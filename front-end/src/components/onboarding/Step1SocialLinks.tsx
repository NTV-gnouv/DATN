import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { SocialLink } from '@/hooks/useOnboarding';

interface Step1Props {
  onNext: (socialLinks: SocialLink[]) => Promise<void>;
  loading?: boolean;
  initialData?: SocialLink[];
}

const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'behance', 'x', 'snapchat', 'linkedin'] as const;

export function Step1SocialLinks({ onNext, loading, initialData }: Step1Props) {
  const [socials, setSocials] = useState<Record<string, string>>(
    initialData?.reduce((acc, s) => ({ ...acc, [s.platform]: s.username }), {}) || {}
  );

  const handleSubmit = async () => {
    const socialLinks = PLATFORMS
      .filter(p => socials[p]?.trim())
      .map(p => ({
        platform: p,
        username: socials[p].trim(),
      }));

    if (socialLinks.length === 0) {
      alert('Vui lòng nhập ít nhất một tài khoản mạng xã hội');
      return;
    }

    await onNext(socialLinks);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Bước 1/4: Kết nối mạng xã hội</h2>
        <p className="text-gray-600">Nhập tên người dùng của bạn trên các nền tảng xã hội</p>
      </div>

      <div className="space-y-4">
        {PLATFORMS.map(platform => (
          <div key={platform} className="flex items-center gap-3">
            <label className="w-24 font-medium capitalize">{platform}</label>
            <input
              type="text"
              placeholder={`Tên ${platform} của bạn`}
              value={socials[platform] || ''}
              onChange={(e) => setSocials({ ...socials, [platform]: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Đang xử lý...' : 'Tiếp tục →'}
      </button>
    </div>
  );
}
