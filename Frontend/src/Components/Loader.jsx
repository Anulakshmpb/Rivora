import React from 'react';

/**
 * Reusable Modern Loader Component
 * @param {object} props
 * @param {string} props.size - Size of the spinner: 'xs' | 'sm' | 'md' | 'lg'
 * @param {string} props.variant - Variant for colors: 'user' | 'admin' | 'white' | 'dark'
 * @param {string} props.text - Optional loading text to display below or beside the spinner
 * @param {boolean} props.inline - If true, displays inline-flex (suitable for inside buttons/text)
 * @param {boolean} props.fullPage - If true, wraps in a full-screen glassmorphism overlay
 */
export default function Loader({
  size = 'md',
  variant = 'user',
  text = '',
  inline = false,
  fullPage = false,
}) {
  // 1. Color mappings
  const colors = {
    user: {
      outer: 'border-t-indigo-600 border-r-indigo-500/30 border-b-indigo-200/20 border-l-indigo-600/60',
      inner: 'border-t-amber-500 border-r-amber-400/20 border-b-transparent border-l-amber-500/60',
      text: 'text-slate-700 font-medium',
    },
    admin: {
      outer: 'border-t-indigo-600 border-r-indigo-400/30 border-b-indigo-200/20 border-l-indigo-600/60',
      inner: 'border-t-slate-800 border-r-slate-700/20 border-b-transparent border-l-slate-900/60',
      text: 'text-slate-800 font-semibold',
    },
    white: {
      outer: 'border-t-white border-r-white/30 border-b-white/10 border-l-white/60',
      inner: 'border-t-white/80 border-r-white/20 border-b-transparent border-l-white/50',
      text: 'text-white/90',
    },
    dark: {
      outer: 'border-t-slate-900 border-r-slate-800/30 border-b-slate-900/10 border-l-slate-900/60',
      inner: 'border-t-indigo-500 border-r-indigo-400/20 border-b-transparent border-l-indigo-500/60',
      text: 'text-slate-900',
    },
  };

  const activeColors = colors[variant] || colors.user;

  // 2. Size styles for the double-ring loader
  const sizes = {
    xs: {
      outer: 'w-4 h-4 border-2',
      inner: 'w-2.5 h-2.5 border',
      container: 'h-4 w-4',
    },
    sm: {
      outer: 'w-8 h-8 border-2',
      inner: 'w-5 h-5 border-2',
      container: 'h-8 w-8',
    },
    md: {
      outer: 'w-14 h-14 border-[3px]',
      inner: 'w-9 h-9 border-2',
      container: 'h-14 w-14',
    },
    lg: {
      outer: 'w-20 h-20 border-4',
      inner: 'w-12 h-12 border-[3px]',
      container: 'h-20 w-20',
    },
  };

  const activeSize = sizes[size] || sizes.md;

  // 3. Render spinner element
  const spinnerElement = (
    <div className={`relative flex items-center justify-center shrink-0 ${activeSize.container}`}>
      {/* Outer Ring */}
      <div
        className={`rounded-full animate-spin absolute ${activeSize.outer} ${activeColors.outer}`}
      />
      {/* Inner Ring (spinning reverse) */}
      {size !== 'xs' && (
        <div
          className={`rounded-full animate-spin-reverse absolute ${activeSize.inner} ${activeColors.inner}`}
        />
      )}
    </div>
  );

  // 4. Render main layout
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-md transition-all duration-300">
        <div className="flex flex-col items-center space-y-6 p-8 rounded-3xl bg-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/50 max-w-sm w-full text-center animate-pulse-slow">
          {/* Logo Font Header */}
          <span className="logo-font text-2xl font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Rivora
          </span>
          {spinnerElement}
          {text && (
            <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase mt-4">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (inline) {
    return (
      <span className="inline-flex items-center justify-center gap-2">
        {spinnerElement}
        {text && <span className={`text-xs ${activeColors.text}`}>{text}</span>}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3 w-full">
      {spinnerElement}
      {text && (
        <p className={`text-xs font-bold uppercase tracking-widest text-center mt-2 ${activeColors.text}`}>
          {text}
        </p>
      )}
    </div>
  );
}
