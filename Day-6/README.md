# Kubernetes Fundamentals – Notes

---

## Kubernetes Architecture

Kubernetes is a container orchestration platform that manages the deployment, scaling, and lifecycle of containerized applications.

### 1. Control Plane Components

- **API Server**: Accepts and processes all cluster requests.
- **etcd**: Key-value store containing all cluster state.
- **Controller Manager**: Monitors and maintains desired state.
- **Scheduler**: Assigns pods to available nodes.

### 2. Worker Node Components

- **Kubelet**: Ensures containers are running on a node.
- **Container Runtime**: Software like Docker or containerd that runs containers.
- **kube-proxy**: Manages networking and forwarding traffic.

---

## Using Minikube Locally

We are using **Minikube**, which provides a local single-node Kubernetes cluster. This simulates a real cluster environment for learning and testing purposes.

- **Why not EKS (AWS)?**
  - EKS is a managed Kubernetes service on AWS that incurs billing.
  - Control Plane costs + EC2 + Load balancers + network add up.
  - For learning, Minikube offers all core features **without cost**.

- **We will create EKS cluster once we are comfortable with Kubernetes Basics**

---

## Pods in Kubernetes

- The smallest deployable unit.
- Wraps one or more containers.
- Each pod gets its own IP address.

---

## Pod and Container Relationship

- Typically, each pod contains **a single container**.
- Multiple containers in one pod should be used only for tightly coupled workloads.

---

## Pod YAML Structure

```
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
spec:
  containers:
  - name: myapp-container
    image: nginx:latest
    ports:
    - containerPort: 80
```

### Field Description

- `apiVersion`: Kubernetes API version.
- `kind`: Resource type (Pod).
- `metadata`: Identifiers (name, labels).
- `spec`: Definition of containers, images, ports.

---

## ReplicaSet – Maintain Desired Pod Count

A ReplicaSet ensures a specified number of pod replicas are always running.

```
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-rs
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
        ports:
        - containerPort: 80
```

---

## What Happens on `kubectl apply -f`

1. YAML is sent to API Server.
2. Validated and stored in `etcd`.
3. Controller sees the new desired state.
4. Scheduler assigns a node.
5. Kubelet pulls the image and starts the container.

---

## What Happens on `kubectl delete -f`

1. API Server receives the delete request.
2. Entry is removed from `etcd`.
3. Kubelet stops and deletes the container.
4. Resources are cleaned up.

> If managed by ReplicaSet/Deployment, the pod will be recreated unless the higher-level object is also deleted.

---

## Common `kubectl` Commands

| Command | Description |
|--------|-------------|
| `kubectl get pods` | List all pods |
| `kubectl describe pod <name>` | View detailed info about a pod |
| `kubectl logs <pod>` | View logs of the container |
| `kubectl get all` | List all resources in namespace |
| `kubectl apply -f file.yaml` | Create/update resources |
| `kubectl delete -f file.yaml` | Delete resources |
| `kubectl get nodes` | Show nodes in the cluster |
| `kubectl explain pod.spec.containers` | Show YAML structure help |
| `kubectl get pods -o yaml` | View running pod definition |

---

Prepared by Bala for Kubernetes beginner sessions.