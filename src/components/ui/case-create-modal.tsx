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
import {
  createCaso,
  getTramites,
  getNucleos,
  getAlumnosDisponibles,
  getProfesoresDisponibles,
  type CreateCasoData,
  type BeneficiarioData,
  type SoporteLegalData,
} from "@/actions/casos";
import { getSolicitantes } from "@/actions/solicitantes";
import { getSemestres } from "@/actions/administracion";
import CloudinaryUploadButton from "./cloudinary-upload-button";

interface CaseCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

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

export default function CaseCreateModal({
  open,
  onClose,
  onSuccess,
}: CaseCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Catálogos
  const [solicitantes, setSolicitantes] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [tramites, setTramites] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [nucleos, setNucleos] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [alumnos, setAlumnos] = useState<
    Array<{ value: string; label: string; term: string }>
  >([]);
  const [profesores, setProfesores] = useState<
    Array<{ value: string; label: string; term: string }>
  >([]);
  const [semestres, setSemestres] = useState<
    Array<{ value: string; label: string }>
  >([]);

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
  const [fechaInicio, setFechaInicio] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Asignación opcional
  const [asignarAlumno, setAsignarAlumno] = useState(false);
  const [cedulaAlumno, setCedulaAlumno] = useState("");
  const [asignarProfesor, setAsignarProfesor] = useState(false);
  const [cedulaProfesor, setCedulaProfesor] = useState("");
  const [term, setTerm] = useState("");

  // Beneficiarios
  const [beneficiarios, setBeneficiarios] = useState<BeneficiarioForm[]>([
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

  // Soportes Legales
  interface SoporteForm {
    descripcion: string;
    documento_url: string;
    observacion: string;
  }
  const [soportes, setSoportes] = useState<SoporteForm[]>([]);

  // Cargar catálogos al abrir el modal
  useEffect(() => {
    if (open) {
      loadCatalogs();
      resetForm();
    }
  }, [open]);

  // Recargar alumnos y profesores cuando cambia el term
  useEffect(() => {
    if (open && term) {
      loadAlumnosAndProfesores(term);
    }
  }, [term, open]);

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
        // Establecer el semestre más reciente por defecto
        if (semestresRes.data.length > 0) {
          const latest = semestresRes.data.sort(
            (a: any, b: any) => b.term.localeCompare(a.term)
          )[0];
          setTerm(latest.term);
        }
      }
    } catch (error) {
      console.error("Error loading catalogs:", error);
    }
  };

  const loadAlumnosAndProfesores = async (termFilter: string) => {
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

  const resetForm = () => {
    setCedulaSolicitante("");
    setLegalHierarchy(null);
    setIdTramite("");
    setIdNucleo("");
    setSintesis("");
    setFechaInicio(new Date().toISOString().split("T")[0]);
    setAsignarAlumno(false);
    setCedulaAlumno("");
    setAsignarProfesor(false);
    setCedulaProfesor("");
    setBeneficiarios([
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
    setSoportes([]);
    setErrors({});
    setSubmitError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cedulaSolicitante) {
      newErrors.cedulaSolicitante = "Debe seleccionar un solicitante";
    }

    if (!legalHierarchy) {
      newErrors.legalHierarchy = "Debe completar la jerarquía legal";
    }

    if (!idTramite) {
      newErrors.idTramite = "Debe seleccionar un trámite";
    }

    if (!idNucleo) {
      newErrors.idNucleo = "Debe seleccionar un núcleo";
    }

    // Validar beneficiarios
    beneficiarios.forEach((ben, index) => {
      if (!ben.cedula_beneficiario.trim()) {
        newErrors[`beneficiario_${index}_cedula`] =
          "La cédula del beneficiario es requerida";
      }
      if (!ben.tipo_beneficiario) {
        newErrors[`beneficiario_${index}_tipo`] =
          "Debe seleccionar el tipo de beneficiario";
      }
      if (ben.tipo_beneficiario === "Indirecto" && !ben.parentesco.trim()) {
        newErrors[`beneficiario_${index}_parentesco`] =
          "El parentesco es requerido para beneficiarios indirectos";
      }
    });

    // Validar asignación si está activa
    if (asignarAlumno && !cedulaAlumno) {
      newErrors.cedulaAlumno = "Debe seleccionar un alumno";
    }
    if (asignarProfesor && !cedulaProfesor) {
      newErrors.cedulaProfesor = "Debe seleccionar un profesor";
    }
    if ((asignarAlumno || asignarProfesor) && !term) {
      newErrors.term = "Debe seleccionar un semestre";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (beneficiarios.length > 1) {
      setBeneficiarios(beneficiarios.filter((_, i) => i !== index));
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

  const handleSoporteChange = (
    index: number,
    field: keyof SoporteForm,
    value: string
  ) => {
    const updated = [...soportes];
    updated[index] = { ...updated[index], [field]: value };
    setSoportes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar datos de beneficiarios
      const beneficiariosData: BeneficiarioData[] = beneficiarios.map((ben) => ({
        cedula_beneficiario: ben.cedula_beneficiario,
        cedula_es_propia: ben.cedula_es_propia,
        nombres: ben.nombres || undefined,
        apellidos: ben.apellidos || undefined,
        sexo: ben.sexo || undefined,
        fecha_nacimiento: ben.fecha_nacimiento || undefined,
        tipo_beneficiario: ben.tipo_beneficiario as "Directo" | "Indirecto",
        parentesco: ben.parentesco || undefined,
      }));

      // Obtener el term del alumno/profesor seleccionado para asegurar que coincida
      let termToUse = term;
      if (asignarAlumno && cedulaAlumno) {
        const alumnoSeleccionado = alumnos.find((a) => a.value === cedulaAlumno);
        if (alumnoSeleccionado) {
          termToUse = alumnoSeleccionado.term;
        }
      } else if (asignarProfesor && cedulaProfesor) {
        const profesorSeleccionado = profesores.find((p) => p.value === cedulaProfesor);
        if (profesorSeleccionado) {
          termToUse = profesorSeleccionado.term;
        }
      }

      // Preparar datos de soportes legales
      const soportesData: SoporteLegalData[] = soportes
        .filter((s) => s.descripcion.trim() && s.documento_url.trim())
        .map((s) => ({
          descripcion: s.descripcion,
          documento_url: s.documento_url,
          observacion: s.observacion || undefined,
        }));

      // Preparar datos del caso
      const casoData: CreateCasoData = {
        cedula_solicitante: cedulaSolicitante,
        id_nucleo: parseInt(idNucleo),
        id_tramite: parseInt(idTramite),
        id_materia: legalHierarchy!.id_materia,
        num_categoria: legalHierarchy!.num_categoria,
        num_subcategoria: legalHierarchy!.num_subcategoria,
        num_ambito_legal: legalHierarchy!.num_ambito_legal,
        sintesis_caso: sintesis || undefined,
        fecha_caso_inicio: fechaInicio,
        beneficiarios: beneficiariosData,
        asignacion:
          asignarAlumno || asignarProfesor
            ? {
              cedula_alumno: asignarAlumno ? cedulaAlumno : undefined,
              cedula_profesor: asignarProfesor ? cedulaProfesor : undefined,
              term: termToUse,
            }
            : undefined,
        soportes: soportesData.length > 0 ? soportesData : undefined,
      };

      const result = await createCaso(casoData);

      if (result.success) {
        resetForm();
        onSuccess?.();
        onClose();
      } else {
        setSubmitError(result.error || "Error al crear el caso");
      }
    } catch (error: any) {
      console.error("Error creating case:", error);
      setSubmitError(error.message || "Error al crear el caso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sky-950 text-3xl font-semibold flex items-center gap-3">
            <span className="icon-[mdi--plus-circle] text-4xl text-green-600"></span>
            Crear Nuevo Caso
          </DialogTitle>
          <DialogDescription className="text-[#325B84] text-lg">
            Complete todos los campos para registrar un nuevo caso legal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Solicitante */}
          <div className="space-y-2">
            <Label htmlFor="solicitante" className="text-sky-950 font-semibold text-lg">
              Solicitante <span className="text-red-500">*</span>
            </Label>
            <FilterSelect
              placeholder="Buscar y seleccionar solicitante"
              value={cedulaSolicitante}
              onChange={setCedulaSolicitante}
              options={solicitantes}
            />
            {errors.cedulaSolicitante && (
              <p className="text-red-500 text-sm">{errors.cedulaSolicitante}</p>
            )}
          </div>

          {/* Jerarquía Legal */}
          <div className="space-y-2">
            <Label className="text-sky-950 font-semibold text-lg">
              Jerarquía Legal <span className="text-red-500">*</span>
            </Label>
            <LegalHierarchySelect
              value={legalHierarchy || undefined}
              onChange={(value) => setLegalHierarchy(value || null)}
              required
              error={errors.legalHierarchy}
            />
          </div>

          {/* Trámite y Núcleo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tramite" className="text-sky-950 font-semibold text-lg">
                Trámite <span className="text-red-500">*</span>
              </Label>
              <FilterSelect
                placeholder="Seleccionar trámite"
                value={idTramite}
                onChange={setIdTramite}
                options={tramites}
              />
              {errors.idTramite && (
                <p className="text-red-500 text-sm">{errors.idTramite}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nucleo" className="text-sky-950 font-semibold text-lg">
                Núcleo <span className="text-red-500">*</span>
              </Label>
              <FilterSelect
                placeholder="Seleccionar núcleo"
                value={idNucleo}
                onChange={setIdNucleo}
                options={nucleos}
              />
              {errors.idNucleo && (
                <p className="text-red-500 text-sm">{errors.idNucleo}</p>
              )}
            </div>
          </div>

          {/* Síntesis y Fecha */}
          <div className="space-y-2">
            <Label htmlFor="sintesis" className="text-sky-950 font-semibold text-lg">
              Síntesis del Caso
            </Label>
            <Textarea
              id="sintesis"
              value={sintesis}
              onChange={(e) => setSintesis(e.target.value)}
              placeholder="Descripción breve del caso..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaInicio" className="text-sky-950 font-semibold text-lg">
              Fecha de Inicio
            </Label>
            <Input
              type="date"
              id="fechaInicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          {/* Beneficiarios */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <Label className="text-sky-950 font-semibold text-lg">
                Beneficiarios <span className="text-red-500">*</span>
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
                  {beneficiarios.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBeneficiario(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <span className="icon-[mdi--delete] text-xl"></span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Cédula <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={ben.cedula_beneficiario}
                      onChange={(e) =>
                        handleBeneficiarioChange(
                          index,
                          "cedula_beneficiario",
                          e.target.value
                        )
                      }
                      placeholder="V-12345678"
                    />
                    {errors[`beneficiario_${index}_cedula`] && (
                      <p className="text-red-500 text-xs">
                        {errors[`beneficiario_${index}_cedula`]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Tipo</Label>
                    <FilterSelect
                      placeholder="Seleccionar tipo"
                      value={ben.tipo_beneficiario}
                      onChange={(value) =>
                        handleBeneficiarioChange(
                          index,
                          "tipo_beneficiario",
                          value
                        )
                      }
                      options={[
                        { value: "Directo", label: "Directo" },
                        { value: "Indirecto", label: "Indirecto" },
                      ]}
                    />
                    {errors[`beneficiario_${index}_tipo`] && (
                      <p className="text-red-500 text-xs">
                        {errors[`beneficiario_${index}_tipo`]}
                      </p>
                    )}
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
                        handleBeneficiarioChange(
                          index,
                          "apellidos",
                          e.target.value
                        )
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
                    <Label className="text-sm font-semibold">
                      Fecha de Nacimiento
                    </Label>
                    <Input
                      type="date"
                      value={ben.fecha_nacimiento}
                      onChange={(e) =>
                        handleBeneficiarioChange(
                          index,
                          "fecha_nacimiento",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {ben.tipo_beneficiario === "Indirecto" && (
                    <div className="space-y-2 col-span-2">
                      <Label className="text-sm font-semibold">
                        Parentesco <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={ben.parentesco}
                        onChange={(e) =>
                          handleBeneficiarioChange(
                            index,
                            "parentesco",
                            e.target.value
                          )
                        }
                        placeholder="Ej: Hijo, Esposo, etc."
                      />
                      {errors[`beneficiario_${index}_parentesco`] && (
                        <p className="text-red-500 text-xs">
                          {errors[`beneficiario_${index}_parentesco`]}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 col-span-2">
                    <input
                      type="checkbox"
                      id={`cedula_propia_${index}`}
                      checked={ben.cedula_es_propia}
                      onChange={(e) =>
                        handleBeneficiarioChange(
                          index,
                          "cedula_es_propia",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`cedula_propia_${index}`}
                      className="text-sm cursor-pointer"
                    >
                      La cédula es propia del beneficiario
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Asignación Opcional */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-sky-950 font-semibold text-lg">
              Asignación (Opcional)
            </Label>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="asignarAlumno"
                  checked={asignarAlumno}
                  onChange={(e) => setAsignarAlumno(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="asignarAlumno" className="cursor-pointer">
                  Asignar Alumno
                </Label>
              </div>

              {asignarAlumno && (
                <div className="ml-6 space-y-2">
                  <FilterSelect
                    placeholder="Seleccionar alumno"
                    value={cedulaAlumno}
                    onChange={setCedulaAlumno}
                    options={alumnos.map((a) => ({
                      value: a.value,
                      label: a.label,
                    }))}
                  />
                  {errors.cedulaAlumno && (
                    <p className="text-red-500 text-sm">{errors.cedulaAlumno}</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="asignarProfesor"
                  checked={asignarProfesor}
                  onChange={(e) => setAsignarProfesor(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="asignarProfesor" className="cursor-pointer">
                  Asignar Profesor Supervisor
                </Label>
              </div>

              {asignarProfesor && (
                <div className="ml-6 space-y-2">
                  <FilterSelect
                    placeholder="Seleccionar profesor"
                    value={cedulaProfesor}
                    onChange={setCedulaProfesor}
                    options={profesores.map((p) => ({
                      value: p.value,
                      label: p.label,
                    }))}
                  />
                  {errors.cedulaProfesor && (
                    <p className="text-red-500 text-sm">
                      {errors.cedulaProfesor}
                    </p>
                  )}
                </div>
              )}

              {(asignarAlumno || asignarProfesor) && (
                <div className="ml-6 space-y-2">
                  <Label className="text-sm font-semibold">
                    Semestre <span className="text-red-500">*</span>
                  </Label>
                  <FilterSelect
                    placeholder="Seleccionar semestre"
                    value={term}
                    onChange={(newTerm) => {
                      setTerm(newTerm);
                      // Limpiar selección de alumno/profesor cuando cambia el term
                      // porque los alumnos/profesores son específicos por term
                      if (asignarAlumno) {
                        setCedulaAlumno("");
                      }
                      if (asignarProfesor) {
                        setCedulaProfesor("");
                      }
                    }}
                    options={semestres}
                  />
                  <p className="text-xs text-sky-950/60">
                    Los alumnos y profesores se filtrarán por el semestre seleccionado
                  </p>
                  {errors.term && (
                    <p className="text-red-500 text-sm">{errors.term}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Soportes Legales */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <Label className="text-sky-950 font-semibold text-lg">
                Soportes Legales (Opcional)
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

            {soportes.map((soporte, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sky-950">
                    Soporte Legal {index + 1}
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
                          onClick={() =>
                            handleSoporteChange(index, "documento_url", "")
                          }
                          className="text-xs text-red-600 hover:underline ml-2"
                        >
                          Cambiar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Observación
                    </Label>
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

            {soportes.length === 0 && (
              <p className="text-sm text-sky-950/60 italic text-center py-4">
                No hay soportes legales agregados. Puede agregarlos después de crear el caso.
              </p>
            )}
          </div>

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
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Caso"}
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

