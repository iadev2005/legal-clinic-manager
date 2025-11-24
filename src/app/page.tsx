import { prisma } from "@/lib/prisma";
import {
  asociarBeneficiarioACaso,
  createBeneficiario,
  createCaso,
  createSolicitante,
  deleteBeneficiario,
  deleteCaso,
  deleteSolicitante,
} from "./actions";
import {
  EstatusCaso,
  TipoBeneficiarioRel,
  TipoSexo,
  TipoTramite,
} from "@prisma/client";

const sexoOptions = Object.values(TipoSexo);
const tramiteOptions = Object.values(TipoTramite);
const estatusOptions = Object.values(EstatusCaso);
const relacionOptions = Object.values(TipoBeneficiarioRel);

export default async function Home() {
  const [solicitantes, casos, beneficiarios] = await Promise.all([
    prisma.solicitante.findMany({
      orderBy: { cedula_solicitante: "asc" },
    }),
    prisma.caso.findMany({
      orderBy: { nro_caso: "desc" },
      include: {
        solicitante: true,
        beneficiarios: { include: { beneficiario: true } },
      },
    }),
    prisma.beneficiario.findMany({
      orderBy: { id_beneficiario: "desc" },
      include: {
        casos: { include: { caso: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="rounded-2xl bg-white p-8 shadow">
          <p className="text-sm uppercase tracking-wide text-zinc-500">
            Legal Clinic Manager · Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
            CRUD extendido (Solicitantes · Casos · Beneficiarios)
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Esta pantalla confirma que puedes manipular las tablas principales
            del dominio (crear, listar, eliminar y asociar entidades) usando
            Prisma + Server Actions en Next.js 16.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Entidad base
              </p>
              <h2 className="text-xl font-semibold text-zinc-900">
                Solicitantes ({solicitantes.length})
              </h2>
            </div>

            <form
              action={createSolicitante}
              className="space-y-4 rounded-xl border border-zinc-200 p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Cédula *
                  </label>
                  <input
                    name="cedula"
                    required
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                    placeholder="V-12345678"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Correo
                  </label>
                  <input
                    name="correo"
                    type="email"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Nombres *
                  </label>
                  <input
                    name="nombres"
                    required
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Apellidos *
                  </label>
                  <input
                    name="apellidos"
                    required
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-600">
                  Sexo
                </label>
                <select
                  name="sexo"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                >
                  <option value="">Seleccione</option>
                  {sexoOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Registrar solicitante
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {solicitantes.length === 0 && (
                <p className="text-sm text-zinc-500">
                  Aún no hay solicitantes registrados.
                </p>
              )}
              {solicitantes.map((solicitante) => (
                <div
                  key={solicitante.cedula_solicitante}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {solicitante.nombres} {solicitante.apellidos}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Cédula: {solicitante.cedula_solicitante}
                    </p>
                  </div>
                  <form action={deleteSolicitante}>
                    <input
                      type="hidden"
                      name="cedula"
                      value={solicitante.cedula_solicitante}
                    />
                    <button
                      className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
                      type="submit"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Entidad dependiente
              </p>
              <h2 className="text-xl font-semibold text-zinc-900">
                Casos ({casos.length})
              </h2>
            </div>

            <form
              action={createCaso}
              className="space-y-4 rounded-xl border border-zinc-200 p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Tipo de caso *
                  </label>
                  <input
                    name="tipoCaso"
                    required
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                    placeholder="Civil, Penal..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Cédula solicitante
                  </label>
                  <input
                    name="cedulaSolicitante"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                    placeholder="Debe existir"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Trámite
                  </label>
                  <select
                    name="tramite"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="">Seleccione</option>
                    {tramiteOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Estatus
                  </label>
                  <select
                    name="estatus"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="">Seleccione</option>
                    {estatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-600">
                  Observación
                </label>
                <textarea
                  name="observacion"
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-600">
                  Nro. expediente (opcional)
                </label>
                <input
                  name="nroExpediente"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Registrar caso
              </button>
            </form>

            <div className="mt-6 space-y-4">
              {casos.length === 0 && (
                <p className="text-sm text-zinc-500">Aún no hay casos.</p>
              )}
              {casos.map((caso) => (
                <div
                  key={caso.nro_caso}
                  className="space-y-3 rounded-xl border border-zinc-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        Caso #{caso.nro_caso} · {caso.tipo_caso}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Solicitante:{" "}
                        {caso.solicitante
                          ? `${caso.solicitante.nombres} ${caso.solicitante.apellidos}`
                          : "—"}
                      </p>
                    </div>
                    <form action={deleteCaso}>
                      <input type="hidden" name="nroCaso" value={caso.nro_caso} />
                      <button
                        className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
                        type="submit"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
                    <p>Trámite: {caso.tramite ?? "—"}</p>
                    <p>Estatus: {caso.estatus ?? "—"}</p>
                    <p>Observación: {caso.observacion || "Sin notas"}</p>
                    <p>Beneficiarios asociados: {caso.beneficiarios.length}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Relaciones N:M
            </p>
            <h2 className="text-xl font-semibold text-zinc-900">
              Beneficiarios ({beneficiarios.length})
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <form
              action={createBeneficiario}
              className="space-y-4 rounded-xl border border-zinc-200 p-4"
            >
              <h3 className="text-sm font-semibold text-zinc-800">
                Crear beneficiario (puedes asociar un caso al vuelo)
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Nombres *
                  </label>
                  <input
                    name="nombres"
                    required
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Apellidos *
                  </label>
                  <input
                    name="apellidos"
                    required
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Cédula
                  </label>
                  <input
                    name="cedula"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Sexo
                  </label>
                  <select
                    name="sexo"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="">Seleccione</option>
                    {sexoOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Asociar al caso #
                  </label>
                  <input
                    name="nroCaso"
                    type="number"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Tipo de beneficiario
                  </label>
                  <select
                    name="tipoRelacion"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="">Seleccione</option>
                    {relacionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-600">
                  Parentesco
                </label>
                <input
                  name="parentesco"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Registrar beneficiario
              </button>
            </form>

            <form
              action={asociarBeneficiarioACaso}
              className="space-y-4 rounded-xl border border-dashed border-zinc-300 p-4"
            >
              <h3 className="text-sm font-semibold text-zinc-800">
                Asociar beneficiario existente a un caso
              </h3>
              <div>
                <label className="text-sm font-medium text-zinc-600">
                  Beneficiario
                </label>
                <select
                  name="beneficiarioId"
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                >
                  <option value="">Seleccione</option>
                  {beneficiarios.map((beneficiario) => (
                    <option
                      key={beneficiario.id_beneficiario}
                      value={beneficiario.id_beneficiario}
                    >
                      {beneficiario.nombres} {beneficiario.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-600">
                  Nro. Caso
                </label>
                <input
                  name="nroCaso"
                  type="number"
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Tipo de beneficiario
                  </label>
                  <select
                    name="tipoRelacion"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="">Seleccione</option>
                    {relacionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-600">
                    Parentesco
                  </label>
                  <input
                    name="parentesco"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg border border-zinc-900 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-900 hover:text-white"
              >
                Asociar beneficiario
              </button>
            </form>
          </div>

          <div className="mt-8 space-y-4">
            {beneficiarios.length === 0 && (
              <p className="text-sm text-zinc-500">
                Aún no hay beneficiarios registrados.
              </p>
            )}
            {beneficiarios.map((beneficiario) => (
              <div
                key={beneficiario.id_beneficiario}
                className="rounded-2xl border border-zinc-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {beneficiario.nombres} {beneficiario.apellidos}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Cédula: {beneficiario.cedula || "N/A"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Asociado a {beneficiario.casos.length} caso(s)
                    </p>
                  </div>
                  <form action={deleteBeneficiario}>
                    <input
                      type="hidden"
                      name="id"
                      value={beneficiario.id_beneficiario}
                    />
                    <button
                      className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600"
                      type="submit"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
                {beneficiario.casos.length > 0 && (
                  <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
                    {beneficiario.casos.map((rel) => (
                      <p key={`${rel.id}-${rel.nro_caso}`}>
                        Caso #{rel.caso?.nro_caso} ·{" "}
                        {rel.tipo_beneficiario || "Sin tipo"} ·{" "}
                        {rel.tipo_parentesco || "Sin parentesco"}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
