"use client"

import { Download, Loader2, FileText } from "lucide-react"
import { useState } from "react"
import { domToPng } from "modern-screenshot"
import { Packer } from "docx"
import { createReportDocument } from "@/components/ReportDocxDocument"

interface PrintButtonProps {
    caseId: string;
    caseNumber: string;
}

export default function PrintButton({ caseId, caseNumber }: PrintButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownload = async () => {
        try {
            setIsGenerating(true)

            // 1. Create a hidden iframe
            const iframe = document.createElement("iframe")
            iframe.style.position = "fixed"
            iframe.style.top = "-10000px"
            iframe.style.left = "-10000px"
            iframe.style.width = "210mm"
            iframe.style.height = "10000px"

            iframe.src = `/cases/report?caseId=${caseId}`
            document.body.appendChild(iframe)

            // 2. Wait for iframe load
            await new Promise((resolve) => {
                iframe.onload = () => setTimeout(resolve, 3000)
            })

            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
            if (!iframeDoc) {
                document.body.removeChild(iframe)
                throw new Error("No se pudo acceder al contenido del reporte.")
            }

            // 3. Wait for pages to be ready
            const pageIds = ["case-report-page-1", "case-report-page-2", "case-report-page-3"]
            let pageElements: (HTMLElement | null)[] = []

            let attempts = 0
            while (attempts < 10) {
                pageElements = pageIds.map(id => iframeDoc.getElementById(id))
                if (pageElements.every(el => el && el.children.length > 0)) break
                await new Promise(r => setTimeout(r, 500))
                attempts++
            }

            if (pageElements.some(el => !el)) {
                document.body.removeChild(iframe)
                throw new Error("No se encontraron todas las páginas del reporte.")
            }

            // 4. Capture pages
            const captureOptions = { scale: 2, backgroundColor: "white" }
            const images: string[] = []
            for (const el of pageElements) {
                if (el) {
                    const img = await domToPng(el, captureOptions)
                    images.push(img)
                }
            }

            // 5. Generate DOCX
            const doc = createReportDocument({
                images,
                date: new Date().toLocaleDateString(),
                titles: [
                    { title: `Información General - Caso ${caseNumber}`, subtitle: "Reporte de Expediente Jurídico" },
                    { title: "Bitácora y Seguimiento", subtitle: "Reporte de Expediente Jurídico" },
                    { title: "Documentación y Beneficiarios", subtitle: "Reporte de Expediente Jurídico" }
                ]
            })

            const blob = await Packer.toBlob(doc)

            // 6. Trigger download
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `Reporte_Caso_${caseNumber.replace('#', '')}_${new Date().toISOString().split('T')[0]}.docx`
            link.click()
            URL.revokeObjectURL(url)

            // Cleanup
            document.body.removeChild(iframe)

        } catch (error) {
            console.error("Error generating report:", error)
            alert("Error al generar el reporte.")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-[#3E7DBB] hover:bg-[#2d5f8f] disabled:bg-blue-300 rounded-2xl text-white text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md shadow-blue-200"
        >
            {isGenerating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
                <FileText className="w-6 h-6" />
            )}
            {isGenerating ? "Generando..." : "Generar Reporte DOCX"}
        </button>
    )
}
