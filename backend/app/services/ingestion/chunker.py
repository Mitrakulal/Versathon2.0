import re
from typing import List, Dict, Any


class StructureAwareChunker:
    """Splits parsed page content into chunks (roughly 300-500 words/tokens)."""

    def __init__(self, target_chunk_size_chars: int = 1500, chunk_overlap_chars: int = 200):
        self.target_size = target_chunk_size_chars
        self.overlap = chunk_overlap_chars

    def chunk_pages(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        chunks = []
        global_order = 0

        for page in pages:
            page_num = page.get("page_number", 1)
            text = page.get("text", "")
            if not text:
                continue

            # Split text by paragraphs first
            paragraphs = text.split("\n\n")
            current_chunk_text = ""

            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue

                if len(current_chunk_text) + len(para) <= self.target_size:
                    current_chunk_text += ("\n\n" if current_chunk_text else "") + para
                else:
                    if current_chunk_text:
                        chunks.append({
                            "page_number": page_num,
                            "order_index": global_order,
                            "text": current_chunk_text.strip(),
                        })
                        global_order += 1
                        # Carry over overlap if needed
                        current_chunk_text = para
                    else:
                        # Single huge paragraph - split by sentences
                        sentences = re.split(r"(?<=[.!?]) +", para)
                        sent_buf = ""
                        for sent in sentences:
                            if len(sent_buf) + len(sent) <= self.target_size:
                                sent_buf += (" " if sent_buf else "") + sent
                            else:
                                if sent_buf:
                                    chunks.append({
                                        "page_number": page_num,
                                        "order_index": global_order,
                                        "text": sent_buf.strip(),
                                    })
                                    global_order += 1
                                sent_buf = sent
                        current_chunk_text = sent_buf

            if current_chunk_text:
                chunks.append({
                    "page_number": page_num,
                    "order_index": global_order,
                    "text": current_chunk_text.strip(),
                })
                global_order += 1

        return chunks
