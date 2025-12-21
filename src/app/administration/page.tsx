"use client";
import Sidebar from "@/components/layout/Sidebar";
import { CustomTable, type Column } from "@/components/ui/custom-table";
import { useState } from "react";

export default function Administration() {

    //user management
    const ManagementUserData = [
        {
            id: "1",
            user: "Luis Martínez",
            role: "Alumno",
            action: "",
        },
        {
            id: "2",
            user: "Ana Silva",
            role: "Alumno",
            action: "",
        },
        {
            id: "3",
            user: "Dr. Briceño",
            role: "Profesor",
            action: "",
        },
    ]
    const ManagementUserColumns: Column<typeof ManagementUserData[0]>[] = [
        {
            header: "ID",
            accessorKey: "id",
            className: "font-bold px-4 leading-tight",
        },
        {
            header: "Usuario",
            accessorKey: "user",
            className: "font-bold pl-6",
        },
        {
            header: "Rol",
            accessorKey: "role",
            className: "text-center",
        },
        {
            header: "Accion",
            accessorKey: "action",
            className: "text-gray-400 font-semibold text-base pl-6",
        }
    ]

    //catalog management
    const CatalogUserData = [
        {
            id: "1",
            nombre: "Luis Martínez",
            action: "",
        },
        {
            id: "2",
            nombre: "Ana Silva",
            action: "",
        },
        {
            id: "3",
            nombre: "Dr. Briceño",
            action: "",
        },
    ]
    const CatalogUserColumns: Column<typeof CatalogUserData[0]>[] = [
        {
            header: "ID",
            accessorKey: "id",
            className: "font-bold px-4 leading-tight",
        },
        {
            header: "Nombre",
            accessorKey: "nombre",
            className: "font-bold pl-6",
        },
        {
            header: "Accion",
            accessorKey: "action",
            className: "text-gray-400 font-semibold text-base pl-6",
        }
    ]

    //formalities management
    const FormalitiesUserData = [
        {
            id: "1",
            nombre: "Luis Martínez",
            action: "",
        },
        {
            id: "2",
            nombre: "Ana Silva",
            action: "",
        },
        {
            id: "3",
            nombre: "Dr. Briceño",
            action: "",
        },
    ]
    const FormalitiesUserColumns: Column<typeof FormalitiesUserData[0]>[] = [
        {
            header: "ID",
            accessorKey: "id",
            className: "font-bold px-4 leading-tight",
        },
        {
            header: "Nombre",
            accessorKey: "nombre",
            className: "font-bold pl-6",
        },
        {
            header: "Accion",
            accessorKey: "action",
            className: "text-gray-400 font-semibold text-base pl-6",
        }
    ]

    //center management
    const CenterUserData = [
        {
            id: "1",
            nombre: "Luis Martínez",
            action: "",
        },
        {
            id: "2",
            nombre: "Ana Silva",
            action: "",
        },
        {
            id: "3",
            nombre: "Dr. Briceño",
            action: "",
        },
    ]
    const CenterUserColumns: Column<typeof CenterUserData[0]>[] = [
        {
            header: "ID",
            accessorKey: "id",
            className: "font-bold px-4 leading-tight",
        },
        {
            header: "Nombre",
            accessorKey: "nombre",
            className: "font-bold pl-6",
        },
        {
            header: "Accion",
            accessorKey: "action",
            className: "text-gray-400 font-semibold text-base pl-6",
        }
    ]


    // State for active tab
    const [activeTab, setActiveTab] = useState<"users" | "catalogs" | "formalities" | "centers">("users");

    // Dynamic data and columns based on active tab
    const getTableData = () => {
        switch (activeTab) {
            case "users": return { data: ManagementUserData, columns: ManagementUserColumns };
            case "catalogs": return { data: CatalogUserData, columns: CatalogUserColumns };
            case "formalities": return { data: FormalitiesUserData, columns: FormalitiesUserColumns };
            case "centers": return { data: CenterUserData, columns: CenterUserColumns };
            default: return { data: ManagementUserData, columns: ManagementUserColumns };
        }
    };

    const { data, columns } = getTableData();

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
            <Sidebar />
            <div className="w-full h-full p-6 overflow-y-auto">
                <h1 className="text-2xl font-bold text-sky-950">Administración</h1>
                <h1 className="self-stretch justify-start text-[#325B84] text-2xl font-semibold">Gestiona las cuentas de los usuarios, roles y las maestras del sistemas. </h1>
                {/* Accesos Recientes */}

                <div className="self-stretch w-full p-7 mt-6 bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] inline-flex flex-col justify-start items-start gap-4">
                    <div className="flex gap-4 w-full justify-center">
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === "users" ? "bg-sky-950 text-white" : "bg-gray-200 text-sky-950 hover:bg-gray-300"}`}
                        >
                            Usuarios
                        </button>
                        <button
                            onClick={() => setActiveTab("catalogs")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === "catalogs" ? "bg-sky-950 text-white" : "bg-gray-200 text-sky-950 hover:bg-gray-300"}`}
                        >
                            Catálogos
                        </button>
                        <button
                            onClick={() => setActiveTab("formalities")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === "formalities" ? "bg-sky-950 text-white" : "bg-gray-200 text-sky-950 hover:bg-gray-300"}`}
                        >
                            Trámites
                        </button>
                        <button
                            onClick={() => setActiveTab("centers")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === "centers" ? "bg-sky-950 text-white" : "bg-gray-200 text-sky-950 hover:bg-gray-300"}`}
                        >
                            Centros
                        </button>
                    </div>

                    <div className="flex w-full items-center gap-4 py-4">
                        {/*filtro de perdiodo inferior*/}
                        <div className="flex items-center gap-2">
                            <span className="text-sky-950 font-semibold">Desde:</span>
                            <input type="date" className="bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block w-full p-2.5" />
                        </div>

                        {/*filtro de perdiodo tope */}
                        <div className="flex items-center gap-2">
                            <span className="text-sky-950 font-semibold">Hasta:</span>
                            <input type="date" className="bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block w-full p-2.5" />
                        </div>

                        {/* campo de busqueda*/}
                        <div className="flex-1">
                            <input type="text" placeholder="Buscar..." className="bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block w-full p-2.5" />
                        </div>

                        {/*boton de agregar */}
                        <button className="bg-sky-950 text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#325B84] transition-colors">Agregar</button>
                    </div>
                    <CustomTable
                        data={data as any}
                        columns={columns as any}
                    />
                </div>
            </div>


        </div>
    );
}
