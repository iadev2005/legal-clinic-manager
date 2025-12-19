"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CustomTable, type Column } from "@/components/ui/custom-table";
import PrimaryButton from "@/components/ui/primary-button";
import SearchInput from "@/components/ui/search-input";
import FilterSelect from "@/components/ui/filter-select";
import ApplicantModal, {
  type ApplicantFormData,
} from "@/components/ui/applicant-modal";
import Pagination from "@/components/ui/pagination";

interface Applicant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  idDocument: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    cases: number;
  };
}

const ITEMS_PER_PAGE = 10;

export default function ApplicantsClient() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [communityFilter, setCommunityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const response = await fetch("/api/applicants");
      const data = await response.json();
      setApplicants(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setLoading(false);
    }
  };

  // Filtrar solicitantes usando useMemo
  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      // Filtro de búsqueda
      const matchesSearch =
        !searchTerm ||
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.idDocument.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de comunidad (simulado - puedes agregar este campo al schema)
      const matchesCommunity = !communityFilter;

      // Filtro de condición laboral (simulado - puedes agregar este campo al schema)
      const matchesStatus = !statusFilter;

      return matchesSearch && matchesCommunity && matchesStatus;
    });
  }, [searchTerm, communityFilter, statusFilter, applicants]);

  // Paginación
  const totalPages = Math.ceil(filteredApplicants.length / ITEMS_PER_PAGE);
  const paginatedApplicants = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredApplicants.slice(startIndex, endIndex);
  }, [filteredApplicants, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, communityFilter, statusFilter]);

  const handleNewApplicant = () => {
    setModalMode("create");
    setSelectedApplicant(null);
    setModalOpen(true);
  };

  const handleEdit = (applicant: Applicant) => {
    setModalMode("edit");
    // Convertir a formato compatible con el modal
    const formData = {
      id: applicant.id,
      name: applicant.name,
      idDocument: applicant.idDocument,
      email: applicant.email || "",
      phone: applicant.phone || "",
      address: applicant.address || "",
    };
    setSelectedApplicant(applicant);
    setModalOpen(true);
  };

  const handleViewDetails = (id: string) => {
    // Redirigir a la página de casos del solicitante
    router.push(`/cases?applicantId=${id}`);
  };

  const handleSaveApplicant = async (formData: ApplicantFormData) => {
    try {
      if (modalMode === "create") {
        const response = await fetch("/api/applicants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Error al crear el solicitante");
        }

        const newApplicant = await response.json();
        setApplicants((prev) => [newApplicant, ...prev]);
      } else {
        const response = await fetch(`/api/applicants/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Error al actualizar el solicitante");
        }

        const updatedApplicant = await response.json();
        setApplicants((prev) =>
          prev.map((a) => (a.id === updatedApplicant.id ? updatedApplicant : a))
        );
      }

      setModalOpen(false);
    } catch (error) {
      console.error("Error saving applicant:", error);
      throw error;
    }
  };

  const columns: Column<Applicant>[] = [
    {
      header: "C.I.",
      accessorKey: "idDocument",
      className: "font-bold text-center",
      headerClassName: "w-[15%]",
    },
    {
      header: "Nombre Completo",
      accessorKey: "name",
      className: "font-bold",
      headerClassName: "w-[25%]",
    },
    {
      header: "Comunidad",
      render: (applicant) => (
        <span className="text-center block">
          {applicant.address?.split(",")[0] || "N/A"}
        </span>
      ),
      className: "text-center",
      headerClassName: "w-[15%]",
    },
    {
      header: "Condición Laboral",
      render: (applicant) => (
        <span className="text-center block">
          {applicant._count && applicant._count.cases > 0
            ? "Activo"
            : "Inactivo"}
        </span>
      ),
      className: "text-center",
      headerClassName: "w-[15%]",
    },
    {
      header: "Carga Familiar",
      render: () => {
        const count = Math.floor(Math.random() * 5) + 1;
        return (
          <span className="text-center block">
            {count} persona{count > 1 ? "s" : ""}
          </span>
        );
      },
      className: "text-center",
      headerClassName: "w-[15%]",
    },
    {
      header: "Acciones",
      render: (applicant) => (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => handleViewDetails(applicant.id)}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
            title="Ver casos relacionados"
          >
            <span className="icon-[mdi--file-document-outline] text-2xl text-[#3E7DBB] group-hover:scale-110 transition-transform"></span>
          </button>
          <button
            onClick={() => handleEdit(applicant)}
            className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
            title="Editar"
          >
            <span className="icon-[mdi--pencil] text-2xl text-green-600 group-hover:scale-110 transition-transform"></span>
          </button>
        </div>
      ),
      className: "text-center",
      headerClassName: "w-[15%]",
    },
  ];

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-2xl text-sky-950">Cargando solicitantes...</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full p-11 inline-flex flex-col justify-start items-start gap-6 overflow-y-auto">
        {/* Header */}
        <div className="self-stretch inline-flex justify-between items-start">
          <div className="flex flex-col justify-start items-start">
            <h1 className="text-sky-950 text-6xl font-semibold">
              Gestión de Solicitantes
            </h1>
            <p className="text-[#325B84] text-2xl font-semibold">
              Crea, consulta y administra el registro de todos los clientes.
            </p>
          </div>
          <PrimaryButton
            onClick={handleNewApplicant}
            icon="icon-[mdi--account-plus]"
          >
            Nuevo Solicitante
          </PrimaryButton>
        </div>

        {/* Filters */}
        <div className="self-stretch inline-flex justify-start items-center gap-4">
          <SearchInput
            placeholder="Buscar por C.I. o Nombre"
            value={searchTerm}
            onChange={setSearchTerm}
            className="flex-1"
          />
          <FilterSelect
            placeholder="Filtrar por Parroquia"
            value={communityFilter}
            onChange={setCommunityFilter}
            options={[
              { value: "centro", label: "Centro" },
              { value: "fundemos", label: "Fundemos" },
              { value: "la-pica", label: "La Pica" },
            ]}
            className="w-64"
          />
          <FilterSelect
            placeholder="Filtrar por Condición Laboral"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "activo", label: "Activo" },
              { value: "inactivo", label: "Inactivo" },
              { value: "busca-trabajo", label: "Busca Trabajo" },
            ]}
            className="w-72"
          />
        </div>

        {/* Table */}
        <div className="self-stretch bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] p-8">
          {filteredApplicants.length === 0 ? (
            <div className="text-center py-12">
              <span className="icon-[mdi--account-search] text-6xl text-sky-950/30 mb-4 block"></span>
              <p className="text-sky-950 text-xl font-semibold">
                {searchTerm || communityFilter || statusFilter
                  ? "No se encontraron solicitantes con los filtros aplicados"
                  : "No hay solicitantes registrados"}
              </p>
            </div>
          ) : (
            <CustomTable data={paginatedApplicants} columns={columns} />
          )}
        </div>

        {/* Pagination */}
        {filteredApplicants.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredApplicants.length}
          />
        )}

        {/* Stats Footer */}
        <div className="self-stretch inline-flex justify-between items-center px-4">
          <p className="text-sky-950 text-lg font-semibold">
            Total de solicitantes:{" "}
            <span className="text-[#3E7DBB]">{filteredApplicants.length}</span>
          </p>
          {(searchTerm || communityFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCommunityFilter("");
                setStatusFilter("");
              }}
              className="text-[#3E7DBB] text-lg font-semibold hover:text-[#2d5f8f] transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      <ApplicantModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveApplicant}
        applicant={selectedApplicant}
        mode={modalMode}
      />
    </>
  );
}
