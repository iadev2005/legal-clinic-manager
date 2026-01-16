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
import { Label } from "@/components/shadcn/label";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import FilterSelect from "./filter-select";
import SolicitanteSearchSelect from "./solicitante-search-select";
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
  desactivarAsignacion,
  addBeneficiario,
  removeBeneficiario,
  type BeneficiarioData,
  type UpdateCasoData,
  vincularCasoSemestre,
  getCasoSemestre,
  getSemestresCaso,
} from "@/actions/casos";
import { getSolicitantes } from "@/actions/solicitantes";
import { getSemestres } from "@/actions/administracion";
import { crearSoporteLegalDirecto } from "@/actions/soportes";
import LoadingScreen from "./loading-screen";

interface CaseEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CaseEditData) => Promise<void>;
  caseData: {
    id: string;
    caseNumber: string;
    applicantName: string;
    status: "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA" | "PAUSADO";
    assignedStudent: string;
  } | null;
  estatusList?: Array<{ id_estatus: number; nombre_estatus: string }>;
  userCedula?: string;
  userRole?: "ADMIN" | "PROFESSOR" | "STUDENT";
  debugRole?: string;
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
  status: "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA" | "PAUSADO";
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
const mapEstatusToFrontend = (estatus: string): "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA" | "PAUSADO" => {
  const upper = estatus.toUpperCase();
  if (upper.includes("PROCESO")) return "EN_PROCESO";
  if (upper.includes("ARCHIVADO")) return "ARCHIVADO";
  if (upper.includes("ENTREGADO")) return "ENTREGADO";
  if (upper.includes("ASESORIA") || upper.includes("ASESORÍA")) return "ASESORIA";
  if (upper.includes("PAUSADO")) return "PAUSADO";
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
  userRole,
  debugRole,
}: CaseEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Catálogos
  const [solicitantes, setSolicitantes] = useState<Array<{ value: string; label: string }>>([]);
  const [tramites, setTramites] = useState<Array<{ value: string; label: string }>>([]);
  const [nucleos, setNucleos] = useState<Array<{ value: string; label: string }>>([]);
  const [alumnos, setAlumnos] = useState<Array<{ value: string; label: string; term: string }>>([]);
  const [profesores, setProfesores] = useState<Array<{ value: string; label: string; term: string }>>([]);
  const [semestres, setSemestres] = useState<Array<{ value: string; label: string }>>([]);
  const [rawSemestres, setRawSemestres] = useState<any[]>([]);
  const [caseHistory, setCaseHistory] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>(""); // Semestre seleccionado para gestión

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
  const [status, setStatus] = useState<"EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA" | "PAUSADO">("EN_PROCESO");
  const [cedulaAlumno, setCedulaAlumno] = useState("");
  const [termAlumno, setTermAlumno] = useState("");
  const [cedulaProfesor, setCedulaProfesor] = useState("");
  const [termProfesor, setTermProfesor] = useState("");


  // Alumnos pendientes de agregar (sin guardar)
  const [pendingStudents, setPendingStudents] = useState<Array<{
    cedula_alumno: string;
    term: string;
    nombre_completo: string;
  }>>([]);

  // Combinar semestres y historial para generar opciones visuales
  useEffect(() => {
    if (rawSemestres.length > 0) {
      const options = rawSemestres.map((sem) => {
        const historyItem = caseHistory.find((ch) => ch.term === sem.term);
        let label = sem.term;

        // Lógica de visualización
        if (historyItem) {
          // Verificar si es el más reciente del historial (asumiendo orden DESC en caseHistory)
          const isMostRecent = caseHistory[0]?.term === sem.term;
          if (isMostRecent) {
            label = `⭐ ${sem.term} (Actual)`;
          } else {
            label = `🕒 ${sem.term} (Histórico)`;
          }
        } else {
          label = `🆕 ${sem.term} (Nuevo)`;
        }

        return {
          value: sem.term,
          label: label,
        };
      });
      setSemestres(options);

      // Pre-seleccionar: Si hay historial, el más reciente. Si no, el primer semestre global.
      if (!selectedTerm) {
        if (caseHistory.length > 0) {
          setSelectedTerm(caseHistory[0].term);
        } else if (rawSemestres.length > 0) {
          setSelectedTerm(rawSemestres[0].term);
        }
      }
    }
  }, [rawSemestres, caseHistory]);


  // Cuando cambia el semestre seleccionado, recargar listas y estatus específico
  useEffect(() => {
    if (selectedTerm && caseData) {
      setLoadingData(true);
      const fetchData = async () => {
        const nroCaso = parseInt(caseData.id);

        // Recargar asignaciones y filtrar por el semestre seleccionado
        const asignacionesRes = await getAsignacionesActivas(nroCaso);

        if (asignacionesRes.success && asignacionesRes.data) {
          // Filtrar alumnos por el semestre seleccionado
          const alumnosFiltrados = asignacionesRes.data.alumnos?.filter(
            (a: any) => a.term === selectedTerm
          ) || [];

          setCurrentStudents(alumnosFiltrados.map((a: any) => ({
            id_asignacion: a.id_asignacion,
            cedula_alumno: a.cedula_alumno,
            term: a.term,
            nombre_completo: a.alumno_nombre
          })));

          // Filtrar profesor por el semestre seleccionado
          const profesorFiltrado = asignacionesRes.data.profesores?.find(
            (p: any) => p.term === selectedTerm
          );

          if (profesorFiltrado) {
            setCedulaProfesor(profesorFiltrado.cedula_profesor || "");
            setTermProfesor(profesorFiltrado.term || "");
          } else {
            // Limpiar si no hay profesor para este semestre
            setCedulaProfesor("");
            setTermProfesor("");
          }
        }

        await loadAlumnosAndProfesores(selectedTerm);

        // Cargar estatus específico de este semestre
        const statusRes = await getCasoSemestre(nroCaso, selectedTerm);
        if (statusRes.success && statusRes.data) {
          if (statusRes.data.nombre_estatus) {
            setStatus(mapEstatusToFrontend(statusRes.data.nombre_estatus));
          }
        }

        setLoadingData(false);
      };
      fetchData();
    }
  }, [selectedTerm, caseData]);

  // Estado para manejar múltiples estudiantes
  const [currentStudents, setCurrentStudents] = useState<Array<{
    id_asignacion: number;
    cedula_alumno: string;
    term: string;
    nombre_completo: string;
  }>>([]);

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
        setRawSemestres(semestresRes.data);
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
      // Cargar datos en paralelo para optimizar tiempo de respuesta
      const [
        casoRes,
        beneficiariosRes,
        soportesRes,
        asignacionesRes,
        semestresCasoRes,
      ] = await Promise.all([
        getCasoById(nroCaso),
        getBeneficiariosCaso(nroCaso),
        getSoportesCaso(nroCaso),
        getAsignacionesActivas(nroCaso),
        getSemestresCaso(nroCaso),
      ]);

      if (casoRes.success && casoRes.data) {
        const caso = casoRes.data;
        const fechaInicioValue = caso.fecha_caso_inicio ? new Date(caso.fecha_caso_inicio).toISOString().split('T')[0] : "";
        const fechaFinalValue = caso.fecha_caso_final ? new Date(caso.fecha_caso_final).toISOString().split('T')[0] : null;

        setCedulaSolicitante(caso.cedula_solicitante || "");
        setIdTramite(caso.id_tramite?.toString() || "");
        setIdNucleo(caso.id_nucleo?.toString() || "");
        setSintesis(caso.sintesis_caso || "");
        setFechaInicio(fechaInicioValue);
        setFechaFinal(fechaFinalValue);
        setStatus(mapEstatusToFrontend(casoRes.data.estatus_actual || "EN_PROCESO"));

        // Jerarquía legal - Usar validación != null para permitir IDs que sean 0
        if (caso.id_materia != null && caso.num_categoria != null && caso.num_subcategoria != null && caso.num_ambito_legal != null) {
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
            setCurrentStudents(asignacionesRes.data.alumnos.map((a: any) => ({
              id_asignacion: a.id_asignacion,
              cedula_alumno: a.cedula_alumno,
              term: a.term,
              nombre_completo: a.alumno_nombre
            })));

            // Usar el term del primer alumno para filtrar listas (opcional, o dejar nulo para ver todos)
            // termToLoad = asignacionesRes.data.alumnos[0].term || undefined;
            // Mejor no filtrar por term estricto para permitir asignar de cualquier term actual
          } else {
            setCurrentStudents([]);
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
        const beneficiariosData = beneficiariosRes.data.map((b: any) => ({
          cedula_beneficiario: b.cedula_beneficiario || "",
          cedula_es_propia: b.cedula_es_propia || false,
          nombres: b.nombres || "",
          apellidos: b.apellidos || "",
          sexo: (b.sexo as "M" | "F") || "",
          fecha_nacimiento: b.fecha_nacimiento ? new Date(b.fecha_nacimiento).toISOString().split('T')[0] : "",
          tipo_beneficiario: (b.tipo_beneficiario as "Directo" | "Indirecto") || "",
          parentesco: b.parentesco || "",
        }));
        setBeneficiarios(beneficiariosData);
      }

      if (soportesRes.success && soportesRes.data) {
        setSoportesExistentes(soportesRes.data);
      }

      if (semestresCasoRes.success && semestresCasoRes.data) {
        setCaseHistory(semestresCasoRes.data);
      }

      setPendingStudents([]);
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
  };

  const handleRemoveBeneficiario = (index: number) => {
    setBeneficiarios(beneficiarios.filter((_, i) => i !== index));
  };

  const handleSoporteChange = (
    index: number,
    field: keyof SoporteForm,
    value: string
  ) => {
    const updated = [...soportes];
    updated[index] = { ...updated[index], [field]: value };
    setSoportes(updated);
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
  };

  const handleRemoveSoporte = (index: number) => {
    setSoportes(soportes.filter((_, i) => i !== index));
  };

  // Agregar alumno pendiente (sin guardar aún)
  const handleAddPendingStudent = () => {
    if (!cedulaAlumno || !termAlumno) return;

    const alumno = alumnos.find((a) => a.value === cedulaAlumno);
    if (!alumno) return;

    // Verificar si ya está en la lista
    const alreadyExists = currentStudents.some(s => s.cedula_alumno === cedulaAlumno && s.term === termAlumno) ||
      pendingStudents.some(s => s.cedula_alumno === cedulaAlumno && s.term === termAlumno);

    if (alreadyExists) {
      setSubmitError("Este alumno ya está asignado o está pendiente de agregar");
      return;
    }

    setPendingStudents([
      ...pendingStudents,
      {
        cedula_alumno: cedulaAlumno,
        term: termAlumno,
        nombre_completo: alumno.label,
      },
    ]);

    // Limpiar selección
    setCedulaAlumno("");
    setTermAlumno("");
    setSubmitError(null);
  };

  // Remover alumno pendiente
  const handleRemovePendingStudent = (index: number) => {
    setPendingStudents(pendingStudents.filter((_, i) => i !== index));
  };

  const handleRemoveStudent = async (idAsignacion: number) => {
    // Optimistic update
    const previousStudents = [...currentStudents];
    setCurrentStudents(currentStudents.filter(s => s.id_asignacion !== idAsignacion));

    try {
      const res = await desactivarAsignacion(idAsignacion, 'alumno');
      if (!res.success) {
        throw new Error(res.error);
      }
    } catch (error) {
      console.error("Error removing student:", error);
      // Revert if error
      setCurrentStudents(previousStudents);
      setSubmitError("Error al eliminar la asignación del estudiante");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

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
          "PAUSADO": "PAUSADO",
        };
        return nombre.includes(statusMap[status] || "");
      });

      if (estatusObj && userCedula) {
        await cambiarEstatus(nroCaso, estatusObj.id_estatus, "Cambio de estatus desde la edición", userCedula);

        // NUEVO: Guardar también en Casos_Semestres si tenemos un semestre seleccionado
        if (selectedTerm) {
          await vincularCasoSemestre(nroCaso, selectedTerm, estatusObj.id_estatus);
        }
      }

      // 3. Asignar alumnos pendientes
      for (const student of pendingStudents) {
        const termToAssign = selectedTerm || student.term;
        const res = await asignarAlumno(nroCaso, student.cedula_alumno, termToAssign);
        if (!res.success) throw new Error(res.error);
        if (res.message) console.warn(res.message);
      }

      // 3b. Asignar alumno/profesor si cambió (legacy, para compatibilidad)
      const termToAssign = selectedTerm || termAlumno;
      if (cedulaAlumno && termToAssign && !pendingStudents.some(s => s.cedula_alumno === cedulaAlumno)) {
        const res = await asignarAlumno(nroCaso, cedulaAlumno, termToAssign);
        if (!res.success) throw new Error(res.error);
        if (res.message) console.warn(res.message);
      }
      if (cedulaProfesor && selectedTerm) {
        const res = await asignarProfesor(nroCaso, cedulaProfesor, selectedTerm);
        if (!res.success) throw new Error(res.error);
        if (res.message) console.warn(res.message);
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

      // Limpiar estado
      setPendingStudents([]);
      onClose();
    } catch (error: any) {
      console.error("Error saving case:", error);
      setSubmitError(error.message || "Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  if (!caseData) return null;

  // Prevenir cierre durante la carga
  const handleClose = () => {
    if (loadingData) return; // No permitir cerrar durante la carga
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
          <LoadingScreen
            message="Cargando información del caso..."
            subMessage="Por favor espera mientras se cargan todos los datos"
          />
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
              <SolicitanteSearchSelect
                placeholder="Buscar por cédula o nombre..."
                value={cedulaSolicitante}
                onChange={(value) => {
                  setCedulaSolicitante(value);
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
                  }}
                />
              </div>
            </div>

            {/* SELECTOR DE SEMESTRE DE GESTIÓN */}
            <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200 space-y-2">
              <Label className="text-yellow-900 font-bold text-lg flex items-center gap-2">
                <span className="icon-[mdi--calendar-clock] text-xl"></span>
                Semestre de Gestión
              </Label>
              <p className="text-sm text-yellow-800/80 mb-2">
                Selecciona el semestre para gestionar el estatus y las asignaciones de este periodo.
              </p>
              <FilterSelect
                placeholder="Seleccionar semestre de trabajo"
                value={selectedTerm}
                onChange={(value) => {
                  setSelectedTerm(value);
                  // Limpiar selecciones de alumno/profe al cambiar de semestre context
                  setCedulaAlumno("");
                  setCedulaProfesor("");
                }}
                options={semestres}
              />
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
                      { value: "PAUSADO", label: "Pausado" },
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
                  <Label className="text-sm font-semibold">Alumnos Asignados Actuales</Label>
                  {currentStudents.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {currentStudents.map((student) => (
                        <div key={student.id_asignacion} className="flex justify-between items-center bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-sky-900">{student.nombre_completo}</span>
                            <span className="text-xs text-sky-700/70">C.I: {student.cedula_alumno} | Term: {student.term}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(student.id_asignacion)}
                            className="p-1 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                            title="Eliminar asignación"
                          >
                            <span className="icon-[mdi--close] text-lg"></span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic mb-3">No hay alumnos asignados actualmente.</div>
                  )}

                  <Label className="text-sm font-semibold text-green-700">Asignar Nuevo Alumno</Label>
                  <div className="flex gap-2">
                    <FilterSelect
                      placeholder="Seleccionar alumno para agregar"
                      value={cedulaAlumno}
                      onChange={(value) => {
                        const alumno = alumnos.find((a) => a.value === value);
                        if (alumno) {
                          setCedulaAlumno(value);
                          setTermAlumno(alumno.term);
                        }
                      }}
                      options={alumnos.map((a) => ({
                        value: a.value,
                        label: a.label,
                      }))}
                    />
                    <button
                      type="button"
                      onClick={handleAddPendingStudent}
                      disabled={!cedulaAlumno || !termAlumno}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <span className="icon-[mdi--plus] text-xl"></span>
                      Agregar
                    </button>
                  </div>

                  {/* Alumnos pendientes de agregar */}
                  {pendingStudents.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <Label className="text-sm font-semibold text-orange-700">Alumnos Pendientes de Agregar</Label>
                      {pendingStudents.map((student, index) => (
                        <div key={index} className="flex justify-between items-center bg-orange-50/50 p-2 rounded-lg border border-orange-100">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-orange-900">{student.nombre_completo}</span>
                            <span className="text-xs text-orange-700/70">C.I: {student.cedula_alumno} | Term: {student.term}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePendingStudent(index)}
                            className="p-1 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                            title="Eliminar de la lista"
                          >
                            <span className="icon-[mdi--close] text-lg"></span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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

                    <div className="space-y-2 col-span-2">
                      <Label className="text-sm font-semibold">Parentesco</Label>
                      <FilterSelect
                        placeholder="Seleccionar parentesco"
                        value={ben.parentesco}
                        onChange={(value) =>
                          handleBeneficiarioChange(index, "parentesco", value)
                        }
                        options={[
                          { value: "S", label: "Sí (S)" },
                          { value: "N", label: "No (N)" },
                        ]}
                      />
                    </div>

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
                      Nuevo Soporte Legal {soportesExistentes.length + index + 1}
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

            {/* Error general */}
            {submitError && (
              <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
                <p className="text-red-800 font-semibold">{submitError}</p>
              </div>
            )}

            <DialogFooter className="flex justify-between items-center gap-2 pt-4 w-full">
              <div className="flex-1">
                {(userCedula && (userRole === "ADMIN" || debugRole === "Administrador")) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105"
                      >
                        <span className="icon-[mdi--trash-can-outline] text-lg"></span>
                        ELIMINAR CASO
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
                          <span className="font-semibold text-red-800">Esta acción es irreversible.</span> Se eliminarán permanentemente el caso y todos sus datos asociados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            import("@/actions/casos").then(({ deleteCaso }) => {
                              // @ts-ignore
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
              </div>
              <div className="flex gap-2">
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
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </PrimaryButton>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
