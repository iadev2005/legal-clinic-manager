"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomTable, type Column } from "@/components/ui/custom-table";
import PrimaryButton from "@/components/ui/primary-button";
import SearchInput from "@/components/ui/search-input";
import FilterSelect from "@/components/ui/filter-select";
import DateInput from "@/components/ui/date-input";
import StatusBadge from "@/components/ui/status-badge";
import { PieChart } from "@/components/ui/pie-chart";
import { BarChart } from "@/components/ui/bar-chart";
import Pagination from "@/components/ui/pagination";
import { type ChartConfig } from "@/components/shadcn/chart";
import CaseDetailsModal from "@/components/ui/case-details-modal";
import CaseEditModal, {
  type CaseEditData,
} from "@/components/ui/case-edit-modal";
import {
  getCasos,
  getCasosBySolicitante,
  cambiarEstatus,
  getEstatus,
  getMaterias,
  getTramites,
  getNucleos,
  asignarAlumno,
  asignarProfesor,
  getAsignacionesActivas,
  type Caso as CasoBD,
} from "@/actions/casos";

interface Case {
  id: string;
  nro_caso: number;
  caseNumber: string;
  applicantName: string;
  applicantId: string;
  subject: string; // Materia
  procedure: string; // Trámite
  tribunal: string;
  period: string;
  assignedStudent: string;
  status: "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA";
  createdAt: string;
}

interface CasesClientProps {
  userRole: "ADMIN" | "PROFESSOR" | "STUDENT";
  userCedula?: string;
}

const ITEMS_PER_PAGE = 10;

// Mapear estatus de BD a formato del frontend
const mapEstatusToFrontend = (estatus: string | null): "EN_PROCESO" | "ARCHIVADO" | "ENTREGADO" | "ASESORIA" => {
  if (!estatus) return "EN_PROCESO";
  const upper = estatus.toUpperCase();
  if (upper.includes("PROCESO")) return "EN_PROCESO";
  if (upper.includes("ARCHIVADO")) return "ARCHIVADO";
  if (upper.includes("ENTREGADO")) return "ENTREGADO";
  if (upper.includes("ASESORIA") || upper.includes("ASESORÍA")) return "ASESORIA";
  return "EN_PROCESO";
};

export default function CasesClient({ userRole, userCedula }: CasesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicantIdFilter = searchParams.get("applicantId");

  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  // Catálogos para filtros
  const [estatusList, setEstatusList] = useState<any[]>([]);
  const [materiasList, setMateriasList] = useState<any[]>([]);
  const [tramitesList, setTramitesList] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [procedureFilter, setProcedureFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [tribunalFilter, setTribunalFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para los modales
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // Estado para la vista (tabla o gráficas)
  const [viewMode, setViewMode] = useState<"table" | "charts">("table");

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
    loadCatalogs();
  }, [applicantIdFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      let result;
      if (applicantIdFilter) {
        result = await getCasosBySolicitante(applicantIdFilter);
      } else {
        result = await getCasos();
      }

      if (result.success && result.data) {
        // Mapear datos de BD al formato del frontend
        const mappedCases: Case[] = result.data.map((caso: any) => {
          // Asegurar que la fecha sea un string
          let fechaStr = "";
          if (caso.fecha_caso_inicio) {
            if (caso.fecha_caso_inicio instanceof Date) {
              fechaStr = caso.fecha_caso_inicio.toISOString().split('T')[0];
            } else if (typeof caso.fecha_caso_inicio === 'string') {
              // Si ya es string, tomar solo la parte de la fecha (antes de T si hay hora)
              fechaStr = caso.fecha_caso_inicio.split('T')[0];
            } else {
              fechaStr = new Date().toISOString().split('T')[0];
            }
          } else {
            fechaStr = new Date().toISOString().split('T')[0];
          }

          return {
            id: caso.nro_caso.toString(),
            nro_caso: caso.nro_caso,
            caseNumber: `#${caso.nro_caso.toString().padStart(6, '0')}`,
            applicantName: caso.solicitante_nombre || "N/A",
            applicantId: caso.cedula_solicitante || "",
            subject: caso.nombre_materia || "N/A",
            procedure: caso.nombre_tramite || "N/A",
            tribunal: caso.nombre_subcategoria || "Sin asignar", // Usar subcategoría como tribunal temporalmente
            period: "N/A", // TODO: Obtener del semestre asignado
            assignedStudent: caso.alumno_asignado || "Sin asignar",
            status: mapEstatusToFrontend(caso.estatus_actual),
            createdAt: fechaStr,
          };
        });
        setCases(mappedCases);
      } else {
        console.error("Error loading cases:", result.error);
        setCases([]);
      }
    } catch (error) {
      console.error("Error loading cases:", error);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogs = async () => {
    const [estatusResult, materiasResult, tramitesResult] = await Promise.all([
      getEstatus(),
      getMaterias(),
      getTramites(),
    ]);

    if (estatusResult.success && estatusResult.data) {
      setEstatusList(estatusResult.data);
    }
    if (materiasResult.success && materiasResult.data) {
      setMateriasList(materiasResult.data);
    }
    if (tramitesResult.success && tramitesResult.data) {
      setTramitesList(tramitesResult.data);
    }
  };

  // Filtrar casos
  const filteredCases = useMemo(() => {
    return cases.filter((caso) => {
      const matchesSearch =
        !searchTerm ||
        caso.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caso.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caso.applicantId.toLowerCase().includes(searchTerm.toLowerCase());

      // Comparar estatus (puede venir de BD con formato diferente)
      const matchesStatus = !statusFilter ||
        caso.status === statusFilter ||
        (statusFilter && caso.status === mapEstatusToFrontend(statusFilter));

      const matchesSubject = !subjectFilter ||
        caso.subject.toLowerCase().includes(subjectFilter.toLowerCase());

      const matchesProcedure =
        !procedureFilter ||
        caso.procedure.toLowerCase().includes(procedureFilter.toLowerCase());

      const matchesSemester = !semesterFilter || caso.period === semesterFilter;

      const matchesTribunal =
        !tribunalFilter ||
        caso.tribunal.toLowerCase().includes(tribunalFilter.toLowerCase());

      // Filtro por fecha
      const matchesDate = !dateFilter || caso.createdAt >= dateFilter;

      // Filtro por applicantId desde URL (cuando viene desde Gestión de Solicitantes)
      const matchesApplicant =
        !applicantIdFilter || caso.applicantId === applicantIdFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSubject &&
        matchesProcedure &&
        matchesSemester &&
        matchesTribunal &&
        matchesDate &&
        matchesApplicant
      );
    });
  }, [
    searchTerm,
    statusFilter,
    subjectFilter,
    procedureFilter,
    semesterFilter,
    tribunalFilter,
    dateFilter,
    applicantIdFilter,
    cases,
  ]);

  // Paginación - reset page to 1 when filters change
  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);

  // Automatically reset to page 1 if current page exceeds total pages
  const effectiveCurrentPage =
    currentPage > totalPages && totalPages > 0 ? 1 : currentPage;

  const paginatedCases = useMemo(() => {
    const startIndex = (effectiveCurrentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCases.slice(startIndex, endIndex);
  }, [filteredCases, effectiveCurrentPage]);

  const handleNewCase = () => {
    // TODO: Abrir modal de nuevo caso (se implementará después)
    console.log("Crear nuevo caso");
    alert("Funcionalidad de crear caso próximamente");
  };

  const handleValidateCase = () => {
    // TODO: Abrir modal de validación
    console.log("Validar/Asignar caso");
    alert("Funcionalidad de validar caso próximamente");
  };

  // Datos para gráficos (calculados desde casos reales)
  const pieChartData = useMemo(() => {
    const materiasCount: Record<string, number> = {};
    cases.forEach((caso) => {
      const materia = caso.subject.toLowerCase();
      materiasCount[materia] = (materiasCount[materia] || 0) + 1;
    });

    return Object.entries(materiasCount).map(([subject, cases]) => ({
      subject,
      cases,
    }));
  }, [cases]);

  const pieChartConfig = useMemo(() => {
    const config: ChartConfig = {
      cases: { label: "Casos" },
    };
    pieChartData.forEach((item) => {
      config[item.subject] = { label: item.subject.charAt(0).toUpperCase() + item.subject.slice(1) };
    });
    return config;
  }, [pieChartData]) satisfies ChartConfig;

  const barChartData = useMemo(() => {
    const tramitesCount: Record<string, number> = {};
    cases.forEach((caso) => {
      const tramite = caso.procedure;
      tramitesCount[tramite] = (tramitesCount[tramite] || 0) + 1;
    });

    return Object.entries(tramitesCount).map(([procedure, count]) => ({
      procedure,
      count,
    }));
  }, [cases]);

  const barChartConfig = {
    count: { label: "Cantidad" },
  } satisfies ChartConfig;

  // Handlers para los modales
  const handleViewDetails = (id: string) => {
    const caso = cases.find((c) => c.id === id);
    if (caso) {
      setSelectedCase(caso);
      setDetailsModalOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    const caso = cases.find((c) => c.id === id);
    if (caso) {
      setSelectedCase(caso);
      setEditModalOpen(true);
    }
  };

  const handleSaveEdit = async (data: CaseEditData) => {
    try {
      const nroCaso = parseInt(data.id);

      // 1. Cambiar estatus si es diferente
      const casoActual = cases.find(c => c.id === data.id);
      if (casoActual && casoActual.status !== data.status) {
        // Buscar el ID del estatus
        const estatusObj = estatusList.find((e: any) => {
          const nombre = e.nombre_estatus?.toUpperCase() || "";
          const statusMap: Record<string, string> = {
            "EN_PROCESO": "EN PROCESO",
            "ARCHIVADO": "ARCHIVADO",
            "ENTREGADO": "ENTREGADO",
            "ASESORIA": "ASESORÍA",
          };
          return nombre.includes(statusMap[data.status] || "");
        });

        if (estatusObj) {
          await cambiarEstatus(nroCaso, estatusObj.id_estatus, "Cambio de estatus desde la interfaz", userCedula);
        }
      }

      // 2. Asignar alumno si es diferente
      if (casoActual && casoActual.assignedStudent !== data.assignedStudent) {
        if (data.assignedStudentCedula && data.assignedStudentTerm) {
          await asignarAlumno(nroCaso, data.assignedStudentCedula, data.assignedStudentTerm);
        }
      }

      // Recargar datos para asegurar sincronización
      await loadData();
    } catch (error) {
      console.error("Error saving case:", error);
      throw error;
    }
  };

  // Columnas según el rol
  const getColumns = (): Column<Case>[] => {
    const baseColumns: Column<Case>[] = [
      {
        header: "N° Caso",
        render: (caso) => (
          <div className="text-center">
            <div className="font-bold text-sky-950">{caso.caseNumber}</div>
            <div className="text-sm text-sky-950/60">
              {caso.createdAt}
            </div>
          </div>
        ),
        className: "text-center",
        headerClassName: "w-[12%]",
      },
      {
        header: "Solicitante",
        render: (caso) => (
          <div>
            <div className="font-bold text-sky-950">{caso.applicantName}</div>
            <div className="text-sm text-sky-950/60">{caso.applicantId}</div>
          </div>
        ),
        headerClassName: "w-[18%]",
      },
      {
        header: "Materia",
        accessorKey: "subject",
        className: "text-center font-semibold",
        headerClassName: "w-[12%]",
      },
      {
        header: "Trámite",
        accessorKey: "procedure",
        className: "text-center",
        headerClassName: "w-[15%]",
      },
    ];

    // Columnas adicionales para Admin
    if (userRole === "ADMIN") {
      baseColumns.push(
        {
          header: "Tribunal",
          accessorKey: "tribunal",
          className: "text-center text-sm",
          headerClassName: "w-[15%]",
        },
        {
          header: "Periodo",
          accessorKey: "period",
          className: "text-center font-semibold",
          headerClassName: "w-[8%]",
        }
      );
    }

    // Columna de alumno asignado
    baseColumns.push({
      header: "Alumno Asignado",
      accessorKey: "assignedStudent",
      className: "text-center font-semibold",
      headerClassName: "w-[12%]",
    });

    // Columna de estatus
    baseColumns.push({
      header: "Estatus",
      render: (caso) => (
        <div className="flex justify-center">
          <StatusBadge status={caso.status} />
        </div>
      ),
      className: "text-center",
      headerClassName: "w-[12%]",
    });

    // Columna de acciones
    baseColumns.push({
      header: "Acciones",
      render: (caso) => (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handleViewDetails(caso.id)}
            className="w-10 h-10 flex justify-center items-center hover:bg-blue-100 rounded-lg transition-colors group cursor-pointer"
            title="Ver detalles"
          >
            <span className="icon-[mdi--file-document-outline] text-3xl text-[#3E7DBB] group-hover:scale-110 transition-transform"></span>
          </button>
          <button
            onClick={() => handleEdit(caso.id)}
            className="w-10 h-10 flex justify-center items-center hover:bg-blue-100 rounded-lg transition-colors group cursor-pointer"
            title="Editar"
          >
            <span className="icon-[uil--pen] text-3xl text-[#003366] group-hover:scale-110 transition-transform"></span>
          </button>
        </div>
      ),
      className: "text-center",
      headerClassName: "w-[10%]",
    });

    return baseColumns;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-2xl text-sky-950">Cargando casos...</div>
      </div>
    );
  }

  return (

    <div className="w-full h-full p-6 inline-flex flex-col justify-start items-stretch gap-4 overflow-hidden">
      {/* Header */}
      <div className="self-stretch inline-flex justify-between items-start">
        <div className="flex flex-col justify-start items-start">
          <h1 className="text-sky-950 text-6xl font-semibold">
            Gestión de Casos
          </h1>
          <p className="text-[#325B84] text-2xl font-semibold">
            Registra, asigna y filtra todos los expedientes legales de la
            clínica.
          </p>
        </div>
        <div className="flex gap-4">
          {userRole === "ADMIN" && (
            <PrimaryButton onClick={handleNewCase} icon="icon-[mdi--plus]">
              Crear Nuevo Caso
            </PrimaryButton>
          )}

          {userRole === "PROFESSOR" && (
            <PrimaryButton
              onClick={handleValidateCase}
              icon="icon-[mdi--check-circle]"
              variant="secondary"
              className="bg-green-600 hover:bg-green-700"
            >
              Validar/Asignar Caso
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Banner informativo cuando se filtra por solicitante */}
      {applicantIdFilter && (
        <div className="self-stretch px-6 py-4 bg-blue-50 border-2 border-[#3E7DBB] rounded-2xl inline-flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="icon-[mdi--information] text-3xl text-[#3E7DBB]"></span>
            <div>
              <p className="text-sky-950 text-lg font-semibold">
                Mostrando casos del solicitante seleccionado
              </p>
              <p className="text-sky-950/70 text-sm">
                Se están filtrando los casos relacionados con este solicitante
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/cases")}
            className="px-4 py-2 bg-[#3E7DBB] hover:bg-[#2d5f8f] text-white rounded-xl font-semibold transition-colors"
          >
            Ver todos los casos
          </button>
        </div>
      )}

      {/* View Toggle (Segmented Control) */}
      <div className="self-stretch flex justify-center">
        <div className="bg-neutral-200/50 p-1.5 rounded-2xl inline-flex gap-1 shadow-inner">
          <button
            onClick={() => setViewMode("table")}
            className={`px-8 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${viewMode === "table"
              ? "bg-white text-[#003366] shadow-[0_2px_8px_rgba(0,0,0,0.1)] scale-100"
              : "text-gray-500 hover:text-[#003366] hover:bg-white/50 scale-95"
              }`}
          >
            <span className="icon-[mdi--table] text-xl"></span>
            Listado de Casos
          </button>
          <button
            onClick={() => setViewMode("charts")}
            className={`px-8 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${viewMode === "charts"
              ? "bg-white text-[#003366] shadow-[0_2px_8px_rgba(0,0,0,0.1)] scale-100"
              : "text-gray-500 hover:text-[#003366] hover:bg-white/50 scale-95"
              }`}
          >
            <span className="icon-[mdi--chart-pie] text-xl"></span>
            Estadísticas
          </button>
        </div>
      </div>

      {/* Filters (only visible in table mode) */}
      {viewMode === "table" && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500 w-full">
          <div className="w-full grid grid-cols-3 gap-4">
            <SearchInput
              placeholder="Buscar caso por N°"
              value={searchTerm}
              onChange={setSearchTerm}
              className="w-full"
            />
            <FilterSelect
              placeholder="Filtrar por Estatus"
              value={statusFilter}
              onChange={setStatusFilter}
              options={estatusList.map((e: any) => ({
                value: e.nombre_estatus,
                label: e.nombre_estatus,
              }))}
              className="w-full"
            />
            <FilterSelect
              placeholder="Filtrar por Materia"
              value={subjectFilter}
              onChange={setSubjectFilter}
              options={materiasList.map((m: any) => ({
                value: m.nombre_materia,
                label: m.nombre_materia,
              }))}
              className="w-full"
            />
          </div>

          {userRole === "ADMIN" && (
            <div className="w-full grid grid-cols-3 gap-4 mt-4">
              <FilterSelect
                placeholder="Filtrar por Trámite"
                value={procedureFilter}
                onChange={setProcedureFilter}
                options={tramitesList.map((t: any) => ({
                  value: t.nombre,
                  label: t.nombre,
                }))}
                className="w-full"
              />
              <FilterSelect
                placeholder="Filtrar por Semestre"
                value={semesterFilter}
                onChange={setSemesterFilter}
                options={[
                  { value: "2024-I", label: "2024-I" },
                  { value: "2023-II", label: "2023-II" },
                  { value: "2023-I", label: "2023-I" },
                ]}
                className="w-full"
              />
              <DateInput
                placeholder="Desde: 01/01/2025"
                value={dateFilter}
                onChange={setDateFilter}
                className="w-full"
              />
              <FilterSelect
                placeholder="Filtrar por Tribunal"
                value={tribunalFilter}
                onChange={setTribunalFilter}
                options={[
                  { value: "Tribunal de Familia", label: "Tribunal de Familia" },
                  { value: "Tribunal Penal", label: "Tribunal Penal" },
                  { value: "Sin asignar", label: "Sin asignar" },
                ]}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Content Area: Table/Footer OR Charts */}
      {viewMode === "table" ? (
        <>
          {/* Table Container - takes remaining space */}
          <div className="self-stretch flex-1 min-h-0 bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] p-8 overflow-hidden flex flex-col">
            {filteredCases.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 h-full text-center py-12">
                <span className="icon-[mdi--gavel] text-6xl text-sky-950/30 mb-4 block"></span>
                <p className="text-sky-950 text-xl font-semibold">
                  {searchTerm || statusFilter || subjectFilter
                    ? "No se encontraron casos con los filtros aplicados"
                    : "No hay casos registrados"}
                </p>
              </div>
            ) : (
              <CustomTable
                data={paginatedCases}
                columns={getColumns()}
                keyField="id"
                className="h-full"
                minRows={10}
              />
            )}
          </div>

          {/* Footer Area: Pagination + Status Bar */}
          <div className="self-stretch flex flex-col gap-2">
            {/* Pagination */}
            {filteredCases.length > 0 && (
              <Pagination
                currentPage={effectiveCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredCases.length}
              />
            )}

            {/* Status Bar (Footer) */}
            <div className="self-stretch flex justify-between items-center min-h-[30px] pt-2">
              {/* Left: Clear Filters */}
              <div className="flex-1 flex justify-start">
                {(searchTerm || statusFilter || subjectFilter || procedureFilter || semesterFilter || tribunalFilter || dateFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("");
                      setSubjectFilter("");
                      setProcedureFilter("");
                      setSemesterFilter("");
                      setTribunalFilter("");
                      setDateFilter("");
                    }}
                    className="text-[#3E7DBB] font-semibold hover:text-[#2d5f8f] transition-colors cursor-pointer flex items-center gap-1 text-sm"
                  >
                    <span className="icon-[mdi--filter-off-outline] text-lg"></span>
                    Limpiar filtros
                  </button>
                )}
              </div>

              {/* Center: Total Count */}
              <div className="flex items-center justify-center bg-white px-4 py-1.5 rounded-full border border-[#003366]/10 shadow-sm">
                <p className="text-sky-950 text-sm font-semibold">
                  Total de casos: <span className="text-[#3E7DBB] font-bold">{filteredCases.length}</span>
                </p>
              </div>

              {/* Right: Spacer */}
              <div className="flex-1"></div>
            </div>
          </div>
        </>
      ) : (
        /* Charts View */
        <div className="self-stretch flex-1 min-h-0 grid grid-cols-2 gap-8 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white rounded-[32px] shadow-sm border border-neutral-100 p-8 flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
            <PieChart
              title="Distribución por Materia"
              data={pieChartData}
              config={pieChartConfig}
              dataKey="cases"
              nameKey="subject"
              innerRadius={60}
            />
          </div>
          <div className="bg-white rounded-[32px] shadow-sm border border-neutral-100 p-8 flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
            <BarChart
              title="Distribución por Trámite"
              data={barChartData}
              config={barChartConfig}
              dataKey="count"
              nameKey="procedure"
            />
          </div>
        </div>
      )}

      {/* Modales */}
      <CaseDetailsModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedCase(null);
        }}
        caseData={selectedCase}
      />

      <CaseEditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedCase(null);
        }}
        onSave={handleSaveEdit}
        caseData={selectedCase}
        estatusList={estatusList}
      />
    </div>
  );
}
