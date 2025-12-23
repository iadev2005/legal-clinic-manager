"use client"

import { Download } from "lucide-react"

export function DownloadReportButton() {
    const handleDownload = () => {
        alert("Esta funcionalidad estará disponible pronto (Simulación de descarga).")
    }

    return (
        <button
            onClick={handleDownload}
            className="bg-sky-950 text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#325B84] transition-colors flex items-center gap-2 cursor-pointer"
        >
            <Download className="w-5 h-5" />
            Descargar Reporte PDF
        </button>
    )
}
