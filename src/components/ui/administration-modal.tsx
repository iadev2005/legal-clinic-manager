"use client";
import { getUsuarioById } from "@/actions/administracion";

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
    onSave: (data: any) => Promise<void> | void;
    item?: any;
    mode: "create" | "edit";
    type: "users" | "subcatalogs" | "legalfield" | "centers" | "semestres";
    parishes?: { id: string; nombre: string }[];
    participations?: any[];
    materias?: { id: string; nombre: string }[];
    categorias?: { id: string; nombre: string; legalfieldid?: string; materiaid?: string }[];
    subcategorias?: { id: string; nombre: string; categorymateriaid: string }[];
    semestres?: { term: string; fecha_inicio: string; fecha_final: string }[];
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

    const selectedOption = options.find(opt => String(opt.value) === String(value));

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
                    {options.map((option, index) => (
                        <div
                            key={option.value || `option-${index}`}
                            className={cn(
                                "px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-blue-50 text-sky-950",
                                String(value) === String(option.value) && "bg-blue-100 font-semibold"
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
    participations = [],
    materias = [],
    categorias = [],
    subcategorias = [],
    semestres = [],
}: AdministrationModalProps) {
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExistingUser, setIsExistingUser] = useState(false);

    // Initial State Setup
    useEffect(() => {
        if (open) {
            setError(null);
            setIsExistingUser(false);
            if (item && mode === "edit") {
                setFormData({
                    ...item,
                    cedulaPrefix: item.cedulaPrefix || "V",
                    cedulaNumber: item.cedulaNumber || item.id?.split("-")[1] || "",
                    parishId: item.parishId || item.id_parroquia?.toString() || "",
                    legalfieldid: item.legalfieldid || "",
                    categorylegalfieldid: item.categorylegalfieldid || item.categorymateriaid || "",
                    longid: item.longid || "",
                    // Asegurar que los valores de string nunca sean null o undefined
                    nombres: item.nombres || "",
                    apellidos: item.apellidos || "",
                    correo: item.correo || "",
                    telefonoLocal: item.telefonoLocal ?? "",
                    telefonoCelular: item.telefonoCelular ?? "",
                    password: "",
                    nombre: item.nombre || "",
                    term: item.term || "",
                    fecha_inicio: item.fecha_inicio ? new Date(item.fecha_inicio).toISOString().split('T')[0] : "",
                    fecha_final: item.fecha_final ? new Date(item.fecha_final).toISOString().split('T')[0] : "",
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
                    legalfieldid: "",
                    nombre: "",
                    term: "",
                    tipoParticipacion: "Inscrito",
                });
            }
            setShowPassword(false);
        }
    }, [item, mode, open]);

    // Update tipoParticipacion when role changes in create mode
    useEffect(() => {
        if (mode === "create" && type === "users") {
            setFormData((prev: any) => ({
                ...prev,
                tipoParticipacion: prev.role === "Profesor" ? "Titular" : "Inscrito"
            }));
        }
    }, [formData.role, mode, type]);

    // Auto-fill logic
    useEffect(() => {
        const checkExistingUser = async () => {
            if (type === "users" && mode === "create" && formData.cedulaNumber && formData.cedulaNumber.length >= 6) {
                const cedula = `${formData.cedulaPrefix}-${formData.cedulaNumber}`;
                const result = await getUsuarioById(cedula);
                if (result.success && result.data) {
                    const user = result.data;
                    setFormData((prev: any) => ({
                        ...prev,
                        nombres: user.nombres || prev.nombres,
                        apellidos: user.apellidos || prev.apellidos,
                        correo: user.correo || prev.correo,
                        telefonoLocal: user.telefonoLocal || prev.telefonoLocal,
                        telefonoCelular: user.telefonoCelular || prev.telefonoCelular,
                        role: user.role || prev.role,
                        sexo: user.sexo || prev.sexo,
                    }));
                    setIsExistingUser(true);
                } else {
                    setIsExistingUser(false);
                }
            } else if (type === "users" && mode === "create" && (!formData.cedulaNumber || formData.cedulaNumber.length < 6)) {
                setIsExistingUser(false);
            }
        };

        const timer = setTimeout(() => {
            checkExistingUser();
        }, 500); // Debounce

        return () => clearTimeout(timer);
    }, [formData.cedulaNumber, formData.cedulaPrefix, mode, type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation - Removed confirm matches
        if (type === "users" && mode === "create") {
            if (!isExistingUser && formData.password && formData.password.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres");
                return;
            }
            // For Students/Professors, semester and type are required
            if (isStudentOrTeacher && (!formData.term || !formData.tipoParticipacion)) {
                setError("Debe indicar el semestre y tipo de participación");
                return;
            }
        }

        if (type === "users" && mode === "edit" && formData.password) {
            if (formData.password.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres");
                return;
            }
        }

        // Validaciones específicas movidas a la construcción de finalData

        // Validación para núcleos
        if (type === "centers" && mode === "create") {
            if (!formData.nombre || formData.nombre.trim() === "") {
                setError("El nombre es requerido");
                return;
            }
        }

        // Validación para núcleos
        if (type === "centers" && mode === "create") {
            if (!formData.nombre || formData.nombre.trim() === "") {
                setError("El nombre es requerido");
                return;
            }
        }

        // Validación para semestres
        if (type === "semestres") {
            if (!formData.term || formData.term.trim() === "") {
                setError("El término del semestre es requerido (ej: 2025-15)");
                return;
            }
            // Validar formato YYYY-NN
            const termPattern = /^\d{4}-\d{2}$/;
            if (!termPattern.test(formData.term)) {
                setError("El formato del término debe ser YYYY-NN (ej: 2025-15)");
                return;
            }
            if (!formData.fecha_inicio) {
                setError("La fecha de inicio es requerida");
                return;
            }
            if (!formData.fecha_final) {
                setError("La fecha final es requerida");
                return;
            }
            // Validar que fecha_final > fecha_inicio
            const fechaInicio = new Date(formData.fecha_inicio);
            const fechaFinal = new Date(formData.fecha_final);
            if (fechaFinal <= fechaInicio) {
                setError("La fecha final debe ser posterior a la fecha de inicio");
                return;
            }
        }

        setLoading(true);

        const finalData = { ...formData };
        if (type === "users") {
            finalData.id = `${formData.cedulaPrefix}-${formData.cedulaNumber}`;
            finalData.user = `${formData.nombres} ${formData.apellidos}`;
        }
        if (type === "subcatalogs") {
            // Validar Materia
            if (!formData.materiaId) {
                setError("Debe seleccionar una materia");
                setLoading(false);
                return;
            }

            const isCivil = materias.find(m => String(m.id) === String(formData.materiaId))?.nombre.toLowerCase().includes("civil");

            if (isCivil) {
                // Si es Civil, requerimos selección explícita
                if (!formData.categorylegalfieldid || formData.categorylegalfieldid.trim() === "") {
                    setError("Debe seleccionar una categoría");
                    setLoading(false);
                    return;
                }
            } else {
                // Si no es Civil, auto-asignamos la primera categoría disponible para esa materia si no se seleccionó ninguna
                if (!formData.categorylegalfieldid) {
                    const availableCats = categorias.filter(c => String(c.materiaid) === String(formData.materiaId));
                    if (availableCats.length > 0) {
                        finalData.categorylegalfieldid = availableCats[0].id;
                    } else {
                        // Fallback si no hay categorías (no debería pasar si la base de datos es consistente)
                        console.warn("No se encontraron categorías para la materia seleccionada:", formData.materiaId);
                        // Permitimos continuar, pero el backend podría fallar si requiere categoría válida
                        // O podríamos lanzar error aquí
                        setError("No hay categorías configuradas para esta materia.");
                        setLoading(false);
                        return;
                    }
                }
            }
            // Aseguramos que legalfieldid (o categorylegalfieldid) se envíe correctamente. 
            // createSubCategoria usa categorylegalfieldid.
            // finalData ya tiene categorylegalfieldid si fue seleccionado o auto-asignado.
            // No necesitamos asignar legalfieldid aquí para subcatalogos, eso era confusión anterior.
        }
        if (type === "legalfield") {
            // Asegurar que longid (Subcategoría) esté presente y sea válido
            if (!formData.longid || formData.longid.trim() === "") {
                setError("Debe seleccionar una subcategoría");
                setLoading(false);
                return;
            }
            // Enviar el ID de la subcategoría. Si el backend espera 'categorylegalfieldid', lo mapeamos.
            // Pero lo más probable es que espere 'categorylegalfieldid' con el ID del padre inmediato.
            finalData.categorylegalfieldid = String(formData.longid).trim();
        }
        if (type === "centers" && formData.parishId) {
            const parsed = parseInt(formData.parishId);
            if (!isNaN(parsed)) {
                finalData.id_parroquia = parsed;
            }
        }

        // Llamar a onSave de forma asíncrona
        try {
            await Promise.resolve(onSave(finalData));
            // Si onSave no lanza error, asumimos éxito y cerramos
            setLoading(false);
            onClose();
        } catch (err: any) {
            setLoading(false);
            setError(err.message || "Error al guardar");
            // El modal permanece abierto para que el usuario corrija
        }
    };

    const handleChange = (field: string, value: string) => {
        // Normalizar el valor a string para consistencia
        const normalizedValue = String(value);
        setFormData((prev: any) => ({ ...prev, [field]: normalizedValue }));
        if (error) setError(null);
    };

    const getTitle = () => {
        const action = mode === "create" ? "Crear" : "Editar";
        const entity = type === "users" ? "Usuario" : type === "subcatalogs" ? "Subcategoría" : type === "legalfield" ? "Legalfield" : "Centro";
        return `${action} ${entity}`;
    };

    const isStudentOrTeacher = type === "users" && (formData.role === "Estudiante" || formData.role === "Alumno" || formData.role === "Profesor");

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-sky-950 text-2xl font-semibold">{getTitle()}</DialogTitle>
                    <DialogDescription className="text-[#325B84]">
                        {mode === "create" ? "Ingresa los datos del nuevo elemento" : "Modifica los datos del elemento seleccionado"}
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                    <form id="admin-form" onSubmit={handleSubmit} className="space-y-4 pt-2">
                        {error && (
                            <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        {type === "users" ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Columna 1 */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Rol en el Sistema</Label>
                                            <div className={isExistingUser ? "pointer-events-none opacity-50" : ""}>
                                                <CustomSelect
                                                    value={formData.role ?? "Estudiante"}
                                                    onChange={(val) => handleChange("role", val)}
                                                    options={[
                                                        { value: "Estudiante", label: "Estudiante" },
                                                        { value: "Profesor", label: "Profesor" },
                                                        { value: "Coordinador", label: "Coordinador" },
                                                    ]}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Cédula de Identidad</Label>
                                            <div className="flex gap-2">
                                                <div className="w-24">
                                                    <CustomSelect
                                                        value={formData.cedulaPrefix ?? "V"}
                                                        onChange={(val) => handleChange("cedulaPrefix", val)}
                                                        options={[
                                                            { value: "V", label: "V" },
                                                            { value: "E", label: "E" },
                                                        ]}
                                                    />
                                                </div>
                                                <Input
                                                    value={formData.cedulaNumber ?? ""}
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
                                                value={formData.nombres ?? ""}
                                                onChange={(e) => handleChange("nombres", e.target.value)}
                                                placeholder="Nombres"
                                                required
                                                disabled={isExistingUser}
                                                className={isExistingUser ? "bg-gray-100" : ""}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="apellidos">Apellidos</Label>
                                            <Input
                                                id="apellidos"
                                                value={formData.apellidos ?? ""}
                                                onChange={(e) => handleChange("apellidos", e.target.value)}
                                                placeholder="Apellidos"
                                                required
                                                disabled={isExistingUser}
                                                className={isExistingUser ? "bg-gray-100" : ""}
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
                                                value={formData.correo ?? ""}
                                                onChange={(e) => handleChange("correo", e.target.value)}
                                                placeholder="@universidad.edu"
                                                required
                                                disabled={isExistingUser}
                                                className={isExistingUser ? "bg-gray-100" : ""}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="sexo">Sexo</Label>
                                            <div className={isExistingUser ? "pointer-events-none opacity-50" : ""}>
                                                <CustomSelect
                                                    value={formData.sexo ?? "M"}
                                                    onChange={(val) => handleChange("sexo", val)}
                                                    options={[
                                                        { value: "M", label: "Masculino" },
                                                        { value: "F", label: "Femenino" },
                                                    ]}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="tlf_local">Tlf. Local</Label>
                                                <Input
                                                    id="tlf_local"
                                                    value={formData.telefonoLocal ?? ""}
                                                    onChange={(e) => handleChange("telefonoLocal", e.target.value)}
                                                    placeholder="(0212) ..."
                                                    disabled={isExistingUser}
                                                    className={isExistingUser ? "bg-gray-100" : ""}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="tlf_celular">Tlf. Celular</Label>
                                                <Input
                                                    id="tlf_celular"
                                                    value={formData.telefonoCelular ?? ""}
                                                    onChange={(e) => handleChange("telefonoCelular", e.target.value)}
                                                    placeholder="(0414) ..."
                                                    required
                                                    disabled={isExistingUser}
                                                    className={isExistingUser ? "bg-gray-100" : ""}
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
                                                    value={formData.password ?? ""}
                                                    onChange={(e) => handleChange("password", e.target.value)}
                                                    placeholder={mode === "create" ? "******" : "(Opcional)"}
                                                    required={mode === "create" && !isExistingUser}
                                                    disabled={isExistingUser}
                                                    className={isExistingUser ? "bg-gray-100" : ""}
                                                />
                                                {!isExistingUser && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-sky-950 focus:outline-none cursor-pointer"
                                                    >
                                                        <span className={`text-xl ${showPassword ? "icon-[uil--eye]" : "icon-[uil--eye-slash]"}`}></span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isStudentOrTeacher && mode === "create" && (
                                    <div className="pt-4 border-t space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="term">Semestre de Ingreso</Label>
                                                <CustomSelect
                                                    value={formData.term ?? ""}
                                                    onChange={(val) => handleChange("term", val)}
                                                    options={semestres.map(s => ({ value: s.term, label: s.term }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="tipoParticipacion">Tipo de Participación</Label>
                                                <CustomSelect
                                                    value={formData.tipoParticipacion ?? ""}
                                                    onChange={(val) => handleChange("tipoParticipacion", val)}
                                                    options={
                                                        formData.role === "Profesor"
                                                            ? [
                                                                { value: "Voluntario", label: "Voluntario" },
                                                                { value: "Asesor", label: "Asesor" },
                                                                { value: "Titular", label: "Titular" },
                                                            ]
                                                            : [
                                                                { value: "Voluntario", label: "Voluntario" },
                                                                { value: "Inscrito", label: "Inscrito" },
                                                                { value: "Egresado", label: "Egresado" },
                                                            ]
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {type !== "semestres" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre</Label>
                                        <Input
                                            id="nombre"
                                            value={formData.nombre || ""}
                                            onChange={(e) => handleChange("nombre", e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                                {type === "subcatalogs" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="materia">Materia <span className="text-red-500">*</span></Label>
                                            <CustomSelect
                                                value={formData.materiaId || ""}
                                                onChange={(val) => {
                                                    console.log('Materia seleccionada:', val);
                                                    handleChange("materiaId", val);
                                                    handleChange("categorylegalfieldid", ""); // Reset category
                                                }}
                                                options={materias.map(m => ({ value: m.id, label: m.nombre }))}
                                            />
                                        </div>
                                        {formData.materiaId && materias.find(m => m.id === formData.materiaId)?.nombre.toLowerCase().includes("civil") && (
                                            <div className="space-y-2">
                                                <Label htmlFor="categoria">Categoría <span className="text-red-500">*</span></Label>
                                                <CustomSelect
                                                    value={formData.categorylegalfieldid || ""}
                                                    onChange={(val) => {
                                                        console.log('Categoría seleccionada:', val);
                                                        handleChange("categorylegalfieldid", val);
                                                    }}
                                                    options={categorias.filter(c => String(c.materiaid) === String(formData.materiaId)).map(c => ({ value: c.id, label: c.nombre }))}
                                                />
                                                {!formData.categorylegalfieldid && mode === "create" && (
                                                    <p className="text-xs text-red-500">Debe seleccionar una categoría</p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                                {type === "legalfield" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="subcategoria">Subcategoría <span className="text-red-500">*</span></Label>
                                        <CustomSelect
                                            value={formData.longid || ""}
                                            onChange={(val) => handleChange("longid", val)}
                                            options={subcategorias.map(s => ({ value: s.id, label: s.nombre }))}
                                        />
                                        {!formData.longid && mode === "create" && (
                                            <p className="text-xs text-red-500">Debe seleccionar una subcategoría</p>
                                        )}
                                    </div>
                                )}
                                {type === "centers" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="parish">Parroquia</Label>
                                        <CustomSelect
                                            value={formData.parishId || ""}
                                            onChange={(val) => handleChange("parishId", val)}
                                            options={parishes.map(p => ({ value: p.id, label: p.nombre }))}
                                        />
                                    </div>
                                )}
                                {type === "semestres" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="term">Término del Semestre <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="term"
                                                value={formData.term || ""}
                                                onChange={(e) => handleChange("term", e.target.value)}
                                                placeholder="Ej: 2025-15"
                                                required
                                                disabled={mode === "edit"}
                                            />
                                            <p className="text-xs text-gray-500">Formato: YYYY-NN (ej: 2025-15)</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="fecha_inicio">Fecha de Inicio <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="fecha_inicio"
                                                    type="date"
                                                    value={formData.fecha_inicio || ""}
                                                    onChange={(e) => handleChange("fecha_inicio", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="fecha_final">Fecha Final <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="fecha_final"
                                                    type="date"
                                                    value={formData.fecha_final || ""}
                                                    onChange={(e) => handleChange("fecha_final", e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {isStudentOrTeacher && mode === "edit" && (
                            <div className="mt-6 border-t pt-4">
                                <h3 className="text-sky-950 font-bold mb-3 flex items-center gap-2">
                                    <span className="icon-[uil--history] text-xl"></span>
                                    Historial de Participación
                                </h3>
                                {participations.length > 0 ? (
                                    <div className="max-h-40 overflow-y-auto border rounded-lg bg-gray-50 overflow-x-auto">
                                        <table className="w-full text-sm text-left min-w-[400px]">
                                            <thead className="text-xs text-sky-950 uppercase bg-gray-100 border-b">
                                                <tr>
                                                    <th className="px-4 py-2">Semestre</th>
                                                    <th className="px-4 py-2">NRC</th>
                                                    <th className="px-4 py-2 text-center">Tipo de Participación</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {participations.map((p, idx) => (
                                                    <tr key={idx} className="bg-white border-b hover:bg-neutral-50">
                                                        <td className="px-4 py-2 font-medium text-sky-950">{p.semestre}</td>
                                                        <td className="px-4 py-2 text-sky-950">{p.nrc}</td>
                                                        <td className="px-4 py-2 text-center">
                                                            <span className={cn(
                                                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                                                                (p.tipo === "Regular" || p.tipo === "fijo") ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                            )}>
                                                                {p.tipo}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-gray-50 border rounded-lg text-gray-400 text-sm">
                                        No hay historial de participación registrado.
                                    </div>
                                )}
                            </div>
                        )}

                    </form>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 bg-neutral-200 hover:bg-neutral-300 rounded-lg text-sky-950 font-semibold transition-colors cursor-pointer"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <PrimaryButton
                        type="submit"
                        form="admin-form"
                        icon={mode === "create" ? "icon-[mdi--plus]" : "icon-[mdi--content-save]"}
                        className={cn("w-full sm:w-auto", loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}
                    >
                        {loading ? "Guardando..." : "Guardar"}
                    </PrimaryButton>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
}
