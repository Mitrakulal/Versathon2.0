import React, { useState } from 'react';
import TopicCard from './TopicCard';

export default function TopicTree({
  topics,
  onEditTopic,
  onDeleteTopic,
  onGenerateQuestions,
}) {
  const [expandedTopics, setExpandedTopics] = useState(() => {
    // Expand top-level topics by default
    const initial = {};
    topics.forEach((t) => {
      initial[t.id] = true;
    });
    return initial;
  });

  const toggleExpand = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {topics.map((topic) => {
        const isExpanded = !!expandedTopics[topic.id];
        const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;

        return (
          <div key={topic.id} style={{ marginBottom: '0.75rem' }}>
            <TopicCard
              topic={topic}
              isSubtopic={false}
              isExpanded={isExpanded}
              onToggleExpand={() => toggleExpand(topic.id)}
              onEdit={onEditTopic}
              onDelete={onDeleteTopic}
              onGenerateQuestions={onGenerateQuestions}
            />

            {/* Render Subtopics */}
            {hasSubtopics && isExpanded && (
              <div
                style={{
                  paddingLeft: '2rem',
                  borderLeft: '2px solid rgba(99, 102, 241, 0.2)',
                  marginLeft: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  marginTop: '0.35rem',
                }}
              >
                {topic.subtopics.map((subtopic) => (
                  <TopicCard
                    key={subtopic.id}
                    topic={subtopic}
                    isSubtopic={true}
                    onEdit={onEditTopic}
                    onDelete={onDeleteTopic}
                    onGenerateQuestions={onGenerateQuestions}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
