import React from 'react'

const Button = ({
    children,
    onClick,
    type='button',
    disabled=false,
    variant='primary',
    className='',
    size='md',
}) => {
    const baseStyle= 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
    const variantStyles={
        primary:'bg-linear-to-r from-emerald-600 to-teal-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40',
        secondary:'bg-slate-100 text-slate-700 hover:bg-slate-50',
        outline:'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
    }

    const sizeStyles={
        sm:'text-xs h-9 px-4',
        md:'text-sm h-11 px-5'
    }
  return (
    <button
    type={type}
    oncClick={onClick}
    disabled={disabled}
    className={[
        baseStyle,
        variantStyles[variant],
        sizeStyles[size],
        className
    ].join}
    >
        {children}
    </button>
  )
}

export default Button