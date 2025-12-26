"use client";

import React from "react";

interface StatusBadgeProps {
  status: "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA";
  className?: string;
}

const statusConfig = {
  EN_PROCESO: {
    label: "En Proceso",
    bgColor: "bg-[#FEF9C3]",
    textColor: "text-[#CB8C06]",
    icon: "icon-[mdi--clock-outline]",
  },
  ENTREGADO: {
    label: "Entregado",
    bgColor: "bg-[#DCFCE7]",
    textColor: "text-[#16A34A]",
    icon: "icon-[mdi--check-circle]",
  },
  ARCHIVADO: {
    label: "Archivado",
    bgColor: "bg-[#E0E7FF]",
    textColor: "text-[#4F46E5]",
    icon: "icon-[mdi--archive]",
  },
  ASESORIA: {
    label: "Asesoría",
    bgColor: "bg-[#DBEAFE]",
    textColor: "text-[#2563EB]",
    icon: "icon-[mdi--information]",
  },
};

export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${className}`}
    >
      <span className={`${config.icon} text-lg ${config.textColor}`}></span>
      <span className={`${config.textColor} text-sm font-semibold`}>
        {config.label}
      </span>
    </div>
  );
}
