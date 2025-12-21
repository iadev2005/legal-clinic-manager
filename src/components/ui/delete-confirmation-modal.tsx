"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/shadcn/dialog";
import PrimaryButton from "./primary-button";

interface DeleteConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
}

export default function DeleteConfirmationModal({
    open,
    onClose,
    onConfirm,
    title = "Confirmar eliminación",
    description = "¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.",
}: DeleteConfirmationModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[90vw] sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-red-600 text-2xl font-semibold flex items-center gap-2">
                        <span className="icon-[mdi--alert-circle-outline] text-3xl"></span>
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-lg pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex-col sm:flex-row gap-3 pt-6">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-semibold transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <span className="icon-[mdi--trash-can-outline] text-xl"></span>
                        Eliminar
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
