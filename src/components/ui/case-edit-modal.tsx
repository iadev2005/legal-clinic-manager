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
import { getAlumnosDisponibles, getAsignacionesActivas } from "@/actions/casos";

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
  estatusList?: Array<{ id_estatus: number; nombre_estatus: string }>;
}

export interface CaseEditData {
  id: string;
  status: "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA";
  assignedStudent: string; // Nombre completo para mostrar
  assignedStudentCedula?: string; // Cédula del alumno
  assignedStudentTerm?: string; // Term del alumno
}

// Mapear estatus de BD a formato del frontend
const mapEstatusToFrontend = (estatus: string): "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA" => {
  const upper = estatus.toUpperCase();
  if (upper.includes("PROCESO")) return "EN_PROCESO";
  if (upper.includes("ARCHIVADO")) return "ARCHIVADO";
  if (upper.includes("ENTREGADO")) return "ENTREGADO";
  if (upper.includes("ASESORIA") || upper.includes("ASESORÍA")) return "ASESORIA";
  return "EN_PROCESO";
};

export default function CaseEditModal({
  open,
  onClose,
  onSave,
  caseData,
  estatusList = [],
}: CaseEditModalProps) {
  const [formData, setFormData] = useState<CaseEditData>({
    id: "",
    status: "EN_PROCESO",
    assignedStudent: "",
    assignedStudentCedula: "",
    assignedStudentTerm: "",
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [alumnosList, setAlumnosList] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);

  // Cargar alumnos cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadAlumnos();
    }
  }, [open]);

  const [alumnosData, setAlumnosData] = useState<Array<{ cedula: string; nombre: string; term: string }>>([]);

  const loadAlumnos = async () => {
    setLoadingAlumnos(true);
    try {
      const result = await getAlumnosDisponibles();
      if (result.success && result.data) {
        const alumnos = result.data.map((alumno: any) => ({
          cedula: alumno.cedula_usuario,
          nombre: alumno.nombre_completo || `${alumno.nombres} ${alumno.apellidos}`,
          term: alumno.term,
        }));
        setAlumnosData(alumnos);
        setAlumnosList(
          alumnos.map((alumno) => ({
            value: alumno.cedula,
            label: alumno.nombre,
          }))
        );
      } else {
        console.error("Error loading alumnos:", result.error);
        setAlumnosList([]);
        setAlumnosData([]);
      }
    } catch (error) {
      console.error("Error loading alumnos:", error);
      setAlumnosList([]);
      setAlumnosData([]);
    } finally {
      setLoadingAlumnos(false);
    }
  };

  useEffect(() => {
    if (caseData && open) {
      // Obtener la información del alumno actual del caso
      const loadCurrentAssignment = async () => {
        try {
          const nroCaso = parseInt(caseData.id);
          const asignaciones = await getAsignacionesActivas(nroCaso);
          if (asignaciones.success && asignaciones.data?.alumnos?.length > 0) {
            const alumnoActual = asignaciones.data.alumnos[0];
            setFormData({
              id: caseData.id,
              status: caseData.status,
              assignedStudent: caseData.assignedStudent,
              assignedStudentCedula: alumnoActual.cedula_alumno || "",
              assignedStudentTerm: alumnoActual.term || "",
            });
          } else {
            // Buscar en la lista de alumnos disponibles por nombre
            const alumnoEnLista = alumnosData.find(
              (a) => a.nombre === caseData.assignedStudent
            );
            setFormData({
              id: caseData.id,
              status: caseData.status,
              assignedStudent: caseData.assignedStudent,
              assignedStudentCedula: alumnoEnLista?.cedula || "",
              assignedStudentTerm: alumnoEnLista?.term || "",
            });
          }
        } catch (error) {
          console.error("Error loading current assignment:", error);
          // Fallback: buscar en la lista de alumnos disponibles
          const alumnoEnLista = alumnosData.find(
            (a) => a.nombre === caseData.assignedStudent
          );
          setFormData({
            id: caseData.id,
            status: caseData.status,
            assignedStudent: caseData.assignedStudent,
            assignedStudentCedula: alumnoEnLista?.cedula || "",
            assignedStudentTerm: alumnoEnLista?.term || "",
          });
        }
        setHasChanges(false);
      };
      loadCurrentAssignment();
    }
  }, [caseData, open, alumnosData]);

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
              options={
                estatusList.length > 0
                  ? estatusList.map((e) => ({
                      value: mapEstatusToFrontend(e.nombre_estatus),
                      label: e.nombre_estatus,
                    }))
                  : [
                      { value: "EN_PROCESO", label: "En Proceso" },
                      { value: "ENTREGADO", label: "Entregado" },
                      { value: "ARCHIVADO", label: "Archivado" },
                      { value: "ASESORIA", label: "Asesoría" },
                    ]
              }
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
              placeholder={loadingAlumnos ? "Cargando alumnos..." : "Seleccionar alumno"}
              value={formData.assignedStudentCedula || formData.assignedStudent}
              onChange={(value) => {
                const alumnoSeleccionado = alumnosData.find((a) => a.cedula === value);
                if (alumnoSeleccionado) {
                  setFormData((prev) => ({
                    ...prev,
                    assignedStudent: alumnoSeleccionado.nombre,
                    assignedStudentCedula: alumnoSeleccionado.cedula,
                    assignedStudentTerm: alumnoSeleccionado.term,
                  }));
                  setHasChanges(true);
                }
              }}
              options={alumnosList}
              disabled={loadingAlumnos}
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
