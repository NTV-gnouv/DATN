import type { SocialLink } from '@/hooks/useOnboarding';

interface Step2Props {
  socialLinks: SocialLink[];
  onNext: (data: { isConfirmed: boolean; displayName?: string; bio?: string; avatar?: string }) => Promise<void>;
  loading?: boolean;
}

export function Step2ProfileConfirm({ socialLinks, onNext, loading }: Step2Props) {
  const primaryProfile = socialLinks[0]?.profileData;
  const fallbackUsername = socialLinks[0]?.username;

  const handleConfirm = async (confirmed: boolean) => {
    await onNext({
      isConfirmed: confirmed,
      displayName: primaryProfile?.displayName || fallbackUsername,
      bio: primaryProfile?.bio,
      avatar: primaryProfile?.avatar,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Bước 2/4: Xác nhận profile</h2>
        <p className="text-gray-600">Điều này có phải là bạn không?</p>
      </div>

      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
        {primaryProfile?.avatar && (
          <img
            src={primaryProfile.avatar}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
          />
        )}
        {primaryProfile?.displayName && (
          <h3 className="text-xl font-bold mb-2">{primaryProfile.displayName}</h3>
        )}
        {primaryProfile?.bio && (
          <p className="text-gray-600 mb-4">{primaryProfile.bio}</p>
        )}
        {primaryProfile?.followers && (
          <p className="text-sm text-gray-500">{primaryProfile.followers.toLocaleString()} followers</p>
        )}
        {!primaryProfile?.avatar && !primaryProfile?.displayName && !primaryProfile?.bio && (
          <div className="text-gray-600 space-y-2">
            <p>Chưa có dữ liệu profile tự động từ mạng xã hội.</p>
            <p>
              {fallbackUsername
                ? `Tài khoản mẫu: @${fallbackUsername}`
                : 'Bạn vẫn có thể bấm "Đây là tôi" để sang bước tiếp theo.'}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleConfirm(false)}
          disabled={loading}
          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100"
        >
          ✗ Không phải
        </button>
        <button
          onClick={() => handleConfirm(true)}
          disabled={loading}
          className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
        >
          ✓ Đây là tôi
        </button>
      </div>
    </div>
  );
}
