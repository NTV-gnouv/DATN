import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  clearSession,
  login,
  register,
  requestPasswordReset,
  resetPassword,
  saveSession,
} from '@/services/auth.service';
import type {
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '@/models/auth.model';

export function useAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(payload: LoginPayload) {
    setLoading(true);
    setError('');
    try {
      const session = await login(payload);
      saveSession(session);
      navigate('/dashboard');
      return session;
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError.message : 'Đăng nhập thất bại';
      setError(nextError);
      throw caughtError;
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(payload: RegisterPayload) {
    setLoading(true);
    setError('');
    try {
      await register(payload);
      const session = await login({ email: payload.email, password: payload.password });
      saveSession(session);
      navigate('/dashboard/pages/new');
      return session;
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError.message : 'Đăng ký thất bại';
      setError(nextError);
      throw caughtError;
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(email: string) {
    setLoading(true);
    setError('');
    try {
      await requestPasswordReset(email);
      setMessage('Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi.');
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError.message : 'Không thể yêu cầu đặt lại mật khẩu';
      setError(nextError);
      throw caughtError;
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(payload: ResetPasswordPayload) {
    setLoading(true);
    setError('');
    try {
      await resetPassword(payload);
      setMessage('Đã cập nhật mật khẩu. Bạn có thể đăng nhập ngay.');
      navigate('/login');
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError.message : 'Đặt lại mật khẩu thất bại';
      setError(nextError);
      throw caughtError;
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    clearSession();
    navigate('/login');
  }

  return {
    loading,
    message,
    error,
    setMessage,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    handleResetPassword,
    signOut,
  };
}
