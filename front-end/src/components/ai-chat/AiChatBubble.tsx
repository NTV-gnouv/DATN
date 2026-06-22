import { SparklesIcon } from '@heroicons/react/24/outline';

import { useTypingText } from '@/hooks/useTypingText';

type AiChatBubbleProps = {
  role: 'assistant' | 'user';
  content: string;
  animate?: boolean;
  onTyped?: () => void;
};

function renderParagraphs(text: string) {
  const parts = text.split('\n\n').filter((part) => part.trim().length > 0);
  if (parts.length <= 1) {
    return <p className="ai-chat-content">{text}</p>;
  }

  return (
    <div className="ai-chat-content-stack">
      {parts.map((part, index) => (
        <p key={`${index}-${part.slice(0, 12)}`} className="ai-chat-content">
          {part}
        </p>
      ))}
    </div>
  );
}

export function AiChatBubble({ role, content, animate = false, onTyped }: AiChatBubbleProps) {
  const { visibleText, isTyping } = useTypingText(content, {
    enabled: animate,
    speedMs: role === 'assistant' ? 14 : 0,
    onComplete: onTyped,
  });

  const isAssistant = role === 'assistant';
  const displayText = animate ? visibleText : content;
  const useParagraphStack = !animate && content.includes('\n\n');

  return (
    <div className={`ai-chat-row ${isAssistant ? 'is-assistant' : 'is-user'}`}>
      {isAssistant ? (
        <div className="ai-chat-avatar" aria-hidden="true">
          <SparklesIcon className="icon-18" />
        </div>
      ) : null}
      <div className={`ai-chat-bubble ${isAssistant ? 'ai-chat-bubble-assistant' : 'ai-chat-bubble-user'}`}>
        <p className="ai-chat-label">{isAssistant ? 'AI Assistant' : 'Bạn'}</p>
        {useParagraphStack ? (
          renderParagraphs(content)
        ) : (
          <p className="ai-chat-content">
            {displayText}
            {animate && isTyping ? <span className="ai-chat-cursor" aria-hidden="true" /> : null}
          </p>
        )}
      </div>
    </div>
  );
}
