# EKS: Single ALB Ingress for Multiple Apps (snake & ball)

This README describes how to expose two Kubernetes services (`snake` and `ball`) through a **single** public **AWS Application Load Balancer (ALB)** on Amazon EKS using the **AWS Load Balancer Controller**. It covers prerequisites, installation, manifests, DNS, validation, troubleshooting, and cleanup.

---

## 1. Architecture Overview

One internet‑facing ALB terminates TLS and routes requests by host header to individual services inside the cluster.

```
Internet
   |
[ ALB :443 ]  (HTTPS, ACM cert)
  |-- host: snake.balatraining.in ──> TargetGroup (ip) ──> Service (ClusterIP) ──> Pods (snake)
  |-- host: ball.balatraining.in  ──> TargetGroup (ip) ──> Service (ClusterIP) ──> Pods (ball)
```

Key points:

- TLS is terminated at the ALB using an ACM certificate (e.g., `*.balatraining.in`).  
- The controller programs listeners, rules, target groups from your `Ingress` spec.  
- `target-type: ip` sends traffic directly to **pod IPs**; Services can stay **ClusterIP** (no NodePorts).

---

## 2. Prerequisites

- **EKS cluster** (e.g., `eksdemo3`) in **us-east-1** with `kubectl`, `helm`, `aws` CLI configured.
- **OIDC provider** associated with the cluster (IRSA).
- **Public subnets** tagged for ALB creation:
  - `kubernetes.io/role/elb = 1` (public)
- **Domain**: `balatraining.in` with access to public DNS (Route53 or any DNS registrar).
- **ACM certificate** in **us-east-1** that covers `*.balatraining.in` (and optionally the apex domain). Validate via **DNS** and ensure status is **Issued**.

> Replace placeholders like `<ACCOUNT_ID>` and `<CERT_ID>` where indicated.

---

## 3. Install AWS Load Balancer Controller

> Grants permissions via IAM and installs the controller with Helm. Versions evolve; omit `--version` to use the chart’s latest compatible version for your EKS.

### 3.1 Create IAM policy (one-time)
```bash
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.1/docs/install/iam_policy.json

aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json
```

### 3.2 Create IRSA service account
```bash
eksctl create iamserviceaccount \
  --cluster=eksdemo3 \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=arn:aws:iam::<ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy \
  --region us-east-1 \
  --override-existing-serviceaccounts \
  --approve
```

### 3.3 Install the controller (Helm)
```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=eksdemo3 \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

### 3.4 Verify
```bash
kubectl -n kube-system get deploy aws-load-balancer-controller
# READY should be 2/2 (or similar, depending on replica count)
```

---

## 4. Application Manifests (ClusterIP)

Create `apps.yaml`. The snake app container listens on **5000**, the ball app on **80**.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: python-app
  template:
    metadata:
      labels:
        app: python-app
    spec:
      containers:
      - name: python-app
        image: balakrishna625/snake:latest
        ports:
        - containerPort: 5000

apiVersion: v1
kind: Service
metadata:
  name: python-clusterip
spec:
  selector:
    app: python-app
  ports:
  - port: 80
    targetPort: 5000
    protocol: TCP
  type: ClusterIP

apiVersion: apps/v1
kind: Deployment
metadata:
  name: ball-app
  labels:
    app: ball-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ball-app
  template:
    metadata:
      labels:
        app: ball-app
    spec:
      containers:
      - name: web
        image: balakrishna625/ball-app-game
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: "50m"
            memory: "64Mi"
          limits:
            cpu: "250m"
            memory: "128Mi"

apiVersion: v1
kind: Service
metadata:
  name: ball-app-svc
  labels:
    app: ball-app
spec:
  type: ClusterIP
  selector:
    app: ball-app
  ports:
  - name: http
    port: 80
    targetPort: 80
    protocol: TCP
```

Apply:
```bash
kubectl apply -f apps.yaml
kubectl get svc,deploy,pods
```

---

## 5. Ingress (single ALB, host‑based routing, TLS)

Create `ingress.yaml`. Update the ACM certificate ARN.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: apps-ingress
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP":80},{"HTTPS":443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:<ACCOUNT_ID>:certificate/<CERT_ID>
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/healthcheck-path: /
    alb.ingress.kubernetes.io/group.name: balatraining
spec:
  ingressClassName: alb
  rules:
  - host: snake.balatraining.in
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: python-clusterip
            port:
              number: 80
  - host: ball.balatraining.in
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ball-app-svc
            port:
              number: 80
```

Apply and wait for the ALB:
```bash
kubectl apply -f ingress.yaml
kubectl get ingress apps-ingress -o wide
# Note the ADDRESS column (ALB DNS)
```

---

## 6. DNS

Create public DNS records pointing to the ALB.

- **Route53 (recommended)**: add **A (Alias)** records  
  - `snake.balatraining.in` → Alias to the ALB DNS name  
  - `ball.balatraining.in`  → Alias to the same ALB

- **Other DNS provider**: add **CNAME** records to the ALB DNS name.

Propagation is usually quick but may take a few minutes depending on TTL and resolver caches.

---


## 7. Cleanup

```bash
kubectl delete -f ingress.yaml
kubectl delete -f apps.yaml

helm uninstall aws-load-balancer-controller -n kube-system

eksctl delete iamserviceaccount \
  --cluster=eksdemo3 \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --region us-east-1

# Optional: remove ACM cert and IAM policy if created only for this demo
# aws iam delete-policy --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy
```

---

## Appendix A — Annotation Reference (quick scan)

| Annotation | Purpose | Notes |
|---|---|---|
| `alb.ingress.kubernetes.io/scheme` | Public vs private ALB | `internet-facing` (public) or `internal` (private) |
| `alb.ingress.kubernetes.io/listen-ports` | ALB listeners | Typical: `[{"HTTP":80},{"HTTPS":443}]` |
| `alb.ingress.kubernetes.io/ssl-redirect` | Force HTTPS | Commonly set to `'443'` |
| `alb.ingress.kubernetes.io/certificate-arn` | TLS/SSL cert (ACM) | Required for HTTPS listener |
| `alb.ingress.kubernetes.io/target-type` | Pod vs Node targets | `ip` recommended (direct to pod IPs) |
| `alb.ingress.kubernetes.io/healthcheck-path` | Health probe path | Must return HTTP 200 |
| `alb.ingress.kubernetes.io/group.name` | ALB sharing | Merge multiple Ingresses onto one ALB |

---

