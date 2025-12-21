"use client";

import { useState, useEffect, useRef } from "react";
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
import { cn } from "@/lib/utils";

interface AdministrationModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    item?: any;
    mode: "create" | "edit";
    type: "users" | "catalogs" | "formalities" | "centers";
    parishes?: { id: string; nombre: string }[];
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    className?: string;
}

const CustomSelect = ({ value, onChange, options, className }: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <div
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer flex items-center justify-between",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={selectedOption ? "text-sky-950" : "text-muted-foreground"}>
                    {selectedOption ? selectedOption.label : "Seleccionar"}
                </span>
                <span className="icon-[mingcute--down-fill] text-sm text-gray-500"></span>
            </div>

            {isOpen && (
                <div className="absolute top-[110%] left-0 w-full rounded-md border bg-white shadow-md z-50 overflow-hidden max-h-40 overflow-y-auto">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={cn(
                                "px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-blue-50 text-sky-950",
                                value === option.value && "bg-blue-100 font-semibold"
                            )}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export default function AdministrationModal({
    open,
    onClose,
    onSave,
    item,
    mode,
    type,
    parishes = [],
}: AdministrationModalProps) {
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial State Setup
    useEffect(() => {
        if (open) {
            setError(null);
            if (item && mode === "edit") {
                setFormData({
                    ...item,
                    cedulaPrefix: item.cedulaPrefix || "V",
                    cedulaNumber: item.cedulaNumber || item.id?.split("-")[1] || "",
                    parishId: item.parishId || "",
                });
            } else {
                setFormData({
                    user: "",
                    role: "Estudiante",
                    cedulaPrefix: "V",
                    cedulaNumber: "",
                    nombres: "",
                    apellidos: "",
                    correo: "",
                    sexo: "M",
                    telefonoLocal: "",
                    telefonoCelular: "",
                    password: "",
                    parishId: "",
                });
            }
            setShowPassword(false);
        }
    }, [item, mode, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation - Removed confirm matches
        if (type === "users" && mode === "create") {
            if (formData.password.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres");
                return;
            }
        }

        if (type === "users" && mode === "edit" && formData.password) {
            if (formData.password.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres");
                return;
            }
        }

        setLoading(true);

        const finalData = { ...formData };
        if (type === "users") {
            finalData.id = `${formData.cedulaPrefix}-${formData.cedulaNumber}`;
            finalData.user = `${formData.nombres} ${formData.apellidos}`;
        }

        setTimeout(() => {
            onSave(finalData);
            setLoading(false);
            onClose();
        }, 500);
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const getTitle = () => {
        const action = mode === "create" ? "Crear" : "Editar";
        const entity = type === "users" ? "Usuario" : type === "catalogs" ? "Catálogo" : type === "formalities" ? "Trámite" : "Centro";
        return `${action} ${entity}`;
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className={type === "users" ? "max-w-3xl" : "max-w-md"}>
                <DialogHeader>
                    <DialogTitle className="text-sky-950 text-2xl font-semibold">{getTitle()}</DialogTitle>
                    <DialogDescription className="text-[#325B84]">
                        {mode === "create" ? "Ingresa los datos del nuevo elemento" : "Modifica los datos del elemento seleccionado"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {error && (
                        <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm font-semibold">
                            {error}
                        </div>
                    )}

                    {type === "users" ? (
                        <div className="grid grid-cols-2 gap-6">
                            {/* Columna 1 */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Rol en el Sistema</Label>
                                    <CustomSelect
                                        value={formData.role}
                                        onChange={(val) => handleChange("role", val)}
                                        options={[
                                            { value: "Estudiante", label: "Estudiante" },
                                            { value: "Profesor", label: "Profesor" },
                                            { value: "Coordinador", label: "Coordinador" },
                                        ]}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Cédula de Identidad</Label>
                                    <div className="flex gap-2">
                                        <div className="w-24">
                                            <CustomSelect
                                                value={formData.cedulaPrefix}
                                                onChange={(val) => handleChange("cedulaPrefix", val)}
                                                options={[
                                                    { value: "V", label: "V" },
                                                    { value: "E", label: "E" },
                                                ]}
                                            />
                                        </div>
                                        <Input
                                            value={formData.cedulaNumber}
                                            onChange={(e) => handleChange("cedulaNumber", e.target.value)}
                                            placeholder="12.345.678"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nombres">Nombres</Label>
                                    <Input
                                        id="nombres"
                                        value={formData.nombres}
                                        onChange={(e) => handleChange("nombres", e.target.value)}
                                        placeholder="Nombres"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="apellidos">Apellidos</Label>
                                    <Input
                                        id="apellidos"
                                        value={formData.apellidos}
                                        onChange={(e) => handleChange("apellidos", e.target.value)}
                                        placeholder="Apellidos"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Columna 2 */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="correo">Correo Institucional</Label>
                                    <Input
                                        id="correo"
                                        type="email"
                                        value={formData.correo}
                                        onChange={(e) => handleChange("correo", e.target.value)}
                                        placeholder="@universidad.edu"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sexo">Sexo</Label>
                                    <CustomSelect
                                        value={formData.sexo}
                                        onChange={(val) => handleChange("sexo", val)}
                                        options={[
                                            { value: "M", label: "Masculino" },
                                            { value: "F", label: "Femenino" },
                                        ]}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="tlf_local">Tlf. Local</Label>
                                        <Input
                                            id="tlf_local"
                                            value={formData.telefonoLocal}
                                            onChange={(e) => handleChange("telefonoLocal", e.target.value)}
                                            placeholder="(0212) ..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tlf_celular">Tlf. Celular</Label>
                                        <Input
                                            id="tlf_celular"
                                            value={formData.telefonoCelular}
                                            onChange={(e) => handleChange("telefonoCelular", e.target.value)}
                                            placeholder="(0414) ..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        {mode === "create" ? "Contraseña" : "Nueva Contraseña"}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => handleChange("password", e.target.value)}
                                            placeholder={mode === "create" ? "******" : "(Opcional)"}
                                            required={mode === "create"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-sky-950 focus:outline-none cursor-pointer"
                                        >
                                            <span className={`text-xl ${showPassword ? "icon-[uil--eye]" : "icon-[uil--eye-slash]"}`}></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    value={formData.nombre || ""}
                                    onChange={(e) => handleChange("nombre", e.target.value)}
                                    required
                                />
                            </div>
                            {type === "centers" && (
                                <div className="space-y-2">
                                    <Label htmlFor="parish">Parroquia</Label>
                                    <CustomSelect
                                        value={formData.parishId}
                                        onChange={(val) => handleChange("parishId", val)}
                                        options={parishes.map(p => ({ value: p.id, label: p.nombre }))}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 rounded-lg text-sky-950 font-semibold transition-colors cursor-pointer"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <PrimaryButton
                            type="submit"
                            icon={mode === "create" ? "icon-[mdi--plus]" : "icon-[mdi--content-save]"}
                            className={cn(loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}
                        >
                            {loading ? "Guardando..." : "Guardar"}
                        </PrimaryButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
