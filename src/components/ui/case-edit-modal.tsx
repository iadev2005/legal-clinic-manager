"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { Label } from "@/components/shadcn/label";
import FilterSelect from "./filter-select";
import PrimaryButton from "./primary-button";

interface CaseEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CaseEditData) => Promise<void>;
  caseData: {
    id: string;
    caseNumber: string;
    applicantName: string;
    status: "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA";
    assignedStudent: string;
  } | null;
}

export interface CaseEditData {
  id: string;
  status: "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA";
  assignedStudent: string;
}

// Lista de estudiantes disponibles (mock - en producción vendría de la API)
const AVAILABLE_STUDENTS = [
  { value: "José Gómez", label: "José Gómez" },
  { value: "Ana Martínez", label: "Ana Martínez" },
  { value: "Luisa Fernández", label: "Luisa Fernández" },
  { value: "Carlos Rodríguez", label: "Carlos Rodríguez" },
  { value: "María González", label: "María González" },
  { value: "Pedro Sánchez", label: "Pedro Sánchez" },
];

const STATUS_OPTIONS = [
  { value: "EN_PROCESO", label: "En Proceso" },
  { value: "ENTREGADO", label: "Entregado" },
  { value: "ARCHIVADO", label: "Archivado" },
  { value: "ASESORIA", label: "Asesoría" },
];

export default function CaseEditModal({
  open,
  onClose,
  onSave,
  caseData,
}: CaseEditModalProps) {
  const [formData, setFormData] = useState<CaseEditData>({
    id: "",
    status: "EN_PROCESO",
    assignedStudent: "",
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (caseData) {
      setFormData({
        id: caseData.id,
        status: caseData.status,
        assignedStudent: caseData.assignedStudent,
      });
      setHasChanges(false);
    }
  }, [caseData, open]);

  const handleChange = (field: keyof CaseEditData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving case:", error);
      alert("Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  if (!caseData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-sky-950 text-3xl font-semibold flex items-center gap-3">
            <span className="icon-[mdi--pencil] text-4xl text-green-600"></span>
            Editar Caso {caseData.caseNumber}
          </DialogTitle>
          <DialogDescription className="text-[#325B84] text-lg">
            Modifica el estatus y el alumno asignado al caso
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Información del caso (solo lectura) */}
          <div className="bg-blue-50 rounded-2xl p-4 border-2 border-[#3E7DBB]/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sky-950/70 text-sm font-semibold">
                  Número de Caso
                </label>
                <p className="text-sky-950 text-lg font-bold">
                  {caseData.caseNumber}
                </p>
              </div>
              <div>
                <label className="text-sky-950/70 text-sm font-semibold">
                  Solicitante
                </label>
                <p className="text-sky-950 text-lg font-semibold">
                  {caseData.applicantName}
                </p>
              </div>
            </div>
          </div>

          {/* Estatus del Caso */}
          <div className="space-y-2">
            <Label
              htmlFor="status"
              className="text-sky-950 font-semibold text-lg"
            >
              Estatus del Caso <span className="text-red-500">*</span>
            </Label>
            <FilterSelect
              placeholder="Seleccionar estatus"
              value={formData.status}
              onChange={(value) =>
                handleChange("status", value as CaseEditData["status"])
              }
              options={STATUS_OPTIONS}
            />
            <p className="text-sm text-sky-950/60">
              Cambia el estado actual del caso según su progreso
            </p>
          </div>

          {/* Alumno Asignado */}
          <div className="space-y-2">
            <Label
              htmlFor="assignedStudent"
              className="text-sky-950 font-semibold text-lg"
            >
              Alumno Asignado <span className="text-red-500">*</span>
            </Label>
            <FilterSelect
              placeholder="Seleccionar alumno"
              value={formData.assignedStudent}
              onChange={(value) => handleChange("assignedStudent", value)}
              options={AVAILABLE_STUDENTS}
            />
            <p className="text-sm text-sky-950/60">
              Asigna o reasigna el caso a un estudiante
            </p>
          </div>

          {/* Indicador de cambios */}
          {hasChanges && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-3 flex items-center gap-2">
              <span className="icon-[mdi--alert] text-2xl text-yellow-600"></span>
              <p className="text-yellow-800 font-semibold">
                Hay cambios sin guardar
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 rounded-2xl text-sky-950 text-lg font-semibold transition-all duration-300 hover:scale-105"
              disabled={loading}
            >
              Cancelar
            </button>
            <PrimaryButton
              type="submit"
              icon="icon-[mdi--content-save]"
              disabled={loading || !hasChanges}
              className={!hasChanges ? "opacity-50 cursor-not-allowed" : ""}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
