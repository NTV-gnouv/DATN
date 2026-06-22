import { useEffect, useState } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { StepIndicator } from './StepIndicator';
import { Step1SocialLinks } from './Step1SocialLinks';
import { Step2ProfileConfirm } from './Step2ProfileConfirm';
import { Step3PromptReview } from './Step3PromptReview';
import { Step4FinalConfirm } from './Step4FinalConfirm';

interface OnboardingFlowProps {
  onCompleted?: (pageId: string) => void;
}

export function OnboardingFlow({ onCompleted }: OnboardingFlowProps) {
  const { session, loading, error, startSession, submitStep, regeneratePrompt, cancel } = useOnboarding();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    startSession();
  }, []);

  useEffect(() => {
    if (session) {
      const steps = session.currentStep;
      setProgress((steps / 4) * 100);
    }
  }, [session?.currentStep]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          {error ? (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-xl font-bold text-red-600 mb-2">Lỗi khởi tạo</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <a
                href="/login"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Đi tới đăng nhập
              </a>
            </>
          ) : (
            <>
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Đang khởi tạo...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (session.status === 'completed') {
    const pageId = session.step4.landingPageId;
    if (pageId && onCompleted) {
      onCompleted(pageId);
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold mb-2">Hoàn thành!</h1>
          <p className="text-gray-600">Landing page của bạn đã được tạo thành công.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <StepIndicator currentStep={session.currentStep} progress={progress} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {session.currentStep === 1 && (
          <Step1SocialLinks
            onNext={async (links) => {
              try {
                await submitStep(1, { socialLinks: links });
              } catch {
                // Error handled in hook
              }
            }}
            loading={loading}
            initialData={session.step1.socialLinks}
          />
        )}

        {session.currentStep === 2 && (
          <Step2ProfileConfirm
            socialLinks={session.step1.socialLinks}
            onNext={async (data) => {
              try {
                await submitStep(2, data);
              } catch {
                // Error handled in hook
              }
            }}
            loading={loading}
          />
        )}

        {session.currentStep === 3 && (
          <Step3PromptReview
            generatedPrompt={session.step3.generatedPrompt || 'AI sẽ tạo prompt tùy chỉnh cho bạn...'}
            onNext={async (prompt) => {
              try {
                await submitStep(3, { editedPrompt: prompt });
              } catch {
                // Error handled in hook
              }
            }}
            onRegenerate={regeneratePrompt}
            loading={loading}
          />
        )}

        {session.currentStep === 4 && (
          <Step4FinalConfirm
            onFinalize={async () => {
              try {
                await submitStep(4, { confirmFinal: true });
              } catch {
                // Error handled in hook
              }
            }}
            loading={loading}
          />
        )}

        <div className="mt-8 text-center">
          <button
            onClick={cancel}
            disabled={loading}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
