"use client";

import { useState, useMemo } from "react";
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

interface Case {
  id: string;
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
}

const ITEMS_PER_PAGE = 10;

export default function CasesClient({ userRole }: CasesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicantIdFilter = searchParams.get("applicantId");

  // Mock data
  const [cases, setCases] = useState<Case[]>([
    {
      id: "1",
      caseNumber: "#2024-051",
      applicantName: "Carlos Mendoza",
      applicantId: "V-18.765.432",
      subject: "Laboral",
      procedure: "Asesoría",
      tribunal: "Tribunal de Protección del Niño",
      period: "2024-I",
      assignedStudent: "José Gómez",
      status: "EN_PROCESO",
      createdAt: "2024-05-10",
    },
    {
      id: "2",
      caseNumber: "#2024-050",
      applicantName: "Pedro Pérez",
      applicantId: "V-15.123.456",
      subject: "Civil",
      procedure: "Redacción Documento",
      tribunal: "Sin asignar",
      period: "2023-II",
      assignedStudent: "Ana Martínez",
      status: "ENTREGADO",
      createdAt: "2024-05-10",
    },
    {
      id: "3",
      caseNumber: "#2024-049",
      applicantName: "María Rodríguez",
      applicantId: "V-20.111.222",
      subject: "Familia",
      procedure: "Conciliación",
      tribunal: "Tribunal de Familia",
      period: "2024-I",
      assignedStudent: "Luisa Fernández",
      status: "EN_PROCESO",
      createdAt: "2024-03-15",
    },
    {
      id: "4",
      caseNumber: "#2024-048",
      applicantName: "Jorge Silva",
      applicantId: "V-12.333.444",
      subject: "Penal",
      procedure: "Asesoría",
      tribunal: "Tribunal Penal",
      period: "2024-I",
      assignedStudent: "José Gómez",
      status: "ARCHIVADO",
      createdAt: "2024-02-20",
    },
  ]);

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

  // Filtrar casos
  const filteredCases = useMemo(() => {
    return cases.filter((caso) => {
      const matchesSearch =
        !searchTerm ||
        caso.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caso.applicantName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || caso.status === statusFilter;
      const matchesSubject = !subjectFilter || caso.subject === subjectFilter;
      const matchesProcedure =
        !procedureFilter || caso.procedure === procedureFilter;
      const matchesSemester = !semesterFilter || caso.period === semesterFilter;
      const matchesTribunal =
        !tribunalFilter || caso.tribunal === tribunalFilter;

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
    // TODO: Abrir modal de nuevo caso
    console.log("Crear nuevo caso");
  };

  const handleValidateCase = () => {
    // TODO: Abrir modal de validación
    console.log("Validar/Asignar caso");
  };

  // Datos para gráficos
  const pieChartData = [
    { subject: "civil", cases: 45 },
    { subject: "laboral", cases: 30 },
    { subject: "penal", cases: 25 },
    { subject: "familia", cases: 20 },
    { subject: "lopnna", cases: 15 },
    { subject: "otros", cases: 10 },
  ];

  const pieChartConfig = {
    cases: { label: "Casos" },
    civil: { label: "Civil" },
    laboral: { label: "Laboral" },
    penal: { label: "Penal" },
    familia: { label: "Familia" },
    lopnna: { label: "LOPNNA" },
    otros: { label: "Otros" },
  } satisfies ChartConfig;

  const barChartData = [
    { procedure: "Representación", count: 60 },
    { procedure: "Conciliación", count: 25 },
    { procedure: "Redacción", count: 30 },
    { procedure: "Investigación", count: 10 },
    { procedure: "Asesoría", count: 5 },
  ];

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
    // Actualizar el caso en el estado
    setCases((prevCases) =>
      prevCases.map((caso) =>
        caso.id === data.id
          ? {
              ...caso,
              status: data.status,
              assignedStudent: data.assignedStudent,
            }
          : caso
      )
    );

    // TODO: Aquí iría la llamada a la API para actualizar en el backend
    // await fetch(`/api/cases/${data.id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(data),
    // });
  };

  // Columnas según el rol
  const getColumns = (): Column<Case>[] => {
    const baseColumns: Column<Case>[] = [
      {
        header: "N° Caso",
        render: (caso) => (
          <div className="text-center">
            <div className="font-bold text-sky-950">{caso.caseNumber}</div>
            <div className="text-sm text-sky-950/60">{caso.createdAt}</div>
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
            className="w-10 h-10 flex justify-center items-center hover:bg-blue-100 rounded-lg transition-colors group"
            title="Ver detalles"
          >
            <span className="icon-[mdi--file-document-outline] text-3xl text-[#3E7DBB] group-hover:scale-110 transition-transform"></span>
          </button>
          <button
            onClick={() => handleEdit(caso.id)}
            className="w-10 h-10 flex justify-center items-center hover:bg-green-100 rounded-lg transition-colors group"
            title="Editar"
          >
            <span className="icon-[mdi--pencil] text-3xl text-green-600 group-hover:scale-110 transition-transform"></span>
          </button>
        </div>
      ),
      className: "text-center",
      headerClassName: "w-[10%]",
    });

    return baseColumns;
  };

  return (
    <div className="w-full h-full p-11 inline-flex flex-col justify-start items-start gap-6 overflow-y-auto">
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

      {/* Filters */}
      <div className="self-stretch grid grid-cols-3 gap-4">
        <SearchInput
          placeholder="Buscar caso por N°"
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <FilterSelect
          placeholder="Filtrar por Estatus"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "EN_PROCESO", label: "En Proceso" },
            { value: "ENTREGADO", label: "Entregado" },
            { value: "ARCHIVADO", label: "Archivado" },
            { value: "ASESORIA", label: "Asesoría" },
          ]}
        />
        <FilterSelect
          placeholder="Filtrar por Materia"
          value={subjectFilter}
          onChange={setSubjectFilter}
          options={[
            { value: "Civil", label: "Civil" },
            { value: "Laboral", label: "Laboral" },
            { value: "Penal", label: "Penal" },
            { value: "Familia", label: "Familia" },
          ]}
        />
      </div>

      {/* Filtros adicionales para Admin */}
      {userRole === "ADMIN" && (
        <div className="self-stretch grid grid-cols-3 gap-4">
          <FilterSelect
            placeholder="Filtrar por Trámite"
            value={procedureFilter}
            onChange={setProcedureFilter}
            options={[
              { value: "Asesoría", label: "Asesoría" },
              { value: "Representación", label: "Representación" },
              { value: "Conciliación", label: "Conciliación" },
              { value: "Redacción Documento", label: "Redacción Documento" },
            ]}
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
          />
          <DateInput
            placeholder="Desde: 01/01/2025"
            value={dateFilter}
            onChange={setDateFilter}
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
          />
        </div>
      )}

      {/* Table */}
      <div className="self-stretch bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] p-8">
        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <span className="icon-[mdi--gavel] text-6xl text-sky-950/30 mb-4 block"></span>
            <p className="text-sky-950 text-xl font-semibold">
              {searchTerm || statusFilter || subjectFilter
                ? "No se encontraron casos con los filtros aplicados"
                : "No hay casos registrados"}
            </p>
          </div>
        ) : (
          <CustomTable data={paginatedCases} columns={getColumns()} />
        )}
      </div>

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

      {/* Charts */}
      <div className="self-stretch grid grid-cols-2 gap-6">
        <div className="bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] p-8">
          <PieChart
            title="Casos por Materia:"
            data={pieChartData}
            config={pieChartConfig}
            dataKey="cases"
            nameKey="subject"
            innerRadius={55}
          />
        </div>
        <div className="bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] p-8">
          <BarChart
            title="Casos por Trámite:"
            data={barChartData}
            config={barChartConfig}
            dataKey="count"
            nameKey="procedure"
          />
        </div>
      </div>

      {/* Stats Footer */}
      <div className="self-stretch inline-flex justify-between items-center px-4">
        <p className="text-sky-950 text-lg font-semibold">
          Total de casos:{" "}
          <span className="text-[#3E7DBB]">{filteredCases.length}</span>
        </p>
        {(searchTerm || statusFilter || subjectFilter || procedureFilter) && (
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
            className="text-[#3E7DBB] text-lg font-semibold hover:text-[#2d5f8f] transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

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
      />
    </div>
  );
}
