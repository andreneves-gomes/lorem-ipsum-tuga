import React from 'react';

// Inline flag instead of the 🇵🇹 emoji, which Windows renders as the letters "PT".
export const Flag: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg viewBox="0 0 30 20" aria-hidden="true" focusable="false" className={className}>
        <rect width="30" height="20" rx="2" fill="#046A38" />
        <path d="M12 0h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H12z" fill="#DA291C" />
        <circle cx="12" cy="10" r="5" fill="none" stroke="#FFD700" strokeWidth="1.6" />
        <path d="M9.6 7.2h4.8v4a2.4 2.4 0 0 1-4.8 0z" fill="#DA291C" stroke="#fff" strokeWidth="0.9" />
    </svg>
);
