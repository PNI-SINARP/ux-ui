# DINARP — Plataforma UX/UI & Sistema de Diseño

Plataforma de interfaz de usuario, prototipado interactivo y sistema de diseño oficial para la **DINARP** (Dirección Nacional de Registros Públicos / Sistema Nacional de Registro de Datos Públicos).

- **Repositorio Oficial:** [https://github.com/PNI-SINARP/ux-ui](https://github.com/PNI-SINARP/ux-ui)
- **Despliegue en Vivo (GitHub Pages):** [https://pni-sinarp.github.io/ux-ui/](https://pni-sinarp.github.io/ux-ui/)

---

## 🎯 Objetivo del Proyecto

Centralizar la experiencia de usuario y los flujos normativos, técnicos y operativos de interoperabilidad del Estado ecuatoriano, garantizando cumplimiento de la **Ley Orgánica de Protección de Datos Personales (LOPDP)**, resoluciones institucionales DINARP (Res. 004, ARP-R02) y accesibilidad **WCAG 2.1 AA**.

---

## 📋 Historias de Usuario (HU) y Flujos Implementados

El sistema implementa 5 bloques funcionales principales estructurados mediante códigos de Historias de Usuario (HU):

### 1. 🔐 Flujos de Identidad y Seguridad (ID-00 a ID-15)

Control de identidades, autenticación de doble factor y administración del directorio institucional.

| Código HU | Historia de Usuario / Flujo | Ruta / Vista | Actor Principal |
|---|---|---|---|
| **ID-00** | Arquitectura base de autenticación e identidades | `/login` | Sistema |
| **ID-01** | Listado y consulta de cuentas internas con filtros por estado y área | `/cuentas-internas` | Administrador del Sistema |
| **ID-02** | Creación de cuentas internas con asignación de roles y área | `/cuentas-internas/nueva` | Administrador del Sistema |
| **ID-03** | Edición de cuentas internas y actualización de perfiles | `/cuentas-internas/[id]/editar` | Administrador del Sistema |
| **ID-04** | Gestión de estados de cuenta (Activar, Suspender, Dar de Baja) | `/cuentas-internas/[id]` | Administrador del Sistema |
| **ID-05** | Auditoría y trazabilidad de eventos de seguridad | `/auditoria-cuentas` | Administrador del Sistema |
| **ID-06** | Autenticación con credenciales y segundo factor TOTP (Google Authenticator) | `/login` | Usuario Habilitado |
| **ID-07** | Autogestión de restablecimiento de contraseña | `/recuperar-contrasena`, `/restablecer-contrasena` | Usuario Habilitado |
| **ID-08** | Recuperación asistida de factor de autenticación 2FA | `/gestion-recuperaciones`, `/verificar-recuperacion` | Administrador / Usuario |
| **ID-09** | Activación de cuenta inicial desde enlace seguro de un solo uso | `/establecer-contrasena` | Usuario en Activación |
| **ID-10** | Directorio y consulta de coordinadores institucionales | `/coordinadores` | Administrador del Sistema |
| **ID-11** | Detalle y actualización de contacto de coordinadores | `/coordinadores/[id]` | Administrador del Sistema |
| **ID-12** | Vinculación y enrolamiento de Google Authenticator vía código QR | `/vincular-autenticador` | Usuario en Activación |
| **ID-14** | Catálogo y matriz de administración de roles y permisos | `/roles` | Administrador del Sistema |
| **ID-15** | Catálogo y configuración de áreas y direcciones DINARP | `/areas` | Administrador del Sistema |

---

### 2. 📑 Flujos de Trámites Institucionales (Anexos ARP-R02)

Formalización jurídica, validación técnica y emisión de resoluciones institucionales.

#### Flujo Anexo A — Registro de Institución y Resolución Jurídica (INS-01 a INS-07)
| Código HU | Historia de Usuario / Flujo | Ruta / Vista | Actor Principal |
|---|---|---|---|
| **INS-01** | Registro de entidad requirente y datos del representante legal | `/registro-institucion` | Representante Legal |
| **INS-02** | Carga de nombramientos, base legal y designación de coordinadores | `/registro-institucion` (Paso 2 y 3) | Representante Legal |
| **INS-03** | Generación de borrador y formalización de solicitud (Anexo A) con firma | `/registro-institucion` (Paso 4) | Representante Legal |
| **INS-04** | Bandeja de recepción y asignación de expedientes a revisores técnicos | `/asignacion-solicitudes` | Director Área de Gestión |
| **INS-05** | Revisión de requisitos y emisión de informe de viabilidad técnica | `/solicitudes-pendientes` | Revisor Área de Gestión |
| **INS-06** | Control de legalidad, dictamen jurídico y expediente normativo | `/revision-normativa` | Revisor Área de Normativa |
| **INS-07** | Emisión, suscripción y notificación de resolución institucional | `/revision-normativa/[id]/gestionar-resolucion` | Director Área de Normativa |

#### Flujo Anexo B — Enrolamiento de Coordinador Institucional (ENR-01 a ENR-04)
| Código HU | Historia de Usuario / Flujo | Ruta / Vista | Actor Principal |
|---|---|---|---|
| **ENR-01** | Notificación y acceso para formalización de coordinador designado | `/enrolamiento-coordinador` | Coordinador Prerregistrado |
| **ENR-02** | Validación de datos institucionales y lectura de acuerdo de confidencialidad | `/enrolamiento-coordinador` (Paso 1 y 2) | Coordinador Titular / Suplente |
| **ENR-03** | Firma electrónica del Acuerdo de Confidencialidad (Anexo B) | `/enrolamiento-coordinador` (Paso 3) | Coordinador / Gestión |
| **ENR-04** | Activación automática de perfil y emisión de credenciales de acceso | `/enrolamiento-coordinador` (Paso 4) | Sistema |

#### Flujo Anexo C — Sustitución / Cambio de Coordinador (CAM-01 a CAM-03)
| Código HU | Historia de Usuario / Flujo | Ruta / Vista | Actor Principal |
|---|---|---|---|
| **CAM-01** | Solicitud motivada de sustitución de coordinador titular o suplente | `/cambio-coordinador` | Representante Institucional |
| **CAM-02** | Asignación, análisis y validación de expediente de sustitución | `/asignacion-solicitudes`, `/solicitudes-pendientes` | Área de Gestión |
| **CAM-03** | Actualización en directorio oficial y revocación de accesos previos | `/coordinadores` | Área de Gestión / Sistema |

#### Flujo BN-04 — Gestión de Suplencias Temporal y Administrativa (AUS-01 a AUS-03)
| Código HU | Historia de Usuario / Flujo | Ruta / Vista | Actor Principal |
|---|---|---|---|
| **AUS-01** | Programación y confirmación de rango de inactividad del titular | `/suplencias` | Coordinador Titular |
| **AUS-02** | Activación y desactivación administrativa de suplencia institucional | `/suplencias` | Administrador del Sistema |
| **AUS-03** | Conmutación y restitución de permisos de suplencia sin alterar credenciales API | `/suplencias` | Portal DINARP / Sistema |

---

### 3. 🌐 Interoperabilidad y Consumo de Datos (SOL, CAT, PRJ, FAC/PAG)

Solicitud de paquetes de datos, consulta de APIs y liquidación de servicios arancelados.

| Código HU | Historia de Usuario / Flujo | Ruta / Vista | Actor Principal |
|---|---|---|---|
| **CAT-01** | Catálogo público y técnico de servicios de datos e integraciones API | `/catalogo-interoperabilidad` | Coordinador / Público |
| **SOL-01** | Exploración y selección de paquetes de datos por temática | `/acceso-interoperabilidad/paquetes` | Coordinador SINARP |
| **SOL-02** | Creación y radicación de solicitud de acceso a interoperabilidad | `/acceso-interoperabilidad/nueva` | Coordinador SINARP |
| **SOL-07** | Bandeja de análisis técnico y pertinencia jurídica de solicitudes | `/acceso-interoperabilidad` | Aprobador Institucional |
| **SOL-08** | Carga de informes de finalidad de uso y dictamen institucional | `/acceso-interoperabilidad/[id]` | Aprobador Institucional |
| **SOL-10** | Resolución final de otorgamiento o rechazo de acceso | `/acceso-interoperabilidad/[id]` | Aprobador Institucional |
| **PRJ-01** | Administración de proyectos institucionales de consumo | `/proyectos` | Coordinador SINARP |
| **FAC-01 / PAG-01..04** | Liquidación de tasas, validación de comprobantes SIGEF y facturación | `/acceso-interoperabilidad/solicitudes/[id]/facturacion` | Analista de Facturación |

---

### 4. 🗄️ Gestión y Gobernanza de Fuentes de Datos (FUE-01 a FUE-12)

Incorporación, factibilidad técnica y cumplimiento de la LOPDP para fuentes de datos.

| Código HU | Historia de Usuario / Flujo | Ruta / Vista | Actor Principal |
|---|---|---|---|
| **FUE-01** | Registro y radicación de nueva fuente de datos pública o privada | `/fuentes/nueva` | Dirección de Tecnología (DTD) |
| **FUE-02** | Configuración técnica de endpoints, esquemas JSON y autenticación | `/fuentes/nueva` (Paso 2) | Dirección de Tecnología (DTD) |
| **FUE-03** | Revisión funcional y cumplimiento de estándares (Res. 004) | `/revision-fuentes` | Gestión y Registro (DGR) |
| **FUE-04** | Clasificación de campos según LOPDP (Accesible / Confidencial) | `/fuentes/[id]` | Protección de Información (DPI) |
| **FUE-05** | Administración, despliegue y monitoreo de microservicios | `/fuentes` | Dirección de Tecnología (DTD) |
| **FUE-07** | Registro de incidentes, novedades y bitácora operativa de fuentes | `/catalogo-interoperabilidad/novedades` | DGR / Operaciones |
| **FUE-11** | Homologación en ambiente de pruebas y pase a producción | `/catalogo-interoperabilidad/administracion` | DTD / DGR |

---

### 5. 🎨 Sistema de Diseño y UIKit (UI)

Infraestructura de componentes estandarizados y guía de estilos accesible.

- **Tipografía Unificada:** Familia tipográfica **Metropolis** aplicada tanto en títulos (`font-heading`) como en cuerpo de texto (`font-sans`).
- **Sistema de Tokens Semánticos:** Mapeo de tokens CSS en `src/app/globals.css` (`bg-primary`, `bg-surface`, `text-foreground`, etc.) con soporte automático para modo claro y oscuro (`[data-theme="dark"]`).
- **Catálogo de Componentes:** Formularios, Combobox, Sliders, Tablas con paginación, Date Pickers, Modales y Badges accesibles (`/uikit`).
- **Drawer de Cuentas de Prueba:** Acceso instantáneo a credenciales y cédulas de prueba organizadas por los 5 flujos del sistema en la vista de inicio de sesión (`/login`).
- **Cumplimiento de Accesibilidad:** Estándar WCAG 2.1 AA con contraste verificado y navegación por teclado.

---

## 👥 Perfiles y Cuentas de Prueba Disponibles

Desde el botón **"Cuentas de Prueba"** en `/login`, se pueden alternar los siguientes perfiles de demostración:

| Rol | Usuario de Prueba | Cédula | Flujo Asignado |
|---|---|---|---|
| **Administrador del Sistema** | Admin Portal | `1799999999` | Flujo Administrador (ID-00..05, 08, 10..15) |
| **Usuario Habilitado** | Funcionario Habilitado | `1715489621` | Usuario 2FA y Restablecimiento (ID-06, 07) |
| **Usuario en Activación** | Usuario Pendiente Activación | `1718956234` | Contraseña inicial y TOTP (ID-09, 12) |
| **Representante Legal** | Marcelo Albuja | `1710001112` | Anexo A - Registro Institucional (INS-01..03) |
| **Director Área de Gestión** | Director Gestión | `1711223344` | Asignación de Trámites (INS-04) |
| **Revisor Área de Gestión** | Ana Torres | `1111111111` | Viabilidad Técnica (INS-05) |
| **Director Área de Normativa** | Director Normativa | `2222222222` | Resolución Jurídica (INS-06, 07) |
| **Revisor Área de Normativa** | Revisor Normativa | `3333333333` | Dictamen Legal (INS-06) |
| **Coordinador Titular** | Roberto Dávila | `1715489621` | Anexo B - Enrolamiento Coordinador (ENR-01..04) |
| **Coordinador Titular (Suplencias)** | Juan Pérez | `1712345678` | Gestión de Suplencias (AUS-01) |
| **Coordinador Suplente** | Mariana Almeida | `1714443322` | Gestión de Suplencias (AUS-01..03) |
| **Representante Institucional** | Carlos Andrade | `1716789019` | Anexo C - Sustitución de Coordinador (CAM-01..03) |
| **Coordinador SINARP** | Andrea López | `1712345678` | Solicitudes y Catálogo API (SOL-01, 02) |
| **Aprobador Institucional** | Dr. Roberto Méndez | `1719876543` | Aprobación de Interoperabilidad (SOL-07..10) |
| **Analista de Facturación** | Lcda. Patricia Morales | `1718765432` | Validación de Pagos SIGEF (FAC-01) |
| **Gestión y Registro (DGR)** | María Torres | `1717654321` | Revisión Técnica de Fuentes (FUE-03, 07) |
| **Tecnología y Desarrollo (DTD)** | Carlos Mena | `1716543210` | Registro y Microservicios (FUE-01, 02, 05) |
| **Protección de Datos (DPI)** | Daniela Ruiz | `1715432109` | Clasificación LOPDP (FUE-04) |

---

## 🚀 Tecnologías

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19, TypeScript)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Componentes UI:** Shadcn UI + Radix UI Primitives
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Animaciones:** `tw-animate-css`, `framer-motion`
- **Formularios & Validación:** React Hook Form + Zod
- **Tipografía:** Metropolis (Heading y Body unificado)

---

## 🛠️ Instalación y Ejecución Local

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

## 📦 Scripts Disponibles

Desde el directorio `frontend/`:

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el entorno de desarrollo local con Turbopack |
| `npm run build` | Compila el proyecto y genera el export estático en `out/` |
| `npm run postbuild` | Genera archivo `.nojekyll` y redirección 404 para GitHub Pages |
| `npm run start` | Inicia el servidor optimizado para producción |
| `npm run lint` | Ejecuta la auditoría de calidad de código con ESLint |

---

## 🌐 Despliegue en GitHub Pages

El proyecto cuenta con un workflow de despliegue continuo automatizado en `.github/workflows/gh-pages.yml`:
- **Disparador:** Cada `push` a la rama `main`.
- **Artefacto:** Export estático Next.js en `./frontend/out`.
- **Enlace:** [https://pni-sinarp.github.io/ux-ui/](https://pni-sinarp.github.io/ux-ui/)
