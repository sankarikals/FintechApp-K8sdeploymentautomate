# FintechApp – Kubernetes Deployment Automation

A production-ready, end-to-end automated deployment setup for a Fintech REST API on Kubernetes.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Application API](#application-api)
- [Local Development](#local-development)
- [Docker](#docker)
- [Kubernetes Deployment](#kubernetes-deployment)
  - [Prerequisites](#prerequisites)
  - [Deploy with Kustomize](#deploy-with-kustomize)
  - [Deploy with Helm](#deploy-with-helm)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variables](#environment-variables)
- [Required Secrets](#required-secrets)
- [Contributing](#contributing)

---

## Architecture Overview

```
                          GitHub Actions CI/CD
                                  │
           ┌───────────┬──────────┴──────────┬───────────┐
           │           │                     │           │
        Lint/Test   Build Image          Deploy Dev   Deploy Prod
                    (GHCR push)         (kustomize)  (kustomize)
                                              │           │
                                         K8s Dev      K8s Prod
                                         Cluster      Cluster
                                              │           │
                                         ┌───┴───┐   ┌───┴───┐
                                         │  HPA  │   │  HPA  │
                                         │ 1-3   │   │ 2-10  │
                                         │ pods  │   │ pods  │
                                         └───────┘   └───────┘
```

## Project Structure

```
.
├── app/                         # Node.js Fintech API
│   ├── src/
│   │   ├── app.js               # Express application
│   │   ├── index.js             # Entry point (graceful shutdown)
│   │   ├── routes/
│   │   │   ├── health.js        # Liveness & readiness probes
│   │   │   ├── accounts.js      # Account management
│   │   │   └── transactions.js  # Transaction processing
│   │   └── store/               # In-memory data stores
│   ├── tests/                   # Jest unit tests
│   ├── Dockerfile               # Multi-stage Docker build
│   └── package.json
├── k8s/
│   ├── base/                    # Shared Kubernetes manifests
│   │   ├── namespace.yaml
│   │   ├── serviceaccount.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml          # Template – populate before applying
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── hpa.yaml
│   │   ├── pdb.yaml
│   │   └── kustomization.yaml
│   └── overlays/
│       ├── dev/                 # Dev environment (1 replica, debug logging)
│       └── prod/                # Prod environment (3 replicas, warn logging)
├── helm/
│   └── fintechapp/              # Helm chart for templated deploys
├── scripts/
│   └── deploy.sh                # Manual deployment helper
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # GitHub Actions pipeline
└── docker-compose.yml           # Local development
```

---

## Application API

Base URL: `http://localhost:3000`

### Health

| Method | Path            | Description       |
|--------|-----------------|-------------------|
| GET    | `/health`       | Liveness probe    |
| GET    | `/health/ready` | Readiness probe   |

### Accounts

| Method | Path                   | Description         |
|--------|------------------------|---------------------|
| GET    | `/api/v1/accounts`     | List all accounts   |
| POST   | `/api/v1/accounts`     | Create account      |
| GET    | `/api/v1/accounts/:id` | Get account by ID   |
| DELETE | `/api/v1/accounts/:id` | Delete account      |

**Create account body:**
```json
{ "owner": "Alice", "currency": "USD" }
```

### Transactions

| Method | Path                       | Description              |
|--------|----------------------------|--------------------------|
| GET    | `/api/v1/transactions`     | List all transactions    |
| POST   | `/api/v1/transactions`     | Create transaction       |
| GET    | `/api/v1/transactions/:id` | Get transaction by ID    |

**Create transaction body:**
```json
{ "accountId": "<uuid>", "type": "credit", "amount": 500, "description": "Salary" }
```
`type` must be `credit` or `debit`. A debit will fail with `422` if the account has insufficient funds.

---

## Local Development

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Run with Node

```bash
cd app
npm install
npm run dev
```

### Run with Docker Compose

```bash
docker compose up --build
```

The API will be available at `http://localhost:3000`.

---

## Docker

### Build manually

```bash
docker build -t fintechapp:local ./app
```

### Run container

```bash
docker run -p 3000:3000 --rm fintechapp:local
```

---

## Kubernetes Deployment

### Prerequisites

- `kubectl` configured for your cluster
- `kustomize` v5+ (or `kubectl` with built-in kustomize)
- `helm` v3+ (for Helm-based deploys)

### Deploy with Kustomize

**Dev environment:**

```bash
kubectl apply -k k8s/overlays/dev --server-side
kubectl rollout status deployment/dev-fintechapp -n fintechapp
```

**Production environment:**

```bash
# 1. Populate the secret template first
#    Edit k8s/base/secret.yaml and add base64-encoded values, then:
kubectl apply -k k8s/overlays/prod --server-side
kubectl rollout status deployment/fintechapp -n fintechapp
```

**Helper script:**

```bash
./scripts/deploy.sh dev sha-abc1234
./scripts/deploy.sh prod sha-abc1234
```

### Deploy with Helm

```bash
# Install
helm install fintechapp ./helm/fintechapp \
  --namespace fintechapp \
  --create-namespace

# Upgrade
helm upgrade fintechapp ./helm/fintechapp \
  --namespace fintechapp \
  --set image.tag=sha-abc1234

# Uninstall
helm uninstall fintechapp -n fintechapp
```

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) has four jobs:

| Job            | Trigger                  | Description                                          |
|----------------|--------------------------|------------------------------------------------------|
| `test`         | All pushes & PRs         | `npm ci` → `npm run test:ci` → upload coverage       |
| `build`        | After `test` passes      | Docker build + push to `ghcr.io` (skipped for PRs)  |
| `deploy-dev`   | After `build` (non-PR)   | `kustomize apply` to dev cluster → smoke test        |
| `deploy-prod`  | After `deploy-dev` (main only) | `kustomize apply` to prod cluster → smoke test |

### Deployment flow

```
push to main
     │
     ▼
  [test] ──── [build] ──── [deploy-dev] ──── [deploy-prod]
  18 tests    push image   kustomize         kustomize
              to GHCR      + rollout         + rollout
                           + smoke test      + smoke test
```

---

## Environment Variables

| Variable    | Default       | Description               |
|-------------|---------------|---------------------------|
| `NODE_ENV`  | `production`  | Runtime environment       |
| `PORT`      | `3000`        | HTTP server port          |
| `HOST`      | `0.0.0.0`     | Bind address              |
| `LOG_LEVEL` | `info`        | Logging verbosity         |

---

## Required Secrets

Configure these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret            | Description                                              |
|-------------------|----------------------------------------------------------|
| `DEV_KUBECONFIG`  | Base64-encoded kubeconfig for the dev cluster            |
| `PROD_KUBECONFIG` | Base64-encoded kubeconfig for the production cluster     |

`GITHUB_TOKEN` is automatically provided by GitHub Actions for GHCR image pushes.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request against `main`

All PRs must pass the CI pipeline (lint + tests) before merging.
