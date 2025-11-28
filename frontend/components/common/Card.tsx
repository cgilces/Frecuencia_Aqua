
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#19322f] border border-[#b2e1d8]/20 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
