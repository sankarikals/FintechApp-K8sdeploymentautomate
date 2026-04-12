#!/usr/bin/env bash
# deploy.sh – helper script for manual Kubernetes deployments
# Usage:
#   ./scripts/deploy.sh dev   [image-tag]
#   ./scripts/deploy.sh prod  [image-tag]

set -euo pipefail

ENVIRONMENT="${1:-dev}"
IMAGE_TAG="${2:-latest}"
REGISTRY="ghcr.io/sankarikals/fintechapp"
OVERLAY_DIR="k8s/overlays/${ENVIRONMENT}"

if [[ ! -d "${OVERLAY_DIR}" ]]; then
  echo "ERROR: Unknown environment '${ENVIRONMENT}'. Use 'dev' or 'prod'."
  exit 1
fi

echo "==> Deploying FintechApp to environment: ${ENVIRONMENT}"
echo "    Image: ${REGISTRY}:${IMAGE_TAG}"

# Update image tag in the overlay
(
  cd "${OVERLAY_DIR}"
  kustomize edit set image "${REGISTRY}:latest=${REGISTRY}:${IMAGE_TAG}"
)

# Apply
kubectl apply -k "${OVERLAY_DIR}" --server-side

# Determine deployment name (dev overlay adds 'dev-' prefix)
DEPLOYMENT_NAME="fintechapp"
if [[ "${ENVIRONMENT}" == "dev" ]]; then
  DEPLOYMENT_NAME="dev-fintechapp"
fi

echo "==> Waiting for rollout to complete..."
kubectl rollout status "deployment/${DEPLOYMENT_NAME}" \
  -n fintechapp --timeout=180s

echo "==> Deployment complete!"
