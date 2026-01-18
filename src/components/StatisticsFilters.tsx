"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useEffect } from "react"
import { getFilterMaterias, getFilterNucleos } from "@/actions/statistics"
import FilterSelect from "@/components/ui/filter-select"
import DateInput from "@/components/ui/date-input"

export function StatisticsFilters({ children }: { children?: React.ReactNode }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize state from URL params
    const getParam = (key: string) => searchParams.get(key) || ""

    const [subject, setSubject] = useState(getParam('subject'))
    const [startDate, setStartDate] = useState(getParam('startDate'))
    const [endDate, setEndDate] = useState(getParam('endDate'))
    const [nucleus, setNucleus] = useState(getParam('nucleus'))

    // State for filter options from DB
    const [materias, setMaterias] = useState<string[]>([])
    const [nucleos, setNucleos] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch filter options from database
    useEffect(() => {
        async function loadFilterOptions() {
            try {
                const [materiasData, nucleosData] = await Promise.all([
                    getFilterMaterias(),
                    getFilterNucleos()
                ])
                setMaterias(materiasData)
                setNucleos(nucleosData)
            } catch (error) {
                console.error("Error loading filter options:", error)
            } finally {
                setLoading(false)
            }
        }
        loadFilterOptions()
    }, [])

    // Update state if URL changes externally
    useEffect(() => {
        setSubject(getParam('subject'))
        setStartDate(getParam('startDate'))
        setEndDate(getParam('endDate'))
        setNucleus(getParam('nucleus'))
    }, [searchParams])

    const updateFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`?${params.toString()}`)
    }, [searchParams, router])

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setSubject(val)
        updateFilter('subject', val)
    }

    const handleNucleusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setNucleus(val)
        updateFilter('nucleus', val)
    }

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setStartDate(val)
        updateFilter('startDate', val)
    }

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setEndDate(val)
        updateFilter('endDate', val)
    }

    // Common input/select class to match administration page
    const inputClass = "bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block w-full p-2.5"

    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-neutral-200">
                <div className="flex items-center gap-2">
                    {/* Botón de Filtros */}
                    <button
                        onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                        className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer border-2 ${isFilterPanelOpen
                            ? "bg-[#003366] text-white border-[#003366]"
                            : "bg-white text-[#003366] border-neutral-200 hover:border-[#003366]"
                            }`}
                    >
                        <span className="icon-[mdi--filter-variant] text-lg"></span>
                        Filtros
                        {(() => {
                            const activeCount = [subject, startDate, endDate, nucleus].filter(Boolean).length;
                            return activeCount > 0 ? (
                                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                    {activeCount}
                                </span>
                            ) : null;
                        })()}
                        <span className={`icon-[mdi--chevron-down] text-lg transition-transform duration-300 ${isFilterPanelOpen ? "rotate-180" : ""
                            }`}></span>
                    </button>

                    {/* Botón para limpiar filtros */}
                    {(subject || startDate || endDate || nucleus) && (
                        <button
                            onClick={() => {
                                setSubject("");
                                setStartDate("");
                                setEndDate("");
                                setNucleus("");
                                router.push("?"); // Clear all query params
                            }}
                            className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                            title="Limpiar filtros"
                        >
                            <span className="icon-[mdi--filter-off-outline] text-lg"></span>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {children}
                </div>
            </div>

            {/* Collapsible Filter Panel */}
            {isFilterPanelOpen && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FilterSelect
                            placeholder="Todas las materias"
                            value={subject}
                            onChange={(val) => {
                                setSubject(val)
                                updateFilter('subject', val)
                            }}
                            options={materias.map(m => ({ value: m, label: m }))}
                            className="w-full"
                        />

                        <DateInput
                            placeholder="Desde"
                            value={startDate}
                            onChange={(val) => {
                                setStartDate(val)
                                updateFilter('startDate', val)
                            }}
                            className="w-full"
                        />

                        <DateInput
                            placeholder="Hasta"
                            value={endDate}
                            onChange={(val) => {
                                setEndDate(val)
                                updateFilter('endDate', val)
                            }}
                            className="w-full"
                        />

                        <FilterSelect
                            placeholder="Todos los núcleos"
                            value={nucleus}
                            onChange={(val) => {
                                setNucleus(val)
                                updateFilter('nucleus', val)
                            }}
                            options={nucleos.map(n => ({ value: n, label: n }))}
                            className="w-full"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
