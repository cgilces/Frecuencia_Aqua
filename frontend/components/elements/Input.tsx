import React from 'react';

interface InputProps {
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    placeholder?: string;
    required?: boolean;
}

const Input = ({ type, value, onChange, className, placeholder, required }: InputProps) => {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            className={className || "w-full bg-[#f3f3f3] border border-[#162b25] rounded-lg px-4 py-2 text-[#162b25] placeholder-[#162b25] focus:ring-2 focus:ring-[#162b25] focus:border-transparent outline-none transition-all"}
            placeholder={placeholder}
            required
        />
    );
};

export default Input;