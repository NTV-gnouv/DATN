import { CheckIcon } from '@heroicons/react/24/outline';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
  progress: number;
}

export function StepIndicator({ currentStep, progress }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                step < currentStep
                  ? 'bg-green-600 text-white'
                  : step === currentStep
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step < currentStep ? <CheckIcon className="w-5 h-5" /> : step}
            </div>
            <span className="text-xs text-gray-600">Bước {step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
