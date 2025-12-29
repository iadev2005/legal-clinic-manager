
import { query } from "./src/lib/db";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function test() {
    try {
        console.log("Testing Housing Stats...");
        const housingStats = await query(`
            SELECT v.tipo_vivienda as name, COUNT(*)::int as value 
            FROM Viviendas v
            JOIN Solicitantes s ON v.cedula_solicitante = s.cedula_solicitante
            GROUP BY v.tipo_vivienda
        `);
        console.log("Housing Stats:", housingStats.rows);

        console.log("Testing Education Stats...");
        const educationStats = await query(`
            SELECT ne.descripcion as name, COUNT(s.cedula_solicitante)::int as value 
            FROM Niveles_Educativos ne 
            LEFT JOIN Solicitantes s ON ne.id_nivel_educativo = s.id_nivel_educativo
            GROUP BY ne.descripcion
        `);
        console.log("Education Stats:", educationStats.rows);

        console.log("Testing Employment Stats...");
        const employmentStats = await query(`
            SELECT t.condicion_trabajo as name, COUNT(s.cedula_solicitante)::int as value 
            FROM Trabajos t 
            LEFT JOIN Solicitantes s ON t.id_trabajo = s.id_trabajo
            GROUP BY t.condicion_trabajo
        `);
        console.log("Employment Stats:", employmentStats.rows);

        console.log("Testing Gender Stats...");
        const genderStats = await query(`
            SELECT 
                CASE 
                    WHEN s.sexo = 'M' THEN 'Masculino'
                    WHEN s.sexo = 'F' THEN 'Femenino'
                    ELSE 'Otro'
                END as name, 
                COUNT(*)::int as value 
            FROM Solicitantes s
            GROUP BY s.sexo
        `);
        console.log("Gender Stats:", genderStats.rows);

        console.log("Testing Age Stats...");
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
            GROUP BY name
            ORDER BY name
        `);
        console.log("Age Stats:", ageStats.rows);

    } catch (error) {
        console.error("Query failed:", error);
    } finally {
        process.exit();
    }
}

test();
