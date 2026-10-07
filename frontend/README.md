# DINARP — Frontend (UX/UI & Sistema de Diseño)

Aplicación frontend construida con [Next.js](https://nextjs.org/) y [Tailwind CSS v4](https://tailwindcss.com/) para la plataforma **DINARP** (Dirección Nacional de Registros Públicos / Sistema Nacional de Registro de Datos Públicos).

- **Repositorio Oficial:** [https://github.com/PNI-SINARP/ux-ui](https://github.com/PNI-SINARP/ux-ui)
- **Despliegue GitHub Pages:** [https://pni-sinarp.github.io/ux-ui/](https://pni-sinarp.github.io/ux-ui/)

---

## 📋 Resumen de Flujos e Historias de Usuario (HU)

La plataforma contiene 5 bloques funcionales implementados:

1. **Identidad y Seguridad (ID-00 a ID-15):**
   - `ID-00 a ID-05`: Gestión integral de cuentas internas, auditoría de eventos y control de estados (`/cuentas-internas`, `/auditoria-cuentas`).
   - `ID-06 a ID-08`: Autenticación 2FA TOTP con Google Authenticator, autogestión de contraseñas y recuperación asistida (`/login`, `/recuperar-contrasena`, `/gestion-recuperaciones`).
   - `ID-09 & ID-12`: Activación de credenciales iniciales y vinculación TOTP vía código QR (`/establecer-contrasena`, `/vincular-autenticador`).
   - `ID-10 & ID-11`: Directorio y fichas de coordinadores institucionales (`/coordinadores`).
   - `ID-14 & ID-15`: Administración de roles, permisos y catálogo de áreas DINARP (`/roles`, `/areas`).

2. **Trámites Institucionales (Anexos ARP-R02):**
   - **Anexo A (INS-01 a INS-07):** Registro institucional, designación de coordinadores, informes de viabilidad técnica y resoluciones jurídicas (`/registro-institucion`, `/asignacion-solicitudes`, `/solicitudes-pendientes`, `/revision-normativa`).
   - **Anexo B (ENR-01 a ENR-04):** Enrolamiento y suscripción de Acuerdos de Confidencialidad por coordinadores designados (`/enrolamiento-coordinador`).
   - **Anexo C (CAM-01 a CAM-03):** Sustitución y cambio motivado de coordinadores (`/cambio-coordinador`).

3. **Interoperabilidad y Consumo de Datos (SOL, CAT, PRJ, FAC/PAG):**
   - `SOL-01..10`: Catálogo de paquetes de datos, solicitudes de acceso y aprobación técnica (`/acceso-interoperabilidad`).
   - `CAT-01`: Catálogo API público e institucional (`/catalogo-interoperabilidad`).
   - `PRJ-01`: Gestión de proyectos de consumo (`/proyectos`).
   - `FAC-01 / PAG-01..04`: Liquidación y validación financiera de comprobantes SIGEF (`/acceso-interoperabilidad/solicitudes/[id]/facturacion`).

4. **Gobernanza de Fuentes de Datos (FUE-01 a FUE-12):**
   - `FUE-01..05`: Registro de fuentes, configuración técnica de microservicios y revisión funcional (Res. 004) (`/fuentes`, `/revision-fuentes`).
   - `FUE-04`: Clasificación de sensibilidad de datos según la LOPDP por la DPI.
   - `FUE-07 & 11`: Monitoreo operativo, novedades y homologación en ambiente de pruebas (`/catalogo-interoperabilidad/novedades`).

5. **Sistema de Diseño & UIKit (UI):**
   - Tipografía unificada **Metropolis** para títulos (`font-heading`) y cuerpo (`font-sans`).
   - Tokens semánticos adaptables a modo claro/oscuro (`[data-theme="dark"]`).
   - Catálogo interactivo de componentes en `/uikit`.
   - Drawer de cuentas y roles de prueba en `/login`.

---

## 🛠️ Ejecución Local

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 📜 Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con Turbopack |
| `npm run build` | Compilación para producción (Static Export en `out/`) |
| `npm run postbuild` | Preparación de archivos para GitHub Pages (`.nojekyll`, `404.html`) |
| `npm run lint` | Análisis de código con ESLint |
