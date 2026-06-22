import { useState } from 'react';
import { Link } from 'react-router-dom';

import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterView() {
  const { handleRegister, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthShell
      eyebrow="Đăng ký"
      title="Bắt đầu hồ sơ nhà sáng tạo"
      subtitle="Tạo tài khoản trước, rồi dựng đường dẫn trang và template."
    >
      <form
        className="auth-form"
        onSubmit={async (event) => {
          event.preventDefault();
          await handleRegister({ name, email, password });
        }}
      >
        <Input label="Họ và tên" value={name} onChange={(event) => setName(event.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input label="Mật khẩu" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="field-error field-error-block">{error}</p> : null}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </Button>
        <div className="auth-links">
          <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
        </div>
      </form>
    </AuthShell>
  );
}