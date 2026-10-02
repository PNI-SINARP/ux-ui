# Certificados Laborales v2

Aplicación web construida con [Next.js](https://nextjs.org) para la generación de certificados laboralesgg.

## Inicio Rápido

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador para ver el resultado.

El archivo principal de la página es `src/app/page.tsx`. Los cambios se reflejan automáticamente al guardar.

## Estructura del Proyecto

```
├── src/app/              # Páginas y layouts de la aplicación
├── public/               # Archivos estáticos
├── app.yaml              # Configuración de App Engine
├── cloudbuild-dev.yaml   # Pipeline CI/CD para desarrollo (mintic-cert-laborales-dev)
├── cloudbuild-qa.yaml    # Pipeline CI/CD para QA (mintic-cert-laborales-qa)
├── cloudbuild-prod.yaml  # Pipeline CI/CD para producción (mintic-cert-laborales-prod)
└── next.config.ts        # Configuración de Next.js
```

## Estrategia de Ramas

| Rama   | Entorno     | Proyecto GCP               | Archivo Cloud Build      |
|--------|-------------|----------------------------|--------------------------|
| `dev`  | Desarrollo  | `mintic-cert-laborales-dev`  | `cloudbuild-dev.yaml`  |
| `qa`   | QA          | `mintic-cert-laborales-qa`   | `cloudbuild-qa.yaml`   |
| `main` | Producción  | `mintic-cert-laborales-prod` | `cloudbuild-prod.yaml` |

## Despliegue

El despliegue se realiza automáticamente mediante **Cloud Build** hacia **App Engine** al hacer push a la rama correspondiente.

### Requisitos previos en cada proyecto GCP

1. Tener habilitada la API de App Engine
2. Tener habilitada la API de Cloud Build
3. Configurar un trigger en Cloud Build apuntando al archivo `cloudbuild-{env}.yaml` correspondiente y a la rama correcta

### Despliegue manual (opcional)

```bash
# Construir la aplicación
npm run build

# El resultado standalone queda en .next/standalone/
```

## Scripts Disponibles

| Comando         | Descripción                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Servidor de desarrollo               |
| `npm run build` | Compilar para producción             |
| `npm run start` | Iniciar servidor de producción       |
| `npm run lint`  | Ejecutar el linter                   |

