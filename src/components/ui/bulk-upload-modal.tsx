"use client";

import { useState, useRef } from "react";
import ExcelJS from "exceljs";
import { processBulkUpload, type BulkUploadUser, type BulkUploadResult } from "@/actions/administracion";

interface BulkUploadModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    semestres: Array<{ term: string; fecha_inicio: string; fecha_final: string }>;
}

interface ColumnMapping {
    cedula: string;
    nombres: string;
    apellidos: string;
    nombreCompleto?: string; // Nueva opción: nombre completo en una sola columna
    correo: string;
    telefonoLocal?: string;
    telefonoCelular?: string;
    nrc?: string;
    tipo?: string;
}

export default function BulkUploadModal({
    open,
    onClose,
    onSuccess,
    semestres
}: BulkUploadModalProps) {
    const [tipo, setTipo] = useState<"Estudiante" | "Profesor">("Estudiante");
    const [term, setTerm] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
        cedula: "",
        nombres: "",
        apellidos: "",
        nombreCompleto: "",
        correo: "",
        telefonoLocal: "",
        telefonoCelular: "",
        nrc: "",
        tipo: ""
    });
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<BulkUploadResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!open) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setPreviewData([]);
        setResult(null);

        try {
            const workbook = new ExcelJS.Workbook();
            const buffer = await selectedFile.arrayBuffer();
            await workbook.xlsx.load(buffer);

            const worksheet = workbook.worksheets[0];
            if (!worksheet) {
                alert("El archivo Excel no contiene hojas de cálculo");
                return;
            }

            // Obtener encabezados de la primera fila
            const headers: string[] = [];
            worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
                headers[colNumber - 1] = cell.value?.toString() || `Columna ${colNumber}`;
            });

            setExcelHeaders(headers);

            // Leer primeras 5 filas para vista previa
            const preview: any[] = [];
            let rowCount = 0;
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // Skip header
                if (rowCount >= 5) return; // Only first 5 data rows
                const rowData: any = {};
                headers.forEach((header, index) => {
                    const cell = row.getCell(index + 1);
                    rowData[header] = cell.value?.toString() || "";
                });
                preview.push(rowData);
                rowCount++;
            });

            setPreviewData(preview);

            // Auto-mapear columnas comunes
            const autoMapping: Partial<ColumnMapping> = {};
            headers.forEach((header) => {
                const headerLower = header.toLowerCase().trim();
                if (headerLower.includes("cedula") || headerLower.includes("cédula") || headerLower.includes("ci")) {
                    autoMapping.cedula = header;
                } else if (headerLower.includes("nombre") && !headerLower.includes("apellido")) {
                    autoMapping.nombres = header;
                } else if (headerLower.includes("apellido")) {
                    autoMapping.apellidos = header;
                } else if ((headerLower.includes("nombre") && headerLower.includes("completo")) || 
                           (headerLower.includes("nombre") && headerLower.includes("apellido")) ||
                           (headerLower.includes("nombre") && !headerLower.includes("apellido") && !autoMapping.nombres)) {
                    // Si tiene "completo" o "apellido" en el nombre, es nombre completo
                    if (headerLower.includes("completo") || headerLower.includes("apellido")) {
                        autoMapping.nombreCompleto = header;
                    }
                } else if (headerLower.includes("correo") || headerLower.includes("email") || headerLower.includes("e-mail")) {
                    autoMapping.correo = header;
                } else if (headerLower.includes("telefono") && (headerLower.includes("local") || headerLower.includes("fijo"))) {
                    autoMapping.telefonoLocal = header;
                } else if (headerLower.includes("telefono") && (headerLower.includes("celular") || headerLower.includes("movil") || headerLower.includes("móvil"))) {
                    autoMapping.telefonoCelular = header;
                } else if (headerLower.includes("nrc")) {
                    autoMapping.nrc = header;
                } else if (headerLower.includes("tipo")) {
                    autoMapping.tipo = header;
                }
            });

            setColumnMapping((prev) => ({ ...prev, ...autoMapping }));
        } catch (error: any) {
            console.error("Error al leer archivo:", error);
            alert(`Error al leer el archivo Excel: ${error.message}`);
        }
    };

    const handleProcess = async () => {
        if (!file || !term) {
            alert("Por favor seleccione un archivo y un semestre");
            return;
        }

        // Validar mapeo de columnas obligatorias
        const hasNombreCompleto = !!columnMapping.nombreCompleto;
        const hasNombresYApellidos = !!columnMapping.nombres && !!columnMapping.apellidos;
        
        if (!columnMapping.cedula || !columnMapping.correo || (!hasNombreCompleto && !hasNombresYApellidos)) {
            alert("Por favor configure el mapeo de columnas para: Cédula, Correo, y (Nombre Completo O Nombres y Apellidos)");
            return;
        }

        setProcessing(true);
        setResult(null);

        try {
            const workbook = new ExcelJS.Workbook();
            const buffer = await file.arrayBuffer();
            await workbook.xlsx.load(buffer);

            const worksheet = workbook.worksheets[0];
            const headers = excelHeaders;

            const users: BulkUploadUser[] = [];

            // Leer todas las filas (empezando desde la fila 2, ya que la 1 es encabezado)
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // Skip header row
                
                const rowData: any = {};

                headers.forEach((header, index) => {
                    const cell = row.getCell(index + 1);
                    rowData[header] = cell.value?.toString() || "";
                });

                // Mapear datos según la configuración
                let nombres = "";
                let apellidos = "";

                // Si hay nombre completo, dividirlo por coma
                if (columnMapping.nombreCompleto && rowData[columnMapping.nombreCompleto]) {
                    const nombreCompleto = rowData[columnMapping.nombreCompleto].trim();
                    const partes = nombreCompleto.split(",").map((p: string) => p.trim());
                    
                    if (partes.length >= 2) {
                        // Formato: "Apellido, Nombre" o "Apellido1 Apellido2, Nombre1 Nombre2"
                        apellidos = partes[0]; // Primera parte antes de la coma = apellidos
                        nombres = partes.slice(1).join(" "); // Resto después de la coma = nombres
                    } else if (partes.length === 1) {
                        // Si no hay coma, intentar dividir por espacio (última palabra = apellido)
                        const palabras = partes[0].split(" ");
                        if (palabras.length >= 2) {
                            apellidos = palabras[palabras.length - 1];
                            nombres = palabras.slice(0, -1).join(" ");
                        } else {
                            nombres = partes[0];
                        }
                    }
                } else {
                    // Usar columnas separadas
                    nombres = rowData[columnMapping.nombres] || "";
                    apellidos = rowData[columnMapping.apellidos] || "";
                }

                const user: BulkUploadUser = {
                    cedula: rowData[columnMapping.cedula] || "",
                    nombres: nombres,
                    apellidos: apellidos,
                    correo: rowData[columnMapping.correo] || "",
                };

                if (columnMapping.telefonoLocal && rowData[columnMapping.telefonoLocal]) {
                    user.telefonoLocal = rowData[columnMapping.telefonoLocal];
                }

                if (columnMapping.telefonoCelular && rowData[columnMapping.telefonoCelular]) {
                    user.telefonoCelular = rowData[columnMapping.telefonoCelular];
                }

                if (columnMapping.nrc && rowData[columnMapping.nrc]) {
                    user.nrc = rowData[columnMapping.nrc];
                }

                if (columnMapping.tipo && rowData[columnMapping.tipo]) {
                    user.tipo = rowData[columnMapping.tipo];
                }

                // Solo agregar si tiene datos mínimos
                if (user.cedula && user.nombres && user.apellidos && user.correo) {
                    users.push(user);
                }
            });

            if (users.length === 0) {
                alert("No se encontraron usuarios válidos en el archivo");
                setProcessing(false);
                return;
            }

            // Procesar carga masiva
            const uploadResult = await processBulkUpload(users, tipo, term);
            setResult(uploadResult);

            if (uploadResult.success || uploadResult.created > 0 || uploadResult.updated > 0) {
                setTimeout(() => {
                    onSuccess();
                    handleClose();
                }, 2000);
            }
        } catch (error: any) {
            console.error("Error al procesar archivo:", error);
            setResult({
                success: false,
                created: 0,
                updated: 0,
                errors: [{ row: 0, cedula: "", error: error.message || "Error al procesar el archivo" }],
                message: "Error al procesar el archivo"
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setExcelHeaders([]);
        setPreviewData([]);
        setColumnMapping({
            cedula: "",
            nombres: "",
            apellidos: "",
            nombreCompleto: "",
            correo: "",
            telefonoLocal: "",
            telefonoCelular: "",
            nrc: "",
            tipo: ""
        });
        setResult(null);
        setTerm("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-sky-950">Carga Masiva de Usuarios</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Tipo y Semestre */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-sky-950 mb-2">
                                Tipo de Usuario *
                            </label>
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value as "Estudiante" | "Profesor")}
                                className="w-full bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block p-2.5"
                            >
                                <option value="Estudiante">Estudiante</option>
                                <option value="Profesor">Profesor</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-sky-950 mb-2">
                                Semestre (Term) *
                            </label>
                            <select
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                                className="w-full bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block p-2.5"
                                required
                            >
                                <option value="">Seleccione un semestre</option>
                                {semestres.map((sem) => (
                                    <option key={sem.term} value={sem.term}>
                                        {sem.term} ({new Date(sem.fecha_inicio).toLocaleDateString()} - {new Date(sem.fecha_final).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Carga de archivo */}
                    <div>
                        <label className="block text-sm font-semibold text-sky-950 mb-2">
                            Archivo Excel *
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            className="w-full bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block p-2.5"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Formatos soportados: .xlsx, .xls
                        </p>
                    </div>

                    {/* Configuración de columnas */}
                    {excelHeaders.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-sky-950 mb-3">
                                Configuración de Columnas
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-sky-950 mb-2">
                                        Cédula *
                                    </label>
                                    <select
                                        value={columnMapping.cedula}
                                        onChange={(e) => setColumnMapping({ ...columnMapping, cedula: e.target.value })}
                                        className="w-full bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block p-2.5"
                                    >
                                        <option value="">Seleccione columna</option>
                                        {excelHeaders.map((header) => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-sky-950 mb-2">
                                        Nombre Completo (Apellido, Nombre) *
                                    </label>
                                    <select
                                        value={columnMapping.nombreCompleto || ""}
                                        onChange={(e) => {
                                            const newMapping = { ...columnMapping, nombreCompleto: e.target.value || undefined };
                                            // Si se selecciona nombre completo, limpiar nombres y apellidos
                                            if (e.target.value) {
                                                newMapping.nombres = "";
                                                newMapping.apellidos = "";
                                            }
                                            setColumnMapping(newMapping);
                                        }}
                                        className="w-full bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block p-2.5"
                                    >
                                        <option value="">No usar (usar columnas separadas)</option>
                                        {excelHeaders.map((header) => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Si el nombre y apellido están en una columna separados por coma (ej: "Pérez, Juan")
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-sky-950 mb-2">
                                        Nombres {!columnMapping.nombreCompleto ? "*" : ""}
                                    </label>
                                    <select
                                        value={columnMapping.nombres}
                                        onChange={(e) => {
                                            const newMapping = { ...columnMapping, nombres: e.target.value };
                                            // Si se selecciona nombres, limpiar nombre completo
                                            if (e.target.value) {
                                                newMapping.nombreCompleto = undefined;
                                            }
                                            setColumnMapping(newMapping);
                                        }}
                                        disabled={!!columnMapping.nombreCompleto}
                                        className="w-full bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block p-2.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Seleccione columna</option>
                                        {excelHeaders.map((header) => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-sky-950 mb-2">
                                        Apellidos {!columnMapping.nombreCompleto ? "*" : ""}
                                    </label>
                                    <select
                                        value={columnMapping.apellidos}
                                        onChange={(e) => {
                                            const newMapping = { ...columnMapping, apellidos: e.target.value };
                                            // Si se selecciona apellidos, limpiar nombre completo
                                            if (e.target.value) {
                                                newMapping.nombreCompleto = undefined;
                                            }
                                            setColumnMapping(newMapping);
                                        }}
                                        disabled={!!columnMapping.nombreCompleto}
                                        className="w-full bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block p-2.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Seleccione columna</option>
                                        {excelHeaders.map((header) => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-sky-950 mb-2">
                                        Correo *
                                    </label>
                                    <select
                                        value={columnMapping.correo}
                                        onChange={(e) => setColumnMapping({ ...columnMapping, correo: e.target.value })}
                                        className="w-full bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block p-2.5"
                                    >
                                        <option value="">Seleccione columna</option>
                                        {excelHeaders.map((header) => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-sky-950 mb-2">
                                        Teléfono Local
                                    </label>
                                    <select
                                        value={columnMapping.telefonoLocal || ""}
                                        onChange={(e) => setColumnMapping({ ...columnMapping, telefonoLocal: e.target.value || undefined })}
                                        className="w-full bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block p-2.5"
                                    >
                                        <option value="">No usar</option>
                                        {excelHeaders.map((header) => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-sky-950 mb-2">
                                        Teléfono Celular
                                    </label>
                                    <select
                                        value={columnMapping.telefonoCelular || ""}
                                        onChange={(e) => setColumnMapping({ ...columnMapping, telefonoCelular: e.target.value || undefined })}
                                        className="w-full bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block p-2.5"
                                    >
                                        <option value="">No usar</option>
                                        {excelHeaders.map((header) => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-sky-950 mb-2">
                                        NRC
                                    </label>
                                    <select
                                        value={columnMapping.nrc || ""}
                                        onChange={(e) => setColumnMapping({ ...columnMapping, nrc: e.target.value || undefined })}
                                        className="w-full bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block p-2.5"
                                    >
                                        <option value="">No usar</option>
                                        {excelHeaders.map((header) => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-sky-950 mb-2">
                                        Tipo
                                    </label>
                                    <select
                                        value={columnMapping.tipo || ""}
                                        onChange={(e) => setColumnMapping({ ...columnMapping, tipo: e.target.value || undefined })}
                                        className="w-full bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block p-2.5"
                                    >
                                        <option value="">No usar</option>
                                        {excelHeaders.map((header) => (
                                            <option key={header} value={header}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vista previa */}
                    {previewData.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-sky-950 mb-3">
                                Vista Previa (primeras 5 filas)
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            {excelHeaders.map((header) => (
                                                <th key={header} className="border border-gray-300 px-2 py-1 text-left">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((row, idx) => (
                                            <tr key={idx}>
                                                {excelHeaders.map((header) => (
                                                    <td key={header} className="border border-gray-300 px-2 py-1">
                                                        {row[header] || ""}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Resultados */}
                    {result && (
                        <div className={`p-4 rounded-lg ${result.success ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
                            <h3 className="font-semibold text-lg mb-2">
                                {result.success ? "✓ Proceso Completado" : "⚠ Proceso Completado con Errores"}
                            </h3>
                            <p className="mb-2">{result.message}</p>
                            <p className="text-sm">
                                <strong>Usuarios creados:</strong> {result.created} |{" "}
                                <strong>Perfiles creados/actualizados:</strong> {result.updated} |{" "}
                                <strong>Errores:</strong> {result.errors.length}
                            </p>
                            {result.errors.length > 0 && (
                                <div className="mt-3 max-h-40 overflow-y-auto">
                                    <p className="font-semibold text-sm mb-1">Errores:</p>
                                    <ul className="text-xs list-disc list-inside">
                                        {result.errors.slice(0, 10).map((error, idx) => (
                                            <li key={idx}>
                                                Fila {error.row} (Cédula: {error.cedula}): {error.error}
                                            </li>
                                        ))}
                                        {result.errors.length > 10 && (
                                            <li>... y {result.errors.length - 10} errores más</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 bg-gray-200 text-sky-950 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            disabled={processing}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleProcess}
                            disabled={processing || !file || !term || !columnMapping.cedula || !columnMapping.correo || (!columnMapping.nombreCompleto && (!columnMapping.nombres || !columnMapping.apellidos))}
                            className="px-4 py-2 bg-sky-950 text-white rounded-lg font-semibold hover:bg-[#325B84] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {processing ? "Procesando..." : "Procesar Carga Masiva"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

