import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthShell } from '@/components/layout/AuthShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'

export default function ForgotPasswordView() {
	const { handleForgotPassword, loading, error, message } = useAuth()
	const [email, setEmail] = useState('')

	return (
		<AuthShell
			eyebrow='Khôi phục'
			title='Đặt lại quyền truy cập an toàn'
			subtitle='Gửi liên kết đặt lại mật khẩu để quay lại luồng quản trị.'
		>
			<form
				className='auth-form'
				onSubmit={async event => {
					event.preventDefault()
					await handleForgotPassword(email)
				}}
			>
				<Input
					label='Email'
					type='email'
					value={email}
					onChange={event => setEmail(event.target.value)}
				/>
				{error ? <p className='field-error field-error-block'>{error}</p> : null}
				{message ? <p className='field-success'>{message}</p> : null}
				<Button
					type='submit'
					fullWidth
					disabled={loading}
				>
					{loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
				</Button>
				<div className='auth-links'>
					<Link to='/login'>Quay lại đăng nhập</Link>
				</div>
			</form>
		</AuthShell>
	)
}
