import io
import pypdf
import docx
from typing import List, Dict, Any
from app.services.ingestion.cleaner import TextCleaner
from app.core.exceptions import ProcessingFailedException
from app.core.logging import logger


class DocumentParser:
    """Parses PDF, DOCX, TXT, and Markdown files into page-level text segments."""

    @classmethod
    def parse_pdf(cls, file_bytes: bytes) -> List[Dict[str, Any]]:
        pages_data = []
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for idx, page in enumerate(reader.pages):
                extracted = page.extract_text() or ""
                cleaned = TextCleaner.clean(extracted)
                if cleaned:
                    pages_data.append({
                        "page_number": idx + 1,
                        "text": cleaned,
                    })
            logger.info(f"Parsed PDF: extracted {len(pages_data)} pages.")
            return pages_data
        except Exception as e:
            logger.error(f"PDF parsing error: {e}")
            raise ProcessingFailedException(process_name="PDF Parsing", reason=str(e))

    @classmethod
    def parse_docx(cls, file_bytes: bytes) -> List[Dict[str, Any]]:
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            full_text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
            cleaned = TextCleaner.clean(full_text)
            logger.info(f"Parsed DOCX: extracted text length {len(cleaned)} chars.")
            return [{"page_number": 1, "text": cleaned}]
        except Exception as e:
            logger.error(f"DOCX parsing error: {e}")
            raise ProcessingFailedException(process_name="DOCX Parsing", reason=str(e))

    @classmethod
    def parse_plain_text(cls, text: str) -> List[Dict[str, Any]]:
        cleaned = TextCleaner.clean(text)
        return [{"page_number": 1, "text": cleaned}] if cleaned else []

    @classmethod
    def parse(cls, filename: str, file_bytes: bytes) -> List[Dict[str, Any]]:
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext == "pdf":
            return cls.parse_pdf(file_bytes)
        elif ext in ["docx", "doc"]:
            return cls.parse_docx(file_bytes)
        elif ext in ["txt", "md", "markdown"]:
            try:
                text = file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                text = file_bytes.decode("latin-1", errors="ignore")
            return cls.parse_plain_text(text)
        else:
            # Fallback treat as text
            try:
                text = file_bytes.decode("utf-8", errors="ignore")
                return cls.parse_plain_text(text)
            except Exception as e:
                raise ProcessingFailedException(
                    process_name="Document Parsing",
                    reason=f"Unsupported file type: {ext}",
                )
