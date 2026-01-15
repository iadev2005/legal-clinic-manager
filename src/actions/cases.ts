"use server";

import { query } from "@/lib/db";

export async function getCaseReportData(caseId: string) {
    try {
        // 1. Get Main Case Info & Legal Hierarchy & Solicitor
        const caseResult = await query(`
        SELECT 
            c.*,
            m.nombre_materia,
            cat.nombre_categoria,
            sc.nombre_subcategoria,
            al.nombre_ambito_legal,
            n.nombre as nombre_nucleo,
            t.nombre as nombre_tramite,
            s.nombres as solicitante_nombres,
            s.apellidos as solicitante_apellidos,
            s.telefono_celular,
            s.correo_electronico,
            s.sexo,
            s.nacionalidad,
            s.estado_civil,
            s.fecha_nacimiento,
            e.nombre_estatus as estatus_actual,
            EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.fecha_nacimiento)) as edad
        FROM Casos c
        JOIN Materias m ON c.id_materia = m.id_materia
        JOIN Categorias cat ON c.num_categoria = cat.num_categoria AND c.id_materia = cat.id_materia
        JOIN Sub_Categorias sc ON c.num_subcategoria = sc.num_subcategoria AND c.num_categoria = sc.num_categoria AND c.id_materia = sc.id_materia
        JOIN Ambitos_Legales al ON c.num_ambito_legal = al.num_ambito_legal AND c.num_subcategoria = al.num_subcategoria AND c.num_categoria = al.num_categoria AND c.id_materia = al.id_materia
        JOIN Nucleos n ON c.id_nucleo = n.id_nucleo
        JOIN Tramites t ON c.id_tramite = t.id_tramite
        JOIN Solicitantes s ON c.cedula_solicitante = s.cedula_solicitante
        LEFT JOIN Se_Le_Adjudican sla ON c.nro_caso = sla.id_caso
        LEFT JOIN Estatus e ON sla.id_estatus = e.id_estatus
        WHERE c.nro_caso = $1
        ORDER BY sla.fecha_registro DESC
        LIMIT 1
    `, [caseId]);

        if (caseResult.rows.length === 0) return null;

        const caseItem = caseResult.rows[0];

        // 2. Get Actions (Bitácora)
        const actionsResult = await query(`
        SELECT a.*, u.nombres, u.apellidos
        FROM Acciones a
        LEFT JOIN Usuarios_Sistema u ON a.cedula_usuario_ejecutor = u.cedula_usuario
        WHERE a.nro_caso = $1
        ORDER BY a.fecha_realizacion DESC, a.fecha_registro DESC
    `, [caseId]);

        // 3. Get Appointments (Citas) and Attendants
        const appointmentsResult = await query(`
        SELECT 
            ci.*,
            ARRAY_AGG(u.nombres || ' ' || u.apellidos) as atendido_por
        FROM Citas ci
        LEFT JOIN Atienden at ON ci.id_cita = at.id_cita AND ci.nro_caso = at.nro_caso
        LEFT JOIN Usuarios_Sistema u ON at.cedula_usuario = u.cedula_usuario
        WHERE ci.nro_caso = $1
        GROUP BY ci.id_cita, ci.nro_caso
        ORDER BY ci.fecha_atencion DESC
    `, [caseId]);

        // 4. Get Legal Support (Soportes)
        const supportResult = await query(`
        SELECT * FROM Soportes_Legales
        WHERE nro_caso = $1
        ORDER BY fecha_soporte DESC
    `, [caseId]);

        // 5. Get Beneficiaries
        const beneficiariesResult = await query(`
        SELECT *, EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento)) as edad
        FROM Beneficiarios
        WHERE nro_caso = $1
    `, [caseId]);

        // 6. Get Students and Professors
        const assignmentsResult = await query(`
        SELECT sa.*, us.nombres, us.apellidos, us.correo_electronico
        FROM Se_Asignan sa
        JOIN Usuarios_Sistema us ON sa.cedula_alumno = us.cedula_usuario
        WHERE sa.id_caso = $1 
        AND sa.term = (SELECT MAX(term) FROM Se_Asignan WHERE id_caso = $1)
    `, [caseId]);

        const supervisorsResult = await query(`
        SELECT su.*, us.nombres, us.apellidos, us.correo_electronico
        FROM Supervisan su
        JOIN Usuarios_Sistema us ON su.cedula_profesor = us.cedula_usuario
        WHERE su.id_caso = $1 
        AND su.term = (SELECT MAX(term) FROM Supervisan WHERE id_caso = $1)
    `, [caseId]);

        return {
            caseInfo: caseItem,
            actions: actionsResult.rows,
            appointments: appointmentsResult.rows,
            supports: supportResult.rows,
            beneficiaries: beneficiariesResult.rows,
            students: assignmentsResult.rows,
            supervisors: supervisorsResult.rows,
        };
    } catch (error) {
        console.error("Error in getCaseReportData:", error);
        throw error;
    }
}
