"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/shadcn/dialog";
import { CustomTable, type Column } from "@/components/ui/custom-table";
import { DownloadCaseReportButton } from "@/components/DownloadCaseReportButton";
import { Input } from "@/components/shadcn/input";

import {
    getHistorialEstatus,
    getAccionesCaso,
    createAccion,
    getEstatus,
    type CreateAccionData
} from "@/actions/casos";
import { getCaseReportData } from "@/actions/cases";
import CaseDetailsModal from "@/components/ui/case-details-modal";
import { StatusChangeDialog } from "@/components/ui/status-change-dialog";

// --- Interfaces ---

// Interface for search results no longer used here but might be kept if imported elsewhere? 
// cleaning up...
interface SearchResultCase {
    nro_caso: number;
    // ...
}

interface Action {
    id: string;
    type: string;
    date: string;
    author: string;
    role?: string;
    description: string;
}

// --- Action History Modal ---

interface ActionHistoryModalProps {
    open: boolean;
    onClose: () => void;
    data: Action[];
}

function ActionHistoryModal({ open, onClose, data }: ActionHistoryModalProps) {
    const [filterText, setFilterText] = useState("");
    const [roleFilter, setRoleFilter] = useState("Todos");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterText, roleFilter]);

    // Filter logic
    const filteredData = data.filter(item => {
        const matchesText =
            item.description.toLowerCase().includes(filterText.toLowerCase()) ||
            item.type.toLowerCase().includes(filterText.toLowerCase()) ||
            item.author.toLowerCase().includes(filterText.toLowerCase());

        const matchesRole =
            roleFilter === "Todos" ||
            (roleFilter === "Estudiantes" && (item.role === "Estudiante" || item.author.includes("Alumno"))) ||
            (roleFilter === "Profesores" && (item.role === "Profesor" || item.author.includes("Profesor"))) ||
            (roleFilter === "Coordinadores" && item.role === "Coordinador") ||
            (roleFilter === "Administradores" && (item.role === "Administrador" || item.role === "Admin" || item.author === "Sistema"));

        return matchesText && matchesRole;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const columns: Column<Action>[] = [
        {
            header: "Fecha",
            accessorKey: "date",
            className: "text-base font-bold text-sky-950 whitespace-nowrap",
        },
        {
            header: "Tipo / Autor",
            accessorKey: "type",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sky-950">{item.type}</span>
                    <span className="text-sm text-sky-950/60">{item.author}</span>
                </div>
            ),
        },
        {
            header: "Descripción",
            accessorKey: "description",
            render: (item) => (
                <div className="text-base text-sky-950/80 leading-snug whitespace-pre-wrap">
                    {item.description.split(/(\bProblema:|\bOrientación:|\bNuevo estatus:|\bMotivo:)/).map((part, i) => {
                        if (["Problema:", "Orientación:", "Nuevo estatus:", "Motivo:"].includes(part)) {
                            return <strong key={i} className="text-sky-950 font-black">{part}</strong>;
                        }
                        return (
                            <span key={i}>
                                {part.split(/(\s+)/).map((subPart, j) => {
                                    if (!/\s/.test(subPart) && subPart.length > 20) {
                                        return subPart.match(/.{1,20}/g)?.join('\u200B') || subPart;
                                    }
                                    return subPart;
                                }).join('')}
                            </span>
                        );
                    })}
                </div>
            ),
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl bg-neutral-50 p-0 overflow-hidden border-0 rounded-3xl flex flex-col max-h-[85vh]">
                <DialogHeader className="p-8 bg-white border-b border-neutral-100 flex-none">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <DialogTitle className="text-sky-950 font-bold text-3xl flex items-center gap-3">
                                <span className="icon-[mdi--history] text-[#3E7DBB]"></span>
                                Historial Completo de Acciones
                            </DialogTitle>
                            <DialogDescription className="text-lg text-sky-950/60">
                                Visualiza y filtra todas las acciones registradas en este expediente.
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 mt-6">
                        <div className="relative flex-1">
                            <span className="icon-[mdi--magnify] text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-xl"></span>
                            <Input
                                placeholder="Buscar en descripción, tipo o autor..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                className="pl-10 bg-neutral-50 border-neutral-200 h-12 text-base rounded-xl"
                            />
                        </div>
                        <div className="flex bg-neutral-100 p-1 rounded-xl">
                            {["Todos", "Estudiantes", "Profesores", "Coordinadores", "Administradores"].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                        roleFilter === role
                                            ? "bg-white text-[#003366] shadow-sm"
                                            : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 p-8 overflow-hidden bg-neutral-50 flex flex-col min-h-0">
                    <div className="flex-1 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col min-h-0">

                        <CustomTable
                            data={paginatedData}
                            columns={columns}
                            className="flex-1 border-0 rounded-none shadow-none"
                            minRows={10}
                        />
                        {/* Pagination Footer */}
                        <div className="flex-none p-4 border-t border-neutral-200 bg-white flex items-center justify-between">
                            <p className="text-sm text-sky-950/60 font-medium">
                                Mostrando {filteredData.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} acciones
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg text-sky-950 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                >
                                    <span className="icon-[mdi--chevron-left] text-2xl"></span>
                                </button>
                                <span className="text-sm font-bold text-sky-950">
                                    Página {currentPage} de {totalPages || 1}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-2 rounded-lg text-sky-950 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                >
                                    <span className="icon-[mdi--chevron-right] text-2xl"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Mapear estatus de BD a formato del frontend
const mapEstatusToFrontend = (estatus: string | null): "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA" | "PAUSADO" => {
    if (!estatus) return "EN_PROCESO";
    const upper = estatus.toUpperCase();
    if (upper.includes("PROCESO")) return "EN_PROCESO";
    if (upper.includes("ARCHIVADO")) return "ARCHIVADO";
    if (upper.includes("ENTREGADO")) return "ENTREGADO";
    if (upper.includes("ASESORIA") || upper.includes("ASESORÍA")) return "ASESORIA";
    if (upper.includes("PAUSADO")) return "PAUSADO";
    return "EN_PROCESO";
};
export default function FollowUpClient({ user }: { user: any }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const paramCaseId = searchParams.get("caseId");

    // Selected Case State
    const [selectedCaseId, setSelectedCaseId] = useState<number | null>(paramCaseId ? parseInt(paramCaseId) : null);
    const [caseDetails, setCaseDetails] = useState<any>(null); // Full details from getCaseReportData
    const [statusHistory, setStatusHistory] = useState<any[]>([]); // From getHistorialEstatus
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // New Action State
    const [newActionProblem, setNewActionProblem] = useState("");
    const [newActionOrientation, setNewActionOrientation] = useState("");
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSavingAction, setIsSavingAction] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState(false);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

    // Redirect if no caseId
    useEffect(() => {
        if (!paramCaseId) {
            router.replace("/cases");
        } else {
            setSelectedCaseId(parseInt(paramCaseId));
        }
    }, [paramCaseId, router]);
    useEffect(() => {
        const loadDetails = async () => {
            if (!selectedCaseId) {
                setCaseDetails(null);
                setStatusHistory([]);
                return;
            }

            setIsLoadingDetails(true);
            try {
                const [details, history] = await Promise.all([
                    getCaseReportData(selectedCaseId.toString()),
                    getHistorialEstatus(selectedCaseId)
                ]);

                if (details) setCaseDetails(details);
                if (history.success) setStatusHistory(history.data || []);

            } catch (error) {
                console.error("Error loading case details:", error);
            } finally {
                setIsLoadingDetails(false);
            }
        };

        if (selectedCaseId) loadDetails();
    }, [selectedCaseId]);


    // Handlers removed (search/click)

    const refreshData = async () => {
        if (!selectedCaseId) return;
        setIsLoadingDetails(true);
        try {
            const [details, history] = await Promise.all([
                getCaseReportData(selectedCaseId.toString()),
                getHistorialEstatus(selectedCaseId)
            ]);

            if (details) setCaseDetails(details);
            if (history.success) setStatusHistory(history.data || []);
        } catch (error) {
            console.error("Error refreshing case details:", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleSaveAction = async () => {
        if (!selectedCaseId) return;
        if (!newActionProblem.trim() && !newActionOrientation.trim()) {
            setActionError('Por favor ingrese al menos una descripción');
            return;
        }

        setIsSavingAction(true);
        setActionError(null);
        setActionSuccess(false);

        try {
            // Combinar problema y orientación en el formato esperado
            const titulo = newActionProblem.trim() || 'Acción registrada';
            const observacion = [
                newActionProblem.trim() && `Problema: ${newActionProblem.trim()}`,
                newActionOrientation.trim() && `Orientación: ${newActionOrientation.trim()}`
            ].filter(Boolean).join('\n\n');

            const result = await createAccion({
                nro_caso: selectedCaseId,
                titulo_accion: titulo,
                observacion: observacion || undefined
            });

            if (result.success) {
                // Limpiar formulario
                setNewActionProblem("");
                setNewActionOrientation("");
                setActionSuccess(true);

                // Recargar datos del caso para mostrar la nueva acción
                await refreshData();

                // Ocultar mensaje de éxito después de 3 segundos
                setTimeout(() => setActionSuccess(false), 3000);
            } else {
                setActionError(result.error || 'Error al guardar la acción');
            }
        } catch (error: any) {
            setActionError(error.message || 'Error al guardar la acción');
        } finally {
            setIsSavingAction(false);
        }
    };

    const handleAttachFile = () => {
        console.log("Attaching file");
        // TODO: Implement file attachment
    };

    // Derived Data for UI
    const appointmentsDisplay = caseDetails?.appointments?.map((appt: any) => ({
        id: appt.id_cita,
        title: appt.observacion || "Cita Programada",
        date: new Date(appt.fecha_atencion).toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date(appt.fecha_atencion).toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })
    })) || [];

    const documentsDisplay = caseDetails?.supports?.map((doc: any) => ({
        id: doc.id_soporte,
        name: doc.descripcion || "Documento",
        type: "pdf", // Placeholder type
        url: doc.documento_url // Correct property from API
    })) || [];

    const actionsDisplay = caseDetails?.actions?.map((action: any, index: number) => ({
        id: `action-${action.nro_accion || index}`,
        type: action.titulo_accion || "Acción",
        dateObj: new Date(action.fecha_registro || action.fecha_realizacion),
        date: new Date(action.fecha_realizacion).toLocaleDateString("es-ES", { day: '2-digit', month: 'long', year: 'numeric' }),
        author: action.nombres ? `${action.nombres} ${action.apellidos}` : "Usuario",
        role: action.rol,
        description: action.observacion || "",
        isStatusChange: false
    })) || [];

    const statusDisplay = statusHistory.map((status: any, index: number) => {
        // Logic for "Caso creado"
        const isCaseCreated = status.motivo === "Caso creado";
        const displayType = isCaseCreated ? "Caso creado" : "Cambio de Estatus";
        const displayDescription = isCaseCreated
            ? `Caso creado con estatus: ${status.nombre_estatus}`
            : `Nuevo estatus: ${status.nombre_estatus}${status.motivo ? `.\nMotivo: ${status.motivo}` : ""}`;

        return {
            id: `status-${index}`,
            type: displayType,
            dateObj: new Date(status.fecha_registro),
            date: new Date(status.fecha_registro).toLocaleDateString("es-ES", { day: '2-digit', month: 'long', year: 'numeric' }),
            author: status.usuario_nombre || "Sistema",
            role: status.rol || "Sistema",
            description: displayDescription,
            isStatusChange: true
        };
    }) || [];

    const historyDisplay = [...actionsDisplay, ...statusDisplay].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

    // Add status history to display if needed, or mix them. Usually actions are separate from status changes.
    // For now we use the 'actions' (Bitácora) as the main history timeline per the mock.

    const historyPreview = historyDisplay.slice(0, 3);

    // Loading State Logic handled in render below to keep header visible


    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-none px-8 pt-8 pb-6 bg-white border-b border-neutral-200 flex justify-between items-center">
                <div>
                    <h1 className="text-sky-950 text-4xl font-bold tracking-tight">
                        Gestión de Casos
                    </h1>
                    <p className="text-[#325B84] text-lg font-medium mt-2">
                        Visualiza el historial de acciones, citas y recaudos de un caso específico.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/cases')}
                    className="px-8 py-4 bg-[#003366] hover:bg-[#002244] text-white text-lg font-bold rounded-xl transition-all hover:scale-105 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-3"
                >
                    <span className="icon-[mdi--arrow-left] text-2xl"></span>
                    Volver a Casos
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-neutral-50 p-8">
                {(!selectedCaseId || isLoadingDetails || !caseDetails) ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <span className="icon-[svg-spinners--180-ring-with-bg] text-4xl text-[#3E7DBB]"></span>
                            <p className="text-sky-950/60 font-medium">Cargando expediente...</p>
                        </div>
                    </div>
                ) : (
                    /* Case Selected View */
                    <div className="max-w-7xl mx-auto">
                        {/* Case Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex flex-col">
                                <h2 className="text-sky-950 text-3xl font-bold flex items-center gap-2">
                                    <span className="icon-[mdi--clipboard-text-clock-outline] text-3xl text-[#3E7DBB]"></span>
                                    Seguimiento y Control
                                </h2>
                                <h3 className="text-sky-950/60 text-xl font-medium mt-1">
                                    Expediente #{selectedCaseId}
                                </h3>
                            </div>
                            <div className="flex gap-2">
                                <DownloadCaseReportButton
                                    caseId={selectedCaseId.toString()}
                                    caseNumber={caseDetails.caseInfo.nro_caso.toString()}
                                />
                            </div>
                        </div>

                        {/* Grid Layout */}
                        <div className="grid grid-cols-3 gap-6">
                            {/* Left Column */}
                            <div className="col-span-1 space-y-6">
                                {/* Case Details Card */}
                                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sky-950 text-xl font-bold">
                                            Detalles del Caso:
                                        </h3>
                                        <button
                                            onClick={() => setIsDetailsModalOpen(true)}
                                            className="px-4 py-2 bg-[#EEF5FB] hover:bg-[#E0EBF7] text-[#3E7DBB] text-xs font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2 cursor-pointer shadow-sm border border-[#3E7DBB]/10"
                                        >
                                            <span className="icon-[mdi--eye-plus-outline] text-xl"></span>
                                            VER TODO
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1">Beneficiario:</div>
                                            <div className="text-sky-950 font-bold">
                                                {caseDetails?.caseInfo?.solicitante_nombres} {caseDetails?.caseInfo?.solicitante_apellidos}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1">Materia:</div>
                                            <div className="text-sky-950 font-bold">{caseDetails?.caseInfo?.nombre_materia}</div>
                                        </div>
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1">Profesor Supervisor:</div>
                                            <div className="text-sky-950 font-bold">
                                                {caseDetails?.supervisors?.[0] ? `${caseDetails.supervisors[0].nombres} ${caseDetails.supervisors[0].apellidos}` : "Sin Asignar"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1">Alumnos Asignados:</div>
                                            <div className="space-y-1">
                                                {caseDetails?.students && caseDetails.students.length > 0 ? (
                                                    caseDetails.students.map((student: any, idx: number) => (
                                                        <div key={idx} className="text-sky-950 font-bold">
                                                            {student.nombres} {student.apellidos}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-sky-950 font-bold">Sin Asignar</div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1 flex items-center justify-between">
                                                <span>Estatus:</span>
                                                <button
                                                    onClick={() => setIsStatusDialogOpen(true)}
                                                    className="px-4 py-1.5 bg-[#EEF5FB] hover:bg-[#E0EBF7] text-[#3E7DBB] text-xs font-black uppercase tracking-widest rounded-lg transition-all hover:scale-105 flex items-center gap-2 cursor-pointer shadow-sm border border-[#3E7DBB]/10 active:scale-95"
                                                >
                                                    <span className="icon-[mdi--swap-horizontal] text-sm"></span>
                                                    CAMBIAR
                                                </button>
                                            </div>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                                <span className="icon-[mdi--circle] text-[8px] mr-1.5"></span>
                                                {caseDetails?.caseInfo?.estatus_actual || "Desconocido"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Beneficiaries Card */}
                                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                                    <h3 className="text-sky-950 text-xl font-bold mb-4">
                                        Beneficiarios:
                                    </h3>
                                    <div className="space-y-3">
                                        {caseDetails?.beneficiaries && caseDetails.beneficiaries.length > 0 ? (
                                            caseDetails.beneficiaries.map((ben: any, idx: number) => (
                                                <div key={idx} className="p-3 bg-pink-50 rounded-xl border border-pink-100">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="icon-[mdi--account] text-pink-600 text-lg"></span>
                                                        <span className="font-bold text-sky-950 text-sm">
                                                            {ben.nombres} {ben.apellidos}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-sky-950/70 ml-6">
                                                        <span className="font-semibold">C.I:</span> {ben.cedula_beneficiario}
                                                    </div>
                                                    <div className="text-xs text-sky-950/70 ml-6">
                                                        <span className="font-semibold">Parentesco:</span> {ben.parentesco || "N/A"}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm">No hay beneficiarios registrados.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Legal Details Card */}
                                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                                    <h3 className="text-sky-950 text-xl font-bold mb-4">
                                        Detalles Legales:
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1">Trámite:</div>
                                            <div className="text-sky-950 font-bold text-sm">{caseDetails?.caseInfo?.nombre_tramite || "N/A"}</div>
                                        </div>
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1">Núcleo:</div>
                                            <div className="text-sky-950 font-bold text-sm">{caseDetails?.caseInfo?.nombre_nucleo || "N/A"}</div>
                                        </div>
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1">Ámbito:</div>
                                            <div className="text-sky-950 font-bold text-sm">{caseDetails?.caseInfo?.nombre_ambito_legal || "N/A"}</div>
                                        </div>
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1">Inicio del Caso:</div>
                                            <div className="text-sky-950 font-bold text-sm">
                                                {caseDetails?.caseInfo?.fecha_caso_inicio
                                                    ? new Date(caseDetails.caseInfo.fecha_caso_inicio).toLocaleDateString("es-ES")
                                                    : "N/A"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Upcoming Appointments Card */}
                                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                                    <h3 className="text-sky-950 text-xl font-bold mb-4">
                                        Próximas Citas:
                                    </h3>
                                    <div className="space-y-3">
                                        {appointmentsDisplay.length > 0 ? appointmentsDisplay.map((appointment: any) => (
                                            <div key={appointment.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                                                <span className="icon-[mdi--calendar-clock] text-[#3E7DBB] text-2xl flex-none mt-0.5"></span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sky-950 font-bold text-sm mb-1">
                                                        {appointment.title}
                                                    </div>
                                                    <div className="text-sky-950/60 text-xs font-medium">
                                                        {appointment.date} - {appointment.time}
                                                    </div>
                                                </div>
                                            </div>
                                        )) : <p className="text-gray-400 text-sm">No hay citas próximas.</p>}
                                    </div>
                                </div>

                                {/* Soportes Legales Section */}
                                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                                    <h3 className="text-sky-950 text-xl font-bold mb-4">
                                        Soportes Legales:
                                    </h3>
                                    <div className="space-y-3">
                                        {documentsDisplay.length > 0 ? documentsDisplay.map((doc: any) => (
                                            doc.url ? (
                                                <a
                                                    key={doc.id}
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-[#3E7DBB] hover:bg-blue-50/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-none group-hover:bg-[#3E7DBB] group-hover:border-[#3E7DBB] transition-colors">
                                                            <span className="icon-[mdi--file-document-outline] text-[#3E7DBB] text-2xl group-hover:text-white transition-colors"></span>
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-sky-950 text-sm font-bold truncate group-hover:text-[#003366] transition-colors" title={doc.name}>
                                                                {doc.name}
                                                            </span>
                                                            <span className="text-sky-950/40 text-xs font-medium group-hover:text-[#3E7DBB] transition-colors">
                                                                Clic para ver documento
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="icon-[mdi--open-in-new] text-neutral-300 text-xl group-hover:text-[#3E7DBB] transition-colors"></span>
                                                </a>
                                            ) : (
                                                <div key={doc.id} className="group flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200 opacity-60">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-none">
                                                            <span className="icon-[mdi--file-document-outline] text-neutral-400 text-2xl"></span>
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-sky-950 text-sm font-bold truncate" title={doc.name}>
                                                                {doc.name}
                                                            </span>
                                                            <span className="text-sky-950/40 text-xs font-medium">No disponible</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )) : (
                                            <div className="text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                                                <span className="icon-[mdi--file-document-remove-outline] text-4xl text-neutral-300 mb-2"></span>
                                                <p className="text-sky-950/40 text-sm font-medium">No hay soportes registrados.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="col-span-2 space-y-6">
                                {/* Register New Action Card */}
                                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                                    <h3 className="text-sky-950 text-xl font-bold mb-4">
                                        Registrar Nueva Acción:
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <textarea
                                                placeholder="Síntesis del problema..."
                                                value={newActionProblem}
                                                onChange={(e) => setNewActionProblem(e.target.value)}
                                                disabled={isSavingAction}
                                                className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-200 text-sky-950 text-sm font-medium placeholder:text-sky-950/40 focus:outline-none focus:border-[#3E7DBB] focus:bg-white transition-all resize-none h-24 disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <textarea
                                                placeholder="Orientación dada por el alumno..."
                                                value={newActionOrientation}
                                                onChange={(e) => setNewActionOrientation(e.target.value)}
                                                disabled={isSavingAction}
                                                className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-200 text-sky-950 text-sm font-medium placeholder:text-sky-950/40 focus:outline-none focus:border-[#3E7DBB] focus:bg-white transition-all resize-none h-24 disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>

                                        {/* Error Message */}
                                        {actionError && (
                                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                                <span className="icon-[mdi--alert-circle] text-lg"></span>
                                                {actionError}
                                            </div>
                                        )}

                                        {/* Success Message */}
                                        {actionSuccess && (
                                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                                <span className="icon-[mdi--check-circle] text-lg"></span>
                                                Acción guardada exitosamente
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleSaveAction}
                                                disabled={isSavingAction}
                                                className="flex-1 px-5 py-2.5 bg-[#003366] hover:bg-[#002244] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSavingAction ? (
                                                    <>
                                                        <span className="icon-[svg-spinners--180-ring-with-bg] text-lg"></span>
                                                        Guardando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="icon-[mdi--content-save] text-lg"></span>
                                                        Guardar Acción
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Action History Timeline */}
                                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sky-950 text-xl font-bold">
                                            Historial de Acciones:
                                        </h3>
                                        <button
                                            onClick={() => setIsHistoryModalOpen(true)}
                                            className="px-4 py-2 bg-[#EEF5FB] hover:bg-[#E0EBF7] text-[#3E7DBB] text-xs font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2 cursor-pointer shadow-sm border border-[#3E7DBB]/10"
                                        >
                                            <span className="icon-[mdi--eye-outline] text-xl"></span>
                                            VER TODO
                                        </button>
                                    </div>

                                    <div className="flex flex-col">
                                        {historyPreview.length > 0 ? (
                                            <>
                                                {historyPreview.map((action: any, index: number) => (
                                                    <div key={action.id} className="flex gap-4">
                                                        {/* Timeline Icon */}
                                                        <div className="flex flex-col items-center">
                                                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-none ${action.isStatusChange ? "bg-yellow-50 border-yellow-500" : "bg-blue-50 border-[#3E7DBB]"}`}>
                                                                <span className={`text-lg ${action.isStatusChange ? "icon-[mdi--swap-horizontal] text-yellow-600" : "icon-[mdi--file-document-outline] text-[#3E7DBB]"}`}></span>
                                                            </div>
                                                            {(index < historyPreview.length - 1 || historyDisplay.length > 3) && (
                                                                <div className="w-0.5 flex-1 bg-neutral-200"></div>
                                                            )}
                                                        </div>

                                                        {/* Action Content */}
                                                        <div className="flex-1 pb-6">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h4 className="text-sky-950 font-bold text-base mb-1">
                                                                        {action.type}
                                                                    </h4>
                                                                    <p className="text-sky-950/60 text-xs font-medium">
                                                                        {action.date}
                                                                    </p>
                                                                </div>
                                                                <span className="px-3 py-1 bg-blue-50 text-[#3E7DBB] text-xs font-bold rounded-full">
                                                                    {action.author}
                                                                </span>
                                                            </div>
                                                            <p className="text-sky-950/80 text-sm leading-relaxed whitespace-pre-wrap">
                                                                {action.description.split(/(\bProblema:|\bOrientación:|\bNuevo estatus:|\bMotivo:)/).map((part: string, i: number) => {
                                                                    if (["Problema:", "Orientación:", "Nuevo estatus:", "Motivo:"].includes(part)) {
                                                                        return <strong key={i} className="text-sky-950 font-black">{part}</strong>;
                                                                    }
                                                                    return (
                                                                        <span key={i}>
                                                                            {part.split(/(\s+)/).map((subPart: string) => {
                                                                                if (!/\s/.test(subPart) && subPart.length > 20) {
                                                                                    return subPart.match(/.{1,20}/g)?.join('\u200B') || subPart;
                                                                                }
                                                                                return subPart;
                                                                            }).join('')}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* More Content Indicator */}
                                                {historyDisplay.length > 3 && (
                                                    <div className="flex gap-4">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-10 h-10 rounded-full bg-neutral-50 border-2 border-dashed border-neutral-300 flex items-center justify-center flex-none group">
                                                                <span className="icon-[mdi--dots-vertical] text-neutral-400 text-xl group-hover:text-[#3E7DBB] transition-colors"></span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 pt-0.5">
                                                            <button
                                                                onClick={() => setIsHistoryModalOpen(true)}
                                                                className="px-4 py-2 bg-[#EEF5FB] hover:bg-[#E0EBF7] text-[#3E7DBB] text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 flex items-center gap-2 cursor-pointer shadow-sm border border-[#3E7DBB]/10 active:scale-95 group"
                                                            >
                                                                <span className="icon-[mdi--eye-outline] text-lg group-hover:scale-110 transition-transform"></span>
                                                                Ver {historyDisplay.length - 3} más en el historial completo
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : <p className="text-gray-400 text-sm">No hay historial disponible.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* History Modal */}
            <ActionHistoryModal
                open={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                data={historyDisplay}
            />

            {/* Case Details Modal */}
            {selectedCaseId && caseDetails && (
                <CaseDetailsModal
                    open={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    caseData={{
                        id: selectedCaseId.toString(),
                        caseNumber: caseDetails.caseInfo?.nro_caso?.toString() || "",
                        applicantName: caseDetails.caseInfo?.solicitante_nombres || "",
                        applicantId: caseDetails.caseInfo?.cedula_solicitante || "",
                        subject: caseDetails.caseInfo?.nombre_materia || "",
                        procedure: caseDetails.caseInfo?.nombre_tramite || "",
                        tribunal: caseDetails.caseInfo?.nombre_nucleo || "",
                        period: "2024-2025",
                        assignedStudent: caseDetails.students?.[0] ? `${caseDetails.students[0].nombres} ${caseDetails.students[0].apellidos}` : "Sin Asignar",
                        status: mapEstatusToFrontend(caseDetails.caseInfo?.estatus_actual),
                        createdAt: caseDetails.caseInfo?.fecha_caso_inicio || ""
                    }}
                    preloadedDetails={caseDetails}
                    preloadedStatusHistory={statusHistory}
                />
            )}

            {/* Status Change Dialog */}
            {selectedCaseId && (
                <StatusChangeDialog
                    open={isStatusDialogOpen}
                    onClose={() => setIsStatusDialogOpen(false)}
                    nroCaso={selectedCaseId!}
                    currentStatusId={caseDetails?.case?.id_estatus}
                    onStatusChanged={refreshData}
                    cedulaUsuario={user?.cedula}
                />
            )}
        </div>
    );
}
