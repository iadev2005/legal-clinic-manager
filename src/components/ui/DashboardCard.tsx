import React from 'react';

interface DashboardCardProps {
    label: string;
    value: string;
    icon?: string;
    iconColor?: string;
    iconBgColor?: string;
}

export default function DashboardCard({
    label,
    value,
    icon,
    iconColor,
    iconBgColor
}: DashboardCardProps) {
    return (
        <div className="flex-1 self-stretch h-55 px-4 bg-neutral-50 rounded-[24px] shadow-sm border border-neutral-200/50 inline-flex flex-col justify-center items-center gap-2.5 min-w-[200px]">
            <div className={`px-3.5 aspect-square py-3 ${iconBgColor} rounded-[55px] inline-flex justify-center items-center gap-2.5`}>
                <span className={`${icon} text-5xl ${iconColor}`}></span>
            </div>
            <div className="self-stretch flex flex-col justify-start items-center">
                <h1 className="self-stretch text-center justify-start text-sky-950 text-xl font-semibold leading-none">{label}</h1>
                <h1 className="self-stretch text-center justify-start text-sky-950 text-5xl font-semibold leading-none">{value}</h1>
            </div>
        </div>
    );
}
