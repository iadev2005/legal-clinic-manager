"use client";
import { CustomTable, type Column } from "@/components/ui/custom-table";
import { useState } from "react";
import AdministrationModal from "@/components/ui/administration-modal";
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal";

export default function AdministrationClient() {
    // State management for all tabs
    const [users, setUsers] = useState([
        {
            id: "V-12345678",
            user: "Luis Martínez",
            role: "Alumno",
            cedulaPrefix: "V",
            cedulaNumber: "12345678",
            nombres: "Luis",
            apellidos: "Martínez",
            correo: "luis@uni.edu",
            sexo: "M",
            telefonoLocal: "",
            telefonoCelular: "04121234567",
            status: "Activo"
        },
        {
            id: "V-87654321",
            user: "Ana Silva",
            role: "Alumno",
            cedulaPrefix: "V",
            cedulaNumber: "87654321",
            nombres: "Ana",
            apellidos: "Silva",
            correo: "ana@uni.edu",
            sexo: "F",
            telefonoLocal: "02125555555",
            telefonoCelular: "04149999999",
            status: "Activo"
        },
        {
            id: "V-11223344",
            user: "Dr. Briceño",
            role: "Profesor",
            cedulaPrefix: "V",
            cedulaNumber: "11223344",
            nombres: "Alberto",
            apellidos: "Briceño",
            correo: "briceno@uni.edu",
            sexo: "M",
            telefonoLocal: "",
            telefonoCelular: "04241112233",
            status: "Activo"
        },
        {
            id: "V-99887766",
            user: "Lic. Rodríguez",
            role: "Coordinador",
            cedulaPrefix: "V",
            cedulaNumber: "99887766",
            nombres: "Carmen",
            apellidos: "Rodríguez",
            correo: "carmen.rod@uni.edu",
            sexo: "F",
            telefonoLocal: "02123334444",
            telefonoCelular: "04145556666",
            status: "Activo"
        },
        {
            id: "V-55667788",
            user: "Ana Pérez",
            role: "Coordinador",
            cedulaPrefix: "V",
            cedulaNumber: "55667788",
            nombres: "Ana",
            apellidos: "Pérez",
            correo: "ana.perez@uni.edu",
            sexo: "F",
            telefonoLocal: "",
            telefonoCelular: "04125556677",
            status: "Inactivo"
        },
    ]);

    const [students, setStudents] = useState([
        { id: "V-87654321", semestre: "202515", tipo: "voluntario", nrc: "15753" },
        { id: "V-87654321", semestre: "2025125", tipo: "Regular", nrc: "15753" },
        { id: "V-12345678", semestre: "202415", tipo: "Regular", nrc: "15753" },
    ])

    const [teachers, setTeachers] = useState([
        { id: "V-11223344", semestre: "202515", tipo: "voluntario", nrc: "15753" },
        { id: "V-11223344", semestre: "2025125", tipo: "fijo", nrc: "15753" },
        { id: "V-99887766", semestre: "202415", tipo: "fijo", nrc: "15753" },
    ])

    const [legalfield, setlegalfield] = useState([
        { id: "1", nombre: "Materia Civil" },
        { id: "2", nombre: "Materia Penal" },
        { id: "3", nombre: "Materia Familiar" },
        { id: "4", nombre: "Materia Laboral" },
        { id: "5", nombre: "LOPNNA" },
        { id: "6", nombre: "Violencia de Género" }
    ])
    const [categorylegalfield, setcategorylegalfield] = useState([
        { id: "1", nombre: "Personas", legalfieldid: "1" },
        { id: "2", nombre: "Tribunales Ordinarios", legalfieldid: "3" },
        { id: "3", nombre: "Suceciones", legalfieldid: "3" },
    ])
    const [subcategorylegalfield, setsubcategorylegalfield] = useState([
        { id: "1", nombre: "Rectificaciones de Acta", categorylegalfieldid: "1" },
        { id: "2", nombre: "Inserciones de Acta", categorylegalfieldid: "1" },
        { id: "3", nombre: "Testamento", categorylegalfieldid: "3" },
    ])

    const [centers, setCenters] = useState([
        { id: "1", nombre: "Tribunales de Municipio" },
        { id: "2", nombre: "Palacio de Justicia" },
        { id: "3", nombre: "Fiscalía General" },
        { id: "4", nombre: "Defensoría del Pueblo" },
    ]);

    const [parishes, setParishes] = useState([
        { id: "1", nombre: "Unare" },
        { id: "2", nombre: "Universidad" },
        { id: "3", nombre: "Cachamay" },
    ]);


    // Active tab state
    const [activeTab, setActiveTab] = useState<"users" | "catalogs" | "formalities" | "centers">("users");

    // Modal States
    const [adminModalOpen, setAdminModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [currentMode, setCurrentMode] = useState<"create" | "edit">("create");
    const [currentItem, setCurrentItem] = useState<any>(null);

    // Selection State
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    // Handlers
    const handleEdit = (item: any) => {
        setCurrentItem(item);
        setCurrentMode("edit");
        setAdminModalOpen(true);
    };

    const handleDelete = (item: any) => {
        setCurrentItem(item); // For single delete
        setSelectedItems([]); // Clear selection to avoid confusion
        setDeleteModalOpen(true);
    };

    const handleBulkDelete = () => {
        setCurrentItem(null); // Indicates multiple delete
        setDeleteModalOpen(true);
    };

    const handleCreate = () => {
        setCurrentItem(null);
        setCurrentMode("create");
        setAdminModalOpen(true);
    };

    const handleSave = (formData: any) => {
        if (currentMode === "create") {
            const newItem = {
                ...formData,
                id: formData.id || Math.random().toString(36).substr(2, 9)
            };

            if (activeTab === "users") setUsers(prev => [...prev, newItem]);
            else if (activeTab === "catalogs") setcategorylegalfield(prev => [...prev, newItem]);
            else if (activeTab === "formalities") setsubcategorylegalfield(prev => [...prev, newItem]);
            else if (activeTab === "centers") setCenters(prev => [...prev, newItem]);
        } else {
            if (activeTab === "users") {
                setUsers(prev => prev.map(u => u.id === currentItem.id ? { ...u, ...formData } : u));
            } else if (activeTab === "catalogs") {
                setcategorylegalfield(prev => prev.map(c => c.id === currentItem.id ? { ...c, ...formData } : c));
            } else if (activeTab === "formalities") {
                setsubcategorylegalfield(prev => prev.map(f => f.id === currentItem.id ? { ...f, ...formData } : f));
            } else if (activeTab === "centers") {
                setCenters(prev => prev.map(c => c.id === currentItem.id ? { ...c, ...formData } : c));
            }
        }
        setAdminModalOpen(false);
    };

    const confirmDelete = () => {
        if (!currentItem && selectedItems.length > 0) {
            const idsToDelete = new Set(selectedItems.map(i => i.id));
            if (activeTab === "users") setUsers(prev => prev.filter(u => !idsToDelete.has(u.id)));
            else if (activeTab === "catalogs") setcategorylegalfield(prev => prev.filter(c => !idsToDelete.has(c.id)));
            else if (activeTab === "formalities") setsubcategorylegalfield(prev => prev.filter(f => !idsToDelete.has(f.id)));
            else if (activeTab === "centers") setCenters(prev => prev.filter(c => !idsToDelete.has(c.id)));
            setSelectedItems([]);
        }
        else if (currentItem) {
            const id = currentItem.id;
            if (activeTab === "users") setUsers(prev => prev.filter(u => u.id !== id));
            else if (activeTab === "catalogs") setcategorylegalfield(prev => prev.filter(c => c.id !== id));
            else if (activeTab === "formalities") setsubcategorylegalfield(prev => prev.filter(f => f.id !== id));
            else if (activeTab === "centers") setCenters(prev => prev.filter(c => c.id !== id));
        }
        setDeleteModalOpen(false);
        setCurrentItem(null);
    };

    const ManagementUserColumns: Column<typeof users[0]>[] = [
        { header: "ID", accessorKey: "id", className: "font-bold px-4 leading-tight" },
        { header: "Usuario", accessorKey: "user", className: "font-bold pl-6" },
        {
            header: "Rol",
            accessorKey: "role",
            className: "text-center",
            render: (row) => {
                const role = row.role;
                let badgeClass = "bg-gray-100 text-gray-800";

                if (role === "Profesor") {
                    badgeClass = "bg-[#D1E4FF] text-[#004A77]";
                } else if (role === "Alumno" || role === "Estudiante") {
                    badgeClass = "bg-[#D1F7D6] text-[#005C2B]";
                } else if (role === "Coordinador" || role === "Admin") {
                    badgeClass = "bg-[#FFF8C5] text-[#8A6A00]";
                }

                return (
                    <div className="flex justify-center">
                        <span className={`px-4 py-1 rounded-full font-bold text-sm ${badgeClass}`}>
                            {role}
                        </span>
                    </div>
                );
            }
        },
        { header: "Correo", accessorKey: "correo", className: "text-center" },
        {
            header: "Estatus",
            accessorKey: "status",
            className: "text-center",
            render: (row) => {
                const status = row.status;
                let badgeClass = "bg-gray-100 text-gray-800";

                if (status === "Inactivo") {
                    badgeClass = "bg-[#FFD1D1] text-[#FF0000]";
                } else if (status === "Activo") {
                    badgeClass = "bg-[#D1F7D6] text-[#005C2B]";
                }

                return (
                    <div className="flex justify-center">
                        <span className={`px-4 py-1 rounded-full font-bold text-sm ${badgeClass}`}>
                            {status}
                        </span>
                    </div>
                );
            }
        },
        {
            header: "Accion",
            render: (row) => (
                <div className="flex gap-2 justify-center">
                    <button onClick={() => handleEdit(row)} className="w-10 h-10 flex justify-center items-center hover:bg-blue-100 rounded-lg transition-colors group cursor-pointer" title="Editar">
                        <span className="icon-[uil--pen] text-3xl text-[#003366] group-hover:scale-110 transition-transform"></span>
                    </button>
                    <button onClick={() => handleDelete(row)} className="w-10 h-10 flex justify-center items-center hover:bg-red-100 rounded-lg transition-colors group cursor-pointer" title="Eliminar">
                        <span className="icon-[mdi--trash-can-outline] text-3xl text-red-600 group-hover:scale-110 transition-transform"></span>
                    </button>
                </div>
            ),
            className: "text-gray-400 font-semibold text-base pl-6",
        }
    ];

    const GenericColumns: Column<{ id: string; nombre: string }>[] = [
        { header: "ID", accessorKey: "id", className: "font-bold px-4 leading-tight" },
        { header: "Nombre", accessorKey: "nombre", className: "font-bold pl-6" },
        {
            header: "Accion",
            render: (row) => (
                <div className="flex gap-2 justify-center">
                    <button onClick={() => handleEdit(row)} className="w-10 h-10 flex justify-center items-center hover:bg-blue-100 rounded-lg transition-colors group cursor-pointer" title="Editar">
                        <span className="icon-[uil--pen] text-3xl text-[#003366] group-hover:scale-110 transition-transform"></span>
                    </button>
                    <button onClick={() => handleDelete(row)} className="w-10 h-10 flex justify-center items-center hover:bg-red-100 rounded-lg transition-colors group cursor-pointer" title="Eliminar">
                        <span className="icon-[mdi--trash-can-outline] text-3xl text-red-600 group-hover:scale-110 transition-transform"></span>
                    </button>
                </div>
            ),
            className: "text-gray-400 font-semibold text-base pl-6",
        },
    ];

    const getTableData = () => {
        switch (activeTab) {
            case "users": return { data: users, columns: ManagementUserColumns };
            case "catalogs": return { data: categorylegalfield, columns: GenericColumns };
            case "formalities": return { data: subcategorylegalfield, columns: GenericColumns };
            case "centers": return { data: centers, columns: GenericColumns };
            default: return { data: users, columns: ManagementUserColumns };
        }
    };

    const { data, columns } = getTableData();

    return (
        <div className="w-full h-full p-6 overflow-y-auto">
            <div className="self-stretch flex flex-col justify-start items-start">
                <h1 className="self-stretch justify-start text-sky-950 text-6xl font-semibold">Administración</h1>
                <h1 className="self-stretch justify-start text-[#325B84] text-2xl font-semibold">Gestiona las cuentas de los usuarios, roles y las maestras del sistemas. </h1>
            </div>

            <div className="self-stretch w-full p-7 mt-6 bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] inline-flex flex-col justify-start items-start gap-4">
                <div className="flex gap-4 w-full justify-center">
                    <button onClick={() => { setActiveTab("users"); setSelectedItems([]); }} className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${activeTab === "users" ? "bg-sky-950 text-white" : "bg-gray-200 text-sky-950 hover:bg-gray-300"}`}>Usuarios</button>
                    <button onClick={() => { setActiveTab("catalogs"); setSelectedItems([]); }} className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${activeTab === "catalogs" ? "bg-sky-950 text-white" : "bg-gray-200 text-sky-950 hover:bg-gray-300"}`}>Catálogos</button>
                    <button onClick={() => { setActiveTab("formalities"); setSelectedItems([]); }} className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${activeTab === "formalities" ? "bg-sky-950 text-white" : "bg-gray-200 text-sky-950 hover:bg-gray-300"}`}>Trámites</button>
                    <button onClick={() => { setActiveTab("centers"); setSelectedItems([]); }} className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${activeTab === "centers" ? "bg-sky-950 text-white" : "bg-gray-200 text-sky-950 hover:bg-gray-300"}`}>Centros</button>
                </div>

                <div className="flex w-full items-center gap-4 py-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sky-950 font-semibold">Desde:</span>
                        <input type="date" className="bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block w-full p-2.5" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sky-950 font-semibold">Hasta:</span>
                        <input type="date" className="bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block w-full p-2.5" />
                    </div>
                    <div className="flex-1">
                        <input type="text" placeholder="Buscar..." className="bg-white border border-gray-300 text-sky-950 text-sm rounded-lg focus:ring-sky-950 focus:border-sky-950 block w-full p-2.5" />
                    </div>
                    {selectedItems.length > 0 ? (
                        <button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-2">
                            <span className="icon-[mdi--trash-can-outline] text-xl"></span> Eliminar ({selectedItems.length})
                        </button>
                    ) : (
                        <button onClick={handleCreate} className="bg-sky-950 text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#325B84] transition-colors cursor-pointer">Agregar</button>
                    )}
                </div>
                <CustomTable
                    data={data as any}
                    columns={columns as any}
                    enableSelection={true}
                    onSelectionChange={setSelectedItems}
                    selectedItems={selectedItems}
                />
            </div>

            <AdministrationModal
                open={adminModalOpen}
                onClose={() => setAdminModalOpen(false)}
                onSave={handleSave}
                item={currentItem}
                mode={currentMode}
                type={activeTab}
                parishes={parishes}
                participations={
                    activeTab === "users" && currentItem
                        ? [
                            ...(students.filter(s => s.id === currentItem.id)),
                            ...(teachers.filter(t => t.id === currentItem.id))
                        ]
                        : []
                }
            />

            <DeleteConfirmationModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
