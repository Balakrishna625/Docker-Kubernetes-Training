# Kubernetes Services in Amazon EKS – ClusterIP, NodePort, and LoadBalancer

This document explains in depth the **Kubernetes Service types** — **ClusterIP**, **NodePort**, and **LoadBalancer**, focusing on how they behave inside **Amazon EKS (Elastic Kubernetes Service)**.  


---

## 1. Introduction – Why Services Exist in Kubernetes

In Kubernetes, **Pods are temporary**. They get recreated, rescheduled, and replaced frequently. When this happens, their IP addresses change.

If applications depended directly on Pod IPs, communication would constantly break.  
That’s where **Services** come in — they provide a **stable virtual endpoint** for accessing a group of Pods.

A **Service**:
- Keeps a consistent IP (and DNS name).
- Uses **label selectors** to route traffic to the right Pods.
- Decides **who can access the application** — internally or externally.

---

## 2. Recap – Minikube vs. EKS

When you run Kubernetes locally using **Minikube**, everything happens on a **single virtual node** (your laptop).  
- The Service types (ClusterIP, NodePort, LoadBalancer) behave similarly in concept but differ in actual exposure.
- However, Minikube doesn’t have real EC2 nodes or AWS networking layers.  
  This means NodePort and LoadBalancer demos are **limited or simulated**.

When you move to **EKS**, you have:
- Real EC2 worker nodes (each with private IPs, and optionally public IPs).
- AWS-managed **VPC**, **subnets**, and **security groups**.
- Real **Load Balancers** (NLB/ELB) created dynamically.

So the concepts you taught with Minikube will now make **real sense** in EKS because every Service type maps to **actual AWS resources**.

---

## 3. ClusterIP Service – Internal Communication Only

### Concept

**ClusterIP** is the **default and simplest** Service type. It exposes Pods **only within the cluster network**.  
Other Pods in the same cluster can reach it, but it is **not accessible from outside** the cluster or VPC.

### How It Works in EKS
- When you create a ClusterIP service, EKS assigns a **virtual internal IP** from the Kubernetes Service CIDR (for example, `10.100.0.0/16`).
- Traffic routing happens internally using kube-proxy and iptables.
- No AWS resources like Load Balancers or public IPs are created.

### Example YAML
```yaml
apiVersion: v1
kind: Service
metadata:
  name: python-clusterip
spec:
  type: ClusterIP
  selector:
    app: python-app
  ports:
  - port: 80
    targetPort: 5000
```

### Explanation
In Minikube, you couldn’t access this service from your browser because it’s restricted inside the cluster.  
The same holds true in EKS — ClusterIP services are used for **internal communication** between components, like a frontend talking to a backend within the same VPC.

### Summary Points
- Used for **internal-only** services.  
- No AWS Security Group or networking changes needed.  
- No external exposure.  
- Ideal for microservice-to-microservice communication.

---

## 4. NodePort Service – Opening Access Through Nodes

### Concept

A **NodePort Service** exposes the application on a **specific port (30000–32767)** on **every worker node**.  
Any request reaching that node and port is routed to the Pods behind the Service.

### Why It’s More Meaningful in EKS
In Minikube, the NodePort didn’t seem very useful because it runs on your single local node.  
In EKS, however, each worker node is an **actual EC2 instance**, and the Service makes the app reachable through **those EC2 node IPs**.

### How It Works
1. You create a Service of type NodePort.
2. Kubernetes allocates a static port, say `31000`.
3. That port is open on every EC2 node in your cluster.
4. Traffic reaching `http://<node-private-ip>:31000` is sent to the Pods.

### Example YAML
```yaml
apiVersion: v1
kind: Service
metadata:
  name: snake-nodeport
spec:
  type: NodePort
  selector:
    app: snake-game
  ports:
  - port: 80
    targetPort: 5000
    nodePort: 31000
```

### Testing and Access
- Within the VPC, any EC2 or Pod can reach the app using node-private-IP + nodePort.
- From outside (for example, from your laptop), the request will fail unless you update **Security Groups**.

### Security Group Requirement
Each worker node’s EC2 instance has an **associated Security Group** (usually auto-managed by the EKS node group).  
By default, inbound traffic to custom ports like 31000 is **blocked**.

To make the NodePort accessible externally:
- Go to **EC2 → Security Groups → Node Group SG**.
- Add an **Inbound Rule**:
  - Type: Custom TCP Rule  
  - Port: `31000`  
  - Source: Your IP (e.g., `49.x.x.x/32`)

###  Explanation
Even if Kubernetes opens a port internally, AWS Security Groups decide whether that traffic is allowed into the EC2 instances.

### Summary Points
- NodePort opens access at the node level.  
- Needs **Security Group updates** for external reachability.  
- Simulates how a backend or app might be temporarily exposed for testing.  
- Still not production-grade — used mainly for debugging or internal VPC access.

---

## 5. LoadBalancer Service – Public Access via AWS Integration

### Concept

**LoadBalancer** is the most production-friendly Service type.  
It provisions an actual **AWS Network Load Balancer (NLB)** or **Elastic Load Balancer (ELB)** in front of your service.  
This gives you a **public DNS endpoint** accessible from anywhere.

### How It Works in EKS
1. When you create a LoadBalancer Service, Kubernetes asks the AWS cloud controller to provision a Load Balancer.  
2. AWS automatically creates:
   - An NLB with listeners (e.g., port 80 or 443).  
   - Target groups that point to the EKS nodes’ private IPs.  
   - Security Group rules to allow inbound traffic.
3. The LoadBalancer forwards requests to the NodePort on the worker nodes.  
4. The NodePort internally forwards traffic to the Pods selected by the Service.

### Example YAML
```yaml
apiVersion: v1
kind: Service
metadata:
  name: ball-loadbalancer
spec:
  type: LoadBalancer
  selector:
    app: ball-game
  ports:
  - port: 80
    targetPort: 8080
```

After a few minutes:
```bash
kubectl get svc
```
shows something like:
```
NAME                TYPE           CLUSTER-IP       EXTERNAL-IP
ball-loadbalancer   LoadBalancer   10.100.56.23     a1b2c3d4e5f6.elb.us-east-1.amazonaws.com
```

### Access
You can open that **ELB DNS name** in your browser, and it routes through AWS infrastructure to your Pods.

### Security Group Requirements
AWS manages two Security Groups:
- **Load Balancer SG:** Allows inbound HTTP/HTTPS from the internet.  
- **Node Group SG:** Must allow inbound from the Load Balancer’s SG on the NodePort range (30000–32767).

In most cases, this happens automatically. But sometimes you may need to manually allow the LB SG as a source in the Node SG if traffic is blocked.

###  Explanation
 Minikube, the LoadBalancer Service didn’t actually create a real load balancer — it just simulated it internally.  
In EKS, this now creates **a real AWS resource** visible under EC2 → Load Balancers, showing how Kubernetes integrates seamlessly with AWS networking.

### Summary Points
- Automatically creates AWS Load Balancer.  
- Provides a public DNS endpoint.  
- Fully managed and scalable.  
- Ideal for production apps.  

---

## 6. Demonstrating with Snake Game and Ball Game

### Step 1 – ClusterIP
- Deploy Snake Game or Ball Game using ClusterIP.  
- Show that it’s accessible only from within the cluster (like frontend-to-backend communication).

### Step 2 – NodePort
- Change Service type to NodePort.  
- Get Node IP using `kubectl get nodes -o wide`.
- Explain how each node in EKS is a real EC2 machine.  
- Access via `http://<node-private-ip>:<nodePort>` (works within VPC).  
- Then explain the Security Group change needed to allow external browser access.

### Step 3 – LoadBalancer
- Change Service type to LoadBalancer.  
- Watch AWS create an actual Load Balancer and assign a DNS.  
- Access app using that public DNS.  
- Open AWS Console → EC2 → Load Balancers → Observe target groups and nodes.  

###  Observe:
| Type | Access Level | AWS Resource Created | Security Group Changes |
|------|---------------|----------------------|------------------------|
| ClusterIP | Internal only | None | None |
| NodePort | VPC or limited external | None | Add inbound for port |
| LoadBalancer | Public Internet | AWS NLB/ELB | Usually auto-managed |

---

## 7. Key Security Group Deep Dive

| Security Group | Purpose | Needed Changes |
|----------------|----------|----------------|
| **EKS Control Plane SG** | For cluster communication | Managed by AWS |
| **EKS Node Group SG** | For EC2 worker nodes | May require NodePort access rule |
| **ELB / NLB SG** | Created automatically for LoadBalancer services | Usually open to 0.0.0.0/0 for port 80/443 |

If LoadBalancer traffic fails:
- Check if **Node SG allows inbound from LB SG**.
- Check if Load Balancer listeners and target groups are healthy.

---

## 8. Architecture Overview (Textual)

```
                    ┌────────────────────────────────────────┐
                    │              AWS VPC                   │
                    │                                        │
   ┌──────────────┐ │  ┌────────────────────────────┐        │
   │ LoadBalancer │─┼─▶│  Node A (EC2) - NodePort   │        │
   │ (Public DNS) │ │  │  Pod (Snake Game)          │        │
   └──────────────┘ │  └────────────────────────────┘        │
                    │  ┌────────────────────────────┐        │
                    │  │  Node B (EC2) - NodePort   │        │
   ┌──────────────┐ |  |                            |        |
   │ LoadBalancer │─┼─▶|                            |        |
   │ (Public DNS) │ |  |                            |        |
   └──────────────┘ │  │  Pod (Ball Game)│          |        |
                    │  └────────────────────────────┘        │
                    └────────────────────────────────────────┘
```

---

## 9. Summary

| Service Type | Exposure | AWS Resource | Security Group Changes | Use Case |
|---------------|-----------|---------------|------------------------|-----------|
| **ClusterIP** | Internal only | None | None | Service-to-Service |
| **NodePort** | Node-level | None | Required for external | Debugging / Testing |
| **LoadBalancer** | Public endpoint | NLB/ELB | Usually automatic | Production exposure |

---

## Final Explanation 

When you ran Kubernetes on Minikube, everything ran in one small box.  
You could only **simulate** how traffic moves between internal and external layers.  
But now with **EKS**, you can demonstrate the **real-world mapping** of Kubernetes networking onto **AWS infrastructure**:

- **ClusterIP** → Internal-only traffic within the cluster network.  
- **NodePort** → Opens real EC2 ports but needs explicit security permissions.  
- **LoadBalancer** → Integrates seamlessly with AWS, giving a global, public endpoint.
