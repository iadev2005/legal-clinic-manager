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
    <div className="w-full flex justify-center py-2">
      <div className="flex items-center gap-6 px-4 py-2 bg-white rounded-full shadow-sm border border-[#003366]/10">
        {/* Info de items */}
        <div className="text-sky-950 text-sm font-medium whitespace-nowrap">
          <span className="font-bold">{startItem}</span> - <span className="font-bold">{endItem}</span> de <span className="font-bold">{totalItems}</span>
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-[#003366]/20"></div>

        {/* Controles de paginación */}
        <div className="flex items-center gap-2">
          {/* Botón Anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-sky-950 transition-all duration-200 hover:bg-[#003366]/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <span className="icon-[mdi--chevron-left] text-2xl"></span>
          </button>

          {/* Números de página */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="px-2 text-sky-950/50 text-sm">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${currentPage === page
                      ? "bg-[#003366] text-white shadow-md scale-105"
                      : "text-sky-950 hover:bg-[#003366]/10"
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
            className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent text-sky-950 transition-all duration-200 hover:bg-[#003366]/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <span className="icon-[mdi--chevron-right] text-2xl"></span>
          </button>
        </div>
      </div>
    </div>
  );
}
