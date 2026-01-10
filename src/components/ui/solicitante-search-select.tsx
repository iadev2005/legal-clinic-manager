"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/shadcn/label";

interface SolicitanteSearchSelectProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: Array<{ value: string; label: string }>;
  className?: string;
  disabled?: boolean;
  error?: string;
}

export default function SolicitanteSearchSelect({
  placeholder = "Buscar por cédula o nombre...",
  value = "",
  onChange,
  options = [],
  className = "",
  disabled = false,
  error,
}: SolicitanteSearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Encontrar el label del valor seleccionado
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : "";

  // Filtrar opciones basado en el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = options.filter((opt) => {
        const label = opt.label.toLowerCase();
        const value = opt.value.toLowerCase();
        // Buscar tanto en el label (nombre + cédula) como en el value (cédula)
        return label.includes(term) || value.includes(term);
      });
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Cerrar el dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Enfocar el input cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (!isOpen) {
      setIsOpen(true);
    }
    // Si hay un valor seleccionado y el usuario empieza a escribir, limpiar la selección
    if (value && newValue !== displayValue) {
      onChange?.("");
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Si hay un valor seleccionado, mostrar el término de búsqueda vacío para empezar a buscar
    if (value) {
      setSearchTerm("");
    }
  };

  const handleClear = () => {
    onChange?.("");
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-5 pr-12 py-3 bg-white rounded-2xl border-2 ${
            error
              ? "border-red-500"
              : "border-[#003366]/20 focus:border-[#3E7DBB]"
          } text-sky-950 text-lg font-medium focus:outline-none transition-colors ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              : "cursor-text"
          }`}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="pointer-events-auto hover:bg-gray-200 rounded-full p-1 transition-colors"
              title="Limpiar selección"
            >
              <span className="icon-[mdi--close-circle] text-xl text-sky-950/60"></span>
            </button>
          )}
          <span
            className={`icon-[mdi--chevron-down] text-2xl transition-transform ${
              isOpen ? "rotate-180" : ""
            } ${disabled ? "text-gray-300" : "text-sky-950/60"}`}
          ></span>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-[#003366]/20 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-5 py-3 text-sky-950/60 text-center">
              No se encontraron solicitantes
            </div>
          ) : (
            <ul className="py-2">
              {filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-5 py-3 cursor-pointer hover:bg-[#3E7DBB]/10 transition-colors ${
                    value === option.value ? "bg-[#3E7DBB]/20 font-semibold" : ""
                  }`}
                >
                  <div className="text-sky-950 text-base">{option.label}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

