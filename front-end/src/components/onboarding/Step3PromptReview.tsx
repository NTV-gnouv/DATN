import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface Step3Props {
  generatedPrompt: string;
  onNext: (editedPrompt: string) => Promise<void>;
  onRegenerate: () => Promise<string>;
  loading?: boolean;
}

export function Step3PromptReview({ generatedPrompt, onNext, onRegenerate, loading }: Step3Props) {
  const [prompt, setPrompt] = useState(generatedPrompt);
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const newPrompt = await onRegenerate();
      setPrompt(newPrompt);
    } finally {
      setRegenerating(false);
    }
  };

  const handleSubmit = async () => {
    await onNext(prompt);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Bước 3/4: Kiểm tra prompt</h2>
        <p className="text-gray-600">Xem lại prompt AI của bạn. Bạn có thể chỉnh sửa hoặc tạo lại nó</p>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="AI prompt sẽ được hiển thị ở đây..."
        rows={8}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
      />

      <div className="flex gap-3">
        <button
          onClick={handleRegenerate}
          disabled={regenerating || loading}
          className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100"
        >
          <SparklesIcon className="w-5 h-5" />
          {regenerating ? 'Đang tạo...' : 'Tạo lại'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Đang xử lý...' : 'Tiếp tục →'}
        </button>
      </div>
    </div>
  );
}
