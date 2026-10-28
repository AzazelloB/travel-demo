import type { ButtonHTMLAttributes } from 'react';

interface ButtonStyleOptions {
  variant?: 'primary' | 'secondary' | 'light';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

/** Use the same variants for buttons and router links. */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: ButtonStyleOptions = {}) {
  const variants = {
    primary: 'border-primary bg-primary text-white hover:border-primary-dark hover:bg-primary-dark',
    secondary: 'border-line bg-transparent text-primary hover:border-accent hover:bg-lilac',
    light: 'border-white bg-white text-primary hover:bg-lilac',
  };
  const sizes = { sm: 'min-h-10 px-4 py-2 text-xs', md: 'min-h-12 px-5 py-3 text-sm' };
  return `inline-flex items-center justify-center gap-3 rounded-xl border font-bold transition-colors ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;
}

export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleOptions) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
