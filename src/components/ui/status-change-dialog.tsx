"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/shadcn/dialog";
import { getEstatus, cambiarEstatus } from "@/actions/casos";
import { cn } from "@/lib/utils";

interface StatusChangeDialogProps {
    open: boolean;
    onClose: () => void;
    nroCaso: number;
    currentStatusId?: number;
    onStatusChanged: () => void;
}

const statusIconMap: Record<string, string> = {
    "En Proceso": "icon-[mdi--clock-outline]",
    "Entregado": "icon-[mdi--check-circle]",
    "Archivado": "icon-[mdi--archive]",
    "Asesoría": "icon-[mdi--information]",
    "Asesoria": "icon-[mdi--information]",
    "Pausado": "icon-[mdi--pause-circle]",
};

export function StatusChangeDialog({
    open,
    onClose,
    nroCaso,
    currentStatusId,
    onStatusChanged,
}: StatusChangeDialogProps) {
    const [statuses, setStatuses] = useState<{ id_estatus: number; nombre_estatus: string }[]>([]);
    const [selectedStatusId, setSelectedStatusId] = useState<number | "">("");
    const [reason, setReason] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            const loadStatuses = async () => {
                const res = await getEstatus();
                if (res.success && res.data) {
                    setStatuses(res.data);
                }
            };
            loadStatuses();
            setSelectedStatusId(currentStatusId || "");
            setReason("");
            setError(null);
        }
    }, [open, currentStatusId]);

    const handleSave = async () => {
        if (!selectedStatusId) {
            setError("Por favor seleccione un estatus");
            return;
        }
        if (!reason.trim()) {
            setError("Por favor ingrese un motivo para el cambio");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const res = await cambiarEstatus(nroCaso, Number(selectedStatusId), reason.trim());
            if (res.success) {
                onStatusChanged();
                onClose();
            } else {
                setError(res.error || "Error al cambiar el estatus");
            }
        } catch (err: any) {
            setError(err.message || "Error al cambiar el estatus");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white rounded-3xl border-0 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 bg-gradient-to-br from-white to-blue-50/30 border-b border-neutral-100">
                    <DialogTitle className="text-xl font-bold text-sky-950 flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="icon-[mdi--swap-horizontal] text-[#3E7DBB] text-xl"></span>
                        </div>
                        Cambiar Estatus
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    {/* Status Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-sky-950/40 uppercase tracking-[0.2em] ml-1">
                            Nuevo Estatus
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {statuses.map((s) => (
                                <button
                                    key={s.id_estatus}
                                    onClick={() => setSelectedStatusId(s.id_estatus)}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all text-left group",
                                        selectedStatusId === s.id_estatus
                                            ? "border-[#3E7DBB] bg-blue-50 text-[#3E7DBB] shadow-sm"
                                            : "border-neutral-100 bg-neutral-50 text-sky-950/60 hover:border-neutral-200"
                                    )}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className={cn(
                                            "text-lg shrink-0",
                                            statusIconMap[s.nombre_estatus] || "icon-[mdi--circle-outline]",
                                            selectedStatusId === s.id_estatus ? "text-[#3E7DBB]" : "text-sky-950/20 group-hover:text-sky-950/40"
                                        )}></span>
                                        <span className="text-sm font-bold truncate">{s.nombre_estatus}</span>
                                    </div>
                                    {selectedStatusId === s.id_estatus && (
                                        <span className="icon-[mdi--check-circle] text-lg shrink-0"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reason Textarea */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-sky-950/40 uppercase tracking-[0.2em] ml-1">
                            Motivo del Cambio
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Justifique brevemente el cambio..."
                            className="w-full px-4 py-2 bg-neutral-50 rounded-xl border-2 border-neutral-200 text-sky-950 text-sm font-medium placeholder:text-sky-950/40 focus:outline-none focus:border-[#3E7DBB] focus:bg-white transition-all resize-none h-20"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
                            <span className="icon-[mdi--alert-circle] text-lg shrink-0"></span>
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-5 bg-neutral-50/50 border-t border-neutral-100 gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sky-950/40 text-xs font-black uppercase tracking-widest hover:text-sky-950 transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-[#3E7DBB] hover:bg-[#325B84] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isSaving ? (
                            <>
                                <span className="icon-[svg-spinners--180-ring-with-bg] text-lg"></span>
                                Actualizando...
                            </>
                        ) : (
                            <>
                                <span className="icon-[mdi--check] text-xl"></span>
                                Confirmar Cambio
                            </>
                        )}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
