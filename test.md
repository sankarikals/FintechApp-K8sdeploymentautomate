Account Service – Local Setup Guide
🧩 Overview

The Account Service is a FastAPI-based microservice responsible for:

Creating customer accounts
Fetching account details
Managing account data persistence in MySQL
Exposing health and metrics endpoints
🏗️ Architecture (Local Setup)
Account Service (FastAPI)
        │
        │  SQLAlchemy (ORM)
        ▼
MySQL (Docker Container)
⚙️ Prerequisites

Ensure the following are installed:

Python 3.10+
Docker
pip (Python package manager)
Git
📂 Project Structure
FintechApp-K8sdeploymentautomate/
└── banking-services/
    ├── account-service/
    ├── auth-service/
    ├── transaction-service/
    ├── common/
    └── setup.py
🚀 Setup & Execution Steps
1️⃣ Clone the Repository
git clone <your-repo-url>
cd FintechApp-K8sdeploymentautomate
2️⃣ Checkout Required Branch
git checkout feature/k8
3️⃣ Install Shared Module (common)

Navigate to banking-services and install:

cd banking-services
pip install -e .

✔ This resolves shared imports like:

from common.middleware import MetricsMiddleware
4️⃣ Start MySQL using Docker
docker run -d --name account-mysql \
-e MYSQL_ROOT_PASSWORD=password \
-e MYSQL_DATABASE=account_db \
-p 3306:3306 \
mysql:8
5️⃣ Verify MySQL Container
docker ps

✔ Ensure account-mysql is running

6️⃣ Configure Environment Variables

Navigate to account service:

cd banking-services/account-service

Set environment variables:

For PowerShell (Windows)
$env:MYSQL_HOST="localhost"
$env:MYSQL_ROOT_PASSWORD="password"
$env:MYSQL_DB="account_db"
7️⃣ Validate Application (Optional)
python app.py

✔ Confirms:

Database connectivity
Table creation
8️⃣ Run FastAPI Server
python -m uvicorn app:app --reload --port 8000
🌐 Access the Application
Feature	URL
Create Account	http://localhost:8000/accounts

Search Account	http://localhost:8000/account-details

Health Check	http://localhost:8000/health

Metrics	http://localhost:8000/metrics
🧪 Testing the Service
✅ Create Account
Open /accounts
Fill form
Submit
✅ Fetch Account Details
Open /account-details
Enter customer_id
🗄️ Verify Data in MySQL
docker exec -it account-mysql mysql -uroot -ppassword
USE account_db;
SELECT * FROM accounts;
⚠️ Troubleshooting
❌ Uvicorn not recognized
python -m uvicorn app:app --reload --port 8000
❌ MySQL connection error
Can't connect to MySQL server on 'account-mysql'

✔ Fix:

Set MYSQL_HOST=localhost
❌ Module not found (common)
pip install -e .
🧠 Key Concepts
Environment-based configuration
Local → localhost
Docker/K8s → account-mysql
FastAPI requires ASGI server (uvicorn)
SQLAlchemy used as ORM for DB interaction
✅ Outcome
Account service successfully runs locally
Connected to MySQL container
APIs accessible via browser
Data persisted in database
🚀 Future Enhancements
Integrate with auth-service for authentication
Connect with transaction-service
Setup docker-compose for multi-service orchestration
Deploy to Kubernetes cluster



Step-by-Step: Run Transaction Service
📂 1. Go to transaction-service
cd ../transaction-service
📦 2. Install dependencies

👉 Check if requirements.txt exists

ls

If present, run:

pip install -r requirements.txt
🧩 3. Ensure common module is already installed

You already ran:

pip install -e .

from banking-services ✅

👉 So no need again (only once required)

🐬 4. Start MySQL for transaction-service
docker run -d --name transaction-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=transaction_db -p 3307:3306 mysql:8
🔍 5. Verify container
docker ps
⚙️ 6. Set environment variables
$env:MYSQL_HOST="localhost"
$env:MYSQL_ROOT_PASSWORD="password"
$env:MYSQL_DB="transaction_db"
$env:MYSQL_PORT="3307"
▶️ 7. Run basic test (important)
python app.py

👉 This step checks:

DB connection
Table creation
🚀 8. Run service properly (FastAPI)
python -m uvicorn app:app --reload --port 8001
🌐 9. Access service
http://localhost:8001
🧪 10. Test endpoints

Try:

http://localhost:8001/health
http://localhost:8001/transactions (or similar)
⚠️ IMPORTANT CHECK (very common issue)

Open app.py and confirm this:

MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))

👉 If it is:

MYSQL_PORT = 3306

❌ Change it → otherwise it won’t connect to port 3307

🔥 Quick Summary
Step	Status
Install requirements	⬅️ do now
Start MySQL	⬅️ do
Set env vars	⬅️ do
Run python app.py	⬅️ test
Run uvicorn	⬅️ final
🚀 After this works

We can:

Connect transaction → account service
Test real flow (debit/credit)
Run everything in docker-compose
Deploy to your KIND cluster

👉 Go ahead and run:

pip install -r requirements.txt
python app.py






















EADME Version (Copy-Paste Ready)

👉 Copy everything below 👇 directly into your README.md

# 📘 Fintech Application Deployment Guide

---

## 1️⃣ Local Development Testing

### 🎯 Objective
Run services locally to verify:
- Code works
- Dependencies are correct
- APIs respond properly

---

### 📁 Step 1: Navigate to Project
```bash
cd banking-services
📦 Step 2: Install Common Dependencies
cd common
pip install -e .
🚀 Step 3: Run Services
Account Service
cd ../account-service
python app.py
Transaction Service
cd ../transaction-service
python app.py
Auth Service
cd ../auth-service
python app.py
🗄️ Step 4: Run MySQL
docker run -d -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=banking \
  mysql:8
🧪 Step 5: Test APIs
curl http://localhost:8081/health
curl http://localhost:8082/health
curl http://localhost:8083/health
2️⃣ Docker Compose Testing
🎯 Objective

Validate containerized environment

🏗️ Step 1: Build Images
docker-compose build
🚀 Step 2: Start Services
docker-compose up
🔍 Step 3: Verify Containers
docker ps
🗄️ Step 4: Create Databases
docker exec -it fintech-mysql mysql -u root -p
CREATE DATABASE account_db;
CREATE DATABASE transaction_db;
CREATE DATABASE auth_db;
🧪 Step 5: Test APIs
curl http://localhost:8081/health
curl http://localhost:8082/health
curl http://localhost:8083/health
🔧 Troubleshooting
docker-compose logs account-service
3️⃣ KIND (Kubernetes) Testing
🎯 Objective

Validate Kubernetes deployment

⚙️ Step 1: Create Cluster
kind create cluster --name fintech-cluster
📦 Step 2: Build Images
docker build -t banking-services-account-service ./account-service
docker build -t banking-services-transaction-service ./transaction-service
docker build -t banking-services-auth-service ./auth-service
📥 Step 3: Load Images into KIND
kind load docker-image banking-services-account-service --name fintech-cluster
kind load docker-image banking-services-transaction-service --name fintech-cluster
kind load docker-image banking-services-auth-service --name fintech-cluster
🗄️ Step 4: Create Init SQL
cd kubernetes/base/mysql
touch init.sql
CREATE DATABASE account_db;
CREATE DATABASE transaction_db;
CREATE DATABASE auth_db;
🧩 Step 5: Create ConfigMap
kubectl create configmap mysql-init-script \
  --from-file=init.sql=init.sql -n banking
🚀 Step 6: Deploy
kubectl apply -f kubernetes/base/mysql/
kubectl apply -f kubernetes/base/deployments/
kubectl apply -f kubernetes/base/services/
🔍 Step 7: Check Pods
kubectl get pods -n banking
🧪 Step 8: Logs
kubectl logs <pod-name> -n banking
🌐 Step 9: Port Forward
kubectl port-forward svc/account-service 8081:8081 -n banking
kubectl port-forward svc/auth-service 8082:8082 -n banking
kubectl port-forward svc/transaction-service 8083:8083 -n banking
🧪 Step 10: Test APIs
curl http://localhost:8081/health
4️⃣ AWS EKS Deployment (Future Plan)
🎯 Objective

Automate CI/CD pipeline

🔁 Flow
Code Push → GitHub
Build Docker Images
Push to AWS ECR
Deploy to EKS
🔐 Required Setup
AWS ECR
EKS Cluster
IAM Roles
GitHub Secrets
📄 Sample GitHub Actions
name: Deploy to EKS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Build Image
      run: docker build -t my-app .

    - name: Push to ECR
      run: |
        aws ecr get-login-password
        docker push <repo>

    - name: Deploy
      run: kubectl apply -f k8s/
✅ Summary
Stage	Purpose
Local	Debug code
Docker	Validate containers
KIND	Validate Kubernetes
EKS	Production deployment

---

# 🔥 Pro Tips (Important)

- Always save file as: `README.md`
- Push to GitHub → it auto formats
- Don’t paste into `.txt` or Word

---

If you want next level:
👉 I can :contentReference[oaicite:0]{index=0}  
👉 Or :contentReference[oaicite:1]{index=1}




//////////////////////////

kubectl create namespace monitoring

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts; helm repo add grafana https://grafana.github.io/helm-charts; helm repo update

https://github.com/helm/helm/releases

 Get-Command helm -ErrorAction SilentlyContinue > to make helm command work in vs code
 
 Install >
 
 helm install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
 
 entautomate> helm install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
NAME: monitoring
LAST DEPLOYED: Sat Apr 18 15:05:19 2026
NAMESPACE: monitoring
STATUS: deployed
REVISION: 1
DESCRIPTION: Install complete
TEST SUITE: None
NOTES:
kube-prometheus-stack has been installed. Check its status by running:
  kubectl --namespace monitoring get pods -l "release=monitoring"

Get Grafana 'admin' user password by running:

  kubectl --namespace monitoring get secrets monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 -d ; echo

Access Grafana local instance:

  export POD_NAME=$(kubectl --namespace monitoring get pod -l "app.kubernetes.io/name=grafana,app.kubernetes.io/instance=monitoring" -oname)
  kubectl --namespace monitoring port-forward $POD_NAME 3000

Get your grafana admin user password by running:

  kubectl get secret --namespace monitoring -l app.kubernetes.io/component=admin-secret -o jsonpath="{.items[0].data.admin-password}" | base64 --decode ; echo


Visit https://github.com/prometheus-operator/kube-prometheus for instructions on how to create & configure Alertmanager and Prometheus instances using the Operator
 
 
 
 Perfect! Here’s how to upload your custom Grafana dashboard (service-dashboard.json) to the Grafana instance deployed by kube-prometheus-stack:

Get the Grafana admin password:
kubectl get secret --namespace monitoring monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 --decode

LeGbJGR1LyLSlvHs1wreNIKJ3SIphML8NZp8n2gi

Forward the Grafana service to your local machine:
kubectl port-forward --namespace monitoring svc/monitoring-grafana 3000:80

Open your browser and go to:
http://localhost:3000
Login with username: admin and the password from step 1.

In Grafana, go to Dashboards → Import, upload your service-dashboard.json file, and select the Prometheus data source.


Great! Here’s how to see your application metrics in Grafana and access the Prometheus UI:

1. Grafana:

Go to http://localhost:3000 and log in.
Click the “+” icon on the left, then “Import.”
Upload your service-dashboard.json file or paste its content.
For “Prometheus” data source, select the one named “Prometheus” (it’s auto-provisioned by the Helm chart).
Click “Import.” Your dashboard will now show your application metrics if your services expose Prometheus metrics and are being scraped.
2. Prometheus UI:

In a new terminal, run:
kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-sta-prometheus 9090:9090
Open http://localhost:9090 in your browser.
You can now query metrics directly in the Prometheus UI.



If you see "No data" in your Grafana dashboard, it usually means Prometheus is not scraping your application's metrics. Here’s how to fix it:

1. Check your application exposes Prometheus metrics:

Your app should have an endpoint like /metrics returning Prometheus-formatted metrics.
2. Create a ServiceMonitor or PodMonitor for your app:

The kube-prometheus-stack uses ServiceMonitor or PodMonitor CRDs to discover and scrape targets.
Example ServiceMonitor YAML (replace labels/selectors/ports as needed):
3. Ensure your Service has the correct labels and exposes the metrics port.

4. Apply the ServiceMonitor:
kubectl apply -f servicemonitor.yaml

5. Wait a minute, then check Prometheus targets:

Go to http://localhost:9090/targets
Your app should appear as “UP” in the list.
6. Refresh your Grafana dashboard.

If you need a custom ServiceMonitor YAML, please provide:

The namespace of your app
The name of the Kubernetes Service exposing metrics

The port name or number for metrics
