import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { loadSession } from '@/services/auth.service';

export default function LoginView() {
  const navigate = useNavigate();
  const { handleLogin, loading, error } = useAuth();
  useEffect(() => {
    const session = loadSession();
    if (session) {
      navigate('/dashboard');
    }
  }, [navigate]);
  const [email, setEmail] = useState('admin@shotvn.local');
  const [password, setPassword] = useState('Admin@123');

  return (
    <AuthShell
      eyebrow="Đăng nhập"
      title="Chào mừng quay lại"
      subtitle="Đăng nhập để quản lý liên kết, trang đích và hồ sơ nhà sáng tạo."
    >
      <form
        className="auth-form"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await handleLogin({ email, password });
          } catch {
            // error is already set inside controller; swallow to avoid uncaught promise
          }
        }}
      >
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input label="Mật khẩu" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="field-error field-error-block">{error}</p> : null}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
        <div className="auth-links">
          <Link to="/register">Người dùng mới? Đăng ký</Link>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>
      </form>
    </AuthShell>
  );
}