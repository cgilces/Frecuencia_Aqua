
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#ffffff] border border-[#162b25] rounded-xl shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
