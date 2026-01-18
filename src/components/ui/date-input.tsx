"use client";

import React from "react";

interface DateInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function DateInput({
  placeholder = "Desde: 01/01/2025",
  value = "",
  onChange,
  className = "",
}: DateInputProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full px-5 py-3 bg-white rounded-2xl border-2 border-[#003366]/20 text-sky-950 text-lg font-medium placeholder:text-sky-950/40 focus:outline-none focus:border-[#3E7DBB] transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      />
      <span className="icon-[mdi--calendar] text-2xl text-sky-950/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"></span>
    </div>
  );
}
