import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    color?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, color, disabled, className }) => {
    switch (color) {
        case "claroaqua":
            className = "bg-[#BEDACC] w-50  hover:bg-[#9adfd3] disabled:opacity-70 text-[#19322f] font-bold py-3 rounded-lg transition-colors flex justify-center items-center shadow-lg uppercase tracking-wider text-sm"
            break;
        case "verdeaqua":
            className = "bg-[#162b25] w-50  hover:bg-[#9adfd3] disabled:opacity-70 text-[#19322f] font-bold py-3 rounded-lg transition-colors flex justify-center items-center shadow-lg uppercase tracking-wider text-sm"
            break;
        case "verdeclaroaqua":
            className = "bg-[#6baf8e] w-50  hover:bg-[#9adfd3] disabled:opacity-70 text-[#19322f] font-bold py-3 rounded-lg transition-colors flex justify-center items-center shadow-lg uppercase tracking-wider text-sm"
            break;
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            color={color || "claroaqua"}
            className={className || "w-50  hover:bg-[#9adfd3] disabled:opacity-70 text-[#19322f] font-bold py-3 rounded-lg transition-colors flex justify-center items-center shadow-lg uppercase tracking-wider text-sm"}
        >
            {children}
        </button>
    );
};
export default Button;