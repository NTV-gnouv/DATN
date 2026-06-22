import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface Step4Props {
  onFinalize: () => Promise<void>;
  loading?: boolean;
}

export function Step4FinalConfirm({ onFinalize, loading }: Step4Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Bước 4/4: Hoàn thành</h2>
        <p className="text-gray-600">Sẵn sàng tạo landing page của bạn?</p>
      </div>

      <div className="bg-green-50 border-2 border-green-200 p-8 rounded-lg text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Bạn đã hoàn thành tất cả bước!</h3>
        <p className="text-gray-600">Landing page của bạn sắp được tạo với các thiết lập bạn đã chọn.</p>
      </div>

      <button
        onClick={onFinalize}
        disabled={loading}
        className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 text-lg"
      >
        {loading ? 'Đang tạo...' : '✓ Tạo Landing Page'}
      </button>
    </div>
  );
}
