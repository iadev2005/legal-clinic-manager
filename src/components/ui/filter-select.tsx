"use client";

import React from "react";

interface FilterSelectProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: { value: string; label: string }[];
  className?: string;
}

export default function FilterSelect({
  placeholder = "Filtrar...",
  value = "",
  onChange,
  options = [],
  className = "",
}: FilterSelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-5 py-3 bg-white rounded-2xl border-2 border-[#003366]/20 text-sky-950 text-lg font-medium appearance-none focus:outline-none focus:border-[#3E7DBB] transition-colors cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="icon-[mdi--chevron-down] text-2xl text-sky-950/60 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"></span>
    </div>
  );
}
