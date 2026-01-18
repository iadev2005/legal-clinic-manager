"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn/alert-dialog";
import StatusBadge from "./status-badge";
import { DownloadCaseReportButton } from "@/components/DownloadCaseReportButton";
import { getCaseReportData } from "@/actions/cases";
import { getHistorialEstatus } from "@/actions/casos";

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
    status: "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA" | "PAUSADO";
    createdAt: string;
  } | null;
  preloadedDetails?: any;
  preloadedStatusHistory?: any[];
  userRole?: "ADMIN" | "PROFESSOR" | "STUDENT";
  debugRole?: string;
}

export default function CaseDetailsModal({
  open,
  onClose,
  caseData,
  preloadedDetails,
  preloadedStatusHistory,
  userRole,
  debugRole
}: CaseDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [caseDetails, setCaseDetails] = useState<any>(null);
  const [historialEstatus, setHistorialEstatus] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "beneficiarios" | "soportes" | "citas" | "bitacora" | "historial">("general");

  useEffect(() => {
    if (open && caseData) {
      if (preloadedDetails) {
        setCaseDetails(preloadedDetails);
        setHistorialEstatus(preloadedStatusHistory || []);
      } else {
        loadCaseDetails();
      }
    }
  }, [open, caseData, preloadedDetails, preloadedStatusHistory]);

  const loadCaseDetails = async () => {
    if (!caseData) return;

    setLoading(true);
    setError(null);

    try {
      const [details, historial] = await Promise.all([
        getCaseReportData(caseData.id),
        getHistorialEstatus(parseInt(caseData.id)),
      ]);

      if (details) {
        setCaseDetails(details);
      } else {
        setError("No se pudieron cargar los detalles del caso");
      }

      if (historial.success && historial.data) {
        setHistorialEstatus(historial.data);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar los detalles del caso");
    } finally {
      setLoading(false);
    }
  };

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  if (!caseData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sky-950 text-3xl font-semibold flex items-center gap-3">
            <span className="icon-[mdi--file-document] text-4xl text-[#3E7DBB]"></span>
            Detalles del Caso {caseData.caseNumber}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sky-950 text-lg">Cargando información...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        ) : caseDetails ? (
          <div className="space-y-6 py-4">
            {/* Tabs de navegación */}
            <div className="flex gap-2 border-b border-gray-200">
              {[
                { id: "general", label: "General", icon: "icon-[mdi--information]" },
                { id: "beneficiarios", label: "Beneficiarios", icon: "icon-[mdi--account-group]" },
                { id: "soportes", label: "Soportes", icon: "icon-[mdi--file-document]" },
                { id: "citas", label: "Citas", icon: "icon-[mdi--calendar]" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 font-semibold transition-colors border-b-2 ${activeTab === tab.id
                    ? "border-[#3E7DBB] text-[#3E7DBB]"
                    : "border-transparent text-gray-500 hover:text-sky-950"
                    }`}
                >
                  <span className={`${tab.icon} mr-2`}></span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: General */}
            {activeTab === "general" && (
              <div className="space-y-6">
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
                        Fecha de Inicio
                      </label>
                      <p className="text-sky-950 text-lg font-semibold">
                        {caseDetails.caseInfo.fecha_caso_inicio
                          ? new Date(caseDetails.caseInfo.fecha_caso_inicio).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sky-950/70 text-sm font-semibold">
                        Fecha de Finalización
                      </label>
                      <p className="text-sky-950 text-lg font-semibold">
                        {caseDetails.caseInfo.fecha_caso_final
                          ? new Date(caseDetails.caseInfo.fecha_caso_final).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : "En proceso"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sky-950/70 text-sm font-semibold">
                        Estatus Actual
                      </label>
                      <div className="mt-1">
                        <StatusBadge status={caseData.status} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sky-950/70 text-sm font-semibold">
                        Semestre de Gestión
                      </label>
                      <p className="text-sky-950 text-lg font-semibold">
                        {caseDetails.caseInfo.periodo_actual || "N/A"}
                      </p>
                    </div>
                    {caseDetails.caseInfo.sintesis_caso && (
                      <div className="col-span-2">
                        <label className="text-sky-950/70 text-sm font-semibold">
                          Síntesis del Caso
                        </label>
                        <p className="text-sky-950 text-base mt-1 bg-white p-3 rounded-lg">
                          {caseDetails.caseInfo.sintesis_caso}
                        </p>
                      </div>
                    )}
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
                        {caseDetails.caseInfo.solicitante_nombres} {caseDetails.caseInfo.solicitante_apellidos}
                      </p>
                    </div>
                    <div>
                      <label className="text-sky-950/70 text-sm font-semibold">
                        Cédula de Identidad
                      </label>
                      <p className="text-sky-950 text-lg font-semibold">
                        {caseDetails.caseInfo.cedula_solicitante}
                      </p>
                    </div>
                    <div>
                      <label className="text-sky-950/70 text-sm font-semibold">
                        Teléfono
                      </label>
                      <p className="text-sky-950 text-lg font-semibold">
                        {caseDetails.caseInfo.telefono_celular || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sky-950/70 text-sm font-semibold">
                        Correo Electrónico
                      </label>
                      <p className="text-sky-950 text-lg font-semibold">
                        {caseDetails.caseInfo.correo_electronico || "N/A"}
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
                        {caseDetails.caseInfo.nombre_materia}
                      </p>
                    </div>
                    <div>
                      <label className="text-sky-950/70 text-sm font-semibold">
                        Categoría
                      </label>
                      <p className="text-sky-950 text-lg font-semibold">
                        {caseDetails.caseInfo.nombre_categoria}
                      </p>
                    </div>
                    <div>
                      <label className="text-sky-950/70 text-sm font-semibold">
                        Subcategoría
                      </label>
                      <p className="text-sky-950 text-lg font-semibold">
                        {caseDetails.caseInfo.nombre_subcategoria}
                      </p>
                    </div>
                    <div>
                      <label className="text-sky-950/70 text-sm font-semibold">
                        Ámbito Legal
                      </label>
                      <p className="text-sky-950 text-lg font-semibold">
                        {caseDetails.caseInfo.nombre_ambito_legal}
                      </p>
                    </div>
                    <div>
                      <label className="text-sky-950/70 text-sm font-semibold">
                        Trámite
                      </label>
                      <p className="text-sky-950 text-lg font-semibold">
                        {caseDetails.caseInfo.nombre_tramite}
                      </p>
                    </div>
                    <div>
                      <label className="text-sky-950/70 text-sm font-semibold">
                        Núcleo
                      </label>
                      <p className="text-sky-950 text-lg font-semibold">
                        {caseDetails.caseInfo.nombre_nucleo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Asignaciones */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-500/20">
                  <h3 className="text-sky-950 text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="icon-[mdi--school] text-2xl text-orange-600"></span>
                    Asignaciones
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sky-950/70 text-sm font-semibold">
                        Alumnos Asignados
                      </label>
                      <div className="space-y-2">
                        {caseDetails.students && caseDetails.students.length > 0 ? (
                          caseDetails.students.map((student: any, idx: number) => (
                            <div key={idx}>
                              <p className="text-sky-950 text-lg font-bold">
                                {student.nombres} {student.apellidos}
                              </p>
                              <p className="text-sm text-sky-950/60">
                                {student.correo_electronico}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sky-950 text-lg font-bold">Sin asignar</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sky-950/70 text-sm font-semibold">
                        Profesor Supervisor
                      </label>
                      <p className="text-sky-950 text-lg font-bold">
                        {caseDetails.supervisors && caseDetails.supervisors.length > 0
                          ? `${caseDetails.supervisors[0].nombres} ${caseDetails.supervisors[0].apellidos}`
                          : "Sin asignar"}
                      </p>
                      {caseDetails.supervisors && caseDetails.supervisors.length > 0 && (
                        <p className="text-sm text-sky-950/60">
                          {caseDetails.supervisors[0].correo_electronico}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Beneficiarios */}
            {activeTab === "beneficiarios" && (
              <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl p-6 border-2 border-pink-500/20">
                <h3 className="text-sky-950 text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="icon-[mdi--account-group] text-2xl text-pink-600"></span>
                  Beneficiarios ({caseDetails.beneficiaries?.length || 0})
                </h3>
                {caseDetails.beneficiaries && caseDetails.beneficiaries.length > 0 ? (
                  <div className="space-y-4">
                    {caseDetails.beneficiaries.map((ben: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-xl border border-pink-200"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sky-950/70 text-sm font-semibold">
                              Cédula
                            </label>
                            <p className="text-sky-950 font-bold">
                              {ben.cedula_beneficiario}
                              {ben.cedula_es_propia && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  Propia
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <label className="text-sky-950/70 text-sm font-semibold">
                              Tipo
                            </label>
                            <p className="text-sky-950 font-semibold">
                              {ben.tipo_beneficiario}
                            </p>
                          </div>
                          <div>
                            <label className="text-sky-950/70 text-sm font-semibold">
                              Nombre Completo
                            </label>
                            <p className="text-sky-950">
                              {ben.nombres && ben.apellidos
                                ? `${ben.nombres} ${ben.apellidos}`
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sky-950/70 text-sm font-semibold">
                              Sexo
                            </label>
                            <p className="text-sky-950">
                              {ben.sexo === "M" ? "Masculino" : ben.sexo === "F" ? "Femenino" : "N/A"}
                            </p>
                          </div>
                          {ben.fecha_nacimiento && (
                            <div>
                              <label className="text-sky-950/70 text-sm font-semibold">
                                Fecha de Nacimiento
                              </label>
                              <p className="text-sky-950">
                                {new Date(ben.fecha_nacimiento).toLocaleDateString("es-ES")}
                                {ben.edad && ` (${ben.edad} años)`}
                              </p>
                            </div>
                          )}
                          {ben.parentesco && (
                            <div>
                              <label className="text-sky-950/70 text-sm font-semibold">
                                Parentesco
                              </label>
                              <p className="text-sky-950">{ben.parentesco}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sky-950/60 text-center py-8">
                    No hay beneficiarios registrados para este caso
                  </p>
                )}
              </div>
            )}

            {/* Tab: Soportes */}
            {activeTab === "soportes" && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl p-6 border-2 border-yellow-500/20">
                <h3 className="text-sky-950 text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="icon-[mdi--file-document] text-2xl text-yellow-600"></span>
                  Soportes Legales ({caseDetails.supports?.length || 0})
                </h3>
                {caseDetails.supports && caseDetails.supports.length > 0 ? (
                  <div className="space-y-4">
                    {caseDetails.supports.map((soporte: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-xl border border-yellow-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-bold text-sky-950">{soporte.descripcion}</p>
                            <p className="text-sm text-sky-950/60 mt-1">
                              {soporte.fecha_soporte
                                ? new Date(soporte.fecha_soporte).toLocaleDateString("es-ES")
                                : "N/A"}
                            </p>
                            {soporte.observacion && (
                              <p className="text-sm text-sky-950/70 mt-2">{soporte.observacion}</p>
                            )}
                          </div>
                          {soporte.documento_url && (
                            <a
                              href={soporte.documento_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                              <span className="icon-[mdi--download] text-xl"></span>
                              Ver Documento
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sky-950/60 text-center py-8">
                    No hay soportes legales registrados para este caso
                  </p>
                )}
              </div>
            )}

            {/* Tab: Citas */}
            {activeTab === "citas" && (
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl p-6 border-2 border-indigo-500/20">
                <h3 className="text-sky-950 text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="icon-[mdi--calendar] text-2xl text-indigo-600"></span>
                  Citas y Entrevistas ({caseDetails.appointments?.length || 0})
                </h3>
                {caseDetails.appointments && caseDetails.appointments.length > 0 ? (
                  <div className="space-y-4">
                    {caseDetails.appointments.map((cita: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-xl border border-indigo-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-sky-950">
                              {new Date(cita.fecha_atencion).toLocaleString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {cita.fecha_proxima_cita && (
                              <p className="text-sm text-green-700 mt-1">
                                Próxima cita:{" "}
                                {new Date(cita.fecha_proxima_cita).toLocaleString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        {cita.observacion && (
                          <p className="text-sm text-sky-950/70 mt-2">{cita.observacion}</p>
                        )}
                        {cita.atendido_por && cita.atendido_por.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-indigo-200">
                            <p className="text-xs font-semibold text-sky-950/60 mb-1">
                              Atendido por:
                            </p>
                            <p className="text-sm text-sky-950">
                              {Array.isArray(cita.atendido_por)
                                ? cita.atendido_por.filter(Boolean).join(", ")
                                : cita.atendido_por}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sky-950/60 text-center py-8">
                    No hay citas registradas para este caso
                  </p>
                )}
              </div>
            )}

          </div>
        ) : null}

        {/* Footer con botones de acción */}
        <div className="flex justify-between items-center pt-4 border-t">

          <div className="flex gap-3">
            {/* DEBUG: Button is rendered if userRole is ADMIN or if raw role is right */}
            {(userRole === "ADMIN" || debugRole === "Administrador") && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-lg font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2 border-2 border-red-800"
                    style={{ display: 'flex', visibility: 'visible', opacity: 1, zIndex: 99 }}
                  >
                    <span className="icon-[mdi--trash-can-outline] text-xl"></span>
                    ELIMINAR CASO (ADMIN)
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 font-bold text-xl flex items-center gap-2">
                      <span className="icon-[mdi--alert-circle] text-2xl"></span>
                      Confirmar Eliminación
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-700 text-base">
                      ¿Estás completamente seguro de que deseas eliminar este caso?<br /><br />
                      <span className="font-semibold text-red-800">Esta acción es irreversible.</span> Se eliminarán permanentemente el caso, sus beneficiarios, historial, asignaciones, soportes y citas asociadas.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        import("@/actions/casos").then(({ deleteCaso }) => {
                          deleteCaso(parseInt(caseData.id)).then((res) => {
                            if (res.success) {
                              onClose();
                              window.location.reload();
                            } else {
                              alert(res.error);
                            }
                          });
                        });
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                    >
                      Sí, Eliminar Definitivamente
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <DownloadCaseReportButton
              caseId={caseData.id}
              caseNumber={caseData.caseNumber}
            />
            <button
              onClick={onClose}
              className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 rounded-2xl text-sky-950 text-lg font-semibold transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
