import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

export default function ResetPasswordView() {
  const [searchParams] = useSearchParams();
  const { handleResetPassword, loading, error, message, setMessage } = useAuth();
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [password, setPassword] = useState('Creator@123');

  useEffect(() => {
    const nextToken = searchParams.get('token') ?? '';
    setToken(nextToken);
    setMessage('');
  }, [searchParams, setMessage]);

  return (
    <AuthShell
      eyebrow="Đặt lại mật khẩu"
      title="Chọn mật khẩu mới"
      subtitle="Dùng mã trong email để hoàn tất khôi phục tài khoản."
    >
      <form
        className="auth-form"
        onSubmit={async (event) => {
          event.preventDefault();
          await handleResetPassword({ token, password });
        }}
      >
        <Input label="Mã đặt lại" value={token} onChange={(event) => setToken(event.target.value)} />
        <Input label="Mật khẩu mới" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="field-error field-error-block">{error}</p> : null}
        {message ? <p className="field-success">{message}</p> : null}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </Button>
        <div className="auth-links">
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </form>
    </AuthShell>
  );
}