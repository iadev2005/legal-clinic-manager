"use client";
import { CustomTable, type Column } from "@/components/ui/custom-table";
import { useState, useEffect } from "react";
import AdministrationModal from "@/components/ui/administration-modal";
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal";
import BulkUploadModal from "@/components/ui/bulk-upload-modal";
import {
    getUsuarios, createUsuario, updateUsuario, deleteUsuario, toggleUsuarioStatus, getParticipacionesUsuario,
    getCategorias, createCategoria, updateCategoria, deleteCategoria,
    getSubCategorias, createSubCategoria, updateSubCategoria, deleteSubCategoria,
    getLegalField, createLegalField, updateLegalField, deleteLegalField,
    getNucleos, createNucleo, updateNucleo, deleteNucleo,
    getMaterias, getSemestres, createSemestre, updateSemestre, deleteSemestre
} from "@/actions/administracion";
import { getParroquias, getEstados, getMunicipiosByEstado } from "@/actions/solicitantes";
import Pagination from "@/components/ui/pagination";
import SearchInput from "@/components/ui/search-input";
import FilterSelect from "@/components/ui/filter-select";
import LoadingScreen from "@/components/ui/loading-screen";


export default function Administration({ currentUser }: { currentUser: any }) {
    // State management for all tabs
    const [users, setUsers] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [legalfield, setlegalfield] = useState<any[]>([]);
    const [categorylegalfield, setcategorylegalfield] = useState<any[]>([]);
    const [subcategorylegalfield, setsubcategorylegalfield] = useState<any[]>([]);
    const [ambitoslegales, setambitoslegales] = useState<any[]>([]);
    const [centers, setCenters] = useState<any[]>([]);
    const [parishes, setParishes] = useState<any[]>([]);
    const [semestres, setSemestres] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para filtros generales
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Estados para filtros específicos
    // Usuarios
    const [filtroRol, setFiltroRol] = useState<string>("");
    const [filtroEstatus, setFiltroEstatus] = useState<string>("");
    const [filtroSemestre, setFiltroSemestre] = useState<string>("");

    // Categorías
    const [filtroMateria, setFiltroMateria] = useState<string>("");

    // Subcategorías
    const [filtroCategoria, setFiltroCategoria] = useState<string>("");

    // Centros
    const [estados, setEstados] = useState<any[]>([]);
    const [municipios, setMunicipios] = useState<any[]>([]);
    const [filtroEstado, setFiltroEstado] = useState<string>("");
    const [filtroMunicipio, setFiltroMunicipio] = useState<string>("");

    // Semestres
    const [filtroEstadoSemestre, setFiltroEstadoSemestre] = useState<string>("");

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Cargar usuarios
            const usuariosRes = await getUsuarios();
            if (usuariosRes.success) {
                setUsers(usuariosRes.data || []);
            }

            // Cargar categorías
            const categoriasRes = await getCategorias();
            if (categoriasRes.success) {
                setcategorylegalfield(categoriasRes.data || []);
            }

            // Cargar subcategorías
            const subcategoriasRes = await getSubCategorias();
            if (subcategoriasRes.success) {
                setsubcategorylegalfield(subcategoriasRes.data || []);
            }

            // Cargar ámbitos legales
            const legalfieldRes = await getLegalField();
            if (legalfieldRes.success) {
                setambitoslegales(legalfieldRes.data || []);
            }

            // Cargar núcleos
            const nucleosRes = await getNucleos();
            if (nucleosRes.success) {
                setCenters(nucleosRes.data || []);
            }

            // Cargar materias
            const materiasRes = await getMaterias();
            if (materiasRes.success) {
                const materiasData = materiasRes.data || [];
                // Asegurar que todas las materias tengan el campo 'id'
                const materiasNormalizadas = materiasData.map((m: any) => ({
                    id: String(m.id || m.id_materia || ''),
                    nombre: m.nombre || m.nombre_materia || ''
                })).filter((m: any) => m.id && m.id !== 'undefined' && m.id !== 'null');
                console.log('Materias cargadas:', materiasNormalizadas);
                setlegalfield(materiasNormalizadas);
            }

            // Cargar parroquias
            const parroquiasRes = await getParroquias();
            if (parroquiasRes.success && parroquiasRes.data) {
                setParishes(parroquiasRes.data.map((p: any) => ({
                    id: p.id_parroquia.toString(),
                    nombre: p.nombre_parroquia
                })));
            }

            // Cargar estados
            const estadosRes = await getEstados();
            if (estadosRes.success) {
                setEstados(estadosRes.data || []);
            }

            // Cargar semestres
            const semestresRes = await getSemestres();
            if (semestresRes.success) {
                setSemestres(semestresRes.data || []);
            }
        } catch (err: any) {
            setError(err.message || 'Error al cargar datos');
            console.error('Error al cargar datos:', err);
        } finally {
            setLoading(false);
        }
    };

    // Cargar municipios cuando se selecciona un estado
    useEffect(() => {
        if (filtroEstado) {
            const estadoId = parseInt(filtroEstado);
            if (!isNaN(estadoId)) {
                getMunicipiosByEstado(estadoId).then((result) => {
                    if (result.success) {
                        setMunicipios(result.data || []);
                    }
                });
                setFiltroMunicipio(""); // Reset municipio cuando cambia el estado
            }
        } else {
            setMunicipios([]);
            setFiltroMunicipio("");
        }
    }, [filtroEstado]);

    // Active tab state
    const [activeTab, setActiveTab] = useState<"users" | "subcatalogs" | "legalfield" | "centers" | "semestres">("users");

    // Limpiar selección cuando cambia la pestaña activa
    useEffect(() => {
        setSelectedItems([]);
        setCurrentPage(1);
    }, [activeTab]);

    // Limpiar selección cuando se aplican filtros
    useEffect(() => {
        setSelectedItems([]);
        setCurrentPage(1);
    }, [searchTerm, filtroRol, filtroEstatus, filtroMateria, filtroCategoria, filtroEstado, filtroMunicipio, filtroEstadoSemestre]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Modal States
    const [adminModalOpen, setAdminModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
    const [currentMode, setCurrentMode] = useState<"create" | "edit">("create");
    const [currentItem, setCurrentItem] = useState<any>(null);

    // Selection State
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    // Handlers
    const handleEdit = async (item: any) => {
        setCurrentItem(item);
        setCurrentMode("edit");

        // Si es usuario, cargar participaciones
        if (activeTab === "users") {
            const participacionesRes = await getParticipacionesUsuario(item.id);
            if (participacionesRes.success) {
                setStudents(participacionesRes.data.filter((p: any) => p.tipo === 'Voluntario' || p.tipo === 'Inscrito' || p.tipo === 'Egresado'));
                setTeachers(participacionesRes.data.filter((p: any) => p.tipo === 'Voluntario' || p.tipo === 'Asesor' || p.tipo === 'Titular'));
            }
        }

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

    const [toggleModalOpen, setToggleModalOpen] = useState(false);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const handleCreate = () => {
        setCurrentItem(null);
        setCurrentMode("create");
        setAdminModalOpen(true);
    };

    const handleToggleStatus = (item: any) => {
        setCurrentItem(item);
        setToggleModalOpen(true);
    };

    const handleBulkToggle = () => {
        setCurrentItem(null); // Indicates multiple
        setToggleModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        const itemsToProcess = currentItem ? [currentItem] : selectedItems;

        if (itemsToProcess.length === 0) return;

        let errorCount = 0;
        let successCount = 0;

        for (const item of itemsToProcess) {
            try {
                const result = await toggleUsuarioStatus(item.id);
                if (!result.success) {
                    // console.error(`Error with ${item.user}: ${result.error}`);
                    errorCount++;
                } else {
                    successCount++;
                }
            } catch (err: any) {
                errorCount++;
            }
        }

        if (errorCount > 0) {
            if (successCount > 0) {
                alert(`Se procesaron ${successCount} usuarios. Hubo ${errorCount} errores (posiblemente por permisos).`);
            } else {
                alert(`No se pudieron procesar los usuarios seleccionados (posiblemente por permisos).`);
            }
        }

        await loadData();
        setToggleModalOpen(false);
        setCurrentItem(null);
        setSelectedItems([]); // Clear selection after processing
    };

    const handleSave = async (formData: any) => {
        try {
            if (currentMode === "create") {
                if (activeTab === "users") {
                    const result = await createUsuario(formData);
                    if (result.success) {
                        await loadData();
                        setAdminModalOpen(false);
                    } else {
                        throw new Error(result.error || 'Error al crear usuario');
                    }
                } else if (activeTab === "subcatalogs") {
                    const result = await createSubCategoria(formData);
                    if (result.success) {
                        await loadData();
                        setAdminModalOpen(false);
                    } else {
                        throw new Error(result.error || 'Error al crear subcategoría');
                    }
                } else if (activeTab === "legalfield") {
                    const result = await createLegalField(formData);
                    if (result.success) {
                        await loadData();
                        setAdminModalOpen(false);
                    } else {
                        throw new Error(result.error || 'Error al crear ámbito legal');
                    }
                } else if (activeTab === "centers") {
                    const result = await createNucleo(formData);
                    if (result.success) {
                        await loadData();
                        setAdminModalOpen(false);
                    } else {
                        throw new Error(result.error || 'Error al crear núcleo');
                    }
                } else if (activeTab === "semestres") {
                    const result = await createSemestre(formData);
                    if (result.success) {
                        await loadData();
                        setAdminModalOpen(false);
                    } else {
                        throw new Error(result.error || 'Error al crear semestre');
                    }
                }
            } else {
                // Edit mode
                if (activeTab === "users") {
                    const result = await updateUsuario(currentItem.id, formData);
                    if (result.success) {
                        await loadData();
                        setAdminModalOpen(false);
                    } else {
                        throw new Error(result.error || 'Error al actualizar usuario');
                    }
                } else if (activeTab === "subcatalogs") {
                    const result = await updateSubCategoria(currentItem.id, formData);
                    if (result.success) {
                        await loadData();
                        setAdminModalOpen(false);
                    } else {
                        throw new Error(result.error || 'Error al actualizar subcategoría');
                    }
                } else if (activeTab === "legalfield") {
                    const result = await updateLegalField(currentItem.id, formData);
                    if (result.success) {
                        await loadData();
                        setAdminModalOpen(false);
                    } else {
                        throw new Error(result.error || 'Error al actualizar ámbito legal');
                    }
                } else if (activeTab === "centers") {
                    const result = await updateNucleo(currentItem.id, formData);
                    if (result.success) {
                        await loadData();
                        setAdminModalOpen(false);
                    } else {
                        throw new Error(result.error || 'Error al actualizar núcleo');
                    }
                } else if (activeTab === "semestres") {
                    const result = await updateSemestre(currentItem.id, formData);
                    if (result.success) {
                        await loadData();
                        setAdminModalOpen(false);
                    } else {
                        throw new Error(result.error || 'Error al actualizar semestre');
                    }
                }
            }
        } catch (err: any) {
            console.error('Error en handleSave:', err);
            throw err; // Re-lanzar para que el modal lo capture y muestre
        }
    };

    const confirmDelete = async () => {
        try {
            // Bulk Delete
            if (!currentItem && selectedItems.length > 0) {
                for (const item of selectedItems) {
                    if (activeTab === "users") {
                        await deleteUsuario(item.id);
                    } else if (activeTab === "subcatalogs") {
                        await deleteSubCategoria(item.id);
                    } else if (activeTab === "legalfield") {
                        await deleteLegalField(item.id);
                    } else if (activeTab === "centers") {
                        await deleteNucleo(item.id);
                    } else if (activeTab === "semestres") {
                        await deleteSemestre(item.id);
                    }
                }
                setSelectedItems([]);
                await loadData();
            }
            // Single Delete
            else if (currentItem) {
                const id = currentItem.id;
                if (activeTab === "users") {
                    const result = await deleteUsuario(id);
                    if (!result.success) {
                        alert(result.error || 'Error al eliminar usuario');
                        return;
                    }
                } else if (activeTab === "subcatalogs") {
                    const result = await deleteSubCategoria(id);
                    if (!result.success) {
                        alert(result.error || 'Error al eliminar subcategoría');
                        return;
                    }
                } else if (activeTab === "legalfield") {
                    const result = await deleteLegalField(id);
                    if (!result.success) {
                        alert(result.error || 'Error al eliminar ámbito legal');
                        return;
                    }
                } else if (activeTab === "centers") {
                    const result = await deleteNucleo(id);
                    if (!result.success) {
                        alert(result.error || 'Error al eliminar núcleo');
                        return;
                    }
                } else if (activeTab === "semestres") {
                    const result = await deleteSemestre(id);
                    if (!result.success) {
                        alert(result.error || 'Error al eliminar semestre');
                        return;
                    }
                }
                await loadData();
            }
            setDeleteModalOpen(false);
            setCurrentItem(null);
        } catch (err: any) {
            alert(err.message || 'Error al eliminar');
            console.error('Error en confirmDelete:', err);
        }
    };

    // Columns definitions
    const ManagementUserColumns: Column<typeof users[0]>[] = [
        { header: "ID", accessorKey: "id", className: "font-bold px-2 py-2 text-xs leading-tight" },
        { header: "Usuario", accessorKey: "user", className: "font-bold pl-2 py-2 text-sm" },
        {
            header: "Rol",
            accessorKey: "role",
            className: "text-center py-2",
            render: (row) => {
                const role = row.role;
                let badgeClass = "bg-gray-100 text-gray-800"; // default

                if (role === "Profesor") {
                    badgeClass = "bg-[#D1E4FF] text-[#004A77]"; // Blue variant
                } else if (role === "Alumno" || role === "Estudiante") {
                    badgeClass = "bg-[#D1F7D6] text-[#005C2B]"; // Green variant
                } else if (role === "Coordinador" || role === "Admin") {
                    badgeClass = "bg-[#FFF8C5] text-[#8A6A00]"; // Yellow/Gold variant
                }

                return (
                    <div className="flex justify-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${badgeClass}`}>
                            {role}
                        </span>
                    </div>
                );
            }
        },
        { header: "Correo", accessorKey: "correo", className: "text-center text-xs py-2" },
        {
            header: "Estatus",
            accessorKey: "status",
            className: "text-center py-2",
            render: (row) => {
                const status = row.status;
                let badgeClass = "bg-gray-100 text-gray-800"; // default

                if (status === "Inactivo") {
                    badgeClass = "bg-[#FFD1D1] text-[#FF0000]"; // Blue variant
                } else if (status === "Activo") {
                    badgeClass = "bg-[#D1F7D6] text-[#005C2B]"; // Green variant
                }

                return (
                    <div className="flex justify-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${badgeClass}`}>
                            {status}
                        </span>
                    </div>
                );
            }
        },
        {
            header: "Accion",
            render: (row) => {
                const canChangeStatus = () => {
                    const myRole = currentUser?.rol;
                    const targetRole = row.role;

                    // Si soy Profesor, no puedo tocar Coordinador ni Admin
                    if (myRole === 'Profesor') {
                        if (targetRole === 'Coordinador' || targetRole === 'Administrador' || targetRole === 'Admin') return false;
                    }

                    // Si soy Coordinador, no puedo tocar Admin
                    if (myRole === 'Coordinador') {
                        if (targetRole === 'Administrador' || targetRole === 'Admin') return false;
                    }

                    return true;
                };

                const isDisabled = !canChangeStatus();

                const onToggle = () => {
                    if (isDisabled) return;
                    handleToggleStatus(row);
                };

                return (
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => handleEdit(row)}
                            className="w-10 h-10 flex justify-center items-center hover:bg-blue-100 rounded-lg transition-colors group cursor-pointer"
                            title="Editar"
                        >
                            <span className="icon-[uil--pen] text-3xl text-[#003366] group-hover:scale-110 transition-transform"></span>
                        </button>
                        <button
                            onClick={onToggle}
                            disabled={isDisabled}
                            className={`w-10 h-10 flex justify-center items-center rounded-lg transition-colors group cursor-pointer ${isDisabled ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'hover:bg-red-100'}`}
                            title={isDisabled ? "No tienes permisos para modificar este usuario" : "Cambiar Estatus"}
                        >
                            <span className={`icon-[mdi--swap-horizontal] text-3xl ${isDisabled ? 'text-gray-400' : 'text-red-600'} group-hover:scale-110 transition-transform`}></span>
                        </button>
                    </div>
                );
            },
            className: "text-gray-400 font-semibold text-sm pl-2 py-2",
        }
    ];

    const GenericColumns: Column<{ id: string; nombre: string }>[] = [
        { header: "ID", accessorKey: "id", className: "font-bold px-2 py-2 text-xs leading-tight" },
        { header: "Nombre", accessorKey: "nombre", className: "font-bold pl-2 py-2 text-sm" },
        {
            header: "Accion",
            render: (row) => (
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => handleEdit(row)}
                        className="w-10 h-10 flex justify-center items-center hover:bg-blue-100 rounded-lg transition-colors group cursor-pointer"
                        title="Editar"
                    >
                        <span className="icon-[uil--pen] text-3xl text-[#003366] group-hover:scale-110 transition-transform"></span>
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="w-10 h-10 flex justify-center items-center hover:bg-red-100 rounded-lg transition-colors group cursor-pointer"
                        title="Eliminar"
                    >
                        <span className="icon-[mdi--trash-can-outline] text-3xl text-red-600 group-hover:scale-110 transition-transform"></span>
                    </button>
                </div>
            ),
            className: "text-gray-400 font-semibold text-sm pl-2 py-2",
        },
    ];

    const SemestresColumns: Column<any>[] = [
        { header: "Término", accessorKey: "term", className: "font-bold px-2 py-2 text-sm" },
        {
            header: "Fecha Inicio",
            accessorKey: "fecha_inicio",
            className: "text-center py-2",
            render: (row) => {
                const fecha = new Date(row.fecha_inicio);
                return fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
            }
        },
        {
            header: "Fecha Final",
            accessorKey: "fecha_final",
            className: "text-center py-2",
            render: (row) => {
                const fecha = new Date(row.fecha_final);
                return fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
            }
        },
        {
            header: "Estado",
            accessorKey: "estado",
            className: "text-center py-2",
            render: (row) => {
                const estado = row.estado || 'Finalizado';
                let badgeClass = "bg-gray-100 text-gray-800"; // default

                if (estado === "Activo") {
                    badgeClass = "bg-[#D1F7D6] text-[#005C2B]"; // Green variant
                } else if (estado === "Pendiente") {
                    badgeClass = "bg-[#FFF8C5] text-[#8A6A00]"; // Yellow variant
                } else if (estado === "Finalizado") {
                    badgeClass = "bg-gray-200 text-gray-600"; // Gray variant
                }

                return (
                    <div className="flex justify-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${badgeClass}`}>
                            {estado}
                        </span>
                    </div>
                );
            }
        },
        {
            header: "Accion",
            render: (row) => (
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => handleEdit(row)}
                        className="w-10 h-10 flex justify-center items-center hover:bg-blue-100 rounded-lg transition-colors group cursor-pointer"
                        title="Editar"
                    >
                        <span className="icon-[uil--pen] text-3xl text-[#003366] group-hover:scale-110 transition-transform"></span>
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="w-10 h-10 flex justify-center items-center hover:bg-red-100 rounded-lg transition-colors group cursor-pointer"
                        title="Eliminar"
                    >
                        <span className="icon-[mdi--trash-can-outline] text-3xl text-red-600 group-hover:scale-110 transition-transform"></span>
                    </button>
                </div>
            ),
            className: "text-gray-400 font-semibold text-sm pl-2 py-2",
        },
    ];

    // Función para filtrar datos según el tipo de tabla
    const filterData = (data: any[], tab: string) => {
        let filtered = [...data];

        // Función helper para buscar en cualquier campo de texto
        const searchInField = (value: any, searchLower: string): boolean => {
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(searchLower);
        };

        switch (tab) {
            case "users":
                // Filtro por búsqueda de texto (nombre, cédula)
                if (searchTerm.trim()) {
                    const searchLower = searchTerm.toLowerCase().trim();
                    filtered = filtered.filter((item) => {
                        const cedulaCompleta = `${item.cedulaPrefix || ''}-${item.cedulaNumber || ''}`;
                        return (
                            searchInField(item.id, searchLower) ||
                            searchInField(item.user, searchLower) ||
                            searchInField(item.nombres, searchLower) ||
                            searchInField(item.apellidos, searchLower) ||
                            searchInField(item.correo, searchLower) ||
                            searchInField(cedulaCompleta, searchLower)
                        );
                    });
                }
                // Filtro por rol
                if (filtroRol) {
                    filtered = filtered.filter((item) =>
                        item.role?.toLowerCase() === filtroRol.toLowerCase()
                    );
                }
                // Filtro por estatus
                if (filtroEstatus) {
                    filtered = filtered.filter((item) =>
                        item.status?.toLowerCase() === filtroEstatus.toLowerCase()
                    );
                }
                // Filtro por semestre
                if (filtroSemestre) {
                    filtered = filtered.filter((item) =>
                        item.semesters?.includes(filtroSemestre)
                    );
                }
                break;

            case "subcatalogs":
                // Filtro por búsqueda de texto
                if (searchTerm.trim()) {
                    const searchLower = searchTerm.toLowerCase().trim();
                    filtered = filtered.filter((item) =>
                        searchInField(item.id, searchLower) ||
                        searchInField(item.nombre, searchLower)
                    );
                }
                // Filtro por Materia (nuevo)
                if (filtroMateria) {
                    filtered = filtered.filter((item) =>
                        String(item.id_materia) === String(filtroMateria)
                    );
                }
                // Filtro por Categoría (para Civil)
                if (filtroCategoria) {
                    filtered = filtered.filter((item) =>
                        item.categorymateriaid === filtroCategoria
                    );
                }
                break;

            case "legalfield":
                // Filtro por búsqueda de texto
                if (searchTerm.trim()) {
                    const searchLower = searchTerm.toLowerCase().trim();
                    filtered = filtered.filter((item) =>
                        searchInField(item.id, searchLower) ||
                        searchInField(item.nombre, searchLower)
                    );
                }
                // Filtro por subcategoría (longid contiene num_subcategoria-num_categoria-id_materia)
                if (filtroCategoria) {
                    filtered = filtered.filter((item) =>
                        item.longid === filtroCategoria
                    );
                }
                break;

            case "centers":
                // Filtro por búsqueda de texto
                if (searchTerm.trim()) {
                    const searchLower = searchTerm.toLowerCase().trim();
                    filtered = filtered.filter((item) =>
                        searchInField(item.id, searchLower) ||
                        searchInField(item.nombre, searchLower)
                    );
                }
                // Filtro por estado
                if (filtroEstado) {
                    const estadoId = parseInt(filtroEstado);
                    if (!isNaN(estadoId)) {
                        filtered = filtered.filter((item) =>
                            item.id_estado === estadoId
                        );
                    }
                }
                // Filtro por municipio
                if (filtroMunicipio) {
                    const municipioId = parseInt(filtroMunicipio);
                    if (!isNaN(municipioId)) {
                        filtered = filtered.filter((item) =>
                            item.id_municipio === municipioId
                        );
                    }
                }
                break;

            case "semestres":
                // Filtro por búsqueda de texto (term)
                if (searchTerm.trim()) {
                    const searchLower = searchTerm.toLowerCase().trim();
                    filtered = filtered.filter((item) =>
                        searchInField(item.term, searchLower) ||
                        searchInField(item.fecha_inicio, searchLower) ||
                        searchInField(item.fecha_final, searchLower)
                    );
                }
                // Filtro por estado
                if (filtroEstadoSemestre) {
                    filtered = filtered.filter((item) =>
                        item.estado?.toLowerCase() === filtroEstadoSemestre.toLowerCase()
                    );
                }
                break;
        }

        return filtered;
    };

    // Dynamic data and columns based on active tab
    const getTableData = () => {
        let rawData: any[] = [];
        let columns: Column<any>[] = [];

        switch (activeTab) {
            case "users":
                rawData = users;
                columns = ManagementUserColumns;
                break;
            case "subcatalogs":
                rawData = subcategorylegalfield;
                columns = GenericColumns;
                break;
            case "legalfield":
                rawData = ambitoslegales;
                columns = GenericColumns;
                break;
            case "centers":
                rawData = centers;
                columns = GenericColumns;
                break;
            case "semestres":
                rawData = semestres;
                columns = SemestresColumns;
                break;
            default:
                rawData = users;
                columns = ManagementUserColumns;
        }

        // Aplicar filtros
        const filteredData = filterData(rawData, activeTab);

        return { data: filteredData, columns };
    };

    const { data: fullFilteredData, columns } = getTableData();

    // Pagination Logic
    const totalPages = Math.ceil(fullFilteredData.length / ITEMS_PER_PAGE);
    const paginatedData = fullFilteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <LoadingScreen
                    message="Cargando administración..."
                    subMessage="Por favor espera mientras se cargan los datos"
                    size="lg"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-screen min-h-screen bg-neutral-50 inline-flex justify-start items-center overflow-hidden">
                <div className="w-full h-full p-6 overflow-y-auto flex items-center justify-center">
                    <div className="text-red-600 text-xl">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 flex flex-col justify-start items-center overflow-hidden">
            <div className="w-full h-full p-6 flex flex-col overflow-hidden">
                <div className="self-stretch flex flex-col justify-start items-start flex-none">
                    <h1 className="self-stretch justify-start text-sky-950 text-4xl font-bold tracking-tight">Administración</h1>
                    <h1 className="self-stretch justify-start text-[#325B84] text-lg font-medium">Gestiona las cuentas de los usuarios, roles y las maestras del sistemas. </h1>
                </div>

                <div className="self-stretch w-full p-7 mt-6 bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] flex flex-col justify-start items-start gap-4 flex-1 min-h-0 overflow-hidden">
                    <div className="flex gap-4 w-full justify-center">
                        <button
                            onClick={() => {
                                setActiveTab("users");
                                setSelectedItems([]);
                                setSearchTerm("");
                                setFiltroRol("");
                                setFiltroEstatus("");
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${activeTab === "users" ? "bg-sky-950 text-white" : "bg-gray-200 text-sky-950 hover:bg-gray-300"}`}
                        >
                            Usuarios
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("subcatalogs");
                                setSelectedItems([]);
                                setSearchTerm("");
                                setFiltroMateria("");
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${activeTab === "subcatalogs" ? "bg-sky-950 text-white" : "bg-gray-200 text-sky-950 hover:bg-gray-300"}`}
                        >
                            SubCatálogos
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("legalfield");
                                setSelectedItems([]);
                                setSearchTerm("");
                                setFiltroCategoria("");
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${activeTab === "legalfield" ? "bg-sky-950 text-white" : "bg-gray-200 text-sky-950 hover:bg-gray-300"}`}
                        >
                            Ambitos Legales
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("centers");
                                setSelectedItems([]);
                                setSearchTerm("");
                                setFiltroEstado("");
                                setFiltroMunicipio("");
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${activeTab === "centers" ? "bg-sky-950 text-white" : "bg-gray-200 text-sky-950 hover:bg-gray-300"}`}
                        >
                            Centros
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("semestres");
                                setSelectedItems([]);
                                setSearchTerm("");
                                setFiltroEstadoSemestre("");
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${activeTab === "semestres" ? "bg-sky-950 text-white" : "bg-gray-200 text-sky-950 hover:bg-gray-300"}`}
                        >
                            Semestres
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 py-4 w-full">
                        <div className="flex flex-wrap items-center gap-4 w-full">
                            {/* Campo de búsqueda - siempre visible */}
                            <div className="flex-1 min-w-[200px]">
                                <SearchInput
                                    placeholder={activeTab === "users" ? "Buscar por nombre, cédula..." : "Buscar..."}
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    className="w-full"
                                />
                            </div>

                            {/* Botón de Filtros */}
                            <button
                                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                                className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer border-2 ${isFilterPanelOpen
                                    ? "bg-[#003366] text-white border-[#003366]"
                                    : "bg-white text-[#003366] border-neutral-200 hover:border-[#003366]"
                                    }`}
                            >
                                <span className="icon-[mdi--filter-variant] text-lg"></span>
                                Filtros
                                {(() => {
                                    /* Calculate active filters count */
                                    let activeCount = 0;
                                    if (activeTab === "users") {
                                        if (filtroRol) activeCount++;
                                        if (filtroEstatus) activeCount++;
                                        if (filtroSemestre) activeCount++;
                                    } else if (activeTab === "subcatalogs") {
                                        if (filtroMateria) activeCount++;
                                        if (filtroCategoria) activeCount++;
                                    } else if (activeTab === "legalfield") {
                                        if (filtroCategoria) activeCount++;
                                    } else if (activeTab === "centers") {
                                        if (filtroEstado) activeCount++;
                                        if (filtroMunicipio) activeCount++;
                                    } else if (activeTab === "semestres") {
                                        if (filtroEstadoSemestre) activeCount++;
                                    }
                                    return activeCount > 0 ? (
                                        <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                            {activeCount}
                                        </span>
                                    ) : null;
                                })()}
                                <span className={`icon-[mdi--chevron-down] text-lg transition-transform duration-300 ${isFilterPanelOpen ? "rotate-180" : ""
                                    }`}></span>
                            </button>

                            {/* Botón para limpiar filtros */}
                            {(searchTerm || filtroRol || filtroEstatus || filtroMateria || filtroCategoria || filtroEstado || filtroMunicipio || filtroEstadoSemestre) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFiltroRol("");
                                        setFiltroEstatus("");
                                        setFiltroMateria("");
                                        setFiltroCategoria("");
                                        setFiltroEstado("");
                                        setFiltroMunicipio("");
                                        setFiltroEstadoSemestre("");
                                    }}
                                    className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                                    title="Limpiar filtros"
                                >
                                    <span className="icon-[mdi--filter-off-outline] text-lg"></span>
                                </button>
                            )}

                            {/* Actions Group */}
                            <div className="flex gap-2 ml-auto">
                                {selectedItems.length > 0 ? (
                                    <button
                                        onClick={activeTab === 'users' ? handleBulkToggle : handleBulkDelete}
                                        className={`${activeTab === 'users' ? 'bg-sky-950 hover:bg-[#325B84]' : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-2`}
                                    >
                                        <span className={activeTab === 'users' ? "icon-[mdi--account-convert-outline] text-xl" : "icon-[mdi--trash-can-outline] text-xl"}></span>
                                        {activeTab === 'users' ? `Cambiar Estatus (${selectedItems.length})` : `Eliminar (${selectedItems.length})`}
                                    </button>
                                ) : (
                                    <>
                                        {activeTab === "users" && (
                                            <button
                                                onClick={() => setBulkUploadModalOpen(true)}
                                                className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors cursor-pointer flex items-center gap-2"
                                            >
                                                <span className="icon-[mdi--upload] text-xl"></span>
                                                Carga Masiva
                                            </button>
                                        )}
                                        <button onClick={handleCreate} className="bg-sky-950 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-[#325B84] transition-colors cursor-pointer">Agregar</button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Collapsible Filter Panel */}
                        {isFilterPanelOpen && (
                            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* USERS FILTERS */}
                                    {activeTab === "users" && (
                                        <>
                                            <FilterSelect
                                                placeholder="Filtrar por Rol"
                                                value={filtroRol}
                                                onChange={setFiltroRol}
                                                options={[
                                                    { value: "Estudiante", label: "Estudiante" },
                                                    { value: "Profesor", label: "Profesor" },
                                                    { value: "Coordinador", label: "Coordinador" },
                                                    { value: "Administrador", label: "Administrador" },
                                                ]}
                                                className="w-full"
                                            />
                                            <FilterSelect
                                                placeholder="Filtrar por Estatus"
                                                value={filtroEstatus}
                                                onChange={setFiltroEstatus}
                                                options={[
                                                    { value: "Activo", label: "Activo" },
                                                    { value: "Inactivo", label: "Inactivo" },
                                                ]}
                                                className="w-full"
                                            />
                                            <FilterSelect
                                                placeholder="Filtrar por Semestre"
                                                value={filtroSemestre}
                                                onChange={setFiltroSemestre}
                                                options={semestres.map((sem: any) => ({
                                                    value: sem.term,
                                                    label: sem.term
                                                }))}
                                                className="w-full"
                                            />
                                        </>
                                    )}

                                    {/* SUBCATALOGS FILTERS */}
                                    {activeTab === "subcatalogs" && (
                                        <>
                                            <FilterSelect
                                                placeholder="Filtrar por Materia"
                                                value={filtroMateria}
                                                onChange={(val) => {
                                                    setFiltroMateria(val);
                                                    setFiltroCategoria("");
                                                }}
                                                options={legalfield.map((m: any) => ({
                                                    value: m.id,
                                                    label: m.nombre
                                                }))}
                                                className="w-full"
                                            />
                                            {filtroMateria && legalfield.find((m: any) => m.id === filtroMateria)?.nombre.toLowerCase().includes("civil") && (
                                                <FilterSelect
                                                    placeholder="Filtrar por Categoría"
                                                    value={filtroCategoria}
                                                    onChange={setFiltroCategoria}
                                                    options={categorylegalfield
                                                        .filter((c: any) => c.materiaid === filtroMateria)
                                                        .map((c: any) => ({
                                                            value: c.id,
                                                            label: c.nombre
                                                        }))}
                                                    className="w-full"
                                                />
                                            )}
                                        </>
                                    )}

                                    {/* LEGALFIELD FILTERS */}
                                    {activeTab === "legalfield" && (
                                        <FilterSelect
                                            placeholder="Filtrar por Subcategoría"
                                            value={filtroCategoria}
                                            onChange={setFiltroCategoria}
                                            options={subcategorylegalfield.map((s: any) => ({
                                                value: s.id,
                                                label: s.nombre
                                            }))}
                                            className="w-full"
                                        />
                                    )}

                                    {/* CENTERS FILTERS */}
                                    {activeTab === "centers" && (
                                        <>
                                            <FilterSelect
                                                placeholder="Filtrar por Estado"
                                                value={filtroEstado}
                                                onChange={setFiltroEstado}
                                                options={estados.map((e: any) => ({
                                                    value: e.id_estado,
                                                    label: e.nombre_estado
                                                }))}
                                                className="w-full"
                                            />
                                            <FilterSelect
                                                placeholder="Filtrar por Municipio"
                                                value={filtroMunicipio}
                                                onChange={setFiltroMunicipio}
                                                disabled={!filtroEstado}
                                                options={municipios.map((m: any) => ({
                                                    value: m.id_municipio,
                                                    label: m.nombre_municipio
                                                }))}
                                                className="w-full"
                                            />
                                        </>
                                    )}

                                    {/* SEMESTRES FILTERS */}
                                    {activeTab === "semestres" && (
                                        <FilterSelect
                                            placeholder="Filtrar por Estado"
                                            value={filtroEstadoSemestre}
                                            onChange={setFiltroEstadoSemestre}
                                            options={[
                                                { value: "Activo", label: "Activo" },
                                                { value: "Pendiente", label: "Pendiente" },
                                                { value: "Finalizado", label: "Finalizado" },
                                            ]}
                                            className="w-full"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contador de resultados */}
                    <div className="flex justify-between items-center mb-2 px-2">
                        <div className="text-sm text-sky-950 font-medium">
                            Mostrando {paginatedData.length} de {fullFilteredData.length} registros
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col bg-white rounded-2xl shadow-sm border border-neutral-100">
                        {paginatedData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center flex-1 py-12 overflow-y-auto">
                                <span className="icon-[mdi--database-off] text-4xl text-neutral-300 mb-2"></span>
                                <p className="text-neutral-400">No se encontraron registros</p>
                            </div>
                        ) : (
                            <div className="flex-1 w-full overflow-hidden">
                                <CustomTable
                                    key={activeTab}
                                    data={paginatedData as any}
                                    columns={columns as any}
                                    enableSelection={true}
                                    onSelectionChange={setSelectedItems}
                                    selectedItems={selectedItems}
                                    className="h-full"
                                    minRows={10}
                                />
                            </div>
                        )}
                    </div>

                    <div className="self-stretch py-1">
                        {fullFilteredData.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={ITEMS_PER_PAGE}
                                totalItems={fullFilteredData.length}
                            />
                        )}
                    </div>
                </div>
            </div>

            <AdministrationModal
                open={adminModalOpen}
                onClose={() => setAdminModalOpen(false)}
                onSave={handleSave}
                item={currentItem}
                mode={currentMode}
                type={activeTab}
                parishes={parishes}
                materias={legalfield}
                categorias={categorylegalfield}
                subcategorias={subcategorylegalfield}
                semestres={semestres}
                participations={
                    activeTab === "users" && currentItem
                        ? [
                            ...(students.filter((s: any) => s.id === currentItem.id)),
                            ...(teachers.filter((t: any) => t.id === currentItem.id))
                        ]
                        : []
                }
            />

            <BulkUploadModal
                open={bulkUploadModalOpen}
                onClose={() => setBulkUploadModalOpen(false)}
                onSuccess={loadData}
                semestres={semestres}
            />

            {/* Modal de eliminación */}
            <DeleteConfirmationModal
                open={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setCurrentItem(null);
                }}
                onConfirm={confirmDelete}
                title={currentItem ? (activeTab === 'users' ? "¿Eliminar Usuario?" : "Eliminar Elemento") : "Eliminación Múltiple"}
                description={
                    currentItem
                        ? `¿Estás seguro de que deseas eliminar a "${currentItem.user || currentItem.nombre}"? Esta acción no se puede deshacer.`
                        : "¿Estás seguro de que deseas eliminar los elementos seleccionados? Esta acción no se puede deshacer."
                }
            />

            {/* Modal de cambio de estatus */}
            <DeleteConfirmationModal
                open={toggleModalOpen}
                onClose={() => {
                    setToggleModalOpen(false);
                    setCurrentItem(null);
                }}
                onConfirm={confirmToggleStatus}
                title={
                    currentItem
                        ? (currentItem.status === 'Activo' ? "Desactivar Usuario" : "Activar Usuario")
                        : "Cambiar Estatus Múltiple"
                }
                description={
                    currentItem
                        ? `¿Estás seguro de que deseas ${currentItem.status === 'Activo' ? 'desactivar' : 'activar'} a "${currentItem.user}"?`
                        : `¿Estás seguro de que deseas invertir el estatus de los ${selectedItems.length} usuarios seleccionados?`
                }
                confirmText={
                    currentItem
                        ? (currentItem.status === 'Activo' ? "Desactivar" : "Activar")
                        : "Confirmar Cambios"
                }
                cancelText="Cancelar"
                isDestructive={currentItem ? currentItem.status === 'Activo' : false} // Blue for bulk safely
            />
        </div>
    );
}
