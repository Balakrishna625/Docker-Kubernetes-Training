# Understanding ALB Ingress Annotations in EKS

This document explains, in **simple and clear language**, what each AWS ALB (Application Load Balancer) Ingress annotation does when you use the **AWS Load Balancer Controller** in your EKS cluster.

---

##  Overview

When you create an `Ingress` resource in Kubernetes with the **AWS Load Balancer Controller**, you can use **annotations** to customize how AWS creates and configures the ALB for your application.

These annotations are like special instructions for the controller — they define **where the ALB is placed**, **how it listens**, **how it handles HTTPS**, **how it checks health**, and **how multiple Ingresses share one ALB**.

---

##  YAML Example

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

---

##  Explanation of Each Annotation

### 1️ `alb.ingress.kubernetes.io/scheme: internet-facing`

- **Purpose:** Defines whether the ALB is public or private.
- **Options:**
  - `internet-facing` → Accessible from the internet (has public IPs).
  - `internal` → Accessible only within your VPC (private).
-  **Think of it like:** Deciding whether your building’s main gate opens to the city road or just inside the campus.

 You used `internet-facing` because your apps should be reachable publicly.

---

### 2️⃣ `alb.ingress.kubernetes.io/listen-ports: '[{"HTTP":80},{"HTTPS":443}]'`

- **Purpose:** Tells ALB which ports to open for incoming traffic.
- ALB will listen on:
  - Port **80** for HTTP (unencrypted traffic).
  - Port **443** for HTTPS (encrypted traffic).

 **Think of it like:** Two entry lanes — one normal (HTTP) and one secured (HTTPS).

 ALB will automatically create both listeners.

---

### 3️⃣ `alb.ingress.kubernetes.io/ssl-redirect: '443'`

- **Purpose:** Automatically redirects all HTTP traffic (port 80) to HTTPS (port 443).
- **Effect:** If someone visits `http://snake.balatraining.in`, they are redirected to `https://snake.balatraining.in`.

 **Think of it like:** A guard at the gate telling visitors, “Please use the secure entrance only.”

 Enforces encrypted (HTTPS) access for all users.

---

### 4️⃣ `alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:<ACCOUNT_ID>:certificate/<CERT_ID>`

- **Purpose:** Specifies which **TLS/SSL certificate** the ALB should use for HTTPS connections.
- The certificate must be created in **AWS Certificate Manager (ACM)** and must exist in the same AWS region as your ALB.
- Example: `*.balatraining.in` wildcard certificate works for all your subdomains.

 **Think of it like:** Giving the ALB a verified ID card to prove its identity to users when they connect.

 Without this, browsers will show a security warning.

---

### 5️⃣ `alb.ingress.kubernetes.io/target-type: ip`

- **Purpose:** Defines where the ALB sends traffic — to Node IPs or directly to Pod IPs.
- **Options:**
  - `instance` → Sends traffic to EC2 node IP (NodePort service needed).
  - `ip` → Sends traffic directly to Pod IPs (ClusterIP service works).

 **Think of it like:** Delivering mail either to the building security (instance) or straight to the apartment (pod).

 Using `ip` is simpler and avoids NodePort configuration.

---

### 6️⃣ `alb.ingress.kubernetes.io/healthcheck-path: /`

- **Purpose:** Defines the URL path ALB will use to check if your app is healthy.
- ALB periodically sends HTTP requests to this path. If it returns `200 OK`, the target is marked **healthy**.
- If the app fails or returns 4xx/5xx, it’s marked **unhealthy** and ALB stops sending traffic to it.

 **Think of it like:** A nurse checking a patient’s pulse every few seconds.

 Change this to `/healthz` or `/status` if your app has a specific health endpoint.

---

### 7️⃣ `alb.ingress.kubernetes.io/group.name: balatraining`

- **Purpose:** Groups multiple Ingress resources into **one shared ALB**.
- If multiple Ingresses share the same `group.name`, they all attach to the same ALB (each adds its own routing rule).

 **Think of it like:** Having many flats in one building using the same main entrance gate.

 Saves cost and reduces the number of ALBs in your account.

---

## 🧩 Summary Table

| Annotation | Purpose | Simple Meaning |
|-------------|----------|----------------|
| `scheme` | Choose public/private ALB | `internet-facing` = public, `internal` = private |
| `listen-ports` | Define open ports | ALB listens on 80 (HTTP) and 443 (HTTPS) |
| `ssl-redirect` | Force HTTPS | Redirects all HTTP to HTTPS |
| `certificate-arn` | Use ACM certificate | Enables HTTPS with your own domain cert |
| `target-type` | Pod vs Node routing | `ip` = send directly to pods |
| `healthcheck-path` | Health probe URL | ALB checks this path for 200 OK |
| `group.name` | Share ALB | Combine multiple Ingresses under one ALB |

---

