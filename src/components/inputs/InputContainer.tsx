import React from "react";

interface InputContainerProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const InputContainer = ({ children, className = "", onClick }: InputContainerProps) => {
    return (
        <div
            onClick={onClick}
            className={`self-stretch bg-neutral-50 rounded-xl outline outline-[3px] outline-sky-950 flex justify-start items-center gap-2 ${className}`}
        >
            {children}
        </div>
    );
};
