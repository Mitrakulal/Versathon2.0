import re
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.entities import Topic, Chunk, Document
from app.services.generation.llm_client import llm_client

logger = logging.getLogger("noterecall.topics")


class TopicExtractor:
    """Extracts a structured Topic -> Subtopic tree from notes and tags chunks."""

    @classmethod
    def extract_topics_from_text(
        cls,
        chunks: List[Chunk],
        space_id: str,
        db: Session,
    ) -> List[Topic]:
        """Runs LLM topic extraction and maps chunks to extracted subtopics."""
        if not chunks:
            return []

        # Prepare summary sample of chunks for prompt
        sample_texts = []
        for idx, chunk in enumerate(chunks[:12]):  # fast token footprint
            snippet = chunk.text[:180].replace("\n", " ")
            sample_texts.append(f"[Chunk {idx} (P.{chunk.page_number})]: {snippet}")
        
        joined_samples = "\n".join(sample_texts)

        prompt = f"""
You are an expert curriculum organizer. Analyze the following study notes and extract a structured Topic and Subtopic outline.

Notes Summary:
{joined_samples}

Instructions:
1. Identify 2 to 5 major topics.
2. For each major topic, identify 1 to 4 subtopics.
3. Provide a clear 1-sentence summary for each topic and subtopic.
4. For each subtopic, list which Chunk indices (e.g. [0, 1, 2]) best belong to it.

Output MUST be strictly valid JSON conforming to this exact schema:
{{
  "topics": [
    {{
      "name": "Main Topic Name",
      "summary": "Concise 1-sentence summary.",
      "subtopics": [
        {{
          "name": "Subtopic Name",
          "summary": "Concise summary.",
          "chunk_indices": [0, 1]
        }}
      ]
    }}
  ]
}}
"""
        extracted_data = None
        try:
            messages = [
                {"role": "system", "content": "You are a curriculum structuring assistant that always outputs pure JSON."},
                {"role": "user", "content": prompt}
            ]
            extracted_data = llm_client.generate_json(messages)
        except Exception as e:
            logger.warning(f"LLM topic extraction skipped/failed ({e}). Falling back to rule-based extractor.")

        # Fallback to rule-based extraction if LLM failed or returned empty
        if not extracted_data or "topics" not in extracted_data or not extracted_data["topics"]:
            extracted_data = cls._fallback_rule_extractor(chunks)

        # Persist extracted topics and assign chunks
        created_topics = []
        try:
            for t_idx, topic_data in enumerate(extracted_data.get("topics", [])):
                parent_topic = Topic(
                    space_id=space_id,
                    name=topic_data.get("name", f"Topic {t_idx + 1}"),
                    summary=topic_data.get("summary", ""),
                    order_index=t_idx,
                )
                db.add(parent_topic)
                db.flush()  # to generate parent_topic.id
                created_topics.append(parent_topic)

                subtopics_data = topic_data.get("subtopics", [])
                if not subtopics_data:
                    # Create at least one default subtopic if none provided
                    subtopics_data = [{"name": "General Overview", "summary": "", "chunk_indices": []}]

                for s_idx, sub_data in enumerate(subtopics_data):
                    subtopic = Topic(
                        space_id=space_id,
                        parent_id=parent_topic.id,
                        name=sub_data.get("name", f"Subtopic {s_idx + 1}"),
                        summary=sub_data.get("summary", ""),
                        order_index=s_idx,
                    )
                    db.add(subtopic)
                    db.flush()
                    created_topics.append(subtopic)

                    # Tag corresponding chunks
                    for c_idx in sub_data.get("chunk_indices", []):
                        if 0 <= c_idx < len(chunks):
                            chunks[c_idx].topic_id = subtopic.id

            # Ensure any untagged chunks are assigned to the first available subtopic
            first_subtopic = next((t for t in created_topics if t.parent_id is not None), created_topics[0] if created_topics else None)
            if first_subtopic:
                for chunk in chunks:
                    if not chunk.topic_id:
                        chunk.topic_id = first_subtopic.id

            db.commit()
            logger.info(f"Successfully extracted and saved {len(created_topics)} topics/subtopics.")
            return created_topics
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to persist extracted topics: {e}")
            raise e

    @classmethod
    def _fallback_rule_extractor(cls, chunks: List[Chunk]) -> Dict[str, Any]:
        """Heuristic fallback topic extraction based on chunk inspection and headings."""
        topics = []
        step = max(1, len(chunks) // 3)
        for i in range(0, len(chunks), step):
            sample = chunks[i].text.split("\n")[0]
            # Clean heading
            title = re.sub(r"^[0-9.#\-\s]+", "", sample)[:40].strip() or f"Section {len(topics) + 1}"
            chunk_slice = list(range(i, min(i + step, len(chunks))))
            topics.append({
                "name": title,
                "summary": f"Key concepts from section {len(topics) + 1}",
                "subtopics": [
                    {
                        "name": f"{title} — Core Concepts",
                        "summary": "Detailed principles and mechanisms.",
                        "chunk_indices": chunk_slice,
                    }
                ],
            })
        return {"topics": topics}
