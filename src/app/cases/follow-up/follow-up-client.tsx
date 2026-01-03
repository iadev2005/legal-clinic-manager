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
import { Input } from "@/components/shadcn/input";

import {
    getHistorialEstatus,
    getAccionesCaso
} from "@/actions/casos";
import { getCaseReportData } from "@/actions/cases";
import CaseDetailsModal from "@/components/ui/case-details-modal";

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

    // Filter logic
    const filteredData = data.filter(item => {
        const matchesText =
            item.description.toLowerCase().includes(filterText.toLowerCase()) ||
            item.type.toLowerCase().includes(filterText.toLowerCase()) ||
            item.author.toLowerCase().includes(filterText.toLowerCase());

        const matchesRole =
            roleFilter === "Todos" ||
            (roleFilter === "Estudiante" && item.author.includes("Alumno")) ||
            (roleFilter === "Profesor" && item.author.includes("Profesor")) ||
            (roleFilter === "Sistema" && item.author === "Sistema");

        return matchesText && matchesRole;
    });

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
            className: "text-base text-sky-950/80 leading-snug min-w-[300px]",
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
                                Historial Completo de Actuaciones
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
                            {["Todos", "Estudiante", "Profesor", "Sistema"].map((role) => (
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

                <div className="flex-1 p-8 overflow-hidden bg-neutral-50">
                    <div className="h-full bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                        <CustomTable
                            data={filteredData}
                            columns={columns}
                            className="h-full border-0 rounded-none shadow-none"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


export default function FollowUpClient() {
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

    const handleSaveAction = () => {
        // Placeholder as requested - No real mutation yet
        if (!newActionProblem.trim() && !newActionOrientation.trim()) return;

        console.log("Saving action (UI only):", { problem: newActionProblem, orientation: newActionOrientation });

        // Mock update UI for immediate feedback if needed, restricted as requested.
        setNewActionProblem("");
        setNewActionOrientation("");
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
        type: "pdf" // Placeholder type
    })) || [];

    const historyDisplay = caseDetails?.actions?.map((action: any) => ({
        id: action.id_accion,
        type: action.titulo_accion || "Actuación",
        date: new Date(action.fecha_realizacion).toLocaleDateString("es-ES", { day: '2-digit', month: 'long', year: 'numeric' }),
        author: action.nombres ? `${action.nombres} ${action.apellidos}` : "Usuario",
        description: action.observacion || ""
    })) || [];

    // Add status history to display if needed, or mix them. Usually actions are separate from status changes.
    // For now we use the 'actions' (Bitácora) as the main history timeline per the mock.

    const historyPreview = historyDisplay.slice(0, 3);

    if (!selectedCaseId || isLoadingDetails || !caseDetails) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                <div className="flex flex-col items-center gap-4">
                    <span className="icon-[svg-spinners--180-ring-with-bg] text-4xl text-[#3E7DBB]"></span>
                    <p className="text-sky-950/60 font-medium">Cargando expediente...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-none px-8 pt-8 pb-6 bg-white border-b border-neutral-200">
                <h1 className="text-sky-950 text-5xl font-bold tracking-tight">
                    Gestión de Casos
                </h1>
                <p className="text-[#325B84] text-lg font-medium mt-2">
                    Visualiza el historial de actuaciones, citas y recaudos de un caso específico.
                </p>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-neutral-50 p-8">
                {/* Case Selected View */}
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
                        <button
                            onClick={() => router.push('/cases')}
                            className="px-5 py-2.5 bg-[#003366] hover:bg-[#002244] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                        >
                            <span className="icon-[mdi--arrow-left] text-lg"></span>
                            Volver a Casos
                        </button>
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
                                        className="text-sm font-bold text-[#3E7DBB] hover:underline uppercase tracking-wide cursor-pointer flex items-center gap-1"
                                    >
                                        <span className="icon-[mdi--eye-plus-outline] text-lg"></span>
                                        Ver Todo
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
                                        <div className="text-sky-950/60 text-sm font-medium mb-1">Alumno Asignado:</div>
                                        <div className="text-sky-950 font-bold">
                                            {caseDetails?.students?.[0] ? `${caseDetails.students[0].nombres} ${caseDetails.students[0].apellidos}` : "Sin Asignar"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sky-950/60 text-sm font-medium mb-1">Estatus:</div>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                            <span className="icon-[mdi--circle] text-[8px] mr-1.5"></span>
                                            {caseDetails?.caseInfo?.estatus_actual || "Desconocido"}
                                        </span>
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

                            {/* Documents Card */}
                            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                                <h3 className="text-sky-950 text-xl font-bold mb-4">
                                    Recaudos Consignados:
                                </h3>
                                <div className="space-y-2 mb-4">
                                    {documentsDisplay.length > 0 ? documentsDisplay.map((doc: any) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                                            <div className="flex items-center gap-2">
                                                <span className="icon-[mdi--file-pdf-box] text-red-500 text-xl"></span>
                                                <span className="text-sky-950 text-sm font-medium">{doc.name}</span>
                                            </div>
                                            <button className="text-sky-950/40 hover:text-[#3E7DBB] transition-colors cursor-pointer">
                                                <span className="icon-[mdi--download] text-xl"></span>
                                            </button>
                                        </div>
                                    )) : <p className="text-gray-400 text-sm">No hay documentos cargados.</p>}
                                </div>
                                <button className="w-full py-3 bg-[#003366] hover:bg-[#002244] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2">
                                    <span className="icon-[mdi--upload] text-lg"></span>
                                    Subir Documentos
                                </button>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="col-span-2 space-y-6">
                            {/* Register New Action Card */}
                            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                                <h3 className="text-sky-950 text-xl font-bold mb-4">
                                    Registrar Nueva Actuación:
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <textarea
                                            placeholder="Síntesis del problema..."
                                            value={newActionProblem}
                                            onChange={(e) => setNewActionProblem(e.target.value)}
                                            className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-200 text-sky-950 text-sm font-medium placeholder:text-sky-950/40 focus:outline-none focus:border-[#3E7DBB] focus:bg-white transition-all resize-none h-24"
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            placeholder="Orientación dada por el alumno..."
                                            value={newActionOrientation}
                                            onChange={(e) => setNewActionOrientation(e.target.value)}
                                            className="w-full px-4 py-3 bg-neutral-50 rounded-xl border-2 border-neutral-200 text-sky-950 text-sm font-medium placeholder:text-sky-950/40 focus:outline-none focus:border-[#3E7DBB] focus:bg-white transition-all resize-none h-24"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleAttachFile}
                                            className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-sky-950 text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                                        >
                                            <span className="icon-[mdi--paperclip] text-lg"></span>
                                            Adjuntar
                                        </button>
                                        <button
                                            onClick={handleSaveAction}
                                            className="flex-1 px-5 py-2.5 bg-[#003366] hover:bg-[#002244] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <span className="icon-[mdi--content-save] text-lg"></span>
                                            Guardar Actuación
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Action History Timeline */}
                            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sky-950 text-xl font-bold">
                                        Historial de Actuaciones:
                                    </h3>
                                    <button
                                        onClick={() => setIsHistoryModalOpen(true)}
                                        className="text-sm font-bold text-[#3E7DBB] hover:underline uppercase tracking-wide cursor-pointer flex items-center gap-1"
                                    >
                                        <span className="icon-[mdi--eye-outline] text-lg"></span>
                                        Ver Todo
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {historyPreview.length > 0 ? historyPreview.map((action: any, index: number) => (
                                        <div key={action.id} className="flex gap-4">
                                            {/* Timeline Icon */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-[#3E7DBB] flex items-center justify-center flex-none">
                                                    <span className="icon-[mdi--file-document-outline] text-[#3E7DBB] text-lg"></span>
                                                </div>
                                                {index < historyPreview.length - 1 && (
                                                    <div className="w-0.5 flex-1 bg-neutral-200 my-2"></div>
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
                                                    {action.description}
                                                </p>
                                            </div>
                                        </div>
                                    )) : <p className="text-gray-400 text-sm">No hay historial disponible.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                        status: caseDetails.caseInfo?.estatus_actual || "EN_PROCESO",
                        createdAt: caseDetails.caseInfo?.fecha_caso_inicio || ""
                    }}
                    preloadedDetails={caseDetails}
                    preloadedStatusHistory={statusHistory}
                />
            )}
        </div>
    );
}
