# DINARP — Frontend (UX/UI)

Aplicación frontend construida con [Next.js](https://nextjs.org/) y Tailwind CSS v4 para la plataforma **DINARP** (Dirección Nacional de Registros Públicos).

Repositorio: [https://github.com/PNI-SINARP/ux-ui](https://github.com/PNI-SINARP/ux-ui)

---

## Inicio Rápido

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Estructura

```
frontend/
├── src/
│   ├── app/             # Rutas y páginas de la aplicación
│   ├── components/      # Componentes UI (Shadcn/Radix) y compartidos
│   ├── modules/         # Módulos de funcionalidad DINARP
│   ├── hooks/           # Custom hooks
│   └── lib/             # Helpers y utilidades
├── public/              # Archivos estáticos
└── next.config.ts       # Configuración de Next.js
```

---

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Ejecutar linter |
