## EKS Basics

**1. What is the difference between Kubernetes and EKS?**  
**Answer:**

* **Kubernetes** is the container orchestration system itself (open source).  
* **EKS (Elastic Kubernetes Service)** is AWS’s managed Kubernetes service.  
  AWS manages the **control plane** (API server, etcd, scheduler, controllers). You manage only **worker nodes** (EC2, Fargate).

**Example:** In on-prem K8s you install the API server. In EKS AWS runs it HA across 3 AZs.

---

**2. What are the main architecture components in EKS?**  
**Answer:**

* **Control Plane (AWS managed):** API server, etcd, controller manager, scheduler.  
* **Data Plane (user managed):** EC2/Fargate worker nodes running kubelet + pods.  
* **Networking:** AWS VPC CNI plugin, kube-proxy.  
* **Add-ons:** CoreDNS, EBS CSI driver, kube-proxy.

**Example:** If you deploy 5 pods, control plane schedules them; worker nodes actually run them.

---

**3. What is OIDC in EKS and why is it used?**  
**Answer:**  
OIDC = OpenID Connect provider.

* Lets you map **Kubernetes Service Accounts → AWS IAM Roles**.  
* Known as **IAM Roles for Service Accounts (IRSA)**.

**Example:** A pod needing S3 access gets temporary IAM permissions via IRSA, no static keys.

---

**4. What are Add-ons in EKS?**  
**Answer:**  
EKS add-ons are AWS-managed cluster components (versioned, easy to update):

* CoreDNS (DNS)  
* VPC CNI (networking)  
* kube-proxy (services)  
* EBS CSI Driver (storage)

**Example:** Instead of manually installing CoreDNS with YAML, you enable it as an EKS add-on.

---

## Pods, Controllers & Scheduling

**5. What is a Pod in Kubernetes?**  
**Answer:**  
A Pod is the smallest deployable unit in K8s, running 1 or more containers together with shared storage/network.

**Example:** A web pod with 2 containers: `nginx` + `sidecar logger`.

---

**6. What is a ReplicaSet? How does it maintain replicas?**  
**Answer:**  
ReplicaSet ensures a defined number of pod replicas are always running.

* Uses **selectors** to identify pods.  
* If a pod crashes, RS creates a replacement.

**Example:** `replicas: 3` → always keeps 3 pods alive.

---

**7. What is the difference between Pod, ReplicaSet, and Deployment?**  
**Answer:**  

* **Pod**: 1+ containers.  
* **ReplicaSet**: maintains N copies of a pod.  
* **Deployment**: manages ReplicaSets, allows rolling updates/rollbacks.

**Example:** Deployment upgrades Nginx from v1.14 → v1.16 with zero downtime.

---

**8. What is a DaemonSet?**  
**Answer:**  
DaemonSet runs **one pod per node** in the cluster.  
Used for logging, monitoring, networking agents.

**Example:** CloudWatch Agent DaemonSet → runs on every node to push logs.

---

## Services & Networking

**9. What are the types of Services in Kubernetes?**  
**Answer:**  

* **ClusterIP** → default, internal only.  
* **NodePort** → exposes on each node’s IP:Port.  
* **LoadBalancer** → provisions AWS ELB/NLB.  
* **ExternalName** → DNS mapping to external service.

**Example:** In EKS, `Service: LoadBalancer` → automatically creates AWS NLB.

---

**10. What does ReplicaSet selector mean?**  
**Answer:**  
A selector tells ReplicaSet which pods it controls (via labels).

**Example:**  

```yaml
selector:
  matchLabels:
    app: nginx
```

RS manages only pods with `app=nginx`.

---

## Config & Secrets

**11. What are environment variables in Kubernetes?**  
**Answer:**  
Values injected into pods for configuration.

* Hardcoded in pod spec.  
* Loaded from ConfigMaps/Secrets.  
* From pod metadata (Downward API).

**Example:** `DB_HOST` from ConfigMap → container uses it at runtime.

---

**12. What is a ConfigMap? What is a Secret?**  
**Answer:**  

* **ConfigMap** → non-sensitive configs (URLs, properties).  
* **Secret** → sensitive data (passwords, tokens). Stored base64, can use AWS KMS.

**Example:**  

* ConfigMap → `APP_ENV=dev`.  
* Secret → `DB_PASSWORD=myPass123`.

---

## Resource Management

**13. What are Resources and Limits in Kubernetes?**  
**Answer:**  

* **Requests** → guaranteed minimum CPU/Memory.  
* **Limits** → maximum usage allowed.

**Example:**  

```yaml
requests:
  cpu: "200m"
  memory: "256Mi"
limits:
  cpu: "500m"
  memory: "512Mi"
```

---

**14. What are Namespaces? Why use them?**  
**Answer:**  
Namespaces logically isolate cluster resources.  
Used for multi-team, multi-env, RBAC, quotas.

**Example:** Separate `dev`, `qa`, `prod` namespaces in one EKS cluster.

---

**15. What are ResourceQuotas? Why do we use them?**  
**Answer:**  
Restrict how much CPU, memory, pods a namespace can consume.  
Prevents one team hogging resources.

**Example:** Limit `dev` namespace to 2 CPUs, 2Gi memory, 10 pods.

---

## Health & Access

**16. What are Liveness and Readiness Probes?**  
**Answer:**  

* **Liveness Probe** → restarts container if unhealthy.  
* **Readiness Probe** → decides if pod can receive traffic.

**Example:**  

* Liveness = check `/health`. If fails → restart.  
* Readiness = wait for app to load DB before serving.

---

**17. What is a ServiceAccount?**  
**Answer:**  
ServiceAccount is an identity for pods to access K8s API or cloud resources.  
In EKS → ServiceAccounts link to IAM roles (IRSA).

**Example:** Pod’s ServiceAccount mapped to IAM Role → can read from S3 bucket.

---
