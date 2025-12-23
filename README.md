# ⚖️ Sistema de Clínicas Jurídicas

Plataforma integral para la administración de expedientes, control de solicitantes y seguimiento académico alineado con los tribunales.

> **Nota:** Este proyecto se encuentra actualmente en fase de desarrollo Frontend (Prototipo/UI). No requiere conexión a base de datos por el momento.

## 🛠️ Stack Tecnológico

*   **Framework:** Next.js 16 (App Router)
*   **Lenguaje:** TypeScript
*   **Estilos:** Tailwind CSS 4
*   **Componentes UI:** Radix UI / Lucide React
*   **Gráficos:** Recharts

## 🚀 Guía de Inicio Rápido

### 1. Requisitos Previos
*   Node.js 18 o superior.

### 2. Instalación
```bash
npm install
# o
pnpm install
```

### 3. Ejecutar en Desarrollo
```bash
npm run dev
# o
pnpm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📂 Estructura del Proyecto

El código fuente principal se encuentra en `src/`:

*   `app/auth`: Módulos de autenticación (Login).
*   `app/dashboard`: Panel principal.
*   `app/cases`: Gestión de casos/expedientes.
*   `app/applicants`: Gestión de solicitantes.
*   `app/citations`: Gestión de citas.
*   `app/statistics`: Visualización de datos estadísticos (Mock Data).
*   `data/`: Datos de prueba estáticos para el desarrollo de la UI.
