import re


class TextCleaner:
    @staticmethod
    def clean(text: str) -> str:
        """Cleans and normalizes extracted raw document text."""
        if not text:
            return ""

        # Normalize line breaks
        text = text.replace("\r\n", "\n").replace("\r", "\n")

        # Remove null bytes and non-printable control chars except tabs/newlines
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", "", text)

        # Replace excessive horizontal whitespace with a single space
        text = re.sub(r"[ \t]+", " ", text)

        # Collapse more than 2 consecutive newlines into 2
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()
