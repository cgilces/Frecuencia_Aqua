
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox: React.FC<CheckboxProps> = ({ className, ...props }) => {
  return (
    <input
      type="checkbox"
      className={`h-4 w-4 rounded bg-[#19322f] border-[#b2e1d8]/50 text-[#b2e1d8] focus:ring-[#b2e1d8] focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#19322f] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
      {...props}
    />
  );
};
