"use server"

import { query } from "@/lib/db";

interface FilterParams {
    materia?: string;
    startDate?: string;
    endDate?: string;
    nucleus?: string;
}

// Helper function to build WHERE clauses for case-related queries
function buildCaseFilters(filters: FilterParams): { whereClause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.materia) {
        conditions.push(`m.nombre_materia = $${paramIndex}`);
        params.push(filters.materia);
        paramIndex++;
    }

    if (filters.startDate) {
        conditions.push(`c.fecha_caso_inicio >= $${paramIndex}`);
        params.push(filters.startDate);
        paramIndex++;
    }

    if (filters.endDate) {
        conditions.push(`c.fecha_caso_inicio <= $${paramIndex}`);
        params.push(filters.endDate);
        paramIndex++;
    }

    if (filters.nucleus) {
        conditions.push(`n.nombre = $${paramIndex}`);
        params.push(filters.nucleus);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params };
}

export async function getSocioEconomicStats(filters: FilterParams = {}) {
    try {
        const { whereClause, params } = buildCaseFilters(filters);

        // For socio-economic stats, we need to filter solicitantes based on their casos
        const solicitanteFilter = whereClause ? `
            WHERE s.cedula_solicitante IN (
                SELECT DISTINCT c.cedula_solicitante 
                FROM Casos c
                JOIN Materias m ON c.id_materia = m.id_materia
                JOIN Nucleos n ON c.id_nucleo = n.id_nucleo
                ${whereClause}
            )
        ` : '';

        const housingStats = await query(`
            SELECT v.tipo_vivienda as name, COUNT(*)::int as value 
            FROM Viviendas v
            JOIN Solicitantes s ON v.cedula_solicitante = s.cedula_solicitante
            ${solicitanteFilter}
            GROUP BY v.tipo_vivienda
        `, params);

        const educationStats = await query(`
            SELECT ne.descripcion as name, COUNT(s.cedula_solicitante)::int as value 
            FROM Niveles_Educativos ne 
            LEFT JOIN Solicitantes s ON ne.id_nivel_educativo = s.id_nivel_educativo
            ${solicitanteFilter.replace('WHERE', 'AND')}
            GROUP BY ne.descripcion
        `, params);

        const employmentStats = await query(`
            SELECT t.condicion_trabajo as name, COUNT(s.cedula_solicitante)::int as value 
            FROM Trabajos t 
            LEFT JOIN Solicitantes s ON t.id_trabajo = s.id_trabajo
            ${solicitanteFilter.replace('WHERE', 'AND')}
            GROUP BY t.condicion_trabajo
        `, params);

        const genderStats = await query(`
            SELECT 
                CASE 
                    WHEN s.sexo = 'M' THEN 'Masculino'
                    WHEN s.sexo = 'F' THEN 'Femenino'
                    ELSE 'Otro'
                END as name, 
                COUNT(*)::int as value 
            FROM Solicitantes s
            ${solicitanteFilter}
            GROUP BY s.sexo
        `, params);

        const ageStats = await query(`
            SELECT 
                CASE 
                    WHEN EXTRACT(YEAR FROM AGE(s.fecha_nacimiento)) < 18 THEN 'Menores de 18'
                    WHEN EXTRACT(YEAR FROM AGE(s.fecha_nacimiento)) BETWEEN 18 AND 30 THEN '18-30'
                    WHEN EXTRACT(YEAR FROM AGE(s.fecha_nacimiento)) BETWEEN 31 AND 50 THEN '31-50'
                    WHEN EXTRACT(YEAR FROM AGE(s.fecha_nacimiento)) BETWEEN 51 AND 65 THEN '51-65'
                    ELSE 'Mayores de 65'
                END as name,
                COUNT(*)::int as value
            FROM Solicitantes s
            ${solicitanteFilter}
            GROUP BY name
            ORDER BY name
        `, params);

        return {
            housing: housingStats.rows,
            education: educationStats.rows,
            employment: employmentStats.rows,
            gender: genderStats.rows,
            age: ageStats.rows
        };
    } catch (error) {
        console.error("Error fetching socio-economic stats:", error);
        throw new Error("Failed to fetch statistics");
    }
}

export async function getCaseStatusStats(filters: FilterParams = {}) {
    try {
        const { whereClause, params } = buildCaseFilters(filters);

        // Get the most recent status for each case from Se_Le_Adjudican using DISTINCT ON
        const stats = await query(`
            SELECT 
                e.nombre_estatus AS name, 
                COUNT(sub.id_caso)::int AS value
            FROM Estatus e
            LEFT JOIN (
                -- Get the latest status for each case (filtered if needed)
                SELECT DISTINCT ON (sla.id_caso) sla.id_caso, sla.id_estatus
                FROM Se_Le_Adjudican sla
                ${whereClause ? `
                    WHERE sla.id_caso IN (
                        SELECT c.nro_caso
                        FROM Casos c
                        JOIN Materias m ON c.id_materia = m.id_materia
                        JOIN Nucleos n ON c.id_nucleo = n.id_nucleo
                        ${whereClause}
                    )
                ` : ''}
                ORDER BY sla.id_caso, sla.fecha_registro DESC
            ) sub ON e.id_estatus = sub.id_estatus
            GROUP BY e.nombre_estatus
            ORDER BY value DESC
        `, params);

        console.log('Case Status Stats Query Result:', stats.rows);
        console.log('Filters applied:', filters);

        return stats.rows;
    } catch (error) {
        console.error("Error fetching case status stats:", error);
        return [];
    }
}

export async function getParishStats(filters: FilterParams = {}) {
    try {
        const { whereClause, params } = buildCaseFilters(filters);

        const solicitanteFilter = whereClause ? `
            WHERE s.cedula_solicitante IN (
                SELECT DISTINCT c.cedula_solicitante 
                FROM Casos c
                JOIN Materias m ON c.id_materia = m.id_materia
                JOIN Nucleos n ON c.id_nucleo = n.id_nucleo
                ${whereClause}
            )
        ` : '';

        const stats = await query(`
            SELECT p.nombre_parroquia as name, COUNT(s.cedula_solicitante)::int as value 
            FROM Parroquias p 
            LEFT JOIN Solicitantes s ON p.id_parroquia = s.id_parroquia
            ${solicitanteFilter}
            GROUP BY p.nombre_parroquia
            ORDER BY value DESC
            LIMIT 15
        `, params);
        return stats.rows;
    } catch (error) {
        console.error("Error fetching parish stats:", error);
        return [];
    }
}

export async function getCaseGrowthStats(filters: FilterParams = {}) {
    try {
        const { whereClause, params } = buildCaseFilters(filters);

        const stats = await query(`
            SELECT 
                TO_CHAR(c.fecha_caso_inicio, 'YYYY-MM') as month,
                COUNT(*)::int as count
            FROM Casos c
            JOIN Materias m ON c.id_materia = m.id_materia
            JOIN Nucleos n ON c.id_nucleo = n.id_nucleo
            WHERE c.fecha_caso_inicio IS NOT NULL
            ${whereClause ? `AND ${whereClause.replace('WHERE', '')}` : ''}
            GROUP BY TO_CHAR(c.fecha_caso_inicio, 'YYYY-MM')
            ORDER BY month DESC
            LIMIT 12
        `, params);
        return stats.rows.reverse(); // Reverse to show oldest to newest
    } catch (error) {
        console.error("Error fetching case growth stats:", error);
        return [];
    }
}
