import { useEffect, useState } from 'react';

type UseTypingTextOptions = {
  speedMs?: number;
  enabled?: boolean;
  onComplete?: () => void;
};

export function useTypingText(text: string, options: UseTypingTextOptions = {}) {
  const { speedMs = 18, enabled = true, onComplete } = options;
  const [visibleText, setVisibleText] = useState(enabled ? '' : text);
  const [isTyping, setIsTyping] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setVisibleText(text);
      setIsTyping(false);
      return;
    }

    setVisibleText('');
    setIsTyping(true);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleText(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
        setIsTyping(false);
        onComplete?.();
      }
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [enabled, onComplete, speedMs, text]);

  return { visibleText, isTyping };
}

export type ChatRenderableMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  animate?: boolean;
};

export function createChatMessage(role: ChatRenderableMessage['role'], content: string, animate = false): ChatRenderableMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    animate,
  };
}
