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
import {
  getNivelesEducativos,
  getTrabajos,
  getActividadesSolicitantes,
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
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ApplicantFormData, string>>
  >({});

  // Catálogos
  const [nivelesEducativos, setNivelesEducativos] = useState<Catalog[]>([]);
  const [trabajos, setTrabajos] = useState<Catalog[]>([]);
  const [actividades, setActividades] = useState<Catalog[]>([]);

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (applicant && mode === "edit") {
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
        fecha_nacimiento: applicant.fecha_nacimiento || "",
        buscando_trabajo: applicant.buscando_trabajo || false,
        tipo_periodo_educacion: applicant.tipo_periodo_educacion || undefined,
        cantidad_tiempo_educacion:
          applicant.cantidad_tiempo_educacion || undefined,
        id_parroquia: applicant.id_parroquia || 0,
        id_actividad_solicitante:
          applicant.id_actividad_solicitante || undefined,
        id_trabajo: applicant.id_trabajo || undefined,
        id_nivel_educativo: applicant.id_nivel_educativo || undefined,
      });
    } else {
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
      });
    }
    setErrors({});
  }, [applicant, mode, open]);

  const loadCatalogs = async () => {
    const [niveles, jobs, acts] = await Promise.all([
      getNivelesEducativos(),
      getTrabajos(),
      getActividadesSolicitantes(),
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
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ApplicantFormData, string>> = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = "El nombre es requerido";
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son requeridos";
    }

    if (!formData.cedula_solicitante.trim()) {
      newErrors.cedula_solicitante = "La cédula es requerida";
    } else if (!/^[VEJ]-?\d{6,8}$/i.test(formData.cedula_solicitante)) {
      newErrors.cedula_solicitante = "Formato inválido (Ej: V-12345678)";
    }

    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = "La fecha de nacimiento es requerida";
    }

    if (!formData.id_parroquia || formData.id_parroquia === 0) {
      newErrors.id_parroquia = "Debe seleccionar una parroquia";
    }

    if (
      formData.correo_electronico &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo_electronico)
    ) {
      newErrors.correo_electronico = "Email inválido";
    }

    if (
      formData.telefono_celular &&
      !/^(\+?58\s?)?4\d{2}-?\d{7}$/.test(formData.telefono_celular)
    ) {
      newErrors.telefono_celular = "Formato inválido (Ej: 0412-1234567)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving applicant:", error);
      alert("Error al guardar el solicitante");
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

        <div className="max-h-[calc(90vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
          <form id="applicant-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Sección 1: Datos Personales */}
            <div className="space-y-4">
              <h3 className="text-sky-950 text-xl font-semibold border-b pb-2">
                Datos Personales
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Cédula */}
                <div className="space-y-2">
                  <Label htmlFor="cedula" className="text-sky-950 font-semibold">
                    Cédula de Identidad <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cedula"
                    value={formData.cedula_solicitante}
                    onChange={(e) =>
                      handleChange("cedula_solicitante", e.target.value)
                    }
                    placeholder="Ej: V-12345678"
                    className={errors.cedula_solicitante ? "border-red-500" : ""}
                    disabled={mode === "edit"}
                  />
                  {errors.cedula_solicitante && (
                    <p className="text-red-500 text-sm">
                      {errors.cedula_solicitante}
                    </p>
                  )}
                </div>

                {/* Nacionalidad */}
                <div className="space-y-2">
                  <Label htmlFor="nacionalidad" className="text-sky-950 font-semibold">
                    Nacionalidad <span className="text-red-500">*</span>
                  </Label>
                  <FilterSelect
                    placeholder="Seleccione"
                    value={formData.nacionalidad || ""}
                    onChange={(value) => handleChange("nacionalidad", value as "V" | "E")}
                    options={[
                      { value: "V", label: "Venezolano (V)" },
                      { value: "E", label: "Extranjero (E)" },
                    ]}
                  />
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
                    onChange={(value) => handleChange("estado_civil", value)}
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
                      className="w-4 h-4"
                    />
                    <span className="text-sky-950 font-semibold">
                      ¿En concubinato?
                    </span>
                  </label>
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
                    onChange={(value) =>
                      handleChange("id_nivel_educativo", value ? parseInt(value) : undefined)
                    }
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
      </DialogContent>
    </Dialog>
  );
}
