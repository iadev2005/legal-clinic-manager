"use client";
import { useState, useEffect } from "react";
import {
    getNotificacionesByUsuario,
    marcarNotificacionRevisada,
    marcarTodasRevisadas,
    verificarCasosPausados,
    type NotificacionUsuario
} from "@/actions/notificaciones";
import { cn } from "@/lib/utils";

interface NotificationsProps {
    user: any;
}

export default function Notifications({ user }: NotificationsProps) {
    const [notifications, setNotifications] = useState<NotificacionUsuario[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        if (!user?.cedula) return;
        setLoading(true);
        try {
            const res = await getNotificacionesByUsuario(user.cedula);
            if (res.success && res.data) {
                setNotifications(res.data);
            }
        } catch (error) {
            console.error("Error loading notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [user]);

    const handleMarkAsRead = async (id: number) => {
        if (!user?.cedula) return;
        try {
            const res = await marcarNotificacionRevisada(id, user.cedula);
            if (res.success) {
                setNotifications(prev => prev.map(n =>
                    n.id_notificacion === id ? { ...n, revisado: true, fecha_revision: new Date().toISOString() } : n
                ));
            }
        } catch (error) {
            console.error("Error marking as read", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user?.cedula) return;
        try {
            const res = await marcarTodasRevisadas(user.cedula);
            if (res.success) {
                setNotifications(prev => prev.map(n => ({ ...n, revisado: true, fecha_revision: new Date().toISOString() })));
            }
        } catch (error) {
            console.error("Error marking all as read", error);
        }
    };

    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleCheckAlerts = async () => {
        setLoading(true);
        try {
            await verificarCasosPausados();
            await loadNotifications();
        } catch (error) {
            console.error("Error checking alerts", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 flex flex-col justify-start items-center overflow-hidden">
            <div className="w-full h-full p-6 flex flex-col overflow-hidden">
                <div className="self-stretch flex flex-col justify-start items-start flex-none mb-6">
                    <h1 className="self-stretch justify-start text-sky-950 text-6xl font-semibold">Notificaciones</h1>
                    <div className="flex justify-between items-center w-full">
                        <h1 className="text-[#325B84] text-2xl font-semibold">Tus notificaciones y alertas del sistema</h1>
                        <div className="flex gap-4">
                            <button
                                onClick={handleCheckAlerts}
                                className="text-sm text-sky-600 hover:text-sky-800 font-medium underline cursor-pointer"
                            >
                                Verificar Alertas
                            </button>
                            {notifications.length > 0 && notifications.some(n => !n.revisado) && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm text-sky-600 hover:text-sky-800 font-medium underline cursor-pointer"
                                >
                                    Marcar todas como leídas
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="self-stretch w-full p-7 bg-white rounded-[30px] shadow-sm border border-neutral-100 flex flex-col justify-start items-start gap-4 flex-1 min-h-0 overflow-hidden">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Cargando notificaciones...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <span className="icon-[mdi--bell-off-outline] text-6xl mb-4 opacity-50"></span>
                            <p>No tienes notificaciones pendientes.</p>
                        </div>
                    ) : (
                        <div className="w-full h-full overflow-y-auto pr-2 space-y-3">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id_notificacion}
                                    className={cn(
                                        "w-full p-4 rounded-xl border transition-all duration-200 flex justify-between items-start gap-4",
                                        notif.revisado
                                            ? "bg-white border-gray-100 text-gray-600"
                                            : "bg-blue-50/50 border-blue-100 shadow-sm"
                                    )}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {!notif.revisado && (
                                                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
                                            )}
                                            <p className={cn("text-sm font-medium", notif.revisado ? "text-gray-500" : "text-sky-900")}>
                                                {formatDate(notif.fecha_notificacion)}
                                            </p>
                                        </div>
                                        <p className={cn("text-base", notif.revisado ? "text-gray-700" : "text-sky-950 font-medium")}>
                                            {notif.descripcion}
                                        </p>
                                    </div>

                                    {!notif.revisado && (
                                        <button
                                            onClick={() => handleMarkAsRead(notif.id_notificacion)}
                                            className="p-2 hover:bg-blue-100 rounded-lg text-sky-700 transition-colors"
                                            title="Marcar como leída"
                                        >
                                            <span className="icon-[mdi--check] text-xl"></span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
