import React from "react";

interface LabeledInputProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

export const LabeledInput = ({ label, children, className = "" }: LabeledInputProps) => {
    return (
        <div className={`flex flex-col justify-start items-start gap-2 ${className}`}>
            <div className="self-stretch justify-start text-sky-950 text-xl font-semibold">
                {label}
            </div>
            {children}
        </div>
    );
};
