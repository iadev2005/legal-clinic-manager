"use client";

import { useState, useMemo } from "react";
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
import { cn } from "@/lib/utils";

// --- Types & Interfaces ---

interface Appointment {
    id: number;
    caseNumber: string;
    caseName: string;
    date: Date;
    time: string;
    type: string;
    participants: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    className?: string;
    placeholder?: string;
}

// --- Helper Components ---

const CustomSelect = ({ value, onChange, options, className, placeholder = "Seleccionar" }: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={cn("relative", className)}>
            <div
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer flex items-center justify-between",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                )}
                onClick={() => setIsOpen(!isOpen)}
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

// --- Day Details Modal ---

interface DayDetailsModalProps {
    open: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    appointments: Appointment[];
}

function DayDetailsModal({ open, onClose, selectedDate, appointments }: DayDetailsModalProps) {
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
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold uppercase",
                                        getTypeColor(apt.type)
                                    )}>
                                        {getTypeLabel(apt.type)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                    <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl p-12 text-center">
                        <span className="icon-[mdi--calendar-blank-outline] text-6xl text-neutral-400 mb-4 block"></span>
                        <p className="text-sky-950/60 text-lg font-semibold">
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
}

function AppointmentModal({ open, onClose, onSave }: AppointmentModalProps) {
    const [caseId, setCaseId] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [type, setType] = useState("");
    const [participants, setParticipants] = useState("");

    const availableCases = [
        { value: "2024-051", label: "Caso #2024-051 - Desalojo Injustificado" },
        { value: "2024-049", label: "Caso #2024-049 - Custodia de Menores" },
        { value: "2024-052", label: "Caso #2024-052 - Reclamo Laboral" },
        { value: "2024-044", label: "Caso #2024-044 - Divorcio Mutuo Acuerdo" },
        { value: "2024-060", label: "Caso #2024-060 - Violencia Doméstica" },
    ];

    const appointmentTypes = [
        { value: "consulta", label: "Consulta Inicial" },
        { value: "seguimiento", label: "Seguimiento" },
        { value: "audiencia", label: "Preparación Audiencia" },
        { value: "entrega", label: "Entrega de Documentos" },
    ];

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!caseId || !date || !time || !type || !participants) return;

        const selectedCase = availableCases.find(c => c.value === caseId);
        const caseName = selectedCase ? selectedCase.label.split(" - ")[1] : "";

        onSave({
            caseNumber: caseId,
            caseName,
            date: new Date(date),
            time,
            type,
            participants,
        });

        // Reset form
        setCaseId("");
        setDate("");
        setTime("");
        setType("");
        setParticipants("");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-white p-0 overflow-hidden border-0 gap-0 rounded-2xl shadow-2xl">
                <div className="bg-[#003366] text-white p-5 flex flex-col gap-1">
                    <DialogTitle className="font-bold text-xl flex items-center gap-2">
                        <span className="icon-[mdi--calendar-plus] text-[#3E7DBB] bg-white rounded-full p-0.5"></span>
                        Programar Cita
                    </DialogTitle>
                    <DialogDescription className="text-blue-200 text-sm">
                        Agenda una nueva cita para seguimiento de caso.
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
                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Tipo de Cita</Label>
                        <CustomSelect
                            value={type}
                            onChange={setType}
                            options={appointmentTypes}
                            placeholder="Seleccionar tipo..."
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="participants" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Participantes</Label>
                        <Input
                            id="participants"
                            placeholder="Ej: Juan Pérez, María González..."
                            value={participants}
                            onChange={(e) => setParticipants(e.target.value)}
                            required
                            className="bg-white border-gray-200 focus:border-[#3E7DBB] h-10"
                        />
                    </div>

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
                            className="px-6 py-2.5 text-sm font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-xl shadow-lg shadow-blue-900/10 transition-all transform active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
                        >
                            <span className="icon-[mdi--check]"></span>
                            Confirmar
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

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
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
        <div className="w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6">
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
            <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-white bg-[#003366] py-2 rounded-lg">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
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
                                "min-h-[100px] border border-neutral-200 rounded-lg p-2 transition-all",
                                day ? "bg-white hover:shadow-md cursor-pointer" : "bg-neutral-50",
                                isToday && "ring-2 ring-[#3E7DBB] bg-blue-50/30"
                            )}
                            onClick={() => day && onDayClick(day)}
                        >
                            {day && (
                                <>
                                    <div className={cn(
                                        "text-sm font-bold mb-1",
                                        isToday ? "text-[#3E7DBB]" : "text-sky-950"
                                    )}>
                                        {day}
                                    </div>
                                    <div className="space-y-1">
                                        {dayAppointments.slice(0, 2).map((apt) => (
                                            <div
                                                key={apt.id}
                                                className="text-[10px] font-semibold bg-[#3E7DBB] text-white px-2 py-1 rounded truncate"
                                                title={`${apt.time} - ${apt.caseName}`}
                                            >
                                                {apt.time} {apt.caseName.substring(0, 15)}...
                                            </div>
                                        ))}
                                        {dayAppointments.length > 2 && (
                                            <div className="text-[9px] font-bold text-gray-500 px-2">
                                                +{dayAppointments.length - 2} más
                                            </div>
                                        )}
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([
        {
            id: 1,
            caseNumber: "2024-051",
            caseName: "Desalojo Injustificado",
            date: new Date(2025, 10, 7),
            time: "10:00",
            type: "consulta",
            participants: "María García",
        },
        {
            id: 2,
            caseNumber: "2024-049",
            caseName: "Custodia de Menores",
            date: new Date(2025, 10, 4),
            time: "09:00",
            type: "seguimiento",
            participants: "Carlos Ruiz",
        },
        {
            id: 3,
            caseNumber: "2024-052",
            caseName: "Reclamo Laboral",
            date: new Date(2025, 10, 10),
            time: "09:00",
            type: "audiencia",
            participants: "Ana Silva",
        },
        {
            id: 4,
            caseNumber: "2024-044",
            caseName: "Divorcio Mutuo Acuerdo",
            date: new Date(2025, 10, 14),
            time: "09:00",
            type: "entrega",
            participants: "Pedro Gómez",
        },
    ]);

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const handleSaveAppointment = (newAppointment: Omit<Appointment, "id">) => {
        const appointment: Appointment = {
            ...newAppointment,
            id: Date.now(),
        };
        setAppointments([...appointments, appointment]);
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

    const chartConfig = {
        count: { label: "Citas" },
    } satisfies ChartConfig;

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-hidden">
            {/* Header */}
            <div className="flex-none flex justify-between items-end">
                <div className="flex flex-col">
                    <h1 className="text-sky-950 text-5xl font-bold tracking-tight">
                        Gestión de Citas
                    </h1>
                    <p className="text-[#325B84] text-lg font-medium mt-1">
                        Programa y consulta la agenda de citas por caso, alumno o profesor.
                    </p>
                </div>
                <PrimaryButton
                    onClick={() => setIsModalOpen(true)}
                    icon="icon-[mdi--calendar-plus]"
                >
                    Programar Cita
                </PrimaryButton>
            </div>

            {/* Chart Section */}
            <div className="flex-none bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                <h2 className="text-sky-950 text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="icon-[mdi--chart-bar] text-[#3E7DBB] text-2xl"></span>
                    Distribución de Citas por Hora (Semana Actual)
                </h2>
                <BarChart
                    data={hourlyDistribution}
                    config={chartConfig}
                    dataKey="count"
                    nameKey="hour"
                />
            </div>

            {/* Calendar Section */}
            <div className="flex-1 min-h-0 overflow-y-auto">
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

            {/* Appointment Modal */}
            <AppointmentModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAppointment}
            />

            {/* Day Details Modal */}
            <DayDetailsModal
                open={isDayDetailsOpen}
                onClose={() => setIsDayDetailsOpen(false)}
                selectedDate={selectedDate}
                appointments={appointments}
            />
        </div>
    );
}
