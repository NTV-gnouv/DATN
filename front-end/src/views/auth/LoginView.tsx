import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthShell } from '@/components/layout/AuthShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { loadSession } from '@/services/auth.service'
import { resolveOnboardingPath } from '@/utils/onboarding'

export default function LoginView() {
	const navigate = useNavigate()
	const { handleLogin, loading, error } = useAuth()
	const [checkingSession, setCheckingSession] = useState(true)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isShownPassword, setIsShownPassword] = useState(false)

	useEffect(() => {
		let cancelled = false

		void (async () => {
			const session = loadSession()
			if (!session) {
				if (!cancelled) {
					setCheckingSession(false)
				}
				return
			}

			const nextPath = await resolveOnboardingPath(session)
			if (!cancelled) {
				navigate(nextPath, { replace: true })
			}
		})()

		return () => {
			cancelled = true
		}
	}, [navigate])

	if (checkingSession && loadSession()) {
		return (
			<AuthShell
				eyebrow='Đăng nhập'
				title='Chào mừng quay lại'
				subtitle='Đang kiểm tra tài khoản...'
			>
				<p className='muted-copy'>Đang kiểm tra tiến trình thiết lập...</p>
			</AuthShell>
		)
	}

	return (
		<AuthShell
			eyebrow='Đăng nhập'
			title='Chào mừng quay lại'
			subtitle='Đăng nhập để quản lý liên kết, trang đích và hồ sơ nhà sáng tạo.'
		>
			<form
				className='auth-form'
				onSubmit={async event => {
					event.preventDefault()
					try {
						await handleLogin({ email, password })
					} catch {
						// error is already set inside controller; swallow to avoid uncaught promise
					}
				}}
			>
				<Input
					label='Email'
					type='email'
					placeholder='Enter your email...'
					value={email}
					onChange={event => setEmail(event.target.value)}
				/>
				<div style={{ position: 'relative' }}>
					<Input
						label='Mật khẩu'
						type={isShownPassword ? 'text' : 'password'}
						placeholder='Enter your password...'
						value={password}
						onChange={event => setPassword(event.target.value)}
					/>
					<span
						style={{ position: 'absolute', right: 10, bottom: 0.5, transform: 'translateY(-10px)', cursor: 'pointer' }}
					>
						{isShownPassword ? (
							<EyeSlashIcon
								onClick={() => setIsShownPassword(false)}
								width={20}
								height={20}
							/>
						) : (
							<EyeIcon
								onClick={() => setIsShownPassword(true)}
								width={20}
								height={20}
							/>
						)}
					</span>
				</div>
				{error ? <p className='field-error field-error-block'>{error}</p> : null}
				<Button
					type='submit'
					fullWidth
					disabled={loading}
				>
					{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
				</Button>
				<div className='auth-links'>
					<Link to='/register'>Người dùng mới? Đăng ký</Link>
					<Link to='/forgot-password'>Quên mật khẩu?</Link>
				</div>
			</form>
		</AuthShell>
	)
}
