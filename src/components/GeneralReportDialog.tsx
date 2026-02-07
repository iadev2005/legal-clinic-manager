"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shadcn/dialog"
import { Button } from "@/components/shadcn/button"
import { Calendar } from "@/components/shadcn/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Download, Loader2 } from "lucide-react"
import { domToPng } from "modern-screenshot"
import { Packer } from "docx"
import { createReportDocument } from "./ReportDocxDocument"


export function GeneralReportDialog() {
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [isGenerating, setIsGenerating] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const handleDownload = async () => {
        if (!startDate || !endDate) return

        try {
            setIsGenerating(true)

            // 1. Create hidden iframe pointing to general report URL with date params
            const iframe = document.createElement("iframe")
            iframe.style.position = "fixed"
            iframe.style.top = "-10000px"
            iframe.style.left = "-10000px"
            iframe.style.width = "210mm"
            iframe.style.height = "10000px"

            const startStr = startDate.toISOString().split('T')[0]
            const endStr = endDate.toISOString().split('T')[0]
            iframe.src = `/statistics/clinic-report?startDate=${startStr}&endDate=${endStr}`

            document.body.appendChild(iframe)

            // 2. Wait for loading
            await new Promise((resolve) => {
                iframe.onload = () => setTimeout(resolve, 5000)
            })

            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
            if (!iframeDoc) throw new Error("No se pudo acceder al reporte")

            // 3. Find 6 pages
            const pageIds = [
                "clinic-report-page-1", "clinic-report-page-2", "clinic-report-page-3",
                "clinic-report-page-4", "clinic-report-page-5", "clinic-report-page-6"
            ]

            let attempts = 0
            const maxAttempts = 40
            while (attempts < maxAttempts) {
                const allFound = pageIds.every(id => {
                    const el = iframeDoc.getElementById(id)
                    return el && el.innerHTML.length > 200
                })
                if (allFound) break
                await new Promise(r => setTimeout(r, 500))
                attempts++
            }

            // Verify all pages are present before continuing
            const capturedElements = pageIds.map(id => iframeDoc.getElementById(id));
            if (capturedElements.some(el => !el)) {
                throw new Error("Faltaron páginas por capturar en el reporte general.")
            }

            // 4. Capture images
            const images: string[] = []
            for (const id of pageIds) {
                const el = iframeDoc.getElementById(id)
                if (el) {
                    const img = await domToPng(el, { scale: 2, backgroundColor: "white" })
                    images.push(img)
                }
            }

            if (images.length !== 6) throw new Error("Faltaron páginas por capturar")

            // 5. Generate DOCX
            const doc = createReportDocument({
                images,
                date: new Date().toLocaleString()
                // Uses default 6-page titles from ReportDocxDocument
            })

            const blob = await Packer.toBlob(doc)

            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            // "Reporte General - [Fecha Inicio] a [Fecha Fin]"
            const now = new Date()
            const genDate = now.toISOString().split('T')[0]
            const genTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
            link.download = `Reporte_General_${startStr}_${endStr}_(${genDate}_${genTime}).docx`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            document.body.removeChild(iframe)

            setIsOpen(false)

        } catch (error) {
            console.error(error)
            alert("Error generando el reporte. Ver consola.")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#325B84] hover:bg-[#284a6e] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-sm">
                    <Download className="mr-2 h-4 w-4" />
                    Reporte General
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>Generar Reporte General</DialogTitle>
                    <DialogDescription>
                        Seleccione el rango de fechas para el reporte de 6 páginas.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Fecha Inicio</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-[110]" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Fecha Fin</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-[110]" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <Button
                    onClick={handleDownload}
                    disabled={!startDate || !endDate || isGenerating}
                    className="w-full bg-[#3E7DBB]"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generando...
                        </>
                    ) : (
                        "Descargar Reporte General"
                    )}
                </Button>
            </DialogContent>
        </Dialog>
    )
}
