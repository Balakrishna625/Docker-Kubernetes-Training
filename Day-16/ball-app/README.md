# Bala's Ball App Game — Docker + Kubernetes (LoadBalancer)

This package contains:
- HTML5 **Ball & Paddle** game (Canvas)
- **Dockerfile** (nginx static server)
- **Kubernetes manifests** to expose via **Service type LoadBalancer**

---

## 1) Build & Run Locally with Docker

> Replace `<DOCKERHUB_USERNAME>` with your Docker Hub username.

```bash
# From the project root
docker build -t <DOCKERHUB_USERNAME>/ball-app:1.0.0 .

# Test locally
docker run --rm -p 8080:80 <DOCKERHUB_USERNAME>/ball-app:1.0.0
# Open http://localhost:8080
```

Optional: create a `latest` tag too:
```bash
docker tag <DOCKERHUB_USERNAME>/ball-app:1.0.0 <DOCKERHUB_USERNAME>/ball-app:latest
```

---

## 2) Push to Docker Hub

```bash
# authenticate
docker login

# push
docker push <DOCKERHUB_USERNAME>/ball-app:1.0.0
docker push <DOCKERHUB_USERNAME>/ball-app:latest
```

---

## 3) Deploy to Kubernetes (Service: LoadBalancer)

> Works great on **EKS**, **GKE**, **AKS**, or **kind-on-cloud** with LB support.

1) Edit `k8s/deployment.yaml` and set the `image:` to your pushed image, e.g.:
```
image: <DOCKERHUB_USERNAME>/ball-app:1.0.0
```

2) Apply manifests:
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service-lb.yaml

kubectl get pods -l app=ball-app -w
kubectl get svc ball-app-svc -o wide
```

3) Access the app:
- On managed clouds (e.g., **EKS**): once the `EXTERNAL-IP` is assigned to the `LoadBalancer`, open
  ```
  http://<EXTERNAL-IP>/
  ```

If `EXTERNAL-IP` is `<pending>`, wait for the cloud LB to provision.


### Rolling update demo
```bash
kubectl set image deploy/ball-app web=<DOCKERHUB_USERNAME>/ball-app:1.0.1
kubectl rollout status deploy/ball-app
```

---

## 4) (Optional) NodePort quick test

```bash
kubectl patch svc ball-app-svc -p '{"spec":{"type":"NodePort"}}'
kubectl get svc ball-app-svc -o wide
# Access: http://<nodeExternalIP>:<nodePort>
```

---

## Files

```
ball-app-lb/
├─ index.html
├─ style.css
├─ app.js
├─ Dockerfile
└─ k8s/
   ├─ deployment.yaml
   └─ service-lb.yaml
```
