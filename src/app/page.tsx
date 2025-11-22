import { prisma } from "@/lib/prisma";
import { createUser, deleteUser } from "./actions";
import type { User } from "@prisma/client";

// Componente principal (async para hacer fetch de datos)
export default async function Home() {
  let users: User[] = [];
  let errorMessage: string | null = null;
  
  try {
    users = await prisma.user.findMany({
      orderBy: {
        id: "desc",
      },
    });
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error);
    errorMessage = error?.message || "Error desconocido";
    users = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Gestión de Usuarios
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Prueba tu base de datos con este CRUD básico
          </p>
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">
                ⚠️ Error de conexión: {errorMessage}
              </p>
              <p className="text-red-600 dark:text-red-300 text-xs mt-2">
                Verifica tu archivo .env y que DATABASE_URL esté configurado correctamente.
              </p>
            </div>
          )}
        </div>

        {/* Formulario para crear usuario */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Crear Nuevo Usuario
          </h2>
          <form action={createUser} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
                placeholder="Nombre del usuario"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Crear Usuario
            </button>
          </form>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Usuarios Existentes ({users.length})
          </h2>
          
          {users.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">
              {errorMessage 
                ? "No se pudo conectar a la base de datos. Verifica tu configuración."
                : "No hay usuarios registrados. Crea uno usando el formulario de arriba."
              }
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {user.name || "Sin nombre"}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {user.email}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                      ID: {user.id}
                    </p>
                  </div>
                  <form action={deleteUser}>
                    <input type="hidden" name="id" value={user.id} />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Borrar
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
