"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import StatusBadge from "./status-badge";

interface CaseDetailsModalProps {
  open: boolean;
  onClose: () => void;
  caseData: {
    id: string;
    caseNumber: string;
    applicantName: string;
    applicantId: string;
    subject: string;
    procedure: string;
    tribunal: string;
    period: string;
    assignedStudent: string;
    status: "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA";
    createdAt: string;
  } | null;
}

export default function CaseDetailsModal({
  open,
  onClose,
  caseData,
}: CaseDetailsModalProps) {
  if (!caseData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sky-950 text-3xl font-semibold flex items-center gap-3">
            <span className="icon-[mdi--file-document] text-4xl text-[#3E7DBB]"></span>
            Detalles del Caso {caseData.caseNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del Caso */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-[#3E7DBB]/20">
            <h3 className="text-sky-950 text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="icon-[mdi--information] text-2xl text-[#3E7DBB]"></span>
              Información General
            </h3>
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
                  Fecha de Creación
                </label>
                <p className="text-sky-950 text-lg font-semibold">
                  {new Date(caseData.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <label className="text-sky-950/70 text-sm font-semibold">
                  Estatus
                </label>
                <div className="mt-1">
                  <StatusBadge status={caseData.status} />
                </div>
              </div>
              <div>
                <label className="text-sky-950/70 text-sm font-semibold">
                  Periodo
                </label>
                <p className="text-sky-950 text-lg font-semibold">
                  {caseData.period}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Solicitante */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-500/20">
            <h3 className="text-sky-950 text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="icon-[mdi--account] text-2xl text-green-600"></span>
              Solicitante
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sky-950/70 text-sm font-semibold">
                  Nombre Completo
                </label>
                <p className="text-sky-950 text-lg font-bold">
                  {caseData.applicantName}
                </p>
              </div>
              <div>
                <label className="text-sky-950/70 text-sm font-semibold">
                  Cédula de Identidad
                </label>
                <p className="text-sky-950 text-lg font-semibold">
                  {caseData.applicantId}
                </p>
              </div>
            </div>
          </div>

          {/* Detalles Legales */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-500/20">
            <h3 className="text-sky-950 text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="icon-[mdi--gavel] text-2xl text-purple-600"></span>
              Detalles Legales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sky-950/70 text-sm font-semibold">
                  Materia
                </label>
                <p className="text-sky-950 text-lg font-bold">
                  {caseData.subject}
                </p>
              </div>
              <div>
                <label className="text-sky-950/70 text-sm font-semibold">
                  Trámite
                </label>
                <p className="text-sky-950 text-lg font-semibold">
                  {caseData.procedure}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sky-950/70 text-sm font-semibold">
                  Tribunal Asignado
                </label>
                <p className="text-sky-950 text-lg font-semibold">
                  {caseData.tribunal}
                </p>
              </div>
            </div>
          </div>

          {/* Alumno Asignado */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-500/20">
            <h3 className="text-sky-950 text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="icon-[mdi--school] text-2xl text-orange-600"></span>
              Asignación
            </h3>
            <div>
              <label className="text-sky-950/70 text-sm font-semibold">
                Alumno Responsable
              </label>
              <p className="text-sky-950 text-lg font-bold">
                {caseData.assignedStudent}
              </p>
            </div>
          </div>
        </div>

        {/* Footer con botón de cerrar */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 rounded-2xl text-sky-950 text-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
