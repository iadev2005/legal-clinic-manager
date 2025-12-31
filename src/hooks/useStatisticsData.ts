"use client"

import { useState, useEffect } from "react";
import {
    getSocioEconomicStats,
    getCaseStatusStats,
    getParishStats,
    getCaseGrowthStats,
    getStateStats,
    getMateriaDetailsStats
} from "@/actions/statistics";

interface FilterParams {
    materia?: string;
    startDate?: string;
    endDate?: string;
    nucleus?: string;
}

interface StatisticsData {
    socioEconomic: {
        housing: { name: string; value: number }[];
        education: { name: string; value: number }[];
        employment: { name: string; value: number }[];
        gender: { name: string; value: number }[];
        age: { name: string; value: number }[];
    };
    state: { name: string; value: number }[];
    caseStatus: { name: string; value: number }[];
    parish: { name: string; value: number }[];
    caseGrowth: { month: string; count: number }[];
    materiaDetails: {
        byMateriaAndStatus: { nombre_materia: string; nombre_estatus: string; value: number }[];
        byMateria: { name: string; value: number }[];
        detailedBreakdown: {
            nombre_materia: string;
            nombre_categoria: string;
            nombre_subcategoria: string;
            nombre_ambito_legal: string;
            nombre_estatus: string;
            value: number
        }[];
    };
}

export function useStatisticsData(filters: FilterParams) {
    const [data, setData] = useState<StatisticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                const [socioEconomic, caseStatus, parish, state, caseGrowth, materiaDetails] = await Promise.all([
                    getSocioEconomicStats(filters),
                    getCaseStatusStats(filters),
                    getParishStats(filters),
                    getStateStats(filters),
                    getCaseGrowthStats(filters),
                    getMateriaDetailsStats(filters)
                ]);

                if (isMounted) {
                    setData({
                        socioEconomic,
                        caseStatus,
                        parish,
                        state,
                        caseGrowth,
                        materiaDetails
                    });
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Error al cargar estadísticas");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [filters.materia, filters.startDate, filters.endDate, filters.nucleus]);

    return { data, loading, error };
}
