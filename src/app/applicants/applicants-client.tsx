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
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal";

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
  // Datos de prueba iniciales
  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: "1",
      name: "Juan Pérez",
      email: "juan@example.com",
      phone: "0414-1234567",
      address: "Centro, Calle 5",
      idDocument: "12.345.678",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { cases: 2 },
    },
    {
      id: "2",
      name: "Maria Rodriguez",
      email: "maria@example.com",
      phone: "0412-7654321",
      address: "La Pica, Sector 2",
      idDocument: "15.678.901",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { cases: 0 },
    },
    {
      id: "3",
      name: "Carlos Sanchez",
      email: "carlos@example.com",
      phone: "0424-5555555",
      address: "Fundemos",
      idDocument: "8.901.234",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { cases: 1 },
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [communityFilter, setCommunityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Selection state
  const [selectedItems, setSelectedItems] = useState<Applicant[]>([]);

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
    setSelectedItems([]); // Clear selection on filter change
  }, [searchTerm, communityFilter, statusFilter]);

  const handleNewApplicant = () => {
    setModalMode("create");
    setSelectedApplicant(null);
    setModalOpen(true);
  };

  const handleEdit = (applicant: Applicant) => {
    setModalMode("edit");
    setSelectedApplicant(applicant);
    setModalOpen(true);
  };

  const handleViewDetails = (id: string) => {
    // Redirigir a la página de casos del solicitante
    router.push(`/cases?applicantId=${id}`);
  };

  const handleDelete = (applicant: Applicant) => {
    setSelectedApplicant(applicant); // Set for single delete
    setDeleteModalOpen(true);
  };

  const handleBulkDelete = () => {
    setSelectedApplicant(null); // Indicates multiple delete
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedApplicant) {
      // Single delete
      setApplicants(prev => prev.filter(a => a.id !== selectedApplicant.id));
      setSelectedApplicant(null);
    } else if (selectedItems.length > 0) {
      // Bulk delete
      const idsToDelete = new Set(selectedItems.map(a => a.id));
      setApplicants(prev => prev.filter(a => !idsToDelete.has(a.id)));
      setSelectedItems([]);
    }
    setDeleteModalOpen(false);
  };

  const handleSaveApplicant = async (formData: ApplicantFormData) => {
    if (modalMode === "create") {
      const newApplicant: Applicant = {
        ...formData,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { cases: 0 },
      };
      setApplicants((prev) => [newApplicant, ...prev]);
    } else {
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === formData.id
            ? {
              ...a,
              ...formData,
              email: formData.email || null,
              phone: formData.phone || null,
              address: formData.address || null,
            }
            : a
        )
      );
    }
    setModalOpen(false);
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
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handleViewDetails(applicant.id)}
            className="w-10 h-10 flex justify-center items-center hover:bg-blue-100 rounded-lg transition-colors group cursor-pointer"
            title="Ver casos relacionados"
          >
            <span className="icon-[mdi--file-document-outline] text-3xl text-[#3E7DBB] group-hover:scale-110 transition-transform"></span>
          </button>
          <button
            onClick={() => handleEdit(applicant)}
            className="w-10 h-10 flex justify-center items-center hover:bg-blue-100 rounded-lg transition-colors group cursor-pointer"
            title="Editar"
          >
            <span className="icon-[uil--pen] text-3xl text-[#003366] group-hover:scale-110 transition-transform"></span>
          </button>
          <button
            onClick={() => handleDelete(applicant)}
            className="w-10 h-10 flex justify-center items-center hover:bg-red-100 rounded-lg transition-colors group cursor-pointer"
            title="Eliminar"
          >
            <span className="icon-[mdi--trash-can-outline] text-3xl text-red-600 group-hover:scale-110 transition-transform"></span>
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

        {/* Filters and Bulk Actions */}
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

          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-2 h-[42px]"
            >
              <span className="icon-[mdi--trash-can-outline] text-xl"></span>
              Eliminar ({selectedItems.length})
            </button>
          )}
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
            <CustomTable
              data={paginatedApplicants}
              columns={columns}
              enableSelection={true}
              onSelectionChange={setSelectedItems}
            />
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
              className="text-[#3E7DBB] text-lg font-semibold hover:text-[#2d5f8f] transition-colors cursor-pointer"
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

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
