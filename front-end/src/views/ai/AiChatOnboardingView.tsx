import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowUpIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

import { AiChatBubble } from '@/components/ai-chat/AiChatBubble';
import { AiStylePicker } from '@/components/ai-chat/AiStylePicker';
import { AiChatSocialForm, type SocialFormErrors, type SocialFormValues } from '@/components/ai-chat/AiChatSocialForm';
import { DashboardPreviewPaneShell } from '@/components/dashboard/DashboardPreviewPane';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { OnboardingShell } from '@/components/layout/OnboardingShell';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { createChatMessage, type ChatRenderableMessage } from '@/hooks/useTypingText';
import type { HeaderBlock, PageBackground } from '@/models/editor.model';
import type { LandingPage } from '@/models/page.model';
import { loadSession } from '@/services/auth.service';
import { getDefaultHeaderBlock } from '@/services/editor.service';
import { getPageById, getPageByUsername, getPageEditorConfig } from '@/services/pages.service';
import { clearOnboardingPageId, getOnboardingPageId } from '@/utils/onboarding';
import {
  AI_CHAT_SUGGESTED_DESCRIPTION,
  applyAiChatStyle,
  generateAiChatLandingPage,
  goBackAiChat,
  sendAiChatMessage,
  startAiChat,
  submitAiChatSocials,
  type AiChatInputType,
  type AiChatSession,
  type AiChatSocialPrefill,
  type AiChatStyleOption,
} from '@/services/ai-chat.service';
import { mergeStyleOptionPreview } from '@/utils/ai-style-preview';

function normalizeSlug(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const STEP_TRANSITION_MS = 1500;

function combineAssistantMessages(items: Array<{ role: 'assistant' | 'user'; content: string }>) {
  return items
    .filter((item) => item.role === 'assistant')
    .map((item) => item.content.trim())
    .filter(Boolean)
    .join('\n\n');
}

const GENERATING_MESSAGES = [
  'Mình đang phân tích thông tin của bạn...',
  'Đang xây dựng bảng màu thương hiệu...',
  'Đang chuẩn bị 3 phương án giao diện...',
  'Đang tìm ảnh nền và ảnh gallery...',
];

function mapSocialPrefill(prefill: AiChatSocialPrefill): SocialFormValues {
  return {
    tiktok: prefill.tiktok,
    instagram: prefill.instagram,
    youtube: prefill.youtube,
    x: prefill.x,
  };
}

function createDefaultPageBackground(): PageBackground {
  return {
    mode: 'solid',
    solid: '#ffffff',
    gradient: {
      start: '#ffffff',
      end: '#cbd5e1',
      type: 'linear',
    },
    imageUrl: '',
    overlayColor: '#000000',
    overlayOpacity: 0,
  };
}

function normalizeHeaderBlock(headerBlock: HeaderBlock): HeaderBlock {
  return {
    ...headerBlock,
    fields: {
      ...headerBlock.fields,
      colors: {
        ...headerBlock.fields.colors,
        pageBackground: headerBlock.fields.colors.pageBackground ?? createDefaultPageBackground(),
      },
    },
  };
}

async function loadPreviewPage(pageId?: string, usernames: string[] = []) {
  if (pageId) {
    const page = await getPageById(pageId);
    if (page?.id && page.status !== 'missing') {
      const config = await getPageEditorConfig(page.id);
      const fallbackHeader = await getDefaultHeaderBlock();
      return {
        page,
        headerBlock: normalizeHeaderBlock((config?.headerBlock as HeaderBlock | null) ?? fallbackHeader),
        themeTokens: (config?.themeTokens as Record<string, unknown> | null | undefined) ?? null,
      };
    }
  }

  for (const candidate of usernames) {
    const byUsername = await getPageByUsername(candidate);
    if (byUsername?.id && byUsername.status !== 'missing') {
      const config = await getPageEditorConfig(byUsername.id);
      const fallbackHeader = await getDefaultHeaderBlock();
      return {
        page: byUsername,
        headerBlock: normalizeHeaderBlock((config?.headerBlock as HeaderBlock | null) ?? fallbackHeader),
        themeTokens: (config?.themeTokens as Record<string, unknown> | null | undefined) ?? null,
      };
    }
  }

  const fallbackHeader = await getDefaultHeaderBlock();
  return {
    page: null,
    headerBlock: normalizeHeaderBlock(fallbackHeader),
    themeTokens: null,
  };
}

export default function AiChatOnboardingView({ mode = 'dashboard' }: { mode?: 'dashboard' | 'onboarding' }) {
  const isOnboarding = mode === 'onboarding';
  const { signOut, finishOnboarding } = useAuth();
  const navigate = useNavigate();
  const authSession = loadSession();
  const [chatSession, setChatSession] = useState<AiChatSession | null>(null);
  const [messages, setMessages] = useState<ChatRenderableMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<ChatRenderableMessage[]>([]);
  const [activeAnimatedId, setActiveAnimatedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [inputType, setInputType] = useState<AiChatInputType>('text');
  const [canGenerate, setCanGenerate] = useState(false);
  const [error, setError] = useState('');
  const [socialSubmitting, setSocialSubmitting] = useState(false);
  const [socialErrors, setSocialErrors] = useState<SocialFormErrors>({});
  const [socialFormError, setSocialFormError] = useState('');
  const [socialPrefill, setSocialPrefill] = useState<SocialFormValues | undefined>();
  const [backing, setBacking] = useState(false);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState('');
  const [draftPageId] = useState(() => (isOnboarding ? getOnboardingPageId() : ''));
  const [pageId, setPageId] = useState('');
  const [previewPage, setPreviewPage] = useState<LandingPage | null>(null);
  const [previewHeaderBlock, setPreviewHeaderBlock] = useState<HeaderBlock | null>(null);
  const [basePreviewHeaderBlock, setBasePreviewHeaderBlock] = useState<HeaderBlock | null>(null);
  const [previewThemeTokens, setPreviewThemeTokens] = useState<Record<string, unknown> | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState('');
  const [stepTransitioning, setStepTransitioning] = useState(false);
  const [styleOptions, setStyleOptions] = useState<AiChatStyleOption[]>([]);
  const [awaitingStyleChoice, setAwaitingStyleChoice] = useState(false);
  const [applyingStyle, setApplyingStyle] = useState(false);
  const [selectedStyleId, setSelectedStyleId] = useState('');
  const [hoveredStyleId, setHoveredStyleId] = useState('');
  const [finishing, setFinishing] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  async function handleFinishOnboarding() {
    if (!pageId || finishing) {
      return;
    }

    setFinishing(true);
    setError('');
    try {
      clearOnboardingPageId();
      await finishOnboarding();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể hoàn tất thiết lập');
      setFinishing(false);
    }
  }

  const previewPageId = pageId || draftPageId;

  const username = useMemo(() => {
    const fromName = normalizeSlug(authSession?.user?.name || '');
    const fromEmail = normalizeSlug(authSession?.user?.email?.split('@')[0] || '');
    return fromName || fromEmail || 'creator';
  }, [authSession?.user?.email, authSession?.user?.name]);

  const accountUsernames = useMemo(() => {
    const usernameFromName = normalizeSlug(authSession?.user?.name || '');
    const usernameFromEmail = normalizeSlug(authSession?.user?.email?.split('@')[0] || '');
    return [usernameFromName, usernameFromEmail, username].filter(
      (value, index, all) => Boolean(value) && all.indexOf(value) === index,
    );
  }, [authSession?.user?.email, authSession?.user?.name, username]);

  const userId = authSession?.user?.id ?? username;

  const showAssistantStep = useCallback(
    (items: Array<{ role: 'assistant' | 'user'; content: string }>, animate = true) => {
      const combined = combineAssistantMessages(items);
      if (!combined) {
        return;
      }

      const nextMessage = createChatMessage('assistant', combined, animate);
      setPendingMessages([]);
      setActiveAnimatedId(null);
      setMessages([nextMessage]);
      if (animate) {
        window.setTimeout(() => setActiveAnimatedId(nextMessage.id), 0);
      }
    },
    [],
  );

  const showAssistantStatus = useCallback((content: string) => {
    setPendingMessages([]);
    setActiveAnimatedId(null);
    setMessages([createChatMessage('assistant', content, false)]);
  }, []);

  const waitForStepTransition = useCallback(async (startedAt: number) => {
    const remaining = Math.max(0, STEP_TRANSITION_MS - (Date.now() - startedAt));
    if (remaining > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, remaining));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setLoading(true);
        setError('');
        const result = await startAiChat(userId, username);
        if (cancelled) {
          return;
        }
        setChatSession(result.session);
        setAwaitingInput(result.awaitingInput);
        setInputType(result.inputType ?? 'text');
        setCanGenerate(result.canGenerate);
        showAssistantStep(result.newMessages);
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Không thể khởi tạo chat AI');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showAssistantStep, userId, username]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setPreviewLoading(true);
        setPreviewError('');
        const loaded = await loadPreviewPage(previewPageId || undefined, accountUsernames);
        if (cancelled) {
          return;
        }
        setPreviewPage(loaded.page);
        setPreviewHeaderBlock(loaded.headerBlock);
        setBasePreviewHeaderBlock(loaded.headerBlock);
        setPreviewThemeTokens(loaded.themeTokens);
      } catch (caughtError) {
        if (!cancelled) {
          setPreviewError(caughtError instanceof Error ? caughtError.message : 'Không thể tải preview');
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accountUsernames, previewPageId]);

  const previewDisplayName = chatSession?.answers?.name;
  const previewBio = chatSession?.answers?.description || chatSession?.answers?.occupation;
  const previewAvatarOverride = previewAvatarUrl || chatSession?.answers?.social_avatar_url || '';

  const activeStyleOption = useMemo(() => {
    const activeId = hoveredStyleId || selectedStyleId || styleOptions[0]?.id;
    return styleOptions.find((option) => option.id === activeId) ?? styleOptions[0] ?? null;
  }, [hoveredStyleId, selectedStyleId, styleOptions]);

  const styledPreview = useMemo(() => {
    if (!awaitingStyleChoice || !activeStyleOption || !basePreviewHeaderBlock) {
      return {
        headerBlock: previewHeaderBlock,
        themeTokens: previewThemeTokens,
      };
    }

    return mergeStyleOptionPreview(basePreviewHeaderBlock, activeStyleOption, {
      displayName: previewDisplayName,
      bio: previewBio,
      avatarUrl: previewAvatarOverride,
    });
  }, [
    activeStyleOption,
    awaitingStyleChoice,
    basePreviewHeaderBlock,
    previewAvatarOverride,
    previewBio,
    previewDisplayName,
    previewHeaderBlock,
    previewThemeTokens,
  ]);

  useEffect(() => {
    if (pendingMessages.length === 0 || activeAnimatedId) {
      return;
    }

    const [nextMessage, ...rest] = pendingMessages;
    setPendingMessages(rest);
    setMessages((current) => [...current, nextMessage]);
    if (nextMessage.animate) {
      setActiveAnimatedId(nextMessage.id);
    }
  }, [activeAnimatedId, pendingMessages]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [messages, activeAnimatedId, submitting, generating, stepTransitioning, styleOptions, awaitingStyleChoice]);

  function handleTypedComplete(messageId: string) {
    setActiveAnimatedId((current) => (current === messageId ? null : current));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!chatSession || !draft.trim() || submitting || generating || activeAnimatedId) {
      return;
    }
    if (!awaitingInput || inputType !== 'text') {
      return;
    }

    const message = draft.trim();
    setDraft('');
    setSubmitting(true);
    setError('');
    setAwaitingInput(false);
    setStepTransitioning(true);
    setMessages((current) => [...current, createChatMessage('user', message, false)]);

    const startedAt = Date.now();

    try {
      const result = await sendAiChatMessage(chatSession.id, message);
      await waitForStepTransition(startedAt);
      setChatSession(result.session);
      setAwaitingInput(result.awaitingInput);
      setInputType(result.inputType ?? 'text');
      setCanGenerate(result.canGenerate);
      showAssistantStep(result.newMessages);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể gửi tin nhắn');
      setAwaitingInput(true);
    } finally {
      setStepTransitioning(false);
      setSubmitting(false);
    }
  }

  async function handleSocialSubmit(values: SocialFormValues) {
    if (!chatSession || socialSubmitting || generating || activeAnimatedId) {
      return;
    }

    setSocialSubmitting(true);
    setSocialErrors({});
    setSocialFormError('');
    setError('');
    setAwaitingInput(false);

    const socialSummary = Object.entries(values)
      .filter(([, value]) => value.trim())
      .map(([platform, value]) => `${platform}: ${value}`)
      .join('\n');

    setStepTransitioning(true);
    if (socialSummary) {
      setMessages((current) => [...current, createChatMessage('user', socialSummary, false)]);
    }

    const startedAt = Date.now();

    try {
      const result = await submitAiChatSocials(chatSession.id, values);
      setAwaitingInput(result.awaitingInput);
      setInputType(result.inputType ?? 'none');
      setCanGenerate(result.canGenerate);

      if (result.formError) {
        setMessages((current) => (current.at(-1)?.role === 'user' ? current.slice(0, -1) : current));
        setSocialFormError(result.formError);
        setAwaitingInput(true);
        setInputType('socials');
        return;
      }

      if (result.socialErrors) {
        setMessages((current) => (current.at(-1)?.role === 'user' ? current.slice(0, -1) : current));
        setSocialErrors(result.socialErrors);
        setAwaitingInput(true);
        setInputType('socials');
        return;
      }

      if (result.avatarUrl) {
        setPreviewAvatarUrl(result.avatarUrl);
      }
      setChatSession(result.session);

      await waitForStepTransition(startedAt);
      showAssistantStep(result.newMessages);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể lưu mạng xã hội');
      setAwaitingInput(true);
      setInputType('socials');
    } finally {
      setStepTransitioning(false);
      setSocialSubmitting(false);
    }
  }

  async function handleGoBack() {
    if (!chatSession || backing || generating || loading || stepTransitioning || submitting || socialSubmitting || pageId) {
      return;
    }

    setBacking(true);
    setError('');

    try {
      const result = await goBackAiChat(chatSession.id);
      setChatSession(result.session);
      setAwaitingInput(result.awaitingInput);
      setInputType(result.inputType ?? 'text');
      setCanGenerate(result.canGenerate);
      setSocialErrors({});
      setSocialFormError('');

      if (result.inputType === 'socials') {
        setPreviewAvatarUrl('');
      } else if (result.session.answers?.social_avatar_url) {
        setPreviewAvatarUrl(result.session.answers.social_avatar_url);
      }

      if (result.prefillValue) {
        setDraft(result.prefillValue);
      } else {
        setDraft('');
      }

      if (result.socialPrefill) {
        setSocialPrefill(mapSocialPrefill(result.socialPrefill));
      } else {
        setSocialPrefill(undefined);
      }

      showAssistantStep(result.newMessages);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể quay lại bước trước');
    } finally {
      setBacking(false);
    }
  }

  async function handleGenerate() {
    if (!chatSession || generating) {
      return;
    }

    setGenerating(true);
    setCanGenerate(false);
    setError('');
    setAwaitingInput(false);
    setAwaitingStyleChoice(false);
    setStyleOptions([]);

    for (const content of GENERATING_MESSAGES) {
      showAssistantStatus(content);
      await new Promise((resolve) => window.setTimeout(resolve, 900));
    }

    try {
      const result = await generateAiChatLandingPage(chatSession.id);
      setChatSession(result.session);
      showAssistantStep(result.newMessages, false);

      if (result.awaitingStyleChoice && result.styleOptions?.length) {
        setStyleOptions(result.styleOptions);
        setAwaitingStyleChoice(true);
        setSelectedStyleId(result.styleOptions[0]?.id ?? '');
        return;
      }

      if (result.pageId) {
        setPageId(result.pageId);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể tạo landing page');
      setCanGenerate(true);
    } finally {
      setGenerating(false);
    }
  }

  async function handleStyleSelect(styleOptionId: string) {
    if (!chatSession || applyingStyle || !styleOptionId) {
      return;
    }

    setApplyingStyle(true);
    setSelectedStyleId(styleOptionId);
    setError('');

    try {
      const result = await applyAiChatStyle(chatSession.id, styleOptionId);
      setChatSession(result.session);
      setPageId(result.pageId);
      setAwaitingStyleChoice(false);
      setStyleOptions([]);
      showAssistantStep(result.newMessages, false);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể áp dụng kiểu giao diện');
    } finally {
      setApplyingStyle(false);
    }
  }

  const showSuggestedDescription =
    !isOnboarding &&
    chatSession?.currentStep === 2 &&
    inputType === 'text' &&
    awaitingInput &&
    !activeAnimatedId &&
    !submitting &&
    !generating &&
    !stepTransitioning;

  const showSocialForm =
    inputType === 'socials' && awaitingInput && !generating && !loading && !stepTransitioning;

  const showTextComposer =
    inputType === 'text' && awaitingInput && !activeAnimatedId && !generating && !loading && !stepTransitioning;

  const isLandingReady = Boolean(pageId);

  const canGoBack =
    Boolean(chatSession) &&
    !isLandingReady &&
    !generating &&
    !applyingStyle &&
    !awaitingStyleChoice &&
    !loading &&
    !stepTransitioning &&
    !submitting &&
    !socialSubmitting &&
    !backing &&
    (canGenerate || (chatSession?.currentStep ?? 0) > 0);

  const chatContent = (
    <div className={`ai-chat-layout${isOnboarding ? ' is-onboarding-only' : ''}`}>
      <Card className="ai-chat-panel">
          <div className="ai-chat-header">
            <div className="ai-chat-header-icon">
              <SparklesIcon className="icon-20" aria-hidden="true" />
            </div>
            <div className="ai-chat-header-copy">
              <p className="eyebrow">AI Assistant</p>
              <h2>Tạo landing page bằng chat</h2>
              <p className="muted-copy">Trả lời từng bước — AI sẽ dựng trang cá nhân hoàn chỉnh cho bạn.</p>
            </div>
          </div>

          <div className="ai-chat-stage">
            <div className="ai-chat-thread" ref={scrollRef}>
              {loading ? <p className="ai-chat-loading">Đang khởi tạo trợ lý AI...</p> : null}
              {!loading && messages.length === 0 ? <p className="ai-chat-loading">Đang chuẩn bị câu hỏi...</p> : null}
              {messages.map((message) => (
                <AiChatBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  animate={Boolean(message.animate && activeAnimatedId === message.id)}
                  onTyped={() => handleTypedComplete(message.id)}
                />
              ))}
              {stepTransitioning ? (
                <div className="ai-chat-row is-assistant" aria-live="polite">
                  <div className="ai-chat-avatar" aria-hidden="true">
                    <SparklesIcon className="icon-18" />
                  </div>
                  <div className="ai-chat-bubble ai-chat-bubble-assistant ai-chat-loading-bubble">
                    <p className="ai-chat-label">AI Assistant</p>
                    <p className="ai-chat-loading-dots">Đang xử lý</p>
                  </div>
                </div>
              ) : null}
              {showSocialForm ? (
                <AiChatSocialForm
                  disabled={Boolean(activeAnimatedId)}
                  submitting={socialSubmitting}
                  errors={socialErrors}
                  formError={socialFormError}
                  initialValues={socialPrefill}
                  onSubmit={(values) => void handleSocialSubmit(values)}
                />
              ) : null}
              {awaitingStyleChoice && styleOptions.length > 0 ? (
                <AiStylePicker
                  options={styleOptions}
                  selectedId={selectedStyleId}
                  hoveredId={hoveredStyleId}
                  applying={applyingStyle}
                  disabled={generating}
                  onSelect={(optionId) => void handleStyleSelect(optionId)}
                  onHover={(optionId) => setHoveredStyleId(optionId ?? '')}
                />
              ) : null}
            </div>
          </div>

          <div className="ai-chat-footer">
            {error ? <p className="ai-chat-error">{error}</p> : null}

            {showSuggestedDescription ? (
              <button
                type="button"
                className="btn btn-secondary ai-chat-suggestion"
                onClick={() => setDraft(AI_CHAT_SUGGESTED_DESCRIPTION)}
              >
                Dùng mô tả mẫu
              </button>
            ) : null}

            <form className="ai-chat-composer" onSubmit={(event) => void handleSubmit(event)}>
              <div className="ai-chat-composer-row">
                {canGoBack ? (
                  <button
                    type="button"
                    className="btn btn-secondary ai-chat-back-btn"
                    onClick={() => void handleGoBack()}
                    disabled={backing || Boolean(activeAnimatedId)}
                  >
                    <ArrowLeftIcon className="icon-18" aria-hidden="true" />
                    <span>Quay lại</span>
                  </button>
                ) : null}

                {showTextComposer ? (
                  <textarea
                    className="input ai-chat-input"
                    rows={2}
                    value={draft}
                    placeholder="Nhập câu trả lời..."
                    onChange={(event) => setDraft(event.target.value)}
                    disabled={!awaitingInput || submitting || generating || stepTransitioning || Boolean(activeAnimatedId)}
                  />
                ) : (
                  <div className="ai-chat-input-placeholder muted-copy">
                    {stepTransitioning
                      ? 'Đang xử lý câu trả lời của bạn...'
                      : inputType === 'socials'
                      ? 'Điền mạng xã hội trong form phía trên.'
                      : canGenerate
                        ? 'Sẵn sàng tạo trang — bấm nút bên phải.'
                        : awaitingStyleChoice
                          ? 'Chọn một kiểu giao diện ở trên.'
                        : generating
                          ? 'AI đang xử lý...'
                          : 'Đang chờ AI...'}
                  </div>
                )}

                <div className="ai-chat-composer-actions">
                  {canGenerate ? (
                    <button
                      type="button"
                      className="btn btn-dark ai-chat-generate-btn"
                      onClick={() => void handleGenerate()}
                      disabled={generating || Boolean(activeAnimatedId)}
                    >
                      <SparklesIcon className="icon-18" aria-hidden="true" />
                      <span>{generating ? 'Đang tạo...' : 'Tạo trang'}</span>
                    </button>
                  ) : null}
                  {showTextComposer ? (
                    <button
                      type="submit"
                      className="btn btn-primary ai-chat-send-btn"
                      disabled={!awaitingInput || !draft.trim() || submitting || generating || stepTransitioning || Boolean(activeAnimatedId)}
                      aria-label="Gửi tin nhắn"
                    >
                      <ArrowUpIcon className="icon-18" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>
            </form>

            {isLandingReady ? (
              <div className="ai-chat-success">
                <p>{isOnboarding ? 'Giao diện đã sẵn sàng. Hoàn tất thiết lập để vào dashboard.' : 'Landing page đã sẵn sàng.'}</p>
                {isOnboarding ? (
                  <button
                    type="button"
                    className="btn btn-dark"
                    onClick={() => void handleFinishOnboarding()}
                    disabled={finishing}
                  >
                    {finishing ? 'Đang hoàn tất...' : 'Hoàn thành'}
                  </button>
                ) : (
                  <button type="button" className="btn btn-dark" onClick={() => navigate(`/editor/${pageId}`)}>
                    Mở editor
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </Card>

        {!isOnboarding ? (
          <aside className="ai-chat-phone-pane">
            <DashboardPreviewPaneShell
              page={previewPage}
              headerBlock={styledPreview.headerBlock}
              themeTokens={styledPreview.themeTokens}
              loading={previewLoading}
              error={previewError}
              displayNameOverride={previewDisplayName}
              bioOverride={previewBio}
              avatarOverride={previewAvatarOverride}
            />
          </aside>
        ) : null}
      </div>
  );

  if (isOnboarding) {
    return (
      <OnboardingShell
        step={isLandingReady ? 3 : 2}
        title={isLandingReady ? 'Hoàn tất thiết lập' : 'Tạo giao diện bằng AI'}
        subtitle={
          isLandingReady
            ? 'Trang của bạn đã được tạo. Bấm Hoàn thành để vào dashboard.'
            : 'Trả lời từng bước trong khung chat — AI sẽ dựng giao diện cho trang của bạn.'
        }
        onSignOut={signOut}
      >
        {chatContent}
      </OnboardingShell>
    );
  }

  return <DashboardShell onSignOut={signOut}>{chatContent}</DashboardShell>;
}
