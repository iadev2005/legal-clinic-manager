"use client";

import { useState, useMemo, useEffect } from "react";
import PrimaryButton from "@/components/ui/primary-button";
import { BarChart } from "@/components/ui/bar-chart";
import { type ChartConfig } from "@/components/shadcn/chart";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import { cn } from "@/lib/utils";
import { getCitas, createCita, updateCita, deleteCita, getUpcomingCitas, getCitaById, getUsuariosAsignadosACita } from "@/actions/citas";
import { getCasos, getAlumnosDisponibles, getProfesoresDisponibles } from "@/actions/casos";
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal";

// --- Types & Interfaces ---

interface Appointment {
    id: number;
    caseNumber: string;
    caseName: string;
    date: Date;
    time: string;
    type: string;
    participants: string;
    id_cita?: number;
    nro_caso?: number;
    observacion?: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

// --- Helper Components ---

const CustomSelect = ({ value, onChange, options, className, placeholder = "Seleccionar", disabled = false }: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={cn("relative", className)}>
            <div
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors flex items-center justify-between",
                    disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : "cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                )}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={selectedOption ? "text-sky-950" : "text-muted-foreground"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="icon-[mingcute--down-fill] text-sm text-gray-500"></span>
            </div>

            {isOpen && (
                <div className="absolute top-[110%] left-0 w-full rounded-md border bg-white shadow-md z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={cn(
                                "px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-blue-50 text-sky-950",
                                value === option.value && "bg-blue-100 font-semibold"
                            )}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Helper Functions ---

const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
        consulta: "Consulta Inicial",
        seguimiento: "Seguimiento",
        audiencia: "Preparación Audiencia",
        entrega: "Entrega de Documentos",
    };
    return types[type] || type;
};

const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
        consulta: "bg-blue-100 text-blue-700",
        seguimiento: "bg-green-100 text-green-700",
        audiencia: "bg-purple-100 text-purple-700",
        entrega: "bg-orange-100 text-orange-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
};

// --- Day Details Modal ---

interface DayDetailsModalProps {
    open: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    appointments: Appointment[];
    onEdit?: (appointment: Appointment) => void;
    onDelete?: (appointment: Appointment) => void;
}

function DayDetailsModal({ open, onClose, selectedDate, appointments, onEdit, onDelete }: DayDetailsModalProps) {
    if (!selectedDate) return null;

    const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getDate() === selectedDate.getDate() &&
            aptDate.getMonth() === selectedDate.getMonth() &&
            aptDate.getFullYear() === selectedDate.getFullYear();
    });

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };



    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-sky-950 text-3xl font-semibold flex items-center gap-3">
                        <span className="icon-[mdi--calendar-today] text-4xl text-[#3E7DBB]"></span>
                        Detalles del Día
                    </DialogTitle>
                    <p className="text-sky-950/70 text-lg font-medium mt-2">
                        {formatDate(selectedDate)}
                    </p>
                </DialogHeader>

                {dayAppointments.length > 0 ? (
                    <div className="space-y-4 py-4">
                        {dayAppointments.map((apt) => (
                            <div
                                key={apt.id}
                                className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-[#3E7DBB]/20 hover:border-[#3E7DBB]/40 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-sky-950 text-xl font-bold flex items-center gap-2">
                                            <span className="icon-[mdi--clock-outline] text-2xl text-[#3E7DBB]"></span>
                                            {apt.time === "08:00" ? "8:00 AM" :
                                                apt.time === "09:00" ? "9:00 AM" :
                                                    apt.time === "10:00" ? "10:00 AM" :
                                                        apt.time === "11:00" ? "11:00 AM" :
                                                            apt.time === "13:00" ? "1:00 PM" :
                                                                apt.time === "14:00" ? "2:00 PM" :
                                                                    apt.time === "15:00" ? "3:00 PM" :
                                                                        apt.time === "16:00" ? "4:00 PM" : apt.time}
                                        </h3>
                                    </div>
                                    {apt.observacion && (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700">
                                            {apt.observacion.substring(0, 20)}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-sky-950/70 text-sm font-semibold">
                                            Caso
                                        </label>
                                        <p className="text-sky-950 text-lg font-bold">
                                            #{apt.caseNumber}
                                        </p>
                                        <p className="text-sky-950/80 text-base font-semibold">
                                            {apt.caseName}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sky-950/70 text-sm font-semibold">
                                            Participantes
                                        </label>
                                        <p className="text-sky-950 text-lg font-semibold">
                                            {apt.participants}
                                        </p>
                                    </div>
                                </div>

                                {apt.observacion && (
                                    <div className="mb-4">
                                        <label className="text-sky-950/70 text-sm font-semibold">
                                            Observación
                                        </label>
                                        <p className="text-sky-950 text-sm mt-1">
                                            {apt.observacion}
                                        </p>
                                    </div>
                                )}

                                {(onEdit || onDelete) && (
                                    <div className="flex gap-2 pt-2 border-t border-blue-200">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(apt)}
                                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <span className="icon-[mdi--pencil]"></span>
                                                Editar
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(apt)}
                                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <span className="icon-[mdi--trash-can-outline]"></span>
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="flex items-center justify-between bg-neutral-100 rounded-xl p-4 mt-4">
                            <div className="flex items-center gap-2">
                                <span className="icon-[mdi--information-outline] text-2xl text-sky-950/60"></span>
                                <span className="text-sky-950/70 font-semibold">
                                    Total de citas programadas:
                                </span>
                            </div>
                            <span className="text-sky-950 text-2xl font-bold">
                                {dayAppointments.length}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
                        <span className="icon-[mdi--calendar-blank-outline] text-7xl text-neutral-300 mb-4"></span>
                        <p className="text-sky-950/60 text-xl font-semibold max-w-xs">
                            No hay citas programadas para este día
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 rounded-2xl text-sky-950 text-lg font-semibold transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// --- Appointment Modal ---

interface AppointmentModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (appointment: Omit<Appointment, "id">) => void;
    editingAppointment?: Appointment | null;
    onUpdate?: (appointment: Appointment) => void;
}

function AppointmentModal({ open, onClose, onSave, editingAppointment, onUpdate }: AppointmentModalProps) {
    const [caseId, setCaseId] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [observacion, setObservacion] = useState("");
    const [fechaProximaCita, setFechaProximaCita] = useState("");
    const [usuariosAsignados, setUsuariosAsignados] = useState<string[]>([]);
    const [availableCases, setAvailableCases] = useState<{ value: string; label: string }[]>([]);
    const [availableUsers, setAvailableUsers] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const timeSlots = [
        { value: "08:00", label: "8:00 AM" },
        { value: "09:00", label: "9:00 AM" },
        { value: "10:00", label: "10:00 AM" },
        { value: "11:00", label: "11:00 AM" },
        { value: "13:00", label: "1:00 PM" },
        { value: "14:00", label: "2:00 PM" },
        { value: "15:00", label: "3:00 PM" },
        { value: "16:00", label: "4:00 PM" },
    ];

    // Cargar datos de la cita si está en modo edición
    useEffect(() => {
        if (open && editingAppointment) {
            const loadCitaData = async () => {
                setLoading(true);
                setError(null);
                try {
                    if (editingAppointment.id_cita && editingAppointment.nro_caso) {
                        const [citaRes, usuariosRes] = await Promise.all([
                            getCitaById(editingAppointment.id_cita, editingAppointment.nro_caso),
                            getUsuariosAsignadosACita(editingAppointment.id_cita, editingAppointment.nro_caso)
                        ]);

                        if (citaRes.success && citaRes.data) {
                            const cita = citaRes.data;
                            const fechaAtencion = new Date(cita.fecha_atencion);
                            setCaseId(cita.nro_caso.toString());
                            setDate(fechaAtencion.toISOString().split('T')[0]);
                            setTime(`${fechaAtencion.getHours().toString().padStart(2, '0')}:${fechaAtencion.getMinutes().toString().padStart(2, '0')}`);
                            setObservacion(cita.observacion || '');
                            if (cita.fecha_proxima_cita) {
                                const fechaProx = new Date(cita.fecha_proxima_cita);
                                setFechaProximaCita(fechaProx.toISOString().slice(0, 16));
                            }

                            if (usuariosRes.success) {
                                setUsuariosAsignados(usuariosRes.data.map((u: any) => u.cedula_usuario));
                            }
                        }
                    }
                } catch (err: any) {
                    setError(err.message || 'Error al cargar datos de la cita');
                } finally {
                    setLoading(false);
                }
            };
            loadCitaData();
        } else if (open && !editingAppointment) {
            // Reset form for new appointment
            setCaseId("");
            setDate("");
            setTime("");
            setObservacion("");
            setFechaProximaCita("");
            setUsuariosAsignados([]);
        }
    }, [open, editingAppointment]);

    // Cargar casos y usuarios disponibles
    useEffect(() => {
        if (open) {
            const loadData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const [casosRes, alumnosRes, profesoresRes] = await Promise.all([
                        getCasos(),
                        getAlumnosDisponibles(),
                        getProfesoresDisponibles()
                    ]);

                    if (casosRes.success) {
                        const casosOptions = casosRes.data.map((caso: any) => ({
                            value: caso.nro_caso.toString(),
                            label: `Caso #${caso.nro_caso} - ${caso.solicitante_nombre || 'Sin solicitante'}`
                        }));
                        setAvailableCases(casosOptions);
                    }

                    if (alumnosRes.success && profesoresRes.success) {
                        // Usar un Map para evitar duplicados por cédula
                        const usuariosMap = new Map<string, { value: string; label: string }>();
                        
                        // Agregar alumnos primero
                        alumnosRes.data.forEach((u: any) => {
                            if (!usuariosMap.has(u.cedula_usuario)) {
                                usuariosMap.set(u.cedula_usuario, {
                                    value: u.cedula_usuario,
                                    label: `${u.nombre_completo} (Estudiante)`
                                });
                            }
                        });
                        
                        // Agregar profesores (si no están ya como estudiantes, o actualizar el label)
                        profesoresRes.data.forEach((u: any) => {
                            if (usuariosMap.has(u.cedula_usuario)) {
                                // Si ya existe, actualizar el label para indicar ambos roles
                                const existing = usuariosMap.get(u.cedula_usuario)!;
                                if (!existing.label.includes('Profesor')) {
                                    existing.label = `${u.nombre_completo} (Estudiante/Profesor)`;
                                }
                            } else {
                                usuariosMap.set(u.cedula_usuario, {
                                    value: u.cedula_usuario,
                                    label: `${u.nombre_completo} (Profesor)`
                                });
                            }
                        });
                        
                        setAvailableUsers(Array.from(usuariosMap.values()));
                    }
                } catch (err: any) {
                    setError(err.message || 'Error al cargar datos');
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!caseId || !date || !time) {
            setError('Por favor complete todos los campos obligatorios');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Combinar fecha y hora
            const fechaHora = new Date(`${date}T${time}:00`);
            const fechaHoraISO = fechaHora.toISOString();

            // Preparar fecha próxima cita si existe
            let fechaProximaISO = null;
            if (fechaProximaCita) {
                fechaProximaISO = new Date(fechaProximaCita).toISOString();
            }

            const selectedCase = availableCases.find(c => c.value === caseId);
            const caseName = selectedCase ? selectedCase.label.split(" - ")[1] : "";

            // Formatear participantes
            const participantesNombres = usuariosAsignados
                .map(cedula => {
                    const user = availableUsers.find(u => u.value === cedula);
                    return user ? user.label.split(' (')[0] : '';
                })
                .filter(Boolean)
                .join(', ') || 'Sin asignar';

            if (editingAppointment && editingAppointment.id_cita && editingAppointment.nro_caso) {
                // Modo edición
                const result = await updateCita(
                    editingAppointment.id_cita,
                    editingAppointment.nro_caso,
                    {
                        fecha_atencion: fechaHoraISO,
                        observacion: observacion || undefined,
                        fecha_proxima_cita: fechaProximaISO || undefined,
                        usuarios_asignados: usuariosAsignados.length > 0 ? usuariosAsignados : []
                    }
                );

                if (result.success && onUpdate) {
                    const updatedAppointment: Appointment = {
                        ...editingAppointment,
                        caseNumber: caseId,
                        caseName,
                        date: fechaHora,
                        time,
                        participants: participantesNombres,
                        observacion: observacion || undefined
                    };
                    onUpdate(updatedAppointment);
                    onClose();
                } else {
                    setError(result.error || 'Error al actualizar la cita');
                }
            } else {
                // Modo creación
                const result = await createCita({
                    nro_caso: parseInt(caseId),
                    fecha_atencion: fechaHoraISO,
                    observacion: observacion || undefined,
                    fecha_proxima_cita: fechaProximaISO || undefined,
                    usuarios_asignados: usuariosAsignados.length > 0 ? usuariosAsignados : undefined
                });

                if (result.success) {
                    onSave({
                        caseNumber: caseId,
                        caseName,
                        date: fechaHora,
                        time,
                        type: "consulta", // Por defecto
                        participants: participantesNombres,
                        id_cita: result.data?.id_cita,
                        nro_caso: parseInt(caseId),
                        observacion: observacion || undefined
                    });

                    // Reset form
                    setCaseId("");
                    setDate("");
                    setTime("");
                    setObservacion("");
                    setFechaProximaCita("");
                    setUsuariosAsignados([]);
                    onClose();
                } else {
                    setError(result.error || 'Error al crear la cita');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Error al guardar la cita');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-white p-0 overflow-hidden border-0 gap-0 rounded-2xl shadow-2xl">
                <div className="bg-[#003366] text-white p-5 flex flex-col gap-1">
                    <DialogTitle className="font-bold text-xl flex items-center gap-2">
                        <span className={`icon-[${editingAppointment ? 'mdi--pencil' : 'mdi--calendar-plus'}] text-[#3E7DBB] bg-white rounded-full p-0.5`}></span>
                        {editingAppointment ? 'Editar Cita' : 'Programar Cita'}
                    </DialogTitle>
                    <DialogDescription className="text-blue-200 text-sm">
                        {editingAppointment ? 'Modifica los datos de la cita.' : 'Agenda una nueva cita para seguimiento de caso.'}
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-neutral-50/50">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Caso Asociado</Label>
                        <CustomSelect
                            value={caseId}
                            onChange={setCaseId}
                            options={availableCases}
                            placeholder="Seleccionar caso..."
                            className="w-full"
                            disabled={!!editingAppointment}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Fecha</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="bg-white border-gray-200 focus:border-[#3E7DBB] h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Hora</Label>
                            <CustomSelect
                                value={time}
                                onChange={setTime}
                                options={timeSlots}
                                placeholder="Seleccionar hora..."
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observacion" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Observación</Label>
                        <Textarea
                            id="observacion"
                            placeholder="Descripción de la cita..."
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            className="bg-white border-gray-200 focus:border-[#3E7DBB] min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fechaProxima" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Fecha Próxima Cita (Opcional)</Label>
                        <Input
                            id="fechaProxima"
                            type="datetime-local"
                            value={fechaProximaCita}
                            onChange={(e) => setFechaProximaCita(e.target.value)}
                            className="bg-white border-gray-200 focus:border-[#3E7DBB] h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Usuarios Asignados (Opcional)</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
                            {availableUsers.map((user) => (
                                <label key={user.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                    <input
                                        type="checkbox"
                                        checked={usuariosAsignados.includes(user.value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setUsuariosAsignados([...usuariosAsignados, user.value]);
                                            } else {
                                                setUsuariosAsignados(usuariosAsignados.filter(u => u !== user.value));
                                            }
                                        }}
                                        className="rounded"
                                    />
                                    <span className="text-sm text-sky-950">{user.label}</span>
                                </label>
                            ))}
                            {availableUsers.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-2">Cargando usuarios...</p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <DialogFooter className="pt-2 gap-2 sm:gap-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors w-full sm:w-auto cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-xl shadow-lg shadow-blue-900/10 transition-all transform active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="icon-[svg-spinners--180-ring-with-bg]"></span>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <span className="icon-[mdi--check]"></span>
                                    Confirmar
                                </>
                            )}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Calendar Component ---

interface CalendarProps {
    appointments: Appointment[];
    currentMonth: number;
    currentYear: number;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
    onDayClick: (day: number) => void;
}

function Calendar({ appointments, currentMonth, currentYear, onPrevMonth, onNextMonth, onToday, onDayClick }: CalendarProps) {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dayNames = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Convert to Monday-first (0 = Monday)
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    // Generate 6 weeks (42 days) to ensure consistent grid height
    const calendarDays = [];
    const totalSlots = 42; // 6 rows * 7 columns

    // Pad empty slots before first day
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    // Fill days
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }
    // Pad empty slots after last day
    while (calendarDays.length < totalSlots) {
        calendarDays.push(null);
    }

    const getAppointmentsForDay = (day: number | null) => {
        if (!day) return [];
        return appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate.getDate() === day &&
                aptDate.getMonth() === currentMonth &&
                aptDate.getFullYear() === currentYear;
        });
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-4 flex-none">
                <h2 className="text-sky-950 text-2xl font-bold">{monthNames[currentMonth]} {currentYear}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onPrevMonth}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                        <span className="icon-[mdi--chevron-left] text-2xl text-[#3E7DBB]"></span>
                    </button>
                    <button
                        onClick={onToday}
                        className="px-4 py-2 text-sm font-bold text-[#3E7DBB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={onNextMonth}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                        <span className="icon-[mdi--chevron-right] text-2xl text-[#3E7DBB]"></span>
                    </button>
                </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2 flex-none">
                {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-white bg-[#003366] py-2 rounded-lg">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-2 min-h-0">
                {calendarDays.map((day, index) => {
                    const dayAppointments = getAppointmentsForDay(day);
                    const isToday = day &&
                        day === new Date().getDate() &&
                        currentMonth === new Date().getMonth() &&
                        currentYear === new Date().getFullYear();

                    return (
                        <div
                            key={index}
                            className={cn(
                                "border border-neutral-200 rounded-lg p-2 transition-all flex flex-col h-full overflow-hidden",
                                day ? "bg-white hover:shadow-md cursor-pointer" : "bg-neutral-50",
                                isToday && "ring-2 ring-[#3E7DBB] bg-blue-50/30"
                            )}
                            onClick={() => day && onDayClick(day)}
                        >
                            {day && (
                                <>
                                    <div className={cn(
                                        "text-sm font-bold mb-1 flex-none",
                                        isToday ? "text-[#3E7DBB]" : "text-sky-950"
                                    )}>
                                        {day}
                                    </div>
                                    <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                                        {dayAppointments.map((apt) => (
                                            <div
                                                key={apt.id}
                                                className="text-[10px] font-semibold bg-[#3E7DBB] text-white px-2 py-1 rounded truncate w-full"
                                                title={`${apt.time} - ${apt.caseName}`}
                                            >
                                                {apt.time} {apt.caseName}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// --- Main Component ---

export default function CitationsClient() {
    const [viewMode, setViewMode] = useState<"calendar" | "chart">("calendar");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]); // Todas las citas sin filtrar
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    
    // Estados para edición y eliminación
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Estados para filtros
    const [filterCaso, setFilterCaso] = useState<string>("");
    const [filterUsuario, setFilterUsuario] = useState<string>("");
    const [filterFechaInicio, setFilterFechaInicio] = useState<string>("");
    const [filterFechaFin, setFilterFechaFin] = useState<string>("");
    const [availableCasesForFilter, setAvailableCasesForFilter] = useState<{ value: string; label: string }[]>([]);
    const [availableUsersForFilter, setAvailableUsersForFilter] = useState<{ value: string; label: string }[]>([]);

    // Función para transformar citas de BD al formato Appointment
    const transformCitas = (citasData: any[]): Appointment[] => {
        return citasData.map((cita: any) => {
            const fechaAtencion = new Date(cita.fecha_atencion);
            const hora = fechaAtencion.getHours().toString().padStart(2, '0');
            const minutos = fechaAtencion.getMinutes().toString().padStart(2, '0');
            const timeStr = `${hora}:${minutos}`;

            const participantes = cita.atendido_por && Array.isArray(cita.atendido_por) 
                ? cita.atendido_por.filter((p: any) => p).join(', ')
                : 'Sin asignar';

            return {
                id: cita.id_cita,
                caseNumber: cita.nro_caso.toString(),
                caseName: cita.solicitante_nombre || cita.caso_sintesis || `Caso #${cita.nro_caso}`,
                date: fechaAtencion,
                time: timeStr,
                type: "consulta",
                participants: participantes,
                id_cita: cita.id_cita,
                nro_caso: cita.nro_caso,
                observacion: cita.observacion
            };
        });
    };

    // Cargar citas desde la BD
    useEffect(() => {
        const loadCitas = async () => {
            setLoading(true);
            setError(null);
            try {
                const filters: any = {};
                if (filterCaso) filters.nroCaso = parseInt(filterCaso);
                if (filterUsuario) filters.cedulaUsuario = filterUsuario;
                if (filterFechaInicio) filters.fechaInicio = filterFechaInicio;
                if (filterFechaFin) filters.fechaFin = filterFechaFin;

                const result = await getCitas(filters);
                if (result.success) {
                    const citasFormateadas = transformCitas(result.data);
                    setAllAppointments(citasFormateadas);
                    setAppointments(citasFormateadas);
                } else {
                    setError(result.error || 'Error al cargar citas');
                }
            } catch (err: any) {
                setError(err.message || 'Error al cargar citas');
            } finally {
                setLoading(false);
            }
        };
        loadCitas();
    }, [filterCaso, filterUsuario, filterFechaInicio, filterFechaFin]);

    // Cargar casos y usuarios para filtros
    useEffect(() => {
        const loadFilterData = async () => {
            try {
                const [casosRes, alumnosRes, profesoresRes] = await Promise.all([
                    getCasos(),
                    getAlumnosDisponibles(),
                    getProfesoresDisponibles()
                ]);

                if (casosRes.success) {
                    const casosOptions = casosRes.data.map((caso: any) => ({
                        value: caso.nro_caso.toString(),
                        label: `Caso #${caso.nro_caso} - ${caso.solicitante_nombre || 'Sin solicitante'}`
                    }));
                    setAvailableCasesForFilter(casosOptions);
                }

                if (alumnosRes.success && profesoresRes.success) {
                    const usuariosMap = new Map<string, { value: string; label: string }>();
                    
                    alumnosRes.data.forEach((u: any) => {
                        if (!usuariosMap.has(u.cedula_usuario)) {
                            usuariosMap.set(u.cedula_usuario, {
                                value: u.cedula_usuario,
                                label: `${u.nombre_completo} (Estudiante)`
                            });
                        }
                    });
                    
                    profesoresRes.data.forEach((u: any) => {
                        if (usuariosMap.has(u.cedula_usuario)) {
                            const existing = usuariosMap.get(u.cedula_usuario)!;
                            if (!existing.label.includes('Profesor')) {
                                existing.label = `${u.nombre_completo} (Estudiante/Profesor)`;
                            }
                        } else {
                            usuariosMap.set(u.cedula_usuario, {
                                value: u.cedula_usuario,
                                label: `${u.nombre_completo} (Profesor)`
                            });
                        }
                    });
                    
                    setAvailableUsersForFilter(Array.from(usuariosMap.values()));
                }
            } catch (err: any) {
                console.error('Error al cargar datos para filtros:', err);
            }
        };
        loadFilterData();
    }, []);

    const handleSaveAppointment = async (newAppointment: Omit<Appointment, "id">) => {
        // Recargar citas para asegurar sincronización
        const filters: any = {};
        if (filterCaso) filters.nroCaso = parseInt(filterCaso);
        if (filterUsuario) filters.cedulaUsuario = filterUsuario;
        if (filterFechaInicio) filters.fechaInicio = filterFechaInicio;
        if (filterFechaFin) filters.fechaFin = filterFechaFin;

        const result = await getCitas(filters);
        if (result.success) {
            const citasFormateadas = transformCitas(result.data);
            setAllAppointments(citasFormateadas);
            setAppointments(citasFormateadas);
        }
    };

    const handleUpdateAppointment = async (updatedAppointment: Appointment) => {
        // Recargar citas después de actualizar
        const filters: any = {};
        if (filterCaso) filters.nroCaso = parseInt(filterCaso);
        if (filterUsuario) filters.cedulaUsuario = filterUsuario;
        if (filterFechaInicio) filters.fechaInicio = filterFechaInicio;
        if (filterFechaFin) filters.fechaFin = filterFechaFin;

        const result = await getCitas(filters);
        if (result.success) {
            const citasFormateadas = transformCitas(result.data);
            setAllAppointments(citasFormateadas);
            setAppointments(citasFormateadas);
        }
        setEditingAppointment(null);
    };

    const handleEditAppointment = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setIsDayDetailsOpen(false);
        setIsModalOpen(true);
    };

    const handleDeleteAppointment = (appointment: Appointment) => {
        setDeletingAppointment(appointment);
        setIsDeleteModalOpen(true);
        setIsDayDetailsOpen(false);
    };

    const confirmDelete = async () => {
        if (deletingAppointment && deletingAppointment.id_cita && deletingAppointment.nro_caso) {
            setLoading(true);
            try {
                const result = await deleteCita(deletingAppointment.id_cita, deletingAppointment.nro_caso);
                if (result.success) {
                    // Recargar citas
                    const filters: any = {};
                    if (filterCaso) filters.nroCaso = parseInt(filterCaso);
                    if (filterUsuario) filters.cedulaUsuario = filterUsuario;
                    if (filterFechaInicio) filters.fechaInicio = filterFechaInicio;
                    if (filterFechaFin) filters.fechaFin = filterFechaFin;

                    const citasResult = await getCitas(filters);
                    if (citasResult.success) {
                        const citasFormateadas = transformCitas(citasResult.data);
                        setAllAppointments(citasFormateadas);
                        setAppointments(citasFormateadas);
                    }
                } else {
                    setError(result.error || 'Error al eliminar la cita');
                }
            } catch (err: any) {
                setError(err.message || 'Error al eliminar la cita');
            } finally {
                setLoading(false);
                setIsDeleteModalOpen(false);
                setDeletingAppointment(null);
            }
        }
    };

    const handleNewAppointment = () => {
        setEditingAppointment(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAppointment(null);
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleToday = () => {
        setCurrentMonth(new Date().getMonth());
        setCurrentYear(new Date().getFullYear());
    };

    const handleDayClick = (day: number) => {
        const clickedDate = new Date(currentYear, currentMonth, day);
        setSelectedDate(clickedDate);
        setIsDayDetailsOpen(true);
    };

    // Calculate hourly distribution for current week
    const hourlyDistribution = useMemo(() => {
        const distribution: { [key: string]: number } = {
            "8:00 AM": 0,
            "9:00 AM": 0,
            "10:00 AM": 0,
            "11:00 AM": 0,
            "1:00 PM": 0,
            "2:00 PM": 0,
            "3:00 PM": 0,
            "4:00 PM": 0,
        };

        appointments.forEach(apt => {
            const hour = apt.time;
            const hourLabel = hour === "08:00" ? "8:00 AM" :
                hour === "09:00" ? "9:00 AM" :
                    hour === "10:00" ? "10:00 AM" :
                        hour === "11:00" ? "11:00 AM" :
                            hour === "13:00" ? "1:00 PM" :
                                hour === "14:00" ? "2:00 PM" :
                                    hour === "15:00" ? "3:00 PM" :
                                        hour === "16:00" ? "4:00 PM" : "";

            if (hourLabel && distribution[hourLabel] !== undefined) {
                distribution[hourLabel]++;
            }
        });

        return Object.entries(distribution).map(([hour, count]) => ({
            hour,
            count,
        }));
    }, [appointments]);

    const currentMonthStats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthAppointments = appointments.filter(apt => {
            const date = new Date(apt.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const futureAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            // Reset hours to compare just dates if needed, but for "upcoming" generally exact time matters
            // Since appointments have times, we should construct a full date object
            // The `date` property seems to be just the date part in some contexts? 
            // initialization: date: new Date(2025, 10, 7) -> this defaults to 00:00:00
            // But we have a `time` string "10:00".
            // Let's just compare dates for simplicity as per existing logic in sidebars usually
            return aptDate >= now || (aptDate.toDateString() === now.toDateString());
        });

        // Actually, let's look at how the sidebar filters it:
        // Line 776: .filter(a => new Date(a.date) >= new Date())
        // I will copy that logic for consistency.
        const upcomingAppointments = appointments.filter(a => new Date(a.date) >= new Date());

        upcomingAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            total: thisMonthAppointments.length,
            upcomingCount: upcomingAppointments.length,
            next: upcomingAppointments.length > 0 ? upcomingAppointments[0] : null
        };
    }, [appointments]);

    const chartConfig = {
        count: { label: "Citas" },
    } satisfies ChartConfig;

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-hidden">
            {/* Header */}
            <div className="flex-none flex flex-col gap-4">
                <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <h1 className="text-sky-950 text-5xl font-bold tracking-tight">
                            Gestión de Citas
                        </h1>
                        <p className="text-[#325B84] text-lg font-medium mt-1">
                            Programa y consulta la agenda de citas por caso, alumno o profesor.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                    {/* View Toggle (Segmented Control) */}
                    <div className="bg-neutral-100 p-1.5 rounded-xl flex gap-1 shadow-inner h-fit">
                        <button
                            onClick={() => setViewMode("calendar")}
                            className={cn(
                                "px-6 py-2 rounded-[10px] text-sm font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer",
                                viewMode === "calendar"
                                    ? "bg-white text-[#003366] shadow-sm"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                            )}
                        >
                            <span className="icon-[mdi--calendar-month] text-lg"></span>
                            Calendario
                        </button>
                        <button
                            onClick={() => setViewMode("chart")}
                            className={cn(
                                "px-6 py-2 rounded-[10px] text-sm font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer",
                                viewMode === "chart"
                                    ? "bg-white text-[#003366] shadow-sm"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                            )}
                        >
                            <span className="icon-[mdi--chart-bar] text-lg"></span>
                            Estadísticas
                        </button>
                    </div>

                        <PrimaryButton
                            onClick={handleNewAppointment}
                            icon="icon-[mdi--calendar-plus]"
                        >
                            Programar Cita
                        </PrimaryButton>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Caso</Label>
                            <CustomSelect
                                value={filterCaso}
                                onChange={setFilterCaso}
                                options={[{ value: "", label: "Todos los casos" }, ...availableCasesForFilter]}
                                placeholder="Filtrar por caso..."
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Usuario</Label>
                            <CustomSelect
                                value={filterUsuario}
                                onChange={setFilterUsuario}
                                options={[{ value: "", label: "Todos los usuarios" }, ...availableUsersForFilter]}
                                placeholder="Filtrar por usuario..."
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fechaInicio" className="text-xs font-bold uppercase tracking-wider text-gray-500">Fecha Inicio</Label>
                            <Input
                                id="fechaInicio"
                                type="date"
                                value={filterFechaInicio}
                                onChange={(e) => setFilterFechaInicio(e.target.value)}
                                className="bg-white border-gray-200 h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fechaFin" className="text-xs font-bold uppercase tracking-wider text-gray-500">Fecha Fin</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="fechaFin"
                                    type="date"
                                    value={filterFechaFin}
                                    onChange={(e) => setFilterFechaFin(e.target.value)}
                                    className="bg-white border-gray-200 h-10 flex-1"
                                />
                                {(filterCaso || filterUsuario || filterFechaInicio || filterFechaFin) && (
                                    <button
                                        onClick={() => {
                                            setFilterCaso("");
                                            setFilterUsuario("");
                                            setFilterFechaInicio("");
                                            setFilterFechaFin("");
                                        }}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-semibold transition-colors cursor-pointer"
                                        title="Limpiar filtros"
                                    >
                                        <span className="icon-[mdi--close]"></span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6 flex-none">
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <span className="icon-[mdi--calendar-check] text-3xl text-[#3E7DBB]"></span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500">Citas este Mes</p>
                        <p className="text-3xl font-bold text-sky-950">{currentMonthStats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-xl">
                        <span className="icon-[mdi--clock-fast] text-3xl text-purple-600"></span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500">Próximas Citas</p>
                        <p className="text-3xl font-bold text-sky-950">{currentMonthStats.upcomingCount}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1 bg-[#3E7DBB]"></div>
                    <div className="p-3 bg-orange-50 rounded-xl">
                        <span className="icon-[mdi--calendar-star] text-3xl text-orange-500"></span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500">Siguiente Cita</p>
                        {currentMonthStats.next ? (
                            <div>
                                <p className="text-lg font-bold text-sky-950 leading-tight">
                                    {new Date(currentMonthStats.next.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {currentMonthStats.next.time}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">{currentMonthStats.next.caseName}</p>
                            </div>
                        ) : (
                            <p className="text-lg font-bold text-gray-400">Sin programar</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <div className="flex flex-col items-center gap-4">
                            <span className="icon-[svg-spinners--180-ring-with-bg] text-4xl text-[#3E7DBB]"></span>
                            <p className="text-sky-950/60 font-medium">Cargando citas...</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}
                {/* Calendar View */}
                {viewMode === "calendar" && !loading && (
                    <div className="h-full w-full animate-in fade-in slide-in-from-left-4 duration-300 grid grid-cols-12 gap-8">
                        {/* Main Calendar */}
                        <div className="col-span-9 h-full flex flex-col">
                            <Calendar
                                appointments={appointments}
                                currentMonth={currentMonth}
                                currentYear={currentYear}
                                onPrevMonth={handlePrevMonth}
                                onNextMonth={handleNextMonth}
                                onToday={handleToday}
                                onDayClick={handleDayClick}
                            />
                        </div>

                        {/* Upcoming Sidebar */}
                        <div className="col-span-3 h-full flex flex-col border-l border-neutral-100 pl-6">
                            <h3 className="text-sky-950 font-bold text-xl mb-4 flex items-center gap-2">
                                <span className="icon-[mdi--playlist-clock] text-[#3E7DBB]"></span>
                                Agenda Próxima
                            </h3>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {appointments
                                    .filter(a => new Date(a.date) >= new Date())
                                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                    .slice(0, 5) // Show next 5
                                    .map(apt => (
                                        <div key={apt.id} className="group p-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all cursor-pointer">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="bg-white border border-neutral-200 rounded-lg px-2 py-1 text-center shadow-sm min-w-[50px]">
                                                    <span className="block text-xs font-bold text-gray-500 uppercase">
                                                        {new Date(apt.date).toLocaleDateString('es-ES', { month: 'short' })}
                                                    </span>
                                                    <span className="block text-xl font-bold text-sky-950 leading-none">
                                                        {new Date(apt.date).getDate()}
                                                    </span>
                                                </div>
                                                {apt.observacion && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-opacity-50 bg-blue-100 text-blue-700">
                                                        {apt.observacion.substring(0, 15)}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-sky-950 truncate" title={apt.caseName}>
                                                {apt.caseName}
                                            </h4>
                                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                                                <span className="icon-[mdi--clock-outline]"></span>
                                                {apt.time} • {apt.participants}
                                            </p>
                                        </div>
                                    ))}
                                {appointments.filter(a => new Date(a.date) >= new Date()).length === 0 && (
                                    <div className="text-center py-10 opacity-50">
                                        <span className="icon-[mdi--calendar-blank] text-4xl mb-2"></span>
                                        <p>No hay citas próximas</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                )}

                {/* Chart View */}
                {viewMode === "chart" && !loading && (
                    <div className="h-full w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-sky-950 text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="icon-[mdi--chart-bar] text-[#3E7DBB] text-3xl"></span>
                            Distribución Semanal de Citas
                        </h2>
                        <div className="flex-1 flex items-center justify-center p-10">
                            <BarChart
                                data={hourlyDistribution}
                                config={chartConfig}
                                dataKey="count"
                                nameKey="hour"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Appointment Modal */}
            <AppointmentModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveAppointment}
                editingAppointment={editingAppointment}
                onUpdate={handleUpdateAppointment}
            />

            {/* Day Details Modal */}
            <DayDetailsModal
                open={isDayDetailsOpen}
                onClose={() => setIsDayDetailsOpen(false)}
                selectedDate={selectedDate}
                appointments={appointments}
                onEdit={handleEditAppointment}
                onDelete={handleDeleteAppointment}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                open={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingAppointment(null);
                }}
                onConfirm={confirmDelete}
                title="Eliminar Cita"
                description={`¿Estás seguro de que deseas eliminar la cita del caso #${deletingAppointment?.caseNumber}? Esta acción no se puede deshacer.`}
            />
        </div>
    );
}
