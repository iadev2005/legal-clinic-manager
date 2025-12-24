"use client"

import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { domToPng } from "modern-screenshot"
import { pdf } from "@react-pdf/renderer"
import { ReportDocument } from "./ReportDocument"

export function DownloadReportButton() {
    const [isGenerating, setIsGenerating] = useState(false)
    const searchParams = useSearchParams()

    const handleDownload = async () => {
        try {
            setIsGenerating(true)

            // 1. Create a hidden iframe to render the report page with current filters
            const iframe = document.createElement("iframe")
            iframe.style.position = "fixed"
            iframe.style.top = "-10000px"
            iframe.style.left = "-10000px"
            iframe.style.width = "210mm" // A4 width
            iframe.style.height = "10000px" // Tall enough

            // Pass current search params to the report page
            const params = searchParams.toString()
            iframe.src = `/statistics/report${params ? `?${params}` : ''}`
            document.body.appendChild(iframe)

            // 2. Wait for the iframe to load and data to fetch
            await new Promise((resolve) => {
                iframe.onload = () => setTimeout(resolve, 5000) // Increased wait time for data fetching
            })

            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
            if (!iframeDoc) {
                document.body.removeChild(iframe)
                throw new Error("No se pudo acceder al contenido del reporte.")
            }

            // 3. Wait for loading to complete by checking for the presence of report pages
            let attempts = 0
            const maxAttempts = 20
            let p1Element, p2Element, p3Element

            while (attempts < maxAttempts) {
                p1Element = iframeDoc.getElementById("report-page-1")
                p2Element = iframeDoc.getElementById("report-page-2")
                p3Element = iframeDoc.getElementById("report-page-3")

                if (p1Element && p2Element && p3Element) {
                    // Check if elements have content (not just loading state)
                    const hasContent = p1Element.children.length > 0 &&
                        p2Element.children.length > 0 &&
                        p3Element.children.length > 0
                    if (hasContent) break
                }

                await new Promise(resolve => setTimeout(resolve, 500))
                attempts++
            }

            if (!p1Element || !p2Element || !p3Element) {
                document.body.removeChild(iframe)
                throw new Error("No se encontraron las páginas del reporte. Intente nuevamente.")
            }

            // Options for high quality capture
            const captureOptions = {
                scale: 2,
                backgroundColor: "white",
            }

            const page1Image = await domToPng(p1Element, captureOptions)
            const page2Image = await domToPng(p2Element, captureOptions)
            const page3Image = await domToPng(p3Element, captureOptions)

            // 4. Generate PDF using react-pdf
            const blob = await pdf(
                <ReportDocument
                    page1Image={page1Image}
                    page2Image={page2Image}
                    page3Image={page3Image}
                    date={new Date().toLocaleString()}
                />
            ).toBlob()

            // 5. Trigger download
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `reporte_clinica_${new Date().toISOString().split('T')[0]}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            // Cleanup
            document.body.removeChild(iframe)

        } catch (error) {
            console.error("Error generating PDF:", error)
            alert("Ocurrió un error al generar el reporte. Revise la consola para más detalles.")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="bg-sky-950 text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#325B84] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Download className="w-5 h-5" />
            )}
            {isGenerating ? "Generando Reporte Pro..." : "Descargar Reporte Pro"}
        </button>
    )
}
