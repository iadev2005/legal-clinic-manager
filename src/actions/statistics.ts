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
    } catch (error: any) {
        console.error("Error fetching socio-economic stats:", error);
        return {
            housing: [],
            education: [],
            employment: [],
            gender: [],
            age: []
        };
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

export async function getStateStats(filters: FilterParams = {}) {
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
            SELECT e.nombre_estado as name, COUNT(s.cedula_solicitante)::int as value 
            FROM Estados e
            JOIN Municipios m ON e.id_estado = m.id_estado
            JOIN Parroquias p ON m.id_municipio = p.id_municipio
            LEFT JOIN Solicitantes s ON p.id_parroquia = s.id_parroquia
            ${solicitanteFilter}
            GROUP BY e.nombre_estado
            ORDER BY value DESC
        `, params);
        return stats.rows;
    } catch (error) {
        console.error("Error fetching state stats:", error);
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

export async function getMateriaDetailsStats(filters: FilterParams = {}) {
    try {
        const { whereClause, params } = buildCaseFilters(filters);

        // 1. Stats by Materia and Estatus (for specific pies like 'Materia Civil- Sucesiones')
        const materiaStatusStats = await query(`
            SELECT 
                m.nombre_materia,
                e.nombre_estatus,
                COUNT(DISTINCT c.nro_caso)::int as value
            FROM Casos c
            JOIN Materias m ON c.id_materia = m.id_materia
            JOIN Se_Le_Adjudican sla ON c.nro_caso = sla.id_caso
            JOIN Estatus e ON sla.id_estatus = e.id_estatus
            -- Get only the latest status for each case
            WHERE sla.fecha_registro = (
                SELECT MAX(sla2.fecha_registro)
                FROM Se_Le_Adjudican sla2
                WHERE sla2.id_caso = c.nro_caso
            )
            ${whereClause ? `AND ${whereClause.replace('WHERE', '')}` : ''}
            GROUP BY m.nombre_materia, e.nombre_estatus
        `, params);

        // 2. Stats by Materia (for 'Reporte de casos por Materia')
        const materiaStats = await query(`
            SELECT 
                m.nombre_materia as name,
                COUNT(*)::int as value
            FROM Casos c
            JOIN Materias m ON c.id_materia = m.id_materia
            JOIN Nucleos n ON c.id_nucleo = n.id_nucleo
            ${whereClause}
            GROUP BY m.nombre_materia
        `, params);

        // 3. Detailed Hierarchy Query (Full breakdown for Custom Report)
        const detailedStats = await query(`
            SELECT 
                m.nombre_materia,
                cat.nombre_categoria,
                sc.nombre_subcategoria,
                al.nombre_ambito_legal,
                e.nombre_estatus,
                COUNT(c.nro_caso)::int as value
            FROM Casos c
            JOIN Materias m ON c.id_materia = m.id_materia
            JOIN Categorias cat ON c.num_categoria = cat.num_categoria AND c.id_materia = cat.id_materia
            JOIN Sub_Categorias sc ON 
                c.num_subcategoria = sc.num_subcategoria AND 
                c.num_categoria = sc.num_categoria AND 
                c.id_materia = sc.id_materia
            JOIN Ambitos_Legales al ON 
                c.num_ambito_legal = al.num_ambito_legal AND 
                c.num_subcategoria = al.num_subcategoria AND 
                c.num_categoria = al.num_categoria AND 
                c.id_materia = al.id_materia
            JOIN Se_Le_Adjudican sla ON c.nro_caso = sla.id_caso
            JOIN Estatus e ON sla.id_estatus = e.id_estatus
            JOIN Nucleos n ON c.id_nucleo = n.id_nucleo
            WHERE sla.fecha_registro = (
                SELECT MAX(sla2.fecha_registro)
                FROM Se_Le_Adjudican sla2
                WHERE sla2.id_caso = c.nro_caso
            )
            ${whereClause ? `AND ${whereClause.replace('WHERE', '')}` : ''}
            GROUP BY 
                m.nombre_materia, 
                cat.nombre_categoria,
                sc.nombre_subcategoria, 
                al.nombre_ambito_legal, 
                e.nombre_estatus
        `, params);

        return {
            byMateriaAndStatus: materiaStatusStats.rows,
            byMateria: materiaStats.rows,
            detailedBreakdown: detailedStats.rows
        };

    } catch (error) {
        console.error("Error fetching detailed materia stats:", error);
        return { byMateriaAndStatus: [], byMateria: [], detailedBreakdown: [] };
    }
}

// Get all materias for filter dropdown
export async function getFilterMaterias() {
    try {
        const result = await query(`
            SELECT nombre_materia 
            FROM Materias 
            ORDER BY nombre_materia
        `);
        return result.rows.map(row => row.nombre_materia);
    } catch (error) {
        console.error("Error fetching materias for filter:", error);
        return [];
    }
}

// Get all nucleos for filter dropdown
export async function getFilterNucleos() {
    try {
        const result = await query(`
            SELECT nombre 
            FROM Nucleos 
            ORDER BY nombre
        `);
        return result.rows.map(row => row.nombre);
    } catch (error) {
        console.error("Error fetching nucleos for filter:", error);
        return [];
    }
}
