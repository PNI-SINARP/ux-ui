# DINARP — UX/UI

Plataforma de interfaz de usuario y prototipado para la **DINARP** (Dirección Nacional de Registros Públicos / Sistema Nacional de Registro de Datos Públicos).

Repositorio oficial: [https://github.com/PNI-SINARP/ux-ui](https://github.com/PNI-SINARP/ux-ui)

---

## 🚀 Tecnologías

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Componentes UI:** Shadcn UI + Radix UI Primitives
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Animaciones:** `tw-animate-css`, `framer-motion`
- **Gestión de Formularios:** React Hook Form + Zod

---

## 📦 Módulos del Sistema

- **Catálogo de Interoperabilidad:** Consulta, administración, fuentes de datos, procesos e integraciones.
- **Gestión de Solicitudes:** Enrolamiento, revisión normativa, asignación y gestión de resoluciones.
- **Coordinadores Institucionales:** Enrolamiento, detalle, actualización de contacto y suspensión/reactivación.
- **Roles y Permisos:** Administración granular de accesos, creación y edición de roles y matriz de impacto.
- **Cuentas Internas:** Gestión de usuarios del sistema, expedientes y control de estados.
- **Gestión de Recuperaciones:** Autorizaciones, denegaciones y evidencias para recuperación de accesos.
- **Configuración e Identidad:** Identidad visual institucional, auditoría de versiones y servicios de acceso.
- **UI Kit:** Catálogo de componentes estandarizados y guía de estilos del sistema de diseño.

---

## 🛠️ Instalación y Ejecución

### Prerrequisitos
- Node.js 20+
- npm o pnpm

### Pasos

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/PNI-SINARP/ux-ui.git
   cd ux-ui/frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

---

## 📂 Estructura del Proyecto

```
DINARP/
├── .github/                 # Workflows de CI/CD y despliegue
└── frontend/                # Aplicación Next.js
    ├── src/
    │   ├── app/             # Rutas, layouts y páginas
    │   ├── components/      # UI primitives y componentes compartidos
    │   ├── hooks/           # Custom React hooks
    │   ├── lib/             # Utilidades generales
    │   └── modules/         # Módulos de negocio (vistas, stores, componentes)
    ├── public/              # Recursos estáticos
    └── package.json         # Configuración y dependencias
```

---

## 📜 Scripts Disponibles

Desde la carpeta `frontend/`:

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo en modo local |
| `npm run build` | Compila el proyecto para producción |
| `npm run start` | Inicia el servidor optimizado para producción |
| `npm run lint` | Ejecuta el análisis de linter (ESLint) |
