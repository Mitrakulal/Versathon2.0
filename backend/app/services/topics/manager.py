from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.entities import Topic, Chunk, Question
from app.schemas.topic import TopicNodeResponse


class TopicManager:
    """Helper service to build and manage hierarchical topic trees."""

    @classmethod
    def get_topic_tree(cls, space_id: str, db: Session) -> List[TopicNodeResponse]:
        """Fetches all topics for a space and constructs a nested parent-child tree."""
        all_topics = db.query(Topic).filter(Topic.space_id == space_id).order_by(Topic.order_index.asc()).all()

        # Build lookup table of counts
        chunk_counts = dict(
            db.query(Chunk.topic_id, func.count(Chunk.id))
            .filter(Chunk.topic_id.isnot(None))
            .group_by(Chunk.topic_id)
            .all()
        )
        question_counts = dict(
            db.query(Question.topic_id, func.count(Question.id))
            .filter(Question.topic_id.isnot(None))
            .group_by(Question.topic_id)
            .all()
        )

        nodes_by_id = {}
        for topic in all_topics:
            nodes_by_id[topic.id] = TopicNodeResponse(
                id=topic.id,
                space_id=topic.space_id,
                parent_id=topic.parent_id,
                name=topic.name,
                summary=topic.summary,
                order_index=topic.order_index,
                chunk_count=chunk_counts.get(topic.id, 0),
                question_count=question_counts.get(topic.id, 0),
                subtopics=[],
            )

        root_nodes = []
        for topic in all_topics:
            node = nodes_by_id[topic.id]
            if topic.parent_id and topic.parent_id in nodes_by_id:
                parent_node = nodes_by_id[topic.parent_id]
                parent_node.subtopics.append(node)
                # Roll up counts to parent
                parent_node.chunk_count += node.chunk_count
                parent_node.question_count += node.question_count
            else:
                root_nodes.append(node)

        return root_nodes
