# ⚖️ Legal Clinic Manager

> Sistema de Gestión de Expedientes para Clínicas Jurídicas Universitarias.
> **Proyecto Académico de Bases de Datos (UCAB)**

## 📖 Descripción

**Legal Clinic Manager** es una plataforma web diseñada para automatizar el flujo de trabajo de la Clínica Jurídica de la Escuela de Derecho. El sistema permite la gestión eficiente de **Solicitantes**, **Expedientes**, **Citas** y la asignación de casos a **Estudiantes y Profesores**.

El objetivo principal es digitalizar el proceso manual actual, garantizar la trazabilidad de los datos mediante auditoría y generar reportes estadísticos para la toma de decisiones, cumpliendo con los objetivos de desarrollo sostenible (ODS 16: Paz, Justicia e Instituciones Sólidas).

---

## 🛠️ Stack Tecnológico

Este proyecto utiliza una arquitectura **Monolítica Modular** basada en Next.js, con una estricta política de **NO ORM** para el manejo de datos, priorizando el uso de SQL Nativo y características avanzadas del motor de base de datos.

* **Framework Fullstack:** [Next.js 14+](https://nextjs.org/) (App Router & Server Actions).
* **Base de Datos:** PostgreSQL 15+.
* **Conectividad:** `pg` (node-postgres) - Driver nativo.
* **Estilos:** Tailwind CSS + Shadcn/ui (opcional).
* **Iconografía:** Lucide React.
* **Control de Versiones:** Git & GitHub.

---

## 🏗️ Arquitectura del Proyecto

El sistema implementa el **Patrón Repository** para desacoplar la lógica de negocio de las consultas a la base de datos. Esto permite mantener el código limpio y organizado sin depender de un ORM.

### Estructura de Directorios

```text
/legal-clinic-manager
├── 📁 app/                   # 🖥️ FRONTEND (Next.js App Router)
│   ├── 📁 (auth)/            # Rutas de Login/Registro
│   ├── 📁 dashboard/         # Rutas Privadas (Expedientes, Usuarios)
│   └── layout.tsx            # Layout principal
│
├── 📁 lib/                   # ⚙️ CONFIGURACIÓN CORE
│   ├── db.js                 # Singleton del Pool de conexión PostgreSQL
│   ├── definitions.ts        # Tipos e Interfaces TypeScript/JSDoc
│   └── utils.js              # Funciones auxiliares
│
├── 📁 repositories/          # 🛡️ CAPA DE ACCESO A DATOS (Raw SQL)
│   ├── usuario-repo.js       # Consultas CRUD para usuarios
│   ├── caso-repo.js          # Consultas complejas de expedientes
│   └── stats-repo.js         # Consultas para reportes y gráficas
│
├── 📁 services/              # 🧠 LÓGICA DE NEGOCIO (Server Actions)
│   ├── auth-service.js       # Manejo de sesión y roles
│   └── expedientes.js        # Orquestador de creación de casos
│
├── 📁 components/            # 🧩 UI COMPONENTS
│   ├── 📁 ui/                # Átomos (Botones, Inputs)
│   └── 📁 forms/             # Formularios de negocio
│
└── 📁 database/              # 🗄️ ARCHIVOS SQL (Requisito Académico)
    ├── 01_init.sql           # DDL: Tablas (Solicitante, Caso, Usuario)
    ├── 02_constraints.sql    # Integridad referencial
    ├── 03_functions.sql      # Stored Procedures (Generador de IDs)
    └── 04_triggers.sql       # Auditoría automática
