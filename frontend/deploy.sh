#!/usr/bin/env bash
# Despliega minedec-geoportal (kit de diseño) a Cloud Run en mec-001-dev-aurora (desarrollo).
#
# Uso: ./deploy.sh

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

gcloud run deploy kit-de-diseno-dev \
  --source . \
  --region us-central1 \
  --project mec-001-dev-aurora \
  --service-account backend-agentica@mec-001-dev-aurora.iam.gserviceaccount.com \
  --build-service-account projects/mec-001-dev-aurora/serviceAccounts/backend-agentica@mec-001-dev-aurora.iam.gserviceaccount.com \
  --set-env-vars="NEXT_PUBLIC_API_URL_CONTACTO=https://dev-contacto-330426731666.us-east1.run.app,ENVIRONMENT=dev,KIT_ASSETS_BUCKET=minedec-kit-assets" \
  --allow-unauthenticated \
  --clear-base-image \
  --quiet
