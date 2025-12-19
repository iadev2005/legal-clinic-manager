"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border-2 border-[#003366]/10">
      {/* Info de items */}
      <div className="text-sky-950 text-sm font-medium">
        Mostrando <span className="font-bold">{startItem}</span> a{" "}
        <span className="font-bold">{endItem}</span> de{" "}
        <span className="font-bold">{totalItems}</span> resultados
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Botón Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-xl bg-white border-2 border-[#003366]/20 text-sky-950 font-semibold transition-all duration-300 hover:bg-[#003366] hover:text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-sky-950 disabled:hover:scale-100"
        >
          <span className="icon-[mdi--chevron-left] text-xl"></span>
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className="px-3 py-2 text-sky-950">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                    currentPage === page
                      ? "bg-[#003366] text-white shadow-lg"
                      : "bg-white border-2 border-[#003366]/20 text-sky-950 hover:bg-[#3E7DBB] hover:text-white"
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Botón Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-xl bg-white border-2 border-[#003366]/20 text-sky-950 font-semibold transition-all duration-300 hover:bg-[#003366] hover:text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-sky-950 disabled:hover:scale-100"
        >
          <span className="icon-[mdi--chevron-right] text-xl"></span>
        </button>
      </div>
    </div>
  );
}
