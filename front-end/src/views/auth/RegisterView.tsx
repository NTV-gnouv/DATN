import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthShell } from '@/components/layout/AuthShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterView() {
	const { handleRegister, loading, error } = useAuth()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isShownPassword, setIsShownPassword] = useState(false)

	return (
		<AuthShell
			eyebrow='Đăng ký'
			title='Bắt đầu hồ sơ nhà sáng tạo'
			subtitle='Tạo tài khoản trước, rồi dựng đường dẫn trang và template.'
		>
			<form
				className='auth-form'
				onSubmit={async event => {
					event.preventDefault()
					await handleRegister({ name, email, password })
				}}
			>
				<Input
					label='Họ và tên'
					placeholder='Enter your full name'
					value={name}
					onChange={event => setName(event.target.value)}
				/>
				<Input
					label='Email'
					type='email'
					placeholder='Enter your email'
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
					{loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
				</Button>
				<div className='auth-links'>
					<Link to='/login'>Đã có tài khoản? Đăng nhập</Link>
				</div>
			</form>
		</AuthShell>
	)
}
