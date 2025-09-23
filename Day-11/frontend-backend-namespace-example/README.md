# Kubernetes Namespaces Demo — Frontend & Backend

This demo showcases **two deployment scenarios** using Kubernetes **Namespaces** with a simple Frontend and Backend Python app.

---

##  Applications

- **Backend**: Flask API on port `5000`
- **Frontend**: Flask app calling the backend via `BACKEND_URL`

Images must be pushed to your DockerHub:
```bash
docker build -t balakrishna625/backend-demo ./backend
docker push balakrishna625/backend-demo

docker build -t balakrishna625/frontend-demo ./frontend
docker push balakrishna625/frontend-demo
```

---

##  Folder Structure

```
frontend-backend-namespace-demo/
├── manifests-common/
│   └── namespaces.yaml
├── scenario-1-same-namespace/
│   ├── backend.yaml
│   └── frontend.yaml
├── scenario-2-different-namespaces/
│   ├── backend.yaml
│   └── frontend.yaml
```

---

## Scenario 1: Same Namespace

In this scenario, both apps are in the same namespace (`dev`).  
➡ Service discovery works with short names like `http://backend:5000`

###  Deploy:
```bash
kubectl apply -f manifests-common/namespaces.yaml
kubectl apply -f scenario-1-same-namespace/backend.yaml
kubectl apply -f scenario-1-same-namespace/frontend.yaml
```

---

##  Scenario 2: Different Namespaces

In this setup:
- Backend is in namespace `backend`
- Frontend is in namespace `frontend`
➡ Service discovery must use full DNS like:
```
http://backend.backend.svc.cluster.local:5000
```

###  Deploy:
```bash
kubectl create namespace frontend
kubectl create namespace backend

kubectl apply -f scenario-2-different-namespaces/backend.yaml
kubectl apply -f scenario-2-different-namespaces/frontend.yaml
```

---

##  Cleanup

```bash
kubectl delete ns dev prod frontend backend
```

---

##  Accessing Frontend

If you're running this in Minikube:
```bash
minikube service frontend -n dev  # or -n frontend in scenario 2
```

Update the namespace as per your chosen scenario.

---

##  What You’ll Observe

| Scenario | DNS Required | Simpler |
|----------|--------------|---------|
| Same NS  | No           | ✅      |
| Diff NS  | Yes          | ❌      |

---


