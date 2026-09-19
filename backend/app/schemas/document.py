from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class DocumentBase(BaseModel):
    filename: str
    file_type: str = Field(..., description="pdf, docx, txt, md, or pasted")


class DocumentUploadResponse(DocumentBase):
    id: str
    space_id: str
    status: str
    uploaded_at: datetime
    chunk_count: int = 0
    message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DocumentResponse(DocumentBase):
    id: str
    space_id: str
    status: str
    uploaded_at: datetime
    chunk_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class PasteTextRequest(BaseModel):
    filename: str = Field(default="Pasted_Notes.txt", min_length=1, max_length=255)
    content: str = Field(..., min_length=10, description="Raw text content of the notes")
