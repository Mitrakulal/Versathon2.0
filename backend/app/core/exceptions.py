from fastapi import HTTPException, status


class NoteRecallException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class ResourceNotFoundException(NoteRecallException):
    def __init__(self, resource: str, identifier: str | int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with identifier '{identifier}' not found.",
        )


class ProcessingFailedException(NoteRecallException):
    def __init__(self, process_name: str, reason: str):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute {process_name}: {reason}",
        )


class LLMGenerationException(NoteRecallException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LLM generation failed: {detail}",
        )
