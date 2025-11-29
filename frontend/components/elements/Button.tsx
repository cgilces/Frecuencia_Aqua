import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    color?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, color, disabled, className }) => {
    let baseClass = "";
    switch (color) {
        case "claroaqua":
            baseClass = "bg-[#BEDACC] hover:bg-[#9adfd3] disabled:opacity-70 text-[#19322f] font-bold rounded-lg transition-colors flex justify-center items-center shadow-lg uppercase tracking-wider text-sm";
            break;
        case "verdeaqua":
            baseClass = "bg-[#162b25] hover:bg-[#9adfd3] disabled:opacity-70 text-[#19322f] font-bold rounded-lg transition-colors flex justify-center items-center shadow-lg uppercase tracking-wider text-sm";
            break;
        case "verdeclaroaqua":
            baseClass = "bg-[#6baf8e] hover:bg-[#9adfd3] disabled:opacity-70 text-[#19322f] font-bold rounded-lg transition-colors flex justify-center items-center shadow-lg uppercase tracking-wider text-sm";
            break;
        default:
            baseClass = "hover:bg-[#9adfd3] disabled:opacity-70 text-[#19322f] font-bold rounded-lg transition-colors flex justify-center items-center shadow-lg uppercase tracking-wider text-sm";
            break;
    }

    const finalClass = className ? `${baseClass} ${className}` : `${baseClass} w-48 py-3`;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={finalClass}
        >
            {children}
        </button>
    );
};
export default Button;