import { FormEvent, useMemo, useRef, useState } from 'react';
import {
  ArrowUpIcon,
  ClipboardDocumentIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
} from '@heroicons/react/24/outline';

import {
  sendPlatformInsightsChat,
  type PlatformInsightsChatMessage,
} from '@/services/platform-insights-chat.service';
import type { AnalyticsDateRange } from '@/utils/analytics-date-range';

export type PlatformInsightsChatProps = {
  pageId?: string;
  slug?: string;
  dateRange: AnalyticsDateRange;
  assistantName?: string;
  placeholder?: string;
  suggestedPrompts?: string[];
  disabled?: boolean;
  className?: string;
};

const DEFAULT_PROMPTS = [
  'Tóm tắt hiệu suất landing page',
  'Quốc gia nào truy cập nhiều nhất?',
  'Phân tích chuyển đổi form liên hệ',
];

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function renderAssistantContent(content: string) {
  const lines = content.split('\n');
  return (
    <div className="platform-insights-chat-assistant-copy">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <br key={`break-${index}`} />;
        }

        if (trimmed.startsWith('- ')) {
          return (
            <p key={`line-${index}`} className="platform-insights-chat-bullet">
              {renderInlineMarkdown(trimmed.slice(2))}
            </p>
          );
        }

        return (
          <p key={`line-${index}`} className="platform-insights-chat-line">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export function PlatformInsightsChat({
  pageId,
  slug,
  dateRange,
  assistantName = 'Beam',
  placeholder,
  suggestedPrompts = DEFAULT_PROMPTS,
  disabled = false,
  className,
}: PlatformInsightsChatProps) {
  const [messages, setMessages] = useState<PlatformInsightsChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<Record<number, 'up' | 'down'>>({});
  const threadRef = useRef<HTMLDivElement>(null);

  const isReady = Boolean(pageId) && !disabled;
  const inputPlaceholder = placeholder ?? `Chat with ${assistantName}...`;

  const introMessage = useMemo<PlatformInsightsChatMessage>(
    () => ({
      role: 'assistant',
      content: slug
        ? `Xin chào! Tôi là **${assistantName}** — trợ lý analytics của ShotVN. Tôi có dữ liệu lượt xem, quốc gia, thiết bị và form liên hệ cho landing page \`/${slug}\` trong phạm vi bạn chọn. Bạn muốn tóm tắt hay phân tích điều gì?`
        : `Xin chào! Tôi là **${assistantName}** — trợ lý analytics của ShotVN. Hãy chọn landing page để bắt đầu phân tích.`,
    }),
    [assistantName, slug],
  );

  const visibleMessages = messages.length > 0 ? messages : [introMessage];

  async function sendMessage(rawText: string) {
    const content = rawText.trim();
    if (!content || !pageId || sending) {
      return;
    }

    const nextMessages: PlatformInsightsChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setDraft('');
    setSending(true);
    setError('');

    try {
      const response = await sendPlatformInsightsChat({
        pageId,
        slug,
        granularity: dateRange.preset === '24h' ? 'hour' : 'day',
        startDate: dateRange.preset === '24h' ? undefined : dateRange.startDate,
        endDate: dateRange.preset === '24h' ? undefined : dateRange.endDate,
        messages: nextMessages,
      });

      setMessages((current) => [...current, { role: 'assistant', content: response.reply }]);
      window.setTimeout(() => {
        threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể gửi tin nhắn');
      setMessages(nextMessages.slice(0, -1));
      setDraft(content);
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  async function copyMessage(content: string) {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <section className={`platform-insights-chat${className ? ` ${className}` : ''}`} aria-label={`Chat ${assistantName}`}>
      <header className="platform-insights-chat-head">
        <div>
          <p className="eyebrow">AI Insights</p>
          <h3>{assistantName}</h3>
        </div>
        <p className="muted-copy platform-insights-chat-subtitle">
          Chỉ trả lời dựa trên số liệu landing page trong phạm vi đã chọn.
        </p>
      </header>

      <div className="platform-insights-chat-thread" ref={threadRef}>
        {visibleMessages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <div key={`${message.role}-${index}-${message.content.slice(0, 24)}`} className={`platform-insights-chat-row ${isUser ? 'is-user' : 'is-assistant'}`}>
              {isUser ? (
                <div className="platform-insights-chat-user-bubble">{message.content}</div>
              ) : (
                <div className="platform-insights-chat-assistant-block">
                  {renderAssistantContent(message.content)}
                  {index > 0 ? (
                    <div className="platform-insights-chat-actions">
                      <button
                        type="button"
                        className="platform-insights-chat-action"
                        aria-label="Sao chép"
                        onClick={() => void copyMessage(message.content)}
                      >
                        <ClipboardDocumentIcon className="icon-16" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={`platform-insights-chat-action${feedback[index] === 'up' ? ' is-active' : ''}`}
                        aria-label="Hữu ích"
                        onClick={() => setFeedback((current) => ({ ...current, [index]: 'up' }))}
                      >
                        <HandThumbUpIcon className="icon-16" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={`platform-insights-chat-action${feedback[index] === 'down' ? ' is-active' : ''}`}
                        aria-label="Chưa hữu ích"
                        onClick={() => setFeedback((current) => ({ ...current, [index]: 'down' }))}
                      >
                        <HandThumbDownIcon className="icon-16" aria-hidden="true" />
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}

        {sending ? <p className="platform-insights-chat-status">{assistantName} đang phân tích...</p> : null}
        {error ? <p className="field-error">{error}</p> : null}
      </div>

      {isReady && suggestedPrompts.length > 0 && messages.length === 0 ? (
        <div className="platform-insights-chat-suggestions">
          {suggestedPrompts.map((prompt) => (
            <button key={prompt} type="button" className="platform-insights-chat-suggestion" onClick={() => void sendMessage(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <form className="platform-insights-chat-composer" onSubmit={handleSubmit}>
        <textarea
          className="platform-insights-chat-input"
          rows={2}
          value={draft}
          placeholder={isReady ? inputPlaceholder : 'Đang tải dữ liệu landing page...'}
          disabled={!isReady || sending}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void sendMessage(draft);
            }
          }}
        />
        <button type="submit" className="platform-insights-chat-send" disabled={!isReady || sending || !draft.trim()} aria-label="Gửi tin nhắn">
          <ArrowUpIcon className="icon-18" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
