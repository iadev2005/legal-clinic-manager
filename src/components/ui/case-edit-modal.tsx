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
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import FilterSelect from "./filter-select";
import PrimaryButton from "./primary-button";
import LegalHierarchySelect from "./legal-hierarchy-select";
import CloudinaryUploadButton from "./cloudinary-upload-button";
import {
  getCasoById,
  getAlumnosDisponibles,
  getProfesoresDisponibles,
  getAsignacionesActivas,
  getBeneficiariosCaso,
  getSoportesCaso,
  getTramites,
  getNucleos,
  updateCaso,
  asignarAlumno,
  asignarProfesor,
  cambiarEstatus,
  addBeneficiario,
  removeBeneficiario,
  type BeneficiarioData,
  type UpdateCasoData,
} from "@/actions/casos";
import { getSolicitantes } from "@/actions/solicitantes";
import { getSemestres } from "@/actions/administracion";
import { crearSoporteLegalDirecto } from "@/actions/soportes";

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
  userCedula?: string;
}

export interface CaseEditData {
  id: string;
  cedula_solicitante?: string;
  id_nucleo?: number;
  id_tramite?: number;
  legalHierarchy?: {
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    num_ambito_legal: number;
  };
  sintesis_caso?: string;
  fecha_caso_inicio?: string;
  fecha_caso_final?: string | null;
  status: "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA";
  assignedStudentCedula?: string;
  assignedStudentTerm?: string;
  assignedProfesorCedula?: string;
  assignedProfesorTerm?: string;
  beneficiarios?: BeneficiarioData[];
  soportes?: Array<{
    descripcion: string;
    documento_url: string;
    observacion?: string;
  }>;
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

interface BeneficiarioForm {
  cedula_beneficiario: string;
  cedula_es_propia: boolean;
  nombres: string;
  apellidos: string;
  sexo: "M" | "F" | "";
  fecha_nacimiento: string;
  tipo_beneficiario: "Directo" | "Indirecto" | "";
  parentesco: string;
}

interface SoporteForm {
  descripcion: string;
  documento_url: string;
  observacion: string;
}

export default function CaseEditModal({
  open,
  onClose,
  onSave,
  caseData,
  estatusList = [],
  userCedula,
}: CaseEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Catálogos
  const [solicitantes, setSolicitantes] = useState<Array<{ value: string; label: string }>>([]);
  const [tramites, setTramites] = useState<Array<{ value: string; label: string }>>([]);
  const [nucleos, setNucleos] = useState<Array<{ value: string; label: string }>>([]);
  const [alumnos, setAlumnos] = useState<Array<{ value: string; label: string; term: string }>>([]);
  const [profesores, setProfesores] = useState<Array<{ value: string; label: string; term: string }>>([]);
  const [semestres, setSemestres] = useState<Array<{ value: string; label: string }>>([]);

  // Form data
  const [cedulaSolicitante, setCedulaSolicitante] = useState("");
  const [legalHierarchy, setLegalHierarchy] = useState<{
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    num_ambito_legal: number;
  } | null>(null);
  const [idTramite, setIdTramite] = useState("");
  const [idNucleo, setIdNucleo] = useState("");
  const [sintesis, setSintesis] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFinal, setFechaFinal] = useState<string | null>(null);
  const [status, setStatus] = useState<"EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA">("EN_PROCESO");
  const [cedulaAlumno, setCedulaAlumno] = useState("");
  const [termAlumno, setTermAlumno] = useState("");
  const [cedulaProfesor, setCedulaProfesor] = useState("");
  const [termProfesor, setTermProfesor] = useState("");

  // Beneficiarios y Soportes
  const [beneficiarios, setBeneficiarios] = useState<BeneficiarioForm[]>([]);
  const [soportes, setSoportes] = useState<SoporteForm[]>([]);
  const [soportesExistentes, setSoportesExistentes] = useState<any[]>([]);

  // Cargar catálogos y datos del caso
  useEffect(() => {
    if (open && caseData) {
      loadCatalogs();
      loadCaseData();
    }
  }, [open, caseData]);

  const loadCatalogs = async () => {
    try {
      const [
        solicitantesRes,
        tramitesRes,
        nucleosRes,
        semestresRes,
      ] = await Promise.all([
        getSolicitantes(),
        getTramites(),
        getNucleos(),
        getSemestres(),
      ]);

      if (solicitantesRes.success && solicitantesRes.data) {
        setSolicitantes(
          solicitantesRes.data.map((s: any) => ({
            value: s.cedula_solicitante,
            label: `${s.nombres} ${s.apellidos} (${s.cedula_solicitante})`,
          }))
        );
      }

      if (tramitesRes.success && tramitesRes.data) {
        setTramites(
          tramitesRes.data.map((t: any) => ({
            value: t.id_tramite.toString(),
            label: t.nombre,
          }))
        );
      }

      if (nucleosRes.success && nucleosRes.data) {
        setNucleos(
          nucleosRes.data.map((n: any) => ({
            value: n.id_nucleo.toString(),
            label: n.nombre,
          }))
        );
      }

      if (semestresRes.success && semestresRes.data) {
        setSemestres(
          semestresRes.data.map((s: any) => ({
            value: s.term,
            label: s.term,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading catalogs:", error);
    }
  };

  const loadCaseData = async () => {
    if (!caseData) return;

    setLoadingData(true);
    try {
      const nroCaso = parseInt(caseData.id);
      const [
        casoRes,
        beneficiariosRes,
        soportesRes,
        asignacionesRes,
      ] = await Promise.all([
        getCasoById(nroCaso),
        getBeneficiariosCaso(nroCaso),
        getSoportesCaso(nroCaso),
        getAsignacionesActivas(nroCaso),
      ]);

      if (casoRes.success && casoRes.data) {
        const caso = casoRes.data;
        setCedulaSolicitante(caso.cedula_solicitante || "");
        setIdTramite(caso.id_tramite?.toString() || "");
        setIdNucleo(caso.id_nucleo?.toString() || "");
        setSintesis(caso.sintesis_caso || "");
        setFechaInicio(caso.fecha_caso_inicio || "");
        setFechaFinal(caso.fecha_caso_final || null);
        setStatus(mapEstatusToFrontend(casoRes.data.estatus_actual || "EN_PROCESO"));

        // Jerarquía legal
        if (caso.id_materia && caso.num_categoria && caso.num_subcategoria && caso.num_ambito_legal) {
          setLegalHierarchy({
            id_materia: caso.id_materia,
            num_categoria: caso.num_categoria,
            num_subcategoria: caso.num_subcategoria,
            num_ambito_legal: caso.num_ambito_legal,
          });
        }

        // Asignaciones
        let termToLoad: string | undefined;
        if (asignacionesRes.success && asignacionesRes.data) {
          if (asignacionesRes.data.alumnos?.length > 0) {
            const alumno = asignacionesRes.data.alumnos[0];
            setCedulaAlumno(alumno.cedula_alumno || "");
            setTermAlumno(alumno.term || "");
            termToLoad = alumno.term || undefined;
          }
          if (asignacionesRes.data.profesores?.length > 0) {
            const profesor = asignacionesRes.data.profesores[0];
            setCedulaProfesor(profesor.cedula_profesor || "");
            setTermProfesor(profesor.term || "");
            if (!termToLoad) termToLoad = profesor.term || undefined;
          }
        }

        // Cargar alumnos y profesores del term correspondiente
        loadAlumnosAndProfesores(termToLoad);
      }

      if (beneficiariosRes.success && beneficiariosRes.data) {
        setBeneficiarios(
          beneficiariosRes.data.map((b: any) => ({
            cedula_beneficiario: b.cedula_beneficiario || "",
            cedula_es_propia: b.cedula_es_propia || false,
            nombres: b.nombres || "",
            apellidos: b.apellidos || "",
            sexo: (b.sexo as "M" | "F") || "",
            fecha_nacimiento: b.fecha_nacimiento || "",
            tipo_beneficiario: (b.tipo_beneficiario as "Directo" | "Indirecto") || "",
            parentesco: b.parentesco || "",
          }))
        );
      }

      if (soportesRes.success && soportesRes.data) {
        setSoportesExistentes(soportesRes.data);
      }
    } catch (error) {
      console.error("Error loading case data:", error);
      setSubmitError("Error al cargar los datos del caso");
    } finally {
      setLoadingData(false);
    }
  };

  const loadAlumnosAndProfesores = async (termFilter?: string) => {
    try {
      const [alumnosRes, profesoresRes] = await Promise.all([
        getAlumnosDisponibles(termFilter),
        getProfesoresDisponibles(termFilter),
      ]);

      if (alumnosRes.success && alumnosRes.data) {
        setAlumnos(
          alumnosRes.data.map((a: any) => ({
            value: a.cedula_usuario,
            label: `${a.nombres} ${a.apellidos}`,
            term: a.term,
          }))
        );
      }

      if (profesoresRes.success && profesoresRes.data) {
        setProfesores(
          profesoresRes.data.map((p: any) => ({
            value: p.cedula_usuario,
            label: `${p.nombres} ${p.apellidos}`,
            term: p.term,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading alumnos/profesores:", error);
    }
  };

  const handleBeneficiarioChange = (
    index: number,
    field: keyof BeneficiarioForm,
    value: any
  ) => {
    const updated = [...beneficiarios];
    updated[index] = { ...updated[index], [field]: value };
    setBeneficiarios(updated);
    setHasChanges(true);
  };

  const handleAddBeneficiario = () => {
    setBeneficiarios([
      ...beneficiarios,
      {
        cedula_beneficiario: "",
        cedula_es_propia: true,
        nombres: "",
        apellidos: "",
        sexo: "",
        fecha_nacimiento: "",
        tipo_beneficiario: "",
        parentesco: "",
      },
    ]);
    setHasChanges(true);
  };

  const handleRemoveBeneficiario = (index: number) => {
    setBeneficiarios(beneficiarios.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSoporteChange = (
    index: number,
    field: keyof SoporteForm,
    value: string
  ) => {
    const updated = [...soportes];
    updated[index] = { ...updated[index], [field]: value };
    setSoportes(updated);
    setHasChanges(true);
  };

  const handleAddSoporte = () => {
    setSoportes([
      ...soportes,
      {
        descripcion: "",
        documento_url: "",
        observacion: "",
      },
    ]);
    setHasChanges(true);
  };

  const handleRemoveSoporte = (index: number) => {
    setSoportes(soportes.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!hasChanges) {
      onClose();
      return;
    }

    if (!caseData) return;

    setLoading(true);
    try {
      const nroCaso = parseInt(caseData.id);

      // 1. Actualizar datos básicos del caso
      const updateData: UpdateCasoData = {};
      if (cedulaSolicitante) updateData.cedula_solicitante = cedulaSolicitante;
      if (idNucleo) updateData.id_nucleo = parseInt(idNucleo);
      if (idTramite) updateData.id_tramite = parseInt(idTramite);
      if (legalHierarchy) {
        updateData.id_materia = legalHierarchy.id_materia;
        updateData.num_categoria = legalHierarchy.num_categoria;
        updateData.num_subcategoria = legalHierarchy.num_subcategoria;
        updateData.num_ambito_legal = legalHierarchy.num_ambito_legal;
      }
      if (sintesis !== undefined) updateData.sintesis_caso = sintesis;
      if (fechaInicio) updateData.fecha_caso_inicio = fechaInicio;
      updateData.fecha_caso_final = fechaFinal;

      if (Object.keys(updateData).length > 0) {
        await updateCaso(nroCaso, updateData);
      }

      // 2. Cambiar estatus si es diferente
      const estatusObj = estatusList.find((e: any) => {
        const nombre = e.nombre_estatus?.toUpperCase() || "";
        const statusMap: Record<string, string> = {
          "EN_PROCESO": "EN PROCESO",
          "ARCHIVADO": "ARCHIVADO",
          "ENTREGADO": "ENTREGADO",
          "ASESORIA": "ASESORÍA",
        };
        return nombre.includes(statusMap[status] || "");
      });

      if (estatusObj && userCedula) {
        await cambiarEstatus(nroCaso, estatusObj.id_estatus, "Cambio de estatus desde la edición", userCedula);
      }

      // 3. Asignar alumno/profesor si cambió
      if (cedulaAlumno && termAlumno) {
        await asignarAlumno(nroCaso, cedulaAlumno, termAlumno);
      }
      if (cedulaProfesor && termProfesor) {
        await asignarProfesor(nroCaso, cedulaProfesor, termProfesor);
      }

      // 4. Agregar nuevos beneficiarios (los existentes no se eliminan, solo se agregan nuevos)
      // Nota: Para eliminar beneficiarios existentes, se necesitaría una funcionalidad adicional

      // 5. Agregar nuevos soportes legales
      for (const soporte of soportes) {
        if (soporte.descripcion.trim() && soporte.documento_url.trim()) {
          await crearSoporteLegalDirecto({
            nro_caso: nroCaso,
            descripcion: soporte.descripcion,
            documento_url: soporte.documento_url,
            observacion: soporte.observacion || undefined,
          });
        }
      }

      // Llamar al callback onSave
      await onSave({
        id: caseData.id,
        status,
        cedula_solicitante: cedulaSolicitante || undefined,
        id_nucleo: idNucleo ? parseInt(idNucleo) : undefined,
        id_tramite: idTramite ? parseInt(idTramite) : undefined,
        legalHierarchy: legalHierarchy || undefined,
        sintesis_caso: sintesis || undefined,
        fecha_caso_inicio: fechaInicio || undefined,
        fecha_caso_final: fechaFinal,
        assignedStudentCedula: cedulaAlumno || undefined,
        assignedStudentTerm: termAlumno || undefined,
        assignedProfesorCedula: cedulaProfesor || undefined,
        assignedProfesorTerm: termProfesor || undefined,
      });

      onClose();
    } catch (error: any) {
      console.error("Error saving case:", error);
      setSubmitError(error.message || "Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  if (!caseData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sky-950 text-3xl font-semibold flex items-center gap-3">
            <span className="icon-[mdi--pencil] text-4xl text-green-600"></span>
            Editar Caso {caseData.caseNumber}
          </DialogTitle>
          <DialogDescription className="text-[#325B84] text-lg">
            Modifica los datos del caso legal
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sky-950">Cargando datos del caso...</p>
          </div>
        ) : (
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
                    Solicitante Actual
                  </label>
                  <p className="text-sky-950 text-lg font-semibold">
                    {caseData.applicantName}
                  </p>
                </div>
              </div>
            </div>

            {/* Solicitante */}
            <div className="space-y-2">
              <Label htmlFor="solicitante" className="text-sky-950 font-semibold text-lg">
                Solicitante
              </Label>
              <FilterSelect
                placeholder="Buscar y seleccionar solicitante"
                value={cedulaSolicitante}
                onChange={(value) => {
                  setCedulaSolicitante(value);
                  setHasChanges(true);
                }}
                options={solicitantes}
              />
            </div>

            {/* Jerarquía Legal */}
            <div className="space-y-2">
              <Label className="text-sky-950 font-semibold text-lg">
                Jerarquía Legal
              </Label>
              <LegalHierarchySelect
                value={legalHierarchy || undefined}
                onChange={(value) => {
                  setLegalHierarchy(value || null);
                  setHasChanges(true);
                }}
              />
            </div>

            {/* Trámite y Núcleo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tramite" className="text-sky-950 font-semibold text-lg">
                  Trámite
                </Label>
                <FilterSelect
                  placeholder="Seleccionar trámite"
                  value={idTramite}
                  onChange={(value) => {
                    setIdTramite(value);
                    setHasChanges(true);
                  }}
                  options={tramites}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nucleo" className="text-sky-950 font-semibold text-lg">
                  Núcleo
                </Label>
                <FilterSelect
                  placeholder="Seleccionar núcleo"
                  value={idNucleo}
                  onChange={(value) => {
                    setIdNucleo(value);
                    setHasChanges(true);
                  }}
                  options={nucleos}
                />
              </div>
            </div>

            {/* Síntesis y Fechas */}
            <div className="space-y-2">
              <Label htmlFor="sintesis" className="text-sky-950 font-semibold text-lg">
                Síntesis del Caso
              </Label>
              <Textarea
                id="sintesis"
                value={sintesis}
                onChange={(e) => {
                  setSintesis(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Descripción breve del caso..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio" className="text-sky-950 font-semibold text-lg">
                  Fecha de Inicio
                </Label>
                <Input
                  type="date"
                  id="fechaInicio"
                  value={fechaInicio}
                  onChange={(e) => {
                    setFechaInicio(e.target.value);
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFinal" className="text-sky-950 font-semibold text-lg">
                  Fecha de Finalización
                </Label>
                <Input
                  type="date"
                  id="fechaFinal"
                  value={fechaFinal || ""}
                  onChange={(e) => {
                    setFechaFinal(e.target.value || null);
                    setHasChanges(true);
                  }}
                />
              </div>
            </div>

            {/* Estatus */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sky-950 font-semibold text-lg">
                Estatus del Caso
              </Label>
              <FilterSelect
                placeholder="Seleccionar estatus"
                value={status}
                onChange={(value) => {
                  setStatus(value as typeof status);
                  setHasChanges(true);
                }}
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
            </div>

            {/* Asignaciones */}
            <div className="space-y-4 border-t pt-4">
              <Label className="text-sky-950 font-semibold text-lg">
                Asignaciones
              </Label>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Alumno</Label>
                  <FilterSelect
                    placeholder="Seleccionar alumno"
                    value={cedulaAlumno}
                    onChange={(value) => {
                      const alumno = alumnos.find((a) => a.value === value);
                      if (alumno) {
                        setCedulaAlumno(value);
                        setTermAlumno(alumno.term);
                        setHasChanges(true);
                      }
                    }}
                    options={alumnos.map((a) => ({
                      value: a.value,
                      label: a.label,
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Profesor Supervisor</Label>
                  <FilterSelect
                    placeholder="Seleccionar profesor"
                    value={cedulaProfesor}
                    onChange={(value) => {
                      const profesor = profesores.find((p) => p.value === value);
                      if (profesor) {
                        setCedulaProfesor(value);
                        setTermProfesor(profesor.term);
                        setHasChanges(true);
                      }
                    }}
                    options={profesores.map((p) => ({
                      value: p.value,
                      label: p.label,
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Beneficiarios */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-sky-950 font-semibold text-lg">
                  Beneficiarios
                </Label>
                <button
                  type="button"
                  onClick={handleAddBeneficiario}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <span className="icon-[mdi--plus] text-xl"></span>
                  Agregar Beneficiario
                </button>
              </div>

              {beneficiarios.map((ben, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sky-950">
                      Beneficiario {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveBeneficiario(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <span className="icon-[mdi--delete] text-xl"></span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Cédula</Label>
                      <Input
                        value={ben.cedula_beneficiario}
                        onChange={(e) =>
                          handleBeneficiarioChange(index, "cedula_beneficiario", e.target.value)
                        }
                        placeholder="V-12345678"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Tipo</Label>
                      <FilterSelect
                        placeholder="Seleccionar tipo"
                        value={ben.tipo_beneficiario}
                        onChange={(value) =>
                          handleBeneficiarioChange(index, "tipo_beneficiario", value)
                        }
                        options={[
                          { value: "Directo", label: "Directo" },
                          { value: "Indirecto", label: "Indirecto" },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Nombres</Label>
                      <Input
                        value={ben.nombres}
                        onChange={(e) =>
                          handleBeneficiarioChange(index, "nombres", e.target.value)
                        }
                        placeholder="Opcional"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Apellidos</Label>
                      <Input
                        value={ben.apellidos}
                        onChange={(e) =>
                          handleBeneficiarioChange(index, "apellidos", e.target.value)
                        }
                        placeholder="Opcional"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Sexo</Label>
                      <FilterSelect
                        placeholder="Seleccionar"
                        value={ben.sexo}
                        onChange={(value) =>
                          handleBeneficiarioChange(index, "sexo", value)
                        }
                        options={[
                          { value: "M", label: "Masculino" },
                          { value: "F", label: "Femenino" },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Fecha de Nacimiento</Label>
                      <Input
                        type="date"
                        value={ben.fecha_nacimiento}
                        onChange={(e) =>
                          handleBeneficiarioChange(index, "fecha_nacimiento", e.target.value)
                        }
                      />
                    </div>

                    {ben.tipo_beneficiario === "Indirecto" && (
                      <div className="space-y-2 col-span-2">
                        <Label className="text-sm font-semibold">Parentesco</Label>
                        <Input
                          value={ben.parentesco}
                          onChange={(e) =>
                            handleBeneficiarioChange(index, "parentesco", e.target.value)
                          }
                          placeholder="Ej: Hijo, Esposo, etc."
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 col-span-2">
                      <input
                        type="checkbox"
                        id={`cedula_propia_${index}`}
                        checked={ben.cedula_es_propia}
                        onChange={(e) =>
                          handleBeneficiarioChange(index, "cedula_es_propia", e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor={`cedula_propia_${index}`} className="text-sm cursor-pointer">
                        La cédula es propia del beneficiario
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Soportes Legales */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-sky-950 font-semibold text-lg">
                  Soportes Legales
                </Label>
                <button
                  type="button"
                  onClick={handleAddSoporte}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <span className="icon-[mdi--plus] text-xl"></span>
                  Agregar Soporte
                </button>
              </div>

              {/* Soportes existentes (solo lectura) */}
              {soportesExistentes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-sky-950/70">
                    Soportes Existentes
                  </Label>
                  {soportesExistentes.map((soporte: any, index: number) => (
                    <div
                      key={index}
                      className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="icon-[mdi--file-document] text-xl text-blue-600"></span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-sky-950 truncate">
                            {soporte.descripcion}
                          </p>
                          {soporte.observacion && (
                            <p className="text-xs text-sky-950/60 truncate">
                              {soporte.observacion}
                            </p>
                          )}
                        </div>
                      </div>
                      <a
                        href={soporte.documento_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 ml-2"
                      >
                        <span className="icon-[mdi--open-in-new] text-xl"></span>
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Nuevos soportes */}
              {soportes.map((soporte, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sky-950">
                      Nuevo Soporte Legal {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveSoporte(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <span className="icon-[mdi--delete] text-xl"></span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Descripción <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={soporte.descripcion}
                        onChange={(e) =>
                          handleSoporteChange(index, "descripcion", e.target.value)
                        }
                        placeholder="Ej: Contrato, Sentencia, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">
                        Documento <span className="text-red-500">*</span>
                      </Label>
                      {!soporte.documento_url ? (
                        <CloudinaryUploadButton
                          onUploadSuccess={(url) =>
                            handleSoporteChange(index, "documento_url", url)
                          }
                          label="Subir Documento"
                        />
                      ) : (
                        <div className="bg-green-50 p-3 rounded-lg flex items-center justify-between border border-green-200">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="icon-[mdi--file-check] text-xl text-green-600"></span>
                            <span className="text-sm text-green-800 font-medium truncate">
                              Documento subido correctamente
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSoporteChange(index, "documento_url", "")}
                            className="text-xs text-red-600 hover:underline ml-2"
                          >
                            Cambiar
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Observación</Label>
                      <Textarea
                        value={soporte.observacion}
                        onChange={(e) =>
                          handleSoporteChange(index, "observacion", e.target.value)
                        }
                        placeholder="Observaciones adicionales (opcional)"
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
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

            {/* Error general */}
            {submitError && (
              <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
                <p className="text-red-800 font-semibold">{submitError}</p>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
