# Kubernetes Fundamentals 

## What is Docker?
Docker is a tool that allows developers to package applications and their dependencies into lightweight, portable units called containers.

Each container includes everything the application needs to run — code, libraries, and environment settings — so it behaves the same everywhere, whether on a developer’s laptop, a test server, or in production.

Example:
Instead of installing Java, Python libraries, or system dependencies manually on every server, you can create a single Docker image and run it anywhere.

### Benefits of Docker
- Easy and consistent deployment across environments.
- Lightweight and faster than virtual machines.
- Works well with microservices architecture.

### Limitations of Docker (Without Kubernetes)
As applications grow, managing multiple Docker containers across multiple servers becomes difficult:
1. No built-in auto-scaling – you must manually start/stop containers.
2. No self-healing – if a container crashes, you need to restart it.
3. Load balancing must be handled manually.
4. Deploying updates requires downtime.
5. Managing networking and configurations becomes complex.

This is where Kubernetes come into picture.

---

## What is Kubernetes?
Kubernetes (K8s) is an open-source container orchestration platform developed by Google. It automates the deployment, scaling, and management of containerized applications.

Kubernetes acts as a controller that decides:
- Where containers should run.
- How to restart failed ones automatically.
- How to distribute user traffic evenly.
- How to scale applications based on demand.

In short, Kubernetes makes it possible to run containers in production reliably and at scale.

---

## Why Kubernetes Came Into Picture
Docker solved the problem of packaging applications, but not the problem of managing them at scale.

When organizations started running hundreds of containers across multiple servers, they needed a system to:
- Automatically restart failed containers.
- Scale containers up or down automatically.
- Distribute traffic efficiently.
- Manage configurations and networking between containers.

Kubernetes was created to handle all of this automatically.

---

## How EKS Solves These Problems
Running plain Kubernetes (installed manually) can still be complex — it involves setting up and maintaining the control plane, API server, scheduler, etc.

Amazon Elastic Kubernetes Service (EKS) is a managed Kubernetes service from AWS that simplifies this.

### Advantages of EKS
- AWS manages the control plane (API server, etcd, scheduler, controller manager).
- Integrates easily with AWS services (IAM, CloudWatch, ALB, EBS, etc.).
- Ensures high availability and automatic upgrades.

With EKS, you focus only on deploying and managing workloads, not on maintaining cluster internals.

---

## Plain Kubernetes vs Managed Kubernetes (EKS)

| Feature | Plain Kubernetes (Self-Managed) | Managed Kubernetes (EKS) |
|----------|---------------------------------|---------------------------|
| Setup | You install and configure everything manually. | AWS sets up and manages the control plane. |
| Maintenance | You manage upgrades, patches, and HA setup. | AWS handles upgrades and control plane maintenance. |
| Scaling | You manually configure node scaling. | Integrated auto-scaling using AWS Auto Scaling Groups. |
| Load Balancing | Requires manual configuration. | Built-in integration with AWS Load Balancers. |
| Complexity | High – requires Kubernetes admin skills. | Lower – AWS manages the hard parts. |
| Focus Area | Managing infrastructure. | Managing applications. |

---

## Kubernetes vs Docker Summary

| Feature | Docker (Standalone) | Kubernetes (via EKS) |
|----------|---------------------|----------------------|
| Purpose | Runs individual containers. | Manages containers across multiple servers. |
| Scaling | Manual. | Automatic based on resource usage. |
| Recovery | Manual restart required. | Auto restarts failed containers. |
| Updates | Manual redeployment. | Rolling updates without downtime. |
| Load Balancing | Not built-in. | Built-in with Service objects and AWS ALB integration. |
| Monitoring | Limited. | Integrated with CloudWatch and Prometheus. |

In short: Docker helps you create containers. Kubernetes (and EKS) helps you manage them efficiently, automatically, and reliably.


# Understanding Containers, Pods, ReplicaSets, and Deployments

## What are Docker Containers
A Docker container is a lightweight and portable environment that includes everything needed to run an application — code, libraries, and configurations.

It allows the application to run the same way on any system, from a developer’s laptop to a cloud server.

---

## Limitations of Simple Docker Containers
When you use Docker alone, it becomes hard to manage containers as your application grows.

### Common Problems
1. Containers do not restart automatically if they crash.
2. You must manually scale up or down when traffic changes.
3. No built-in system for load balancing.
4. Deploying updates may cause downtime.
5. Managing many containers across servers becomes complex.

Kubernetes was created to solve these problems.

---

## What are Pods in Kubernetes
A Pod is the smallest deployable unit in Kubernetes.  
It can run one or more containers that belong to the same application.

All containers in a Pod:
- Run together on the same node.
- Share the same IP address.
- Can communicate easily with each other.

Pods are used to manage related containers together as one unit.

---

## Difference Between Pods and Plain Containers

| Feature | Docker Container | Kubernetes Pod |
|----------|------------------|----------------|
| Unit of Deployment | One container | One or more containers together |
| Scaling | Manual | Handled automatically by Kubernetes |
| Restart Handling | Manual | Managed automatically by controllers |
| Deployment | One at a time | Managed in groups |

Pods make container management easier but still have some drawbacks.

---

## Disadvantages of Pods
1. If a Pod fails, it does not restart automatically on its own.  
2. No built-in scaling — you must manually create more Pods.  
3. Updating Pods manually can cause downtime.  

To fix these issues, Kubernetes introduced **ReplicaSets**.

---

## How ReplicaSet Solves Pod Problems
A ReplicaSet ensures that the desired number of Pods are always running.

### Example
If you want 3 Pods running and one fails, the ReplicaSet creates a new one automatically.

### Advantages
- Keeps the application running even if some Pods fail.
- Allows easy scaling by changing the replica count.
- Adds self-healing ability to Pods.

---

## Problems with ReplicaSet
Although ReplicaSets add stability, they have their own challenges:
1. No rolling updates — updates must be done manually.
2. Manual management of ReplicaSets for every version.

These are solved by **Deployments**.

---

## How Deployment Solves ReplicaSet Problems
A Deployment is a higher-level controller that manages ReplicaSets and provides better rolling update features.

### Advantages of Deployments
1. Deploy new versions gradually (rolling updates) without downtime.  
2. Automatically manages ReplicaSets for new versions.  
3. Simplifies scaling and version management.

### Summary
- **Pod** → Runs one or more containers.  
- **ReplicaSet** → Maintains a fixed number of Pods.  
- **Deployment** → Adds versioning, updates, and rollback on top of ReplicaSets.

# Understanding DaemonSet in Kubernetes

## What is a DaemonSet?
A DaemonSet is a Kubernetes controller that ensures **one Pod runs on every node** (or selected nodes) in the cluster.  
If a new node is added, the DaemonSet automatically creates a Pod on it.  
If a node is removed, the corresponding Pod is also removed automatically.

This type of controller is mainly used for workloads that need to be present on **all nodes** for monitoring, logging, or maintenance.

### Key Characteristics
- Runs **one Pod per node** automatically.
- No need to define replica count; it matches the number of nodes.
- Automatically adjusts when nodes are added or removed.
- Commonly used for system-level or background services.

---

## When to Use a DaemonSet
You use a DaemonSet when you need a Pod running on each node to perform system-related or background tasks.

### Typical Use Cases
1. **Log collection** – Agents that collect logs from nodes (e.g., Fluentd or Fluent Bit).  
2. **Monitoring** – Node-level monitoring tools (e.g., Prometheus Node Exporter).  

In short, a DaemonSet is ideal for **node-level tasks** that must run everywhere.

---

## Deployment vs DaemonSet: When to Choose Which

| Feature | Deployment | DaemonSet |
|----------|-------------|------------|
| **Purpose** | Run applications or microservices for users. | Run background services or agents on every node. |
| **Scaling** | Scale up or down based on load (HPA supported). | Scales automatically with the number of nodes. |
| **Replica Count** | Defined manually in the spec. | One Pod per node (no replicas field). |
| **Pod Placement** | Kubernetes scheduler decides where Pods run. | One Pod scheduled per node automatically. |
| **Use Case** | Web servers, APIs, batch workers. | Monitoring, logging, storage, security agents. |
| **Traffic Exposure** | Usually exposed via Service or Ingress. | Usually not exposed; used internally. |
| **Updates** | Rolling updates for app versions. | Rolling updates for system agents. |

### Simple Rule
- Choose **Deployment** when your goal is to run an **application for users** (frontend, backend, API, etc.).  
- Choose **DaemonSet** when your goal is to run an **agent or service on each node** (log collector, monitor, etc.).

---

## Summary
- **DaemonSet**: Runs one Pod per node automatically for background or monitoring tasks.  
- **Deployment**: Runs multiple replicas of an application for serving users.  
- **Choice**: Use DaemonSet for node-level tasks, and Deployment for app-level workloads.

