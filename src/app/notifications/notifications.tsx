"use client";
import { useState, useEffect, useMemo } from "react";
import {
    getNotificacionesByUsuario,
    marcarNotificacionRevisada,
    marcarTodasRevisadas,
    verificarCasosPausados,
    type NotificacionUsuario
} from "@/actions/notificaciones";
import { cn } from "@/lib/utils";
import PrimaryButton from "@/components/ui/primary-button";

interface NotificationsProps {
    user: any;
}

export default function Notifications({ user }: NotificationsProps) {
    const [notifications, setNotifications] = useState<NotificacionUsuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const [checking, setChecking] = useState(false);

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
        setChecking(true);
        try {
            await verificarCasosPausados();
            await loadNotifications();
        } catch (error) {
            console.error("Error checking alerts", error);
        } finally {
            setChecking(false);
        }
    };

    const filteredNotifications = useMemo(() => {
        if (activeTab === 'unread') {
            return notifications.filter(n => !n.revisado);
        }
        return notifications;
    }, [notifications, activeTab]);

    const unreadCount = notifications.filter(n => !n.revisado).length;

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 flex flex-col overflow-hidden">
            <div className="w-full h-full p-8 flex flex-col gap-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-6 flex-none">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-sky-950 text-4xl font-bold tracking-tight">Notificaciones</h1>
                            <p className="text-[#325B84] text-lg font-medium">
                                Mantente al día con las alertas y actualizaciones de tus casos.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCheckAlerts}
                                disabled={checking}
                                className="px-4 py-2 bg-white border border-neutral-200 text-sky-700 hover:bg-neutral-50 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                                <span className={cn("icon-[mdi--refresh] text-lg", checking && "animate-spin")}></span>
                                {checking ? "Verificando..." : "Verificar Alertas"}
                            </button>
                            {unreadCount > 0 && (
                                <PrimaryButton
                                    onClick={handleMarkAllAsRead}
                                    icon="icon-[mdi--check-all]"
                                >
                                    Marcar todas leídas
                                </PrimaryButton>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-neutral-200">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={cn(
                                "px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer",
                                activeTab === 'all'
                                    ? "border-[#003366] text-[#003366]"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Todas
                            <span className="bg-neutral-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                {notifications.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('unread')}
                            className={cn(
                                "px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer",
                                activeTab === 'unread'
                                    ? "border-[#003366] text-[#003366]"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Sin Leer
                            {unreadCount > 0 && (
                                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col relative">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 z-10">
                            <span className="icon-[svg-spinners--180-ring-with-bg] text-4xl text-[#003366]"></span>
                            <p className="text-gray-500 font-medium">Cargando notificaciones...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center">
                                <span className="icon-[mdi--bell-off-outline] text-4xl opacity-50"></span>
                            </div>
                            <p className="font-medium">No hay notificaciones {activeTab === 'unread' ? 'sin leer' : ''}.</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            {filteredNotifications.map((notif) => (
                                <div
                                    key={notif.id_notificacion}
                                    className={cn(
                                        "p-5 border-b border-neutral-100 transition-all hover:bg-neutral-50 flex gap-4 group",
                                        !notif.revisado && "bg-blue-50/30"
                                    )}
                                >
                                    <div className="flex-none pt-1">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            notif.revisado ? "bg-neutral-100 text-gray-400" : "bg-blue-100 text-[#003366]"
                                        )}>
                                            <span className="icon-[mdi--bell-outline] text-xl"></span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                {!notif.revisado && (
                                                    <span className="w-2 h-2 rounded-full bg-orange-500 flex-none" title="Sin leer"></span>
                                                )}
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    {formatDate(notif.fecha_notificacion)}
                                                </span>
                                            </div>
                                            {!notif.revisado && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notif.id_notificacion)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-1"
                                                >
                                                    <span className="icon-[mdi--check]"></span>
                                                    Marcar como leída
                                                </button>
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-base leading-relaxed",
                                            notif.revisado ? "text-gray-600" : "text-sky-950 font-medium"
                                        )}>
                                            {notif.descripcion}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
