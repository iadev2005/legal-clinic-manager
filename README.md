# ⚖️ Sistema de Clínicas Jurídicas - Guía de Configuración

Este documento detalla cómo configurar el entorno de desarrollo local para conectar la aplicación Next.js con nuestra base de datos PostgreSQL en la nube (Neon).

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:
1.  **Node.js** (Versión 18 o superior).
2.  **VS Code** (Editor de código recomendado).
3.  **Extensión "Prisma"** para VS Code (Para colorear la sintaxis de los archivos .prisma).

---

## 🚀 Guía de Inicio Rápido

Sigue estos pasos en orden para levantar el proyecto:

### 1. Clonar e Instalar Dependencias

Descarga el repositorio y abre la terminal en la carpeta del proyecto. Ejecuta:

```bash
npm install
# O si usas pnpm:
pnpm install
```
Nota: Este proyecto usa Prisma v6. Si el editor sugiere actualizar a v7, ignóralo para evitar problemas de compatibilidad.

### 2. Configurar Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto (al mismo nivel que `package.json`). Copia el siguiente contenido y pídenos la contraseña real por el grupo:

```bash
# Archivo: .env
# Reemplaza 'PASSWORD_AQUI' con la contraseña real que te pasaremos.
DATABASE_URL="postgresql://neondb_owner:PASSWORD_AQUI@ep-winter-night-adkjve62-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 3. Generar el Cliente de Prisma
Para que TypeScript reconozca la estructura de nuestra base de datos, ejecuta:

```bash
npx prisma generate
```

### 4. Sincronizar con la Nube
Para verificar que tu conexión funciona y tienes las últimas tablas:

```bash
npx prisma db push
```

Si ves un mensaje verde que dice 🚀 Your database is now in sync, ¡todo está correcto!

## 🛠️ Comandos de Desarrollo

### Levantar el servidor Next.js
Para ver la web en http://localhost:3000:

```bash
pnpm run dev
```

### Ver y Editar la Base de Datos (Modo Visual)
Si no quieres usar SQL, Prisma incluye un panel visual para ver/editar datos:

```bash
npx prisma studio
```

## ⚠️ Solución de Problemas (Troubleshooting)

### 🔴 Error: P1001: Can't reach database server
Si obtienes este error al intentar conectar, significa que tu red está bloqueando la base de datos.

**Causa común:** Estás usando el Wi-Fi de la universidad/escuela o una VPN activada.

**Solución:**
1. Apaga cualquier VPN.
2. Desconéctate del Wi-Fi institucional.
3. Comparte datos (Hotspot) desde tu celular a la computadora e intenta de nuevo.

### 🔴 Error: "Table 'user' does not exist" (en SQL Manual)
Si intentas hacer consultas manuales en pgAdmin o Neon y falla:

*   PostgreSQL convierte todo a minúsculas por defecto.
*   Prisma crea las tablas con mayúscula inicial (User).

**Solución:** Usa comillas dobles en el nombre de la tabla.

❌ Mal: `SELECT * FROM user;`

✅ Bien: `SELECT * FROM "User";`

## 📁 Estructura Clave del Backend

*   `prisma/schema.prisma`: Aquí se definen los modelos (Tablas) y sus relaciones. Si cambias esto, avisa al equipo.
*   `lib/prisma.ts`: Archivo de configuración global de Prisma para evitar conexiones múltiples en desarrollo. No lo borres.
*   `.env`: Archivo con credenciales secretas. NUNCA subir este archivo a Git.
