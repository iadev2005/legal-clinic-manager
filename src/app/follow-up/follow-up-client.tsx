"use client";

import { useState } from "react";
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

interface RecentCase {
    id: string;
    caseNumber: string;
    applicantName: string;
    caseType: string;
    area: string;
}

interface CaseDetails {
    beneficiario: string;
    materia: string;
    profesorSupervisor: string;
    alumnoAsignado: string;
    estatus: string;
}

interface Appointment {
    id: string;
    title: string;
    date: string;
    time: string;
}

interface Document {
    id: string;
    name: string;
    type: string;
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
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCase, setSelectedCase] = useState<RecentCase | null>(null);
    const [newActionProblem, setNewActionProblem] = useState("");
    const [newActionOrientation, setNewActionOrientation] = useState("");
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    // Mock data for recent cases
    const recentCases: RecentCase[] = [
        {
            id: "1",
            caseNumber: "2024-051",
            applicantName: "Carlos Mendoza",
            caseType: "Despido Injustificado",
            area: "Laboral"
        },
        {
            id: "2",
            caseNumber: "2024-050",
            applicantName: "José Torres",
            caseType: "Despido Injustificado",
            area: "Laboral"
        },
        {
            id: "3",
            caseNumber: "2024-049",
            applicantName: "María Rodríguez",
            caseType: "Divorcio",
            area: "Civil"
        },
        {
            id: "4",
            caseNumber: "2024-048",
            applicantName: "Carlos Pérez",
            caseType: "Desalojo",
            area: "Civil"
        }
    ];

    // Mock case details
    const caseDetails: CaseDetails = {
        beneficiario: "Carlos Mendoza",
        materia: "Laboral",
        profesorSupervisor: "Dr. Ricardo Solís",
        alumnoAsignado: "José Gómez",
        estatus: "En Proceso"
    };

    // Mock appointments
    const appointments: Appointment[] = [
        {
            id: "1",
            title: "Revisión de recaudos:",
            date: "05 de Nov, 2025",
            time: "10:00 AM"
        }
    ];

    // Mock documents
    const documents: Document[] = [
        {
            id: "1",
            name: "copia_cedula.pdf",
            type: "pdf"
        },
        {
            id: "2",
            name: "carta_despido.pdf",
            type: "pdf"
        }
    ];

    // Local state for history to allow additions
    const [history, setHistory] = useState<Action[]>([
        {
            id: "1",
            type: "Apertura de Caso:",
            date: "01 de Noviembre, 2025",
            author: "Sistema",
            description: "Se crea el caso #2024-051 asignado al alumno José Gómez y supervisor Dr. Ricardo Solís. Materia: Laboral."
        },
        {
            id: "2",
            type: "Primera Entrevista:",
            date: "01 de Noviembre, 2025",
            author: "Alumno: J. Gómez",
            description: "Síntesis: Cliente manifiesta despido injustificado de la empresa 'XYZ C.A.' el día 20/10/2025. Orientación: Se le indica consignar copia de la C.I., carta de despido. Últimos recibos de pago. Próxima Cita: 05/11/2025 para revisión de recaudos."
        }
    ]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Searching for:", searchQuery);
    };

    const handleCaseClick = (caseItem: RecentCase) => {
        setSelectedCase(caseItem);
    };

    const handleSaveAction = () => {
        if (!newActionProblem.trim() && !newActionOrientation.trim()) return;

        const newAction: Action = {
            id: Date.now().toString(),
            type: "Nueva Actuación:",
            date: new Date().toLocaleDateString("es-ES", { day: '2-digit', month: 'long', year: 'numeric' }),
            author: "Usuario Actual", // Placeholder
            description: `Síntesis: ${newActionProblem}\n\nOrientación: ${newActionOrientation}`
        };

        setHistory([newAction, ...history]);
        setNewActionProblem("");
        setNewActionOrientation("");
    };

    const handleAttachFile = () => {
        console.log("Attaching file");
        // TODO: Implement file attachment
    };

    // Preview only the first few items for the main view
    const historyPreview = history.slice(0, 3);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-none px-8 pt-8 pb-6 bg-white border-b border-neutral-200">
                <h1 className="text-sky-950 text-5xl font-bold tracking-tight">
                    Seguimiento y Control
                </h1>
                <p className="text-[#325B84] text-lg font-medium mt-2">
                    Visualiza el historial de actuaciones, citas y recaudos de un caso específico.
                </p>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-neutral-50 p-8">
                {!selectedCase ? (
                    /* Empty State */
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="max-w-2xl w-full">
                            {/* Icon and Message */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-50 rounded-full mb-6">
                                    <span className="icon-[mdi--file-search-outline] text-[#3E7DBB] text-5xl"></span>
                                </div>
                                <h2 className="text-sky-950 text-3xl font-bold mb-3">
                                    No hay ningún expediente seleccionado
                                </h2>
                                <p className="text-sky-950/60 text-base font-medium">
                                    Por favor, ve a la sección de{" "}
                                    <a
                                        href="/cases"
                                        className="text-[#3E7DBB] font-bold hover:underline"
                                    >
                                        Gestión de Casos
                                    </a>{" "}
                                    para seleccionar un expediente.
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-neutral-300"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-neutral-50 px-4 text-sm font-bold text-sky-950/40 uppercase tracking-wider">
                                        O busca aquí
                                    </span>
                                </div>
                            </div>

                            {/* Search Section */}
                            <div className="space-y-6">
                                <form onSubmit={handleSearch}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Ej: 2024-051 o V-12345678..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full px-5 py-4 pr-32 bg-white rounded-xl border-2 border-neutral-200 text-sky-950 text-base font-medium placeholder:text-sky-950/40 focus:outline-none focus:border-[#3E7DBB] transition-all shadow-sm"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-[#003366] hover:bg-[#002244] text-white text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                                        >
                                            <span className="icon-[mdi--magnify] text-lg"></span>
                                            Buscar
                                        </button>
                                    </div>
                                </form>

                                {/* Recent Cases */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-950/50 px-1">
                                        Expedientes Recientes
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {recentCases.map((caseItem) => (
                                            <button
                                                key={caseItem.id}
                                                onClick={() => handleCaseClick(caseItem)}
                                                className="group p-4 bg-white hover:bg-blue-50 border-2 border-neutral-200 hover:border-[#3E7DBB] rounded-xl transition-all cursor-pointer text-left shadow-sm"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="text-[#3E7DBB] text-sm font-bold">
                                                        #{caseItem.caseNumber}
                                                    </span>
                                                    <span className="icon-[mdi--arrow-right] text-sky-950/30 group-hover:text-[#3E7DBB] group-hover:translate-x-1 transition-all"></span>
                                                </div>
                                                <div className="text-sky-950 font-bold text-base mb-1">
                                                    {caseItem.applicantName}
                                                </div>
                                                <div className="text-xs text-sky-950/60 font-medium">
                                                    {caseItem.area} - {caseItem.caseType}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Case Selected View */
                    <div className="max-w-7xl mx-auto">
                        {/* Case Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sky-950 text-3xl font-bold">
                                Expediente del Caso #{selectedCase.caseNumber}
                            </h2>
                            <button
                                onClick={() => setSelectedCase(null)}
                                className="px-5 py-2.5 bg-[#003366] hover:bg-[#002244] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                            >
                                <span className="icon-[mdi--close-circle-outline] text-lg"></span>
                                Cerrar Expediente
                            </button>
                        </div>

                        {/* Grid Layout */}
                        <div className="grid grid-cols-3 gap-6">
                            {/* Left Column */}
                            <div className="col-span-1 space-y-6">
                                {/* Case Details Card */}
                                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                                    <h3 className="text-sky-950 text-xl font-bold mb-4">
                                        Detalles del Caso:
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1">Beneficiario:</div>
                                            <div className="text-sky-950 font-bold">{caseDetails.beneficiario}</div>
                                        </div>
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1">Materia:</div>
                                            <div className="text-sky-950 font-bold">{caseDetails.materia}</div>
                                        </div>
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1">Profesor Supervisor:</div>
                                            <div className="text-sky-950 font-bold">{caseDetails.profesorSupervisor}</div>
                                        </div>
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1">Alumno Asignado:</div>
                                            <div className="text-sky-950 font-bold">{caseDetails.alumnoAsignado}</div>
                                        </div>
                                        <div>
                                            <div className="text-sky-950/60 text-sm font-medium mb-1">Estatus:</div>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                                <span className="icon-[mdi--circle] text-[8px] mr-1.5"></span>
                                                {caseDetails.estatus}
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
                                        {appointments.map((appointment) => (
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
                                        ))}
                                    </div>
                                </div>

                                {/* Documents Card */}
                                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 shadow-sm">
                                    <h3 className="text-sky-950 text-xl font-bold mb-4">
                                        Recaudos Consignados:
                                    </h3>
                                    <div className="space-y-2 mb-4">
                                        {documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                                                <div className="flex items-center gap-2">
                                                    <span className="icon-[mdi--file-pdf-box] text-red-500 text-xl"></span>
                                                    <span className="text-sky-950 text-sm font-medium">{doc.name}</span>
                                                </div>
                                                <button className="text-sky-950/40 hover:text-[#3E7DBB] transition-colors cursor-pointer">
                                                    <span className="icon-[mdi--download] text-xl"></span>
                                                </button>
                                            </div>
                                        ))}
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
                                        {historyPreview.map((action, index) => (
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
                                        ))}
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
                data={history}
            />
        </div>
    );
}
