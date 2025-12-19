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
import PrimaryButton from "./primary-button";

interface ApplicantModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ApplicantFormData) => Promise<void>;
  applicant?: {
    id?: string;
    name: string;
    idDocument: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  mode: "create" | "edit";
}

export interface ApplicantFormData {
  id?: string;
  name: string;
  idDocument: string;
  email: string;
  phone: string;
  address: string;
}

export default function ApplicantModal({
  open,
  onClose,
  onSave,
  applicant,
  mode,
}: ApplicantModalProps) {
  const [formData, setFormData] = useState<ApplicantFormData>({
    name: "",
    idDocument: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ApplicantFormData, string>>
  >({});

  useEffect(() => {
    if (applicant && mode === "edit") {
      setFormData({
        id: applicant.id,
        name: applicant.name || "",
        idDocument: applicant.idDocument || "",
        email: applicant.email || "",
        phone: applicant.phone || "",
        address: applicant.address || "",
      });
    } else {
      setFormData({
        name: "",
        idDocument: "",
        email: "",
        phone: "",
        address: "",
      });
    }
    setErrors({});
  }, [applicant, mode, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ApplicantFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.idDocument.trim()) {
      newErrors.idDocument = "La cédula es requerida";
    } else if (!/^[VEJ]-?\d{6,8}$/i.test(formData.idDocument)) {
      newErrors.idDocument = "Formato inválido (Ej: V-12345678)";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (formData.phone && !/^\+?58\s?4\d{2}-?\d{7}$/.test(formData.phone)) {
      newErrors.phone = "Formato inválido (Ej: +58 412-1234567)";
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

  const handleChange = (field: keyof ApplicantFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre Completo */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sky-950 font-semibold">
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej: María González"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Cédula de Identidad */}
          <div className="space-y-2">
            <Label htmlFor="idDocument" className="text-sky-950 font-semibold">
              Cédula de Identidad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="idDocument"
              value={formData.idDocument}
              onChange={(e) => handleChange("idDocument", e.target.value)}
              placeholder="Ej: V-12345678"
              className={errors.idDocument ? "border-red-500" : ""}
            />
            {errors.idDocument && (
              <p className="text-red-500 text-sm">{errors.idDocument}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sky-950 font-semibold">
              Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Ej: maria.gonzalez@email.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sky-950 font-semibold">
              Teléfono
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Ej: +58 412-1234567"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sky-950 font-semibold">
              Dirección
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Ej: Caracas, Venezuela"
            />
          </div>

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
              icon={
                mode === "create"
                  ? "icon-[mdi--account-plus]"
                  : "icon-[mdi--content-save]"
              }
              className={loading ? "opacity-50 cursor-not-allowed" : ""}
            >
              {loading
                ? "Guardando..."
                : mode === "create"
                ? "Crear Solicitante"
                : "Guardar Cambios"}
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
