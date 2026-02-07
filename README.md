# ⚖️ Sistema de Gestión de Clínicas Jurídicas

Plataforma integral para la administración de expedientes, control de solicitantes y seguimiento académico alineado con los tribunales. Diseñada para clínicas jurídicas educativas donde estudiantes de derecho brindan asistencia legal bajo supervisión de profesores, con coordinadores y administradores supervisando las operaciones.

---

## 🌟 Características Clave

* **Gestión de Ciclo de Vida de Casos:** Creación, seguimiento, asignación y cierre de casos con auditoría completa.
* **Control de Solicitantes:** Registro detallado de datos sociodemográficos, económicos y familiares.
* **Asignación Académica:** Gestión de estudiantes por semestre y supervisión directa por parte de profesores.
* **Gestión de Citas:** Programación, registro y control de atención de citas legales.
* **Notificaciones en Tiempo Real:** Alertas automáticas sobre actualizaciones de casos y nuevas asignaciones.
* **Reportes y Exportación:** Generación de informes profesionales en formatos PDF, Excel y Word.
* **Seguridad por Roles (RBAC):** Cuatro niveles de acceso definidos: Administrador, Coordinador, Profesor y Estudiante.
* **Auditoría Integral:** Trazabilidad total de cambios en casos, solicitantes y usuarios.

---

## 📚 Documentación

Para información técnica detallada, guías de desarrollo y especificaciones completas, consulta nuestra documentación oficial:

[**DeepWiki Legal Clinic Manager**](https://deepwiki.com/iadev2005/legal-clinic-manager)

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión |
| :--- | :--- | :--- |
| **Framework** | Next.js | 16.1.4 |
| **Lenguaje** | TypeScript | 5.9.3 |
| **Base de Datos** | PostgreSQL | - |
| **UI** | React | 19.2.3 |
| **Estilos** | Tailwind CSS | 4.1.18 |
| **Componentes** | Radix UI | 1.x |
| **Gráficos** | Recharts | 2.15.4 |
| **Autenticación** | jose | 6.1.3 |
| **Hashing** | bcryptjs | 3.0.3 |
| **Cliente DB** | pg | 8.16.3 |
| **Exportación** | @react-pdf/renderer, jsPDF, exceljs, docx | Varias |
| **Cloud Storage** | next-cloudinary | 6.17.5 |

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
* Node.js 18 o superior
* PostgreSQL 12 o superior
* Cuenta de Cloudinary (opcional, para almacenamiento de documentos)

### Instalación
1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/iadev2005/legal-clinic-manager.git
   cd legal-clinic-manager
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   # o
   npm install
   ```

### Configuración

1. **Variables de Entorno**
   Crea un archivo `.env.local` basado en el ejemplo:
   ```bash
   cp .env.example .env.local
   ```

   Configura las siguientes llaves:
   * `DATABASE_URL`: Cadena de conexión a PostgreSQL.
   * `JWT_SECRET`: Secreto para la firma de tokens.
   * `CLOUDINARY_URL`: Credenciales para almacenamiento en la nube.

2. **Base de Datos**
   Ejecuta el script para inicializar el esquema:
   ```bash
   psql -U tu_usuario -d tu_db -f database/schema.sql
   ```

3. **Ejecutar en Desarrollo**
   ```bash
   npm run dev
   ```

   Visita [http://localhost:3000](http://localhost:3000).

---

## 📂 Estructura del Proyecto

```text
src/
├── app/                  # Rutas de Next.js App Router (auth, dashboard, cases, etc.)
├── actions/              # Server Actions (lógica de negocio: casos, citas, etc.)
├── components/           # Componentes de React y UI (Radix, Tailwind)
├── lib/                  # Utilidades (autenticación, permisos, conexión DB)
├── types/                # Definiciones y tipos de TypeScript
└── database/             # Scripts SQL y migraciones
```

---

## 🏗️ Arquitectura del Sistema

El sistema implementa una arquitectura de tres capas utilizando **Next.js Server Actions**:

* **Server Actions Pattern:** Operaciones aisladas y seguras en el servidor mediante la directiva `'use server'`.
* **Transaction Management:** Uso de transacciones explícitas para garantizar la integridad de datos en operaciones complejas.
* **Permission Gateway:** Verificación estricta de permisos mediante la función `verificarPermisoAlumno()` que consulta las relaciones de asignación y supervisión.

---

## 🔐 Roles y Permisos

| Rol | Permisos Principales |
| --- | --- |
| **Administrador** | Acceso completo, gestión de usuarios y configuración global. |
| **Coordinador** | Supervisión general, asignación de casos, reportes y eliminación. |
| **Profesor** | Control de casos supervisados y guía académica de estudiantes. |
| **Estudiante** | Gestión de casos asignados y seguimiento de actividades. |

---

## 📊 Auditoría y Cumplimiento

Se mantiene una trazabilidad completa mediante tablas dedicadas:

* **Auditoria_Casos:** Registra cambios en expedientes, beneficiarios y documentos.
* **Auditoria_Solicitantes:** Monitorea actualizaciones en los perfiles de los ciudadanos.
* **Auditoria_Usuarios:** Controla el acceso y cambios en cuentas de usuario.

---

## 📈 Reportes y Exportación

* **PDF:** Informes complejos con `@react-pdf/renderer` y tablas dinámicas con `jsPDF`.
* **Excel:** Exportación masiva de datos para análisis externo con `exceljs`.
* **Word:** Generación de documentos legales y plantillas mediante `docx`.
* **Gráficos:** Visualización de métricas clave en el Dashboard con `recharts`.

---

## 🤝 Contribución

1. Haz un **Fork** del proyecto.
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus **Commits** de forma descriptiva.
4. Abre un **Pull Request** detallando los cambios.

---

## 📄 Licencia

Este proyecto es de carácter **privado** y propiedad de la clínica jurídica. Queda prohibida su reproducción o distribución sin autorización expresa.

## 📞 Soporte

Para reportar errores o solicitar nuevas funciones, por favor abre un *Issue* en el repositorio o contacta directamente al equipo de desarrollo.
