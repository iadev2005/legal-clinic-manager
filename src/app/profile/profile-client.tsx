"use client";

import { useState } from "react";
import { updatePassword } from "@/actions/auth";
import { useRouter } from "next/navigation";

interface ProfileClientProps {
    user: any;
    participations?: any[];
}

export default function ProfileClient({ user, participations = [] }: ProfileClientProps) {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas nuevas no coinciden");
            return;
        }

        if (newPassword.length < 6) {
            setError("La contraseña nueva debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);

        try {
            const res = await updatePassword(user.cedula_usuario || user.id || user.cedula, currentPassword, newPassword);

            if (res?.error) {
                setError(res.error);
            } else {
                setSuccess(true);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (err) {
            setError("Ocurrió un error al actualizar la contraseña");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full px-6 py-8 flex flex-col gap-6 overflow-y-auto items-center">
            <div className="flex flex-col gap-2 w-full max-w-[96%]">
                <h1 className="text-sky-950 text-4xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-[#325B84] text-lg font-medium">Administra tu información personal y seguridad.</p>
            </div>

            <div className="max-w-[96%] w-full bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Columna Izquierda: Información Básica */}
                <div className="col-span-1 flex flex-col gap-6 border-r border-neutral-100 pr-0 lg:pr-8">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-[#3E7DBB] to-[#003366] rounded-full flex items-center justify-center text-white text-5xl font-bold uppercase shadow-xl ring-4 ring-blue-50">
                            {user.nombres ? user.nombres.charAt(0) : user.nombre?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-sky-950 leading-tight">
                                {user.nombres} {user.apellidos}
                            </h2>
                            <div className="flex gap-2 mt-3 justify-center">
                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[#E3F2FD] text-[#0D47A1] hover:scale-105 transition-transform cursor-pointer select-none shadow-sm hover:shadow-md">
                                    {user.role || user.rol}
                                </span>
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user.status === 'Activo' || user.status === true || user.activo ? 'bg-[#D1F7D6] text-[#005C2B]' : 'bg-[#FFD1D1] text-[#FF0000]'} hover:scale-105 transition-transform cursor-pointer select-none shadow-sm hover:shadow-md`}>
                                    {user.status === 'Activo' || user.status === true || user.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-4">
                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start gap-3">
                            <span className="icon-[mdi--card-account-details-outline] text-2xl text-[#3E7DBB] mt-0.5"></span>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cédula</p>
                                <p className="text-sky-950 font-semibold">{user.cedula_usuario || user.id || user.cedula}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start gap-3">
                            <span className="icon-[mdi--email-outline] text-2xl text-[#3E7DBB] mt-0.5"></span>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Correo Electrónico</p>
                                <p className="text-sky-950 font-semibold truncate max-w-[200px]" title={user.correo || user.correo_electronico}>
                                    {user.correo || user.correo_electronico || "No registrado"}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start gap-3">
                            <span className="icon-[mdi--phone-outline] text-2xl text-[#3E7DBB] mt-0.5"></span>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Teléfonos</p>
                                <p className="text-sky-950 font-semibold text-sm">
                                    Móvil: {user.telefonoCelular || user.telefono_celular || "N/A"}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    Local: {user.telefonoLocal || user.telefono_local || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Historial y Seguridad */}
                <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">

                    {/* Historial Académico (Si aplica) */}
                    {participations.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-sky-950 mb-4 flex items-center gap-2">
                                <span className="icon-[mdi--school-outline] text-[#3E7DBB] text-2xl"></span>
                                Historial Académico
                            </h3>
                            <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-neutral-100 text-sky-950 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Semestre</th>
                                            <th className="px-4 py-3">Rol</th>
                                            <th className="px-4 py-3">Tipo</th>
                                            <th className="px-4 py-3">NRC</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {participations.map((part, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-4 py-3 font-semibold text-[#3E7DBB]">{part.semestre}</td>
                                                <td className="px-4 py-3 font-medium text-gray-700">
                                                    {user.rol}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold uppercase">
                                                        {part.tipo}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 font-mono">{part.nrc || "---"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Formulario de Seguridad */}
                    <div>
                        <h3 className="text-xl font-bold text-sky-950 mb-4 flex items-center gap-2">
                            <span className="icon-[mdi--shield-key-outline] text-[#3E7DBB] text-2xl"></span>
                            Seguridad
                        </h3>
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-6">
                            <h4 className="font-bold text-sky-950 mb-4">Actualizar Contraseña</h4>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Contraseña Actual</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-[#3E7DBB] focus:outline-none transition-colors bg-white text-sky-950 pr-12"
                                            placeholder="Ingrese su contraseña actual"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onMouseDown={() => setShowCurrentPassword(true)}
                                            onMouseUp={() => setShowCurrentPassword(false)}
                                            onMouseLeave={() => setShowCurrentPassword(false)}
                                            onTouchStart={() => setShowCurrentPassword(true)}
                                            onTouchEnd={() => setShowCurrentPassword(false)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3E7DBB] transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                                        >
                                            <span className={`text-2xl ${showCurrentPassword ? "icon-[uil--eye]" : "icon-[uil--eye-slash]"}`}></span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Nueva Contraseña</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-[#3E7DBB] focus:outline-none transition-colors bg-white text-sky-950 pr-12"
                                                placeholder="Nueva contraseña"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onMouseDown={() => setShowNewPassword(true)}
                                                onMouseUp={() => setShowNewPassword(false)}
                                                onMouseLeave={() => setShowNewPassword(false)}
                                                onTouchStart={() => setShowNewPassword(true)}
                                                onTouchEnd={() => setShowNewPassword(false)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3E7DBB] transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                                            >
                                                <span className={`text-2xl ${showNewPassword ? "icon-[uil--eye]" : "icon-[uil--eye-slash]"}`}></span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Confirmar Contraseña</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-[#3E7DBB] focus:outline-none transition-colors bg-white text-sky-950 pr-12"
                                                placeholder="Confirme nueva contraseña"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onMouseDown={() => setShowConfirmPassword(true)}
                                                onMouseUp={() => setShowConfirmPassword(false)}
                                                onMouseLeave={() => setShowConfirmPassword(false)}
                                                onTouchStart={() => setShowConfirmPassword(true)}
                                                onTouchEnd={() => setShowConfirmPassword(false)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3E7DBB] transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                                            >
                                                <span className={`text-2xl ${showConfirmPassword ? "icon-[uil--eye]" : "icon-[uil--eye-slash]"}`}></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                                        <span className="icon-[mdi--alert-circle] text-xl"></span>
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
                                        <span className="icon-[mdi--check-circle] text-xl"></span>
                                        Contraseña actualizada exitosamente
                                    </div>
                                )}

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3 bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="icon-[svg-spinners--180-ring-with-bg] text-xl"></span>
                                                Actualizando...
                                            </>
                                        ) : (
                                            "Actualizar Contraseña"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
