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
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import PrimaryButton from "./primary-button";
import LocationCascadeSelect from "./location-cascade-select";
import FilterSelect from "./filter-select";
import LoadingScreen from "./loading-screen";
import {
  getNivelesEducativos,
  getTrabajos,
  getActividadesSolicitantes,
  getBienes,
  type Vivienda,
  type FamiliaHogar,
} from "@/actions/solicitantes";

interface ApplicantModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ApplicantFormData) => Promise<void>;
  applicant?: {
    cedula_solicitante?: string;
    nombres: string;
    apellidos: string;
    telefono_local?: string | null;
    telefono_celular?: string | null;
    correo_electronico?: string | null;
    sexo?: "M" | "F" | null;
    nacionalidad?: "V" | "E" | null;
    estado_civil?: "Soltero" | "Casado" | "Divorciado" | "Viudo" | null;
    en_concubinato?: boolean;
    fecha_nacimiento: string;
    buscando_trabajo?: boolean;
    tipo_periodo_educacion?: string | null;
    cantidad_tiempo_educacion?: number | null;
    id_parroquia: number;
    id_actividad_solicitante?: number | null;
    id_trabajo?: number | null;
    id_nivel_educativo?: number | null;
    vivienda?: Partial<Vivienda>;
    familia?: Partial<FamiliaHogar>;
    bienes?: any[];
  } | null;
  mode: "create" | "edit";
}

export interface ApplicantFormData {
  cedula_solicitante: string;
  nombres: string;
  apellidos: string;
  telefono_local?: string;
  telefono_celular?: string;
  correo_electronico?: string;
  sexo?: "M" | "F";
  nacionalidad?: "V" | "E";
  estado_civil?: "Soltero" | "Casado" | "Divorciado" | "Viudo";
  en_concubinato?: boolean;
  fecha_nacimiento: string;
  buscando_trabajo?: boolean;
  tipo_periodo_educacion?: string;
  cantidad_tiempo_educacion?: number;
  id_parroquia: number;
  id_actividad_solicitante?: number;
  id_trabajo?: number;
  id_nivel_educativo?: number;
  // Nuevos campos
  vivienda?: Partial<Vivienda>;
  familia?: Partial<FamiliaHogar>;
  bienes?: number[];
}

interface Catalog {
  id: number;
  label: string;
}

export default function ApplicantModal({
  open,
  onClose,
  onSave,
  applicant,
  mode,
}: ApplicantModalProps) {
  const [formData, setFormData] = useState<ApplicantFormData>({
    cedula_solicitante: "",
    nombres: "",
    apellidos: "",
    telefono_local: "",
    telefono_celular: "",
    correo_electronico: "",
    sexo: undefined,
    nacionalidad: "V",
    estado_civil: undefined,
    en_concubinato: false,
    fecha_nacimiento: "",
    buscando_trabajo: false,
    tipo_periodo_educacion: undefined,
    cantidad_tiempo_educacion: undefined,
    id_parroquia: 0,
    id_actividad_solicitante: undefined,
    id_trabajo: undefined,
    id_nivel_educativo: undefined,
    vivienda: undefined,
    familia: undefined,
    bienes: [],
  });

  // Estados separados para cédula
  const [cedulaPrefix, setCedulaPrefix] = useState<"V" | "E">("V");
  const [cedulaNumber, setCedulaNumber] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ApplicantFormData, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Catálogos
  const [nivelesEducativos, setNivelesEducativos] = useState<Catalog[]>([]);
  const [trabajos, setTrabajos] = useState<Catalog[]>([]);
  const [actividades, setActividades] = useState<Catalog[]>([]);
  const [bienes, setBienes] = useState<Catalog[]>([]);

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (applicant && mode === "edit") {
      // Separar cédula en prefijo y número
      const cedula = applicant.cedula_solicitante || "";
      let prefix: "V" | "E" = "V";
      let number = "";
      
      if (cedula) {
        // Extraer prefijo (V o E) y número
        const match = cedula.match(/^([VEJ])-?(.+)$/i);
        if (match) {
          prefix = (match[1].toUpperCase() === "E" ? "E" : "V") as "V" | "E";
          number = match[2];
        } else {
          // Si no tiene prefijo, asumir según nacionalidad
          prefix = (applicant.nacionalidad === "E" ? "E" : "V") as "V" | "E";
          number = cedula.replace(/^[VEJ]-?/i, "");
        }
      } else {
        // Si no hay cédula, usar la nacionalidad del solicitante
        prefix = (applicant.nacionalidad === "E" ? "E" : "V") as "V" | "E";
      }

      setCedulaPrefix(prefix);
      setCedulaNumber(number);

      // Formatear fecha de nacimiento para el input date (YYYY-MM-DD)
      let fechaNacimiento = "";
      if (applicant.fecha_nacimiento) {
        const fecha = new Date(applicant.fecha_nacimiento);
        if (!isNaN(fecha.getTime())) {
          fechaNacimiento = fecha.toISOString().split('T')[0];
        }
      }

      setFormData({
        cedula_solicitante: applicant.cedula_solicitante || "",
        nombres: applicant.nombres || "",
        apellidos: applicant.apellidos || "",
        telefono_local: applicant.telefono_local || "",
        telefono_celular: applicant.telefono_celular || "",
        correo_electronico: applicant.correo_electronico || "",
        sexo: applicant.sexo || undefined,
        nacionalidad: applicant.nacionalidad || "V",
        estado_civil: applicant.estado_civil || undefined,
        en_concubinato: applicant.en_concubinato || false,
        fecha_nacimiento: fechaNacimiento,
        buscando_trabajo: applicant.buscando_trabajo || false,
        tipo_periodo_educacion: applicant.tipo_periodo_educacion || undefined,
        cantidad_tiempo_educacion:
          applicant.cantidad_tiempo_educacion || undefined,
        id_parroquia: applicant.id_parroquia || 0,
        id_actividad_solicitante:
          applicant.id_actividad_solicitante || undefined,
        id_trabajo: applicant.id_trabajo || undefined,
        id_nivel_educativo: applicant.id_nivel_educativo || undefined,
        vivienda: (applicant as any).vivienda || undefined,
        familia: (applicant as any).familia || undefined,
        bienes: (applicant as any).bienes?.map((b: any) => b.id_bien) || [],
      });
    } else {
      setCedulaPrefix("V");
      setCedulaNumber("");
      setFormData({
        cedula_solicitante: "",
        nombres: "",
        apellidos: "",
        telefono_local: "",
        telefono_celular: "",
        correo_electronico: "",
        sexo: undefined,
        nacionalidad: "V",
        estado_civil: undefined,
        en_concubinato: false,
        fecha_nacimiento: "",
        buscando_trabajo: false,
        tipo_periodo_educacion: undefined,
        cantidad_tiempo_educacion: undefined,
        id_parroquia: 0,
        id_actividad_solicitante: undefined,
        id_trabajo: undefined,
        id_nivel_educativo: undefined,
        vivienda: undefined,
        familia: undefined,
        bienes: [],
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [applicant, mode, open]);

  const loadCatalogs = async () => {
    setLoadingCatalogs(true);
    try {
      const [niveles, jobs, acts, bienesData] = await Promise.all([
        getNivelesEducativos(),
        getTrabajos(),
        getActividadesSolicitantes(),
        getBienes(),
      ]);

    if (niveles.success && niveles.data) {
      setNivelesEducativos(
        niveles.data.map((n: any) => ({
          id: n.id_nivel_educativo,
          label: n.descripcion,
        }))
      );
    }

    if (jobs.success && jobs.data) {
      setTrabajos(
        jobs.data.map((t: any) => ({
          id: t.id_trabajo,
          label: t.condicion_trabajo,
        }))
      );
    }

    if (acts.success && acts.data) {
      setActividades(
        acts.data.map((a: any) => ({
          id: a.id_actividad_solicitante,
          label: a.condicion_actividad,
        }))
      );
    }

    if (bienesData.success && bienesData.data) {
      setBienes(
        bienesData.data.map((b: any) => ({
          id: b.id_bien,
          label: b.descripcion,
        }))
      );
    }
    } catch (error) {
      console.error("Error loading catalogs:", error);
    } finally {
      setLoadingCatalogs(false);
    }
  };

  const validateForm = (data?: ApplicantFormData): boolean => {
    const dataToValidate = data || formData;
    const newErrors: Partial<Record<keyof ApplicantFormData, string>> = {};

    if (!dataToValidate.nombres.trim()) {
      newErrors.nombres = "El nombre es requerido";
    }

    if (!dataToValidate.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son requeridos";
    }

    // Validar cédula (prefijo + número)
    if (mode === "create") {
      if (!cedulaNumber.trim()) {
        newErrors.cedula_solicitante = "El número de cédula es requerido";
      } else if (!/^\d{6,8}$/.test(cedulaNumber.replace(/\D/g, ""))) {
        newErrors.cedula_solicitante = "El número de cédula debe tener entre 6 y 8 dígitos";
      }
    }

    if (!dataToValidate.fecha_nacimiento) {
      newErrors.fecha_nacimiento = "La fecha de nacimiento es requerida";
    }

    if (!dataToValidate.id_parroquia || dataToValidate.id_parroquia === 0) {
      newErrors.id_parroquia = "Debe seleccionar una parroquia";
    }

    if (
      dataToValidate.correo_electronico &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dataToValidate.correo_electronico)
    ) {
      newErrors.correo_electronico = "Email inválido";
    }

    if (
      dataToValidate.telefono_celular &&
      !/^(\+?58\s?)?0?4\d{2}-?\d{7}$/.test(dataToValidate.telefono_celular)
    ) {
      newErrors.telefono_celular = "Formato inválido (Ej: 0412-1234567)";
    }

    // Validar constraint de familia/hogar
    if (dataToValidate.familia?.cantidad_personas) {
      const cantidadPersonas = dataToValidate.familia.cantidad_personas;
      const cantidadTrabajadores = dataToValidate.familia.cantidad_trabajadores || 0;
      const cantidadNinos = dataToValidate.familia.cantidad_ninos || 0;
      
      if (cantidadTrabajadores + cantidadNinos > cantidadPersonas) {
        // Agregar error visual en el campo de cantidad de personas
        (newErrors as any).cantidad_personas = 
          `La suma de trabajadores (${cantidadTrabajadores}) y niños (${cantidadNinos}) ` +
          `no puede ser mayor que la cantidad de personas (${cantidadPersonas})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Preparar datos para enviar
    const dataToSave: ApplicantFormData = { ...formData };

    // Concatenar prefijo y número de cédula antes de validar
    if (mode === "create") {
      const cedulaCompleta = `${cedulaPrefix}-${cedulaNumber.replace(/\D/g, "")}`;
      dataToSave.cedula_solicitante = cedulaCompleta;
      // Sincronizar nacionalidad con prefijo de cédula
      dataToSave.nacionalidad = cedulaPrefix;
    }

    // Validar con los datos actualizados
    if (!validateForm(dataToSave)) {
      return;
    }

    setLoading(true);
    try {
      await onSave(dataToSave);
      onClose();
    } catch (error: any) {
      console.error("Error saving applicant:", error);
      setSubmitError(error.message || "Error al guardar el solicitante");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ApplicantFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-sky-950 text-3xl font-semibold">
            {mode === "create" ? "Nuevo Solicitante" : "Editar Solicitante"}
          </DialogTitle>
          <DialogDescription className="text-[#325B84] text-lg">
            {mode === "create"
              ? "Completa los datos del nuevo solicitante"
              : "Modifica los datos del solicitante"}
          </DialogDescription>
        </DialogHeader>

        {loadingCatalogs ? (
          <LoadingScreen
            message="Cargando información del solicitante..."
            subMessage="Por favor espera mientras se cargan los catálogos y datos"
          />
        ) : (
          <>
            {submitError && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="icon-[mdi--alert-circle] text-2xl text-red-500 flex-shrink-0 mt-0.5"></span>
                  <div className="flex-1">
                    <h4 className="text-red-800 font-semibold mb-1">Error al guardar</h4>
                    <p className="text-red-700 text-sm">{submitError}</p>
                  </div>
                  <button
                    onClick={() => setSubmitError(null)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0"
                    type="button"
                  >
                    <span className="icon-[mdi--close] text-xl"></span>
                  </button>
                </div>
              </div>
            )}

            <div className="max-h-[calc(90vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
          <form id="applicant-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Sección 1: Datos Personales */}
            <div className="space-y-4">
              <h3 className="text-sky-950 text-xl font-semibold border-b pb-2">
                Datos Personales
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Prefijo de Cédula */}
                <div className="space-y-2">
                  <Label htmlFor="cedula_prefix" className="text-sky-950 font-semibold">
                    Tipo de Cédula <span className="text-red-500">*</span>
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={cedulaPrefix}
                    onChange={(value) => {
                      const prefix = value as "V" | "E";
                      setCedulaPrefix(prefix);
                      handleChange("nacionalidad", prefix);
                    }}
                    options={[
                      { value: "V", label: "Venezolano (V)" },
                      { value: "E", label: "Extranjero (E)" },
                    ]}
                    disabled={mode === "edit"}
                  />
                </div>

                {/* Número de Cédula */}
                <div className="space-y-2">
                  <Label htmlFor="cedula_number" className="text-sky-950 font-semibold">
                    Número de Cédula <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cedula_number"
                    value={cedulaNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setCedulaNumber(value);
                    }}
                    placeholder="Ej: 12345678"
                    className={errors.cedula_solicitante ? "border-red-500" : ""}
                    disabled={mode === "edit"}
                    maxLength={8}
                  />
                  {errors.cedula_solicitante && (
                    <p className="text-red-500 text-sm">
                      {errors.cedula_solicitante}
                    </p>
                  )}
                </div>

                {/* Nombres */}
                <div className="space-y-2">
                  <Label htmlFor="nombres" className="text-sky-950 font-semibold">
                    Nombres <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombres"
                    value={formData.nombres}
                    onChange={(e) => handleChange("nombres", e.target.value)}
                    placeholder="Ej: María José"
                    className={errors.nombres ? "border-red-500" : ""}
                  />
                  {errors.nombres && (
                    <p className="text-red-500 text-sm">{errors.nombres}</p>
                  )}
                </div>

                {/* Apellidos */}
                <div className="space-y-2">
                  <Label htmlFor="apellidos" className="text-sky-950 font-semibold">
                    Apellidos <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => handleChange("apellidos", e.target.value)}
                    placeholder="Ej: González Pérez"
                    className={errors.apellidos ? "border-red-500" : ""}
                  />
                  {errors.apellidos && (
                    <p className="text-red-500 text-sm">{errors.apellidos}</p>
                  )}
                </div>

                {/* Sexo */}
                <div className="space-y-2">
                  <Label className="text-sky-950 font-semibold">Sexo</Label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sexo"
                        value="M"
                        checked={formData.sexo === "M"}
                        onChange={(e) => handleChange("sexo", e.target.value as "M" | "F")}
                        className="w-4 h-4"
                      />
                      <span>Masculino</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sexo"
                        value="F"
                        checked={formData.sexo === "F"}
                        onChange={(e) => handleChange("sexo", e.target.value as "M" | "F")}
                        className="w-4 h-4"
                      />
                      <span>Femenino</span>
                    </label>
                  </div>
                </div>

                {/* Fecha de Nacimiento */}
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento" className="text-sky-950 font-semibold">
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) =>
                      handleChange("fecha_nacimiento", e.target.value)
                    }
                    className={errors.fecha_nacimiento ? "border-red-500" : ""}
                  />
                  {errors.fecha_nacimiento && (
                    <p className="text-red-500 text-sm">
                      {errors.fecha_nacimiento}
                    </p>
                  )}
                </div>

                {/* Estado Civil */}
                <div className="space-y-2">
                  <Label htmlFor="estado_civil" className="text-sky-950 font-semibold">
                    Estado Civil
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={formData.estado_civil || ""}
                    onChange={(value) => {
                      handleChange("estado_civil", value);
                      // Si se selecciona "Casado", desactivar concubinato
                      if (value === "Casado") {
                        handleChange("en_concubinato", false);
                      }
                    }}
                    options={[
                      { value: "Soltero", label: "Soltero(a)" },
                      { value: "Casado", label: "Casado(a)" },
                      { value: "Divorciado", label: "Divorciado(a)" },
                      { value: "Viudo", label: "Viudo(a)" },
                    ]}
                  />
                </div>

                {/* En Concubinato */}
                <div className="space-y-2 flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.en_concubinato}
                      onChange={(e) =>
                        handleChange("en_concubinato", e.target.checked)
                      }
                      disabled={formData.estado_civil === "Casado"}
                      className="w-4 h-4"
                    />
                    <span className={`text-sky-950 font-semibold ${formData.estado_civil === "Casado" ? "opacity-50" : ""}`}>
                      ¿En concubinato?
                    </span>
                  </label>
                  {formData.estado_civil === "Casado" && (
                    <p className="text-sm text-gray-500 ml-2">
                      (No aplica si está casado)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 2: Contacto */}
            <div className="space-y-4">
              <h3 className="text-sky-950 text-xl font-semibold border-b pb-2">
                Información de Contacto
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Teléfono Celular */}
                <div className="space-y-2">
                  <Label htmlFor="telefono_celular" className="text-sky-950 font-semibold">
                    Teléfono Celular
                  </Label>
                  <Input
                    id="telefono_celular"
                    value={formData.telefono_celular}
                    onChange={(e) =>
                      handleChange("telefono_celular", e.target.value)
                    }
                    placeholder="Ej: 0412-1234567"
                    className={errors.telefono_celular ? "border-red-500" : ""}
                  />
                  {errors.telefono_celular && (
                    <p className="text-red-500 text-sm">
                      {errors.telefono_celular}
                    </p>
                  )}
                </div>

                {/* Teléfono Local */}
                <div className="space-y-2">
                  <Label htmlFor="telefono_local" className="text-sky-950 font-semibold">
                    Teléfono Local
                  </Label>
                  <Input
                    id="telefono_local"
                    value={formData.telefono_local}
                    onChange={(e) =>
                      handleChange("telefono_local", e.target.value)
                    }
                    placeholder="Ej: 0212-1234567"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="email" className="text-sky-950 font-semibold">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.correo_electronico}
                    onChange={(e) =>
                      handleChange("correo_electronico", e.target.value)
                    }
                    placeholder="Ej: maria.gonzalez@email.com"
                    className={errors.correo_electronico ? "border-red-500" : ""}
                  />
                  {errors.correo_electronico && (
                    <p className="text-red-500 text-sm">
                      {errors.correo_electronico}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 3: Ubicación */}
            <div className="space-y-4">
              <h3 className="text-sky-950 text-xl font-semibold border-b pb-2">
                Ubicación Geográfica
              </h3>
              <LocationCascadeSelect
                value={formData.id_parroquia}
                onChange={(value) => handleChange("id_parroquia", value || 0)}
                error={errors.id_parroquia}
                required
              />
            </div>

            {/* Sección 4: Información Socioeconómica */}
            <div className="space-y-4">
              <h3 className="text-sky-950 text-xl font-semibold border-b pb-2">
                Información Socioeconómica
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Nivel Educativo */}
                <div className="space-y-2">
                  <Label htmlFor="nivel_educativo" className="text-sky-950 font-semibold">
                    Nivel Educativo
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={formData.id_nivel_educativo?.toString() || ""}
                    onChange={(value) => {
                      const nivelEducativo = value ? parseInt(value) : undefined;
                      handleChange("id_nivel_educativo", nivelEducativo);
                      // Si es jefe de hogar, sincronizar el nivel educativo del jefe
                      if (formData.familia?.es_jefe_hogar) {
                        handleChange("familia", {
                          ...formData.familia,
                          id_nivel_educativo_jefe: nivelEducativo,
                        });
                      }
                    }}
                    options={nivelesEducativos.map((n) => ({
                      value: n.id.toString(),
                      label: n.label,
                    }))}
                  />
                </div>

                {/* Condición de Trabajo */}
                <div className="space-y-2">
                  <Label htmlFor="trabajo" className="text-sky-950 font-semibold">
                    Condición de Trabajo
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={formData.id_trabajo?.toString() || ""}
                    onChange={(value) =>
                      handleChange("id_trabajo", value ? parseInt(value) : undefined)
                    }
                    options={trabajos.map((t) => ({
                      value: t.id.toString(),
                      label: t.label,
                    }))}
                  />
                </div>

                {/* Actividad del Solicitante */}
                <div className="space-y-2">
                  <Label htmlFor="actividad" className="text-sky-950 font-semibold">
                    Actividad Principal
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={formData.id_actividad_solicitante?.toString() || ""}
                    onChange={(value) =>
                      handleChange(
                        "id_actividad_solicitante",
                        value ? parseInt(value) : undefined
                      )
                    }
                    options={actividades.map((a) => ({
                      value: a.id.toString(),
                      label: a.label,
                    }))}
                  />
                </div>

                {/* Busca Trabajo */}
                <div className="space-y-2 flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.buscando_trabajo}
                      onChange={(e) =>
                        handleChange("buscando_trabajo", e.target.checked)
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sky-950 font-semibold">
                      ¿Busca trabajo actualmente?
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sección 5: Información de Vivienda */}
            <div className="space-y-4">
              <h3 className="text-sky-950 text-xl font-semibold border-b pb-2">
                Información de Vivienda
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Tipo de Vivienda */}
                <div className="space-y-2">
                  <Label htmlFor="tipo_vivienda" className="text-sky-950 font-semibold">
                    Tipo de Vivienda
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={formData.vivienda?.tipo_vivienda || ""}
                    onChange={(value) =>
                      handleChange("vivienda", {
                        ...formData.vivienda,
                        tipo_vivienda: value as any,
                      })
                    }
                    options={[
                      { value: "Casa", label: "Casa" },
                      { value: "Apartamento", label: "Apartamento" },
                      { value: "Rancho", label: "Rancho" },
                      { value: "Otro", label: "Otro" },
                    ]}
                  />
                </div>

                {/* Cantidad de Habitaciones */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad_habitaciones" className="text-sky-950 font-semibold">
                    Cantidad de Habitaciones
                  </Label>
                  <Input
                    id="cantidad_habitaciones"
                    type="number"
                    min="0"
                    value={formData.vivienda?.cantidad_habitaciones || ""}
                    onChange={(e) =>
                      handleChange("vivienda", {
                        ...formData.vivienda,
                        cantidad_habitaciones: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ej: 3"
                  />
                </div>

                {/* Cantidad de Baños */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad_banos" className="text-sky-950 font-semibold">
                    Cantidad de Baños
                  </Label>
                  <Input
                    id="cantidad_banos"
                    type="number"
                    min="0"
                    value={formData.vivienda?.cantidad_banos || ""}
                    onChange={(e) =>
                      handleChange("vivienda", {
                        ...formData.vivienda,
                        cantidad_banos: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ej: 2"
                  />
                </div>

                {/* Material del Piso */}
                <div className="space-y-2">
                  <Label htmlFor="material_piso" className="text-sky-950 font-semibold">
                    Material del Piso
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={formData.vivienda?.material_piso || ""}
                    onChange={(value) =>
                      handleChange("vivienda", {
                        ...formData.vivienda,
                        material_piso: value as any,
                      })
                    }
                    options={[
                      { value: "Tierra", label: "Tierra" },
                      { value: "Cemento", label: "Cemento" },
                      { value: "Cerámica", label: "Cerámica" },
                      { value: "Granito / Parquet / Mármol", label: "Granito / Parquet / Mármol" },
                      { value: "Otro", label: "Otro" },
                    ]}
                  />
                </div>

                {/* Material de Paredes */}
                <div className="space-y-2">
                  <Label htmlFor="material_paredes" className="text-sky-950 font-semibold">
                    Material de Paredes
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={formData.vivienda?.material_paredes || ""}
                    onChange={(value) =>
                      handleChange("vivienda", {
                        ...formData.vivienda,
                        material_paredes: value as any,
                      })
                    }
                    options={[
                      { value: "Cartón / Palma / Desechos", label: "Cartón / Palma / Desechos" },
                      { value: "Bahareque", label: "Bahareque" },
                      { value: "Bloque sin frizar", label: "Bloque sin frizar" },
                      { value: "Bloque frizado", label: "Bloque frizado" },
                      { value: "Otro", label: "Otro" },
                    ]}
                  />
                </div>

                {/* Material del Techo */}
                <div className="space-y-2">
                  <Label htmlFor="material_techo" className="text-sky-950 font-semibold">
                    Material del Techo
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={formData.vivienda?.material_techo || ""}
                    onChange={(value) =>
                      handleChange("vivienda", {
                        ...formData.vivienda,
                        material_techo: value as any,
                      })
                    }
                    options={[
                      { value: "Madera / Cartón / Palma", label: "Madera / Cartón / Palma" },
                      { value: "Zinc / Acerolit", label: "Zinc / Acerolit" },
                      { value: "Platabanda / Tejas", label: "Platabanda / Tejas" },
                      { value: "Otro", label: "Otro" },
                    ]}
                  />
                </div>

                {/* Agua Potable */}
                <div className="space-y-2">
                  <Label htmlFor="agua_potable" className="text-sky-950 font-semibold">
                    Agua Potable
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={formData.vivienda?.agua_potable || ""}
                    onChange={(value) =>
                      handleChange("vivienda", {
                        ...formData.vivienda,
                        agua_potable: value as any,
                      })
                    }
                    options={[
                      { value: "Dentro de la vivienda", label: "Dentro de la vivienda" },
                      { value: "Fuera de la vivienda", label: "Fuera de la vivienda" },
                      { value: "No tiene servicio", label: "No tiene servicio" },
                    ]}
                  />
                </div>

                {/* Eliminación de Aguas */}
                <div className="space-y-2">
                  <Label htmlFor="eliminacion_aguas" className="text-sky-950 font-semibold">
                    Eliminación de Aguas
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={formData.vivienda?.eliminacion_aguas || ""}
                    onChange={(value) =>
                      handleChange("vivienda", {
                        ...formData.vivienda,
                        eliminacion_aguas: value as any,
                      })
                    }
                    options={[
                      { value: "Poceta a cloaca", label: "Poceta a cloaca" },
                      { value: "Pozo séptico", label: "Pozo séptico" },
                      { value: "Letrina", label: "Letrina" },
                      { value: "No tiene", label: "No tiene" },
                    ]}
                  />
                </div>

                {/* Aseo Urbano */}
                <div className="space-y-2">
                  <Label htmlFor="aseo_urbano" className="text-sky-950 font-semibold">
                    Aseo Urbano
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={formData.vivienda?.aseo_urbano || ""}
                    onChange={(value) =>
                      handleChange("vivienda", {
                        ...formData.vivienda,
                        aseo_urbano: value as any,
                      })
                    }
                    options={[
                      { value: "Llega a la vivienda", label: "Llega a la vivienda" },
                      { value: "No llega / Container", label: "No llega / Container" },
                      { value: "No tiene", label: "No tiene" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Sección 6: Información de Familia/Hogar */}
            <div className="space-y-4">
              <h3 className="text-sky-950 text-xl font-semibold border-b pb-2">
                Información de Familia/Hogar
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Cantidad de Personas */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad_personas" className="text-sky-950 font-semibold">
                    Cantidad de Personas <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cantidad_personas"
                    type="number"
                    min="1"
                    value={formData.familia?.cantidad_personas || ""}
                    onChange={(e) => {
                      const cantidadPersonas = e.target.value ? parseInt(e.target.value) : 1;
                      handleChange("familia", {
                        ...formData.familia,
                        cantidad_personas: cantidadPersonas,
                      });
                      // Limpiar error si se corrige
                      if (errors.cantidad_personas) {
                        setErrors((prev) => ({ ...prev, cantidad_personas: undefined }));
                      }
                    }}
                    placeholder="Ej: 4"
                    className={errors.cantidad_personas ? "border-red-500" : ""}
                  />
                  {errors.cantidad_personas && (
                    <p className="text-red-500 text-sm">{errors.cantidad_personas}</p>
                  )}
                </div>

                {/* Cantidad de Trabajadores */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad_trabajadores" className="text-sky-950 font-semibold">
                    Cantidad de Trabajadores
                  </Label>
                  <Input
                    id="cantidad_trabajadores"
                    type="number"
                    min="0"
                    value={formData.familia?.cantidad_trabajadores || ""}
                    onChange={(e) => {
                      const cantidadTrabajadores = e.target.value ? parseInt(e.target.value) : 0;
                      handleChange("familia", {
                        ...formData.familia,
                        cantidad_trabajadores: cantidadTrabajadores,
                      });
                      // Validar constraint en tiempo real
                      const cantidadPersonas = formData.familia?.cantidad_personas || 0;
                      const cantidadNinos = formData.familia?.cantidad_ninos || 0;
                      if (cantidadTrabajadores + cantidadNinos > cantidadPersonas && cantidadPersonas > 0) {
                        (setErrors as any)((prev: any) => ({
                          ...prev,
                          cantidad_personas: 
                            `La suma de trabajadores (${cantidadTrabajadores}) y niños (${cantidadNinos}) ` +
                            `no puede ser mayor que la cantidad de personas (${cantidadPersonas})`,
                        }));
                      } else if (errors.cantidad_personas) {
                        setErrors((prev) => ({ ...prev, cantidad_personas: undefined }));
                      }
                    }}
                    placeholder="Ej: 2"
                  />
                </div>

                {/* Cantidad de Niños */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad_ninos" className="text-sky-950 font-semibold">
                    Cantidad de Niños
                  </Label>
                  <Input
                    id="cantidad_ninos"
                    type="number"
                    min="0"
                    value={formData.familia?.cantidad_ninos || ""}
                    onChange={(e) => {
                      const cantidadNinos = e.target.value ? parseInt(e.target.value) : 0;
                      handleChange("familia", {
                        ...formData.familia,
                        cantidad_ninos: cantidadNinos,
                      });
                      // Validar constraint en tiempo real
                      const cantidadPersonas = formData.familia?.cantidad_personas || 0;
                      const cantidadTrabajadores = formData.familia?.cantidad_trabajadores || 0;
                      if (cantidadTrabajadores + cantidadNinos > cantidadPersonas && cantidadPersonas > 0) {
                        setErrors((prev: any) => ({
                          ...prev,
                          cantidad_personas: 
                            `La suma de trabajadores (${cantidadTrabajadores}) y niños (${cantidadNinos}) ` +
                            `no puede ser mayor que la cantidad de personas (${cantidadPersonas})`,
                        }));
                      } else if (errors.cantidad_personas) {
                        setErrors((prev) => ({ ...prev, cantidad_personas: undefined }));
                      }
                    }}
                    placeholder="Ej: 2"
                  />
                </div>

                {/* Cantidad de Niños Estudiando */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad_ninos_estudiando" className="text-sky-950 font-semibold">
                    Niños Estudiando
                  </Label>
                  <Input
                    id="cantidad_ninos_estudiando"
                    type="number"
                    min="0"
                    value={formData.familia?.cantidad_ninos_estudiando || ""}
                    onChange={(e) =>
                      handleChange("familia", {
                        ...formData.familia,
                        cantidad_ninos_estudiando: e.target.value ? parseInt(e.target.value) : 0,
                      })
                    }
                    placeholder="Ej: 1"
                  />
                </div>

                {/* Ingreso Mensual Aproximado */}
                <div className="space-y-2">
                  <Label htmlFor="ingreso_mensual" className="text-sky-950 font-semibold">
                    Ingreso Mensual Aproximado (Bs.)
                  </Label>
                  <Input
                    id="ingreso_mensual"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.familia?.ingreso_mensual_aprox || ""}
                    onChange={(e) =>
                      handleChange("familia", {
                        ...formData.familia,
                        ingreso_mensual_aprox: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Ej: 500.00"
                  />
                </div>

                {/* Nivel Educativo del Jefe de Hogar */}
                <div className="space-y-2">
                  <Label htmlFor="nivel_educativo_jefe" className="text-sky-950 font-semibold">
                    Nivel Educativo del Jefe
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={formData.familia?.id_nivel_educativo_jefe?.toString() || ""}
                    onChange={(value) =>
                      handleChange("familia", {
                        ...formData.familia,
                        id_nivel_educativo_jefe: value ? parseInt(value) : undefined,
                      })
                    }
                    options={nivelesEducativos.map((n) => ({
                      value: n.id.toString(),
                      label: n.label,
                    }))}
                  />
                </div>

                {/* Es Jefe de Hogar */}
                <div className="space-y-2 flex items-center pt-6 col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.familia?.es_jefe_hogar || false}
                      onChange={(e) => {
                        const isJefeHogar = e.target.checked;
                        handleChange("familia", {
                          ...formData.familia,
                          es_jefe_hogar: isJefeHogar,
                          // Si es jefe de hogar, sincronizar con el nivel educativo del solicitante
                          id_nivel_educativo_jefe: isJefeHogar 
                            ? formData.id_nivel_educativo 
                            : formData.familia?.id_nivel_educativo_jefe,
                        });
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sky-950 font-semibold">
                      ¿Es jefe de hogar?
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sección 7: Bienes del Solicitante */}
            <div className="space-y-4">
              <h3 className="text-sky-950 text-xl font-semibold border-b pb-2">
                Bienes del Solicitante
              </h3>

              <div className="space-y-2">
                <Label className="text-sky-950 font-semibold">
                  Seleccione los bienes que posee
                </Label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border rounded-lg">
                  {bienes.map((bien) => (
                    <label
                      key={bien.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.bienes?.includes(bien.id) || false}
                        onChange={(e) => {
                          const currentBienes = formData.bienes || [];
                          if (e.target.checked) {
                            handleChange("bienes", [...currentBienes, bien.id]);
                          } else {
                            handleChange(
                              "bienes",
                              currentBienes.filter((id) => id !== bien.id)
                            );
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sky-950">{bien.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </form>
            </div>

            <DialogFooter className="gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 rounded-2xl text-sky-950 text-lg font-semibold transition-all duration-300 hover:scale-105 cursor-pointer"
            disabled={loading}
          >
            Cancelar
          </button>
          <PrimaryButton
            type="submit"
            form="applicant-form"
            icon={
              mode === "create"
                ? "icon-[mdi--account-plus]"
                : "icon-[mdi--content-save]"
            }
            className={loading ? "opacity-50 cursor-not-allowed" : ""}
            disabled={loading}
          >
            {loading
              ? "Guardando..."
              : mode === "create"
                ? "Crear Solicitante"
                : "Guardar Cambios"}
          </PrimaryButton>
        </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
