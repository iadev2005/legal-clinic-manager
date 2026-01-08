"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/shadcn/dialog";

interface DeleteConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function DeleteConfirmationModal({
    open,
    onClose,
    onConfirm,
    title = "Confirmar acción",
    description = "¿Estás seguro de que deseas realizar esta acción?",
    confirmText = "Eliminar",
    cancelText = "Cancelar",
    isDestructive = true,
}: DeleteConfirmationModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[90vw] sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className={`${isDestructive ? "text-red-600" : "text-sky-950"} text-2xl font-semibold flex items-center gap-2`}>
                        <span className={`icon-[${isDestructive ? "mdi--alert-circle-outline" : "mdi--information-outline"}] text-3xl`}></span>
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-lg pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex-col sm:flex-row gap-3 pt-6">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-semibold transition-colors cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`w-full sm:w-auto px-4 py-2 ${isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-sky-950 hover:bg-[#325B84]"} text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer`}
                    >
                        {isDestructive && <span className="icon-[mdi--trash-can-outline] text-xl"></span>}
                        {confirmText}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
