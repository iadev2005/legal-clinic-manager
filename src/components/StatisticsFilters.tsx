"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useEffect } from "react"
import { filterOptions } from "@/data/statistics-data"

export function StatisticsFilters({ children }: { children?: React.ReactNode }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize state from URL params
    const getParam = (key: string) => searchParams.get(key) || ""

    const [subject, setSubject] = useState(getParam('subject'))
    const [startDate, setStartDate] = useState(getParam('startDate'))
    const [endDate, setEndDate] = useState(getParam('endDate'))
    const [nucleus, setNucleus] = useState(getParam('nucleus'))

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

    return (
        <div className="w-full flex flex-col md:flex-row gap-4 items-end">
            <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-sm font-semibold text-sky-950">Materia</label>
                <select
                    className={inputClass}
                    value={subject}
                    onChange={handleSubjectChange}
                >
                    <option value="">Todas las materias</option>
                    {filterOptions.subjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-sm font-semibold text-sky-950">Desde</label>
                <input
                    type="date"
                    className={inputClass}
                    value={startDate}
                    onChange={handleStartDateChange}
                />
            </div>

            <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-sm font-semibold text-sky-950">Hasta</label>
                <input
                    type="date"
                    className={inputClass}
                    value={endDate}
                    onChange={handleEndDateChange}
                />
            </div>

            <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-sm font-semibold text-sky-950">Núcleo</label>
                <select
                    className={inputClass}
                    value={nucleus}
                    onChange={handleNucleusChange}
                >
                    <option value="">Todos los núcleos</option>
                    {filterOptions.nuclei.map(n => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
            </div>
            <div className="flex-grow"></div>
            {children}
        </div>
    )
}
