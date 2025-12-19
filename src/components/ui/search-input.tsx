"use client";

import React from "react";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function SearchInput({
  placeholder = "Buscar...",
  value = "",
  onChange,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-5 py-3 bg-white rounded-2xl border-2 border-[#003366]/20 text-sky-950 text-lg font-medium placeholder:text-sky-950/40 focus:outline-none focus:border-[#3E7DBB] transition-colors"
      />
      <span className="icon-[mdi--magnify] text-2xl text-sky-950/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"></span>
    </div>
  );
}
