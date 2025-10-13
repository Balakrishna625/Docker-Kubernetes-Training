# Kubernetes Services Explained

------------------------------------------------------------------------

## What is a Service in Kubernetes?

In Kubernetes, a **Service** is an abstraction layer that defines a
**logical set of Pods** and a **policy to access them**.\
Because Pods are **ephemeral** (created and destroyed frequently),
Services provide:

-   A **stable IP address** and **DNS name**
-   **Automatic load balancing** between healthy Pods

A Service continuously tracks Pods using **label selectors**. If Pods
are replaced, the Service automatically updates its backend endpoints.

------------------------------------------------------------------------

## Why Services Are Needed

Without Services, communication between Pods would break whenever Pods
are rescheduled or replaced, because:

-   Each Pod gets a **dynamic IP**
-   Clients would need to track these changes manually
-   Load balancing traffic between multiple Pods would be manual and
    error-prone

Services solve this by providing:

  -----------------------------------------------------------------------
  Feature                       Description
  ----------------------------- -----------------------------------------
  Stable Networking             Assigns a permanent virtual IP
                                (ClusterIP)

  Service Discovery             Creates a DNS entry (via CoreDNS)

  Load Balancing                Distributes traffic evenly among all
                                healthy Pods

  Decoupling                    Clients connect to the Service instead of
                                directly to Pods
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Types of Kubernetes Services

Kubernetes supports three main Service types based on **how you want to
expose** your application.

  ------------------------------------------------------------------------
  Service Type           Access Scope           Typical Use Case
  ---------------------- ---------------------- --------------------------
  ClusterIP (default)    Internal               Internal communication
                                                (e.g., API → DB)

  NodePort               External (via node     Expose app on all node IPs
                         IPs)                   using static port

  LoadBalancer           External (via cloud    Internet-facing services
                         LB)                    in AWS/Azure/GCP
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## ClusterIP Service (Default)

The **ClusterIP** Service exposes an app **inside** the Kubernetes
cluster only.

**Example YAML:**

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 8080
```

### Explanation

-   Creates a **virtual IP** reachable **only within the cluster**

-   Other Pods can connect to this Service using:

        http://backend-service:80

-   Typically used for **inter-service communication** (e.g., frontend →
    backend)

------------------------------------------------------------------------

## NodePort Service

**NodePort** exposes the Service on a specific port on **every node** in
the cluster.

**Example YAML:**

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 3000
      nodePort: 31000
```

### Explanation

-   Opens port `31000` on every node (from range `30000–32767`)
-   Accessible externally via `http://<NodeIP>:31000`
-   Internally forwards traffic to Pods' container port `3000`
-   Common for **local testing**, **on-prem clusters**, or **Minikube
    demos**

------------------------------------------------------------------------

## LoadBalancer Service

The **LoadBalancer** Service integrates with your **cloud provider's
load balancer** (e.g., AWS ELB/ALB, Azure LB, GCP LB).

**Example YAML:**

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080
```

### Explanation

-   Automatically provisions a **public cloud Load Balancer**
-   Assigns an **external IP** accessible from the internet
-   Distributes incoming traffic across backend Pods
-   Ideal for **production** and **public-facing** apps

**Note:**\
Each LoadBalancer Service creates a dedicated LB instance --- in large
systems, this can be expensive and less scalable.

------------------------------------------------------------------------

## Ingress and ALB Ingress Controller

In real-world cloud setups (like AWS EKS), instead of creating a
**LoadBalancer per service**, we use **Ingress Controllers**.

### What is Ingress?

-   Manages **HTTP and HTTPS routing** into the cluster
-   Uses **a single Load Balancer** for multiple Services
-   Provides **hostname** and **path-based** routing
-   Supports **SSL/TLS termination** and custom headers

### Example Ingress Rule

``` yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    kubernetes.io/ingress.class: alb
spec:
  rules:
    - host: example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 80
          - path: /web
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
```

### Benefits of Ingress over LoadBalancer

  Feature               Ingress                 LoadBalancer
  --------------------- ----------------------- -----------------
  Load Balancer Count   One for many services   One per service
  Routing Rules         Path/Host based         Basic TCP/UDP
  Cost Efficiency       High                    Lower
  SSL Termination       Centralized             Per Service
  Flexibility           Advanced                Limited

------------------------------------------------------------------------

## How Services Select Pods (Selectors & Labels)

Services rely on **label selectors** to identify which Pods they route
traffic to.

**Example:**

``` yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 8080
```

### Explanation

-   The Service's `selector` matches all Pods labeled with `app: myapp`
-   Traffic sent to `myapp-service:80` is distributed among those Pods
-   Kubernetes' **Endpoints controller** maintains the list of Pod IPs
    automatically

------------------------------------------------------------------------

## When to Use Each Service Type

  ------------------------------------------------------------------------
  Use Case              Recommended Type                   Reason
  --------------------- ---------------------------------- ---------------
  Internal              ClusterIP                          Secure and
  communication (DB,                                       efficient
  APIs)                                                    inside cluster

  Local testing or      NodePort                           Simple exposure
  non-cloud setup                                          method

  Cloud app with public LoadBalancer                       Cloud-managed
  access                                                   LB

  Multi-service public  Ingress                            Central routing
  entry point                                              and SSL
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## Summary

-   ClusterIP → Internal access only
-   NodePort → Expose via Node IPs
-   LoadBalancer → Public access via cloud LB
-   Ingress → Centralized, path-based routing

Kubernetes Services are essential for **network stability**, **load
balancing**, and **scalability** across dynamic workloads.

------------------------------------------------------------------------

## Key Takeaways

-   Always define clear **labels and selectors** for predictable routing
-   Use **ClusterIP** for internal APIs, **Ingress** for external apps
-   Avoid multiple **LoadBalancers** in production; prefer a single
    **Ingress**
-   Combine **Services + Ingress + DNS** for complete traffic management
