from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.entities import StudySpace, Document, Chunk
from app.schemas.document import DocumentUploadResponse, DocumentResponse, PasteTextRequest
from app.services.ingestion.parser import DocumentParser
from app.services.ingestion.chunker import StructureAwareChunker
from app.services.topics.extractor import TopicExtractor
from app.core.exceptions import ResourceNotFoundException, ProcessingFailedException
from app.core.logging import logger

router = APIRouter(tags=["Documents"])


@router.post("/spaces/{space_id}/documents/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED)
def upload_document(
    space_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Upload a study document (PDF, DOCX, TXT, MD), chunk it, and extract topics."""
    space = db.query(StudySpace).filter(StudySpace.id == space_id, StudySpace.user_id == user_id).first()
    if not space:
        raise ResourceNotFoundException(resource="StudySpace", identifier=space_id)

    file_bytes = file.file.read()
    filename = file.filename or "Uploaded_Document"
    ext = filename.split(".")[-1].lower() if "." in filename else "txt"

    # Create document record
    doc = Document(
        space_id=space_id,
        filename=filename,
        file_type=ext,
        status="processing",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    try:
        # 1. Parse document into pages
        parsed_pages = DocumentParser.parse(filename, file_bytes)
        if not parsed_pages:
            raise ProcessingFailedException(process_name="Ingestion", reason="No readable text extracted from document.")

        # 2. Chunk pages
        chunker = StructureAwareChunker()
        chunk_dicts = chunker.chunk_pages(parsed_pages)

        # 3. Store chunks in DB
        db_chunks = []
        for c in chunk_dicts:
            chunk = Chunk(
                document_id=doc.id,
                text=c["text"],
                page_number=c["page_number"],
                order_index=c["order_index"],
            )
            db.add(chunk)
            db_chunks.append(chunk)
        
        db.commit()
        for chunk in db_chunks:
            db.refresh(chunk)

        # 4. Extract Topic Hierarchy & Tag Chunks
        created_topics = TopicExtractor.extract_topics_from_text(db_chunks, space_id=space_id, db=db)

        # 5. Auto-generate initial question bank for extracted subtopics
        from app.services.generation.generator import QuestionGenerator
        subtopics = [t for t in created_topics if t.parent_id is not None]
        for st in subtopics[:3]:
            try:
                QuestionGenerator.generate_for_topic(st.id, db=db, count=2)
            except Exception as q_err:
                logger.warning(f"Initial question generation skipped for {st.name}: {q_err}")

        # Update doc status
        doc.status = "completed"
        db.commit()

        logger.info(f"Document {filename} processed: {len(db_chunks)} chunks created.")
        return DocumentUploadResponse(
            id=doc.id,
            space_id=doc.space_id,
            filename=doc.filename,
            file_type=doc.file_type,
            status=doc.status,
            uploaded_at=doc.uploaded_at,
            chunk_count=len(db_chunks),
            message=f"Successfully processed {len(db_chunks)} chunks and extracted topic hierarchy.",
        )
    except Exception as e:
        doc.status = "failed"
        db.commit()
        logger.error(f"Ingestion failed for {filename}: {e}")
        raise ProcessingFailedException(process_name="Document Processing", reason=str(e))


@router.post("/spaces/{space_id}/documents/paste", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED)
def paste_notes(
    space_id: str,
    payload: PasteTextRequest,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """Paste raw text notes, chunk it, and extract topic hierarchy."""
    space = db.query(StudySpace).filter(StudySpace.id == space_id, StudySpace.user_id == user_id).first()
    if not space:
        raise ResourceNotFoundException(resource="StudySpace", identifier=space_id)

    doc = Document(
        space_id=space_id,
        filename=payload.filename,
        file_type="pasted",
        status="processing",
        raw_content=payload.content,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    try:
        parsed_pages = DocumentParser.parse_plain_text(payload.content)
        chunker = StructureAwareChunker()
        chunk_dicts = chunker.chunk_pages(parsed_pages)

        db_chunks = []
        for c in chunk_dicts:
            chunk = Chunk(
                document_id=doc.id,
                text=c["text"],
                page_number=1,
                order_index=c["order_index"],
            )
            db.add(chunk)
            db_chunks.append(chunk)

        db.commit()
        for chunk in db_chunks:
            db.refresh(chunk)

        TopicExtractor.extract_topics_from_text(db_chunks, space_id=space_id, db=db)

        doc.status = "completed"
        db.commit()

        return DocumentUploadResponse(
            id=doc.id,
            space_id=doc.space_id,
            filename=doc.filename,
            file_type=doc.file_type,
            status=doc.status,
            uploaded_at=doc.uploaded_at,
            chunk_count=len(db_chunks),
            message=f"Successfully processed {len(db_chunks)} chunks and extracted topic hierarchy.",
        )
    except Exception as e:
        doc.status = "failed"
        db.commit()
        raise ProcessingFailedException(process_name="Pasted Notes Processing", reason=str(e))


@router.get("/spaces/{space_id}/documents", response_model=List[DocumentResponse])
def list_documents(
    space_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default-user",
):
    """List all documents for a study space with processing status."""
    space = db.query(StudySpace).filter(StudySpace.id == space_id, StudySpace.user_id == user_id).first()
    if not space:
        raise ResourceNotFoundException(resource="StudySpace", identifier=space_id)

    docs = db.query(Document).filter(Document.space_id == space_id).order_by(Document.uploaded_at.desc()).all()
    
    result = []
    for doc in docs:
        c_count = db.query(func.count(Chunk.id)).filter(Chunk.document_id == doc.id).scalar() or 0
        result.append(
            DocumentResponse(
                id=doc.id,
                space_id=doc.space_id,
                filename=doc.filename,
                file_type=doc.file_type,
                status=doc.status,
                uploaded_at=doc.uploaded_at,
                chunk_count=c_count,
            )
        )
    return result
