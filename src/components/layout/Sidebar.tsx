"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();

    const sidebarItems = [
        { label: "Inicio/Dashboard", href: "/dashboard", icon: "icon-[material-symbols--dashboard-outline-rounded]", activeIcon: "icon-[material-symbols--dashboard-rounded]" },
        { label: "Gestión de\nSolicitantes", href: "/applicants", icon: "icon-[flowbite--users-outline]", activeIcon: "icon-[flowbite--users-solid]" },
        { label: "Gestión de Casos", href: "/cases", icon: "icon-[icon-park-outline--gavel]", activeIcon: "icon-[icon-park-solid--gavel]" },
        { label: "Seguimiento y Control", href: "/follow-up", icon: "icon-[mdi--file-check-outline]", activeIcon: "icon-[mdi--file-check]" },
        { label: "Gestión de Citas", href: "/citations", icon: "icon-[mdi--calendar-outline]", activeIcon: "icon-[mdi--calendar]" },
        { label: "Reportes y\nEstadísticas", href: "/statistics", icon: "icon-[material-symbols--pie-chart-outline]", activeIcon: "icon-[material-symbols--pie-chart]" },
        { label: "Administración", href: "/administration", icon: "icon-[ph--sliders-horizontal]", activeIcon: "icon-[ph--sliders-horizontal-fill]" },
    ];

    // Mock User Data (ToDo: Replace with real auth data)
    const user = {
        name: "Ana",
        lastname: "Pérez",
        role: "Coordinador"
    };

    const initials = `${user.name.charAt(0)}${user.lastname.charAt(0)}`;
    const displayName = `${user.name} ${user.lastname} (${user.role})`;

    return (
        <div className="w-fit self-stretch px-8 py-4 shadow-[2px_0px_37px_0px_rgba(0,0,0,0.25)] inline-flex flex-col justify-between items-center" style={{ background: "linear-gradient(131deg, #036 26.14%, #3E7DBB 239.06%)" }}>
            <div className="self-stretch inline-flex flex-col justify-start items-start gap-2">
                {/* Logo */}
                <div className="self-stretch pb-2 flex flex-col justify-start items-start gap-3">
                    <img src="/logoH.svg" alt="Logo Horizontal" className="w-75" />
                    <div className="self-stretch h-[4px] bg-white rounded-full"></div>
                </div>

                {/* Navigation Items */}
                <div className="flex flex-col gap-1 w-full">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={index} href={item.href} className={`group inline-flex justify-start items-center gap-2 p-1 rounded-xl transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:shadow-md cursor-pointer ${isActive ? "bg-white/10" : ""}`}>
                                <div className="relative w-11 h-11 flex justify-center items-center">
                                    <span className={`${item.icon} text-4xl text-white absolute transition-all duration-300 ${isActive ? "opacity-0 scale-75" : "group-hover:opacity-0 group-hover:scale-75"}`}></span>
                                    <span className={`${item.activeIcon} text-4xl text-white absolute transition-all duration-300 ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"}`}></span>
                                </div>
                                <h1 className={`justify-start text-white text-base font-semibold leading-tight group-hover:text-neutral-100 transition-colors whitespace-pre-line ${isActive ? "text-neutral-100" : ""}`}>{item.label}</h1>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="self-stretch inline-flex flex-col justify-center items-start gap-2">
                <div className="self-stretch px-3 py-2.5 rounded-2xl inline-flex justify-start items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-[0px_0px_20px_rgba(255,255,255,0.2)] cursor-default group" style={{ background: "linear-gradient(99deg, #3E7DBB 0.65%, #73ACE6 117.83%)", }}>
                    <div className="p-2 bg-blue-300 rounded-xl flex justify-start items-center gap-2.5 transition-transform duration-300 group-hover:rotate-12 group-hover:bg-blue-200">
                        <span className="icon-[mdi--peace] text-4xl text-[#3E7DBB] transition-transform duration-300 group-hover:scale-110"></span>
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start">
                        <h1 className="self-stretch justify-start text-sky-950 text-base font-semibold leading-tight">Contribuyendo al ODS 16:</h1>
                        <h1 className="self-stretch justify-start text-sky-950 text-xs font-semibold leading-tight">Paz, Justicia e Instituciones</h1>
                    </div>
                </div>
                <div className="self-stretch inline-flex justify-start items-center gap-3">
                    <div className="px-3 aspect-square bg-gradient-to-br from-cyan-600 to-blue-400 rounded-[45px] inline-flex flex-col justify-center items-center gap-2.5" style={{ background: "linear-gradient(99deg, #3E7DBB 0.65%, #73ACE6 117.83%)", }}>
                        <h1 className="justify-start text-sky-950 text-xl font-semibold">{initials}</h1>
                    </div>
                    <div className="inline-flex flex-col justify-start items-start">
                        <h1 className="self-stretch justify-start text-white text-lg font-semibold leading-tight [text-shadow:_0px_4px_6px_rgb(0_0_0_/_0.25)]">{displayName}</h1>
                        <Link href="/" className="flex justify-start items-center gap-2 text-red-500 text-sm font-semibold leading-tight [text-shadow:_0px_4px_6px_rgb(0_0_0_/_0.25)] cursor-pointer transition-all duration-100 hover:text-red-400 hover:drop-shadow-[0_0_8px_rgba(248,113,113,1)]">
                            Cerrar Sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

