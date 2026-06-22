import { forwardRef, type InputHTMLAttributes } from 'react';

type Status = 'idle' | 'checking' | 'available' | 'taken';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  status?: Status;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, status = 'idle', className = '', ...rest },
  ref,
) {
  return (
    <label className="field" style={{ position: 'relative' }}>
      <span className="field-label">{label}</span>
      <input
        ref={ref}
        className={`input ${className} ${status !== 'idle' ? 'input-has-status' : ''}`.trim()}
        {...rest}
      />
      {status !== 'idle' ? (
        <span className={`input-status input-status-${status}`} aria-hidden="true" />
      ) : null}
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
});