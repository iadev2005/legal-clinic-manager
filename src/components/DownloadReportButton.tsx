"use client"

import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { domToPng } from "modern-screenshot"
import { Packer } from "docx"
import { createReportDocument } from "./ReportDocxDocument"


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
            iframe.src = `/statistics/socioeconomic-report${params ? `?${params}` : ''}`
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

            // 3. Wait for loading to complete by checking for the presence of report pages (1 to 3)
            let attempts = 0
            const maxAttempts = 40 // Total 20 seconds polling + 5 seconds initial wait
            const pageIds = [
                "socioeconomic-report-page-1", "socioeconomic-report-page-2", "socioeconomic-report-page-3"
            ];
            let pageElements: (HTMLElement | null)[] = [];

            while (attempts < maxAttempts) {
                pageElements = pageIds.map(id => iframeDoc.getElementById(id));

                if (pageElements.every(el => el)) {
                    // Check if charts/content are rendered (children length > 0)
                    const hasContent = pageElements.every(el => {
                        // We check if there's any substantive content beyond just the container
                        return el && el.innerHTML.length > 200; // Arbitrary length to ensure charts are rendered
                    });
                    if (hasContent) break;
                }

                await new Promise(resolve => setTimeout(resolve, 500))
                attempts++
            }

            if (pageElements.some(el => !el)) {
                document.body.removeChild(iframe)
                throw new Error("No se encontraron todas las páginas del reporte (Socio-Económico).")
            }

            // Options for high quality capture
            const captureOptions = {
                scale: 2,
                backgroundColor: "white",
            }

            const images: string[] = [];
            for (const el of pageElements) {
                if (el) {
                    const img = await domToPng(el, captureOptions);
                    images.push(img);
                }
            }

            // 4. Generate DOCX using docx
            const doc = createReportDocument({
                images,
                date: new Date().toLocaleString(),
                // Custom titles for 3-page report
                titles: [
                    { title: "Métricas de Casos y Crecimiento", subtitle: "Reporte Socio-Cultural" },
                    { title: "Datos Socio-Económicos I", subtitle: "Reporte Socio-Cultural" },
                    { title: "Datos Socio-Económicos II", subtitle: "Reporte Socio-Cultural" }
                ]
            })

            const blob = await Packer.toBlob(doc)

            // 5. Trigger download
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `reporte_socio_cultural_${new Date().toISOString().split('T')[0]}.docx`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            // Cleanup
            document.body.removeChild(iframe)

        } catch (error) {
            console.error("Error generating DOCX:", error)
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
            {isGenerating ? "Generando Socio-Cultural..." : "Reporte Socio-Cultural"}
        </button>
    )
}
