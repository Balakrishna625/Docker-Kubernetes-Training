# EKS Hands-On Lab Guide  
### Practice Docker, Pods, ReplicaSets, Deployments, and DaemonSets Using Docker Hub Images

---

## 1. Practice: Run a Docker Image in a Pod

### Step 1 – Create Pod manifest
Save this file as **pod.yaml**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80
```

Apply the manifest:
```bash
kubectl apply -f pod.yaml
```

Check the status:
```bash
kubectl get pods
kubectl describe pod nginx-pod
```

### What to Observe
- The Pod status should become **Running** once the image is pulled and started.
- The container image used is **nginx:1.21** (from Docker Hub).
- If you delete the Pod, it does not restart automatically.

**Understanding:**  
A Pod represents a single running instance of a container.  
If the Pod crashes or is deleted, it won’t recover by itself.

Clean up:
```bash
kubectl delete pod nginx-pod
```

---

## 2. Practice: ReplicaSet (Self-Healing & Scaling)

### Step 1 – Create ReplicaSet manifest
Save this file as **replicaset.yaml**:
```yaml
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
        image: nginx:1.21
        ports:
        - containerPort: 80
```

Apply it:
```bash
kubectl apply -f replicaset.yaml
kubectl get rs,pods
```

### What to Observe
- You should see 3 Pods running automatically.
- Delete one Pod using `kubectl delete pod <pod-name>` and observe that a **new Pod gets created** immediately.
- ReplicaSet maintains the desired number of Pods.

**Understanding:**  
ReplicaSet ensures the application always has the required number of Pods running.  
It provides **self-healing** and **basic scaling** capabilities.

---

## 3. Practice: Deployment (Manage Versions and Scale Easily)

### Step 1 – Create Deployment manifest
Save this file as **deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deploy
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
        image: nginx:1.21
        ports:
        - containerPort: 80
```

Apply:
```bash
kubectl apply -f deployment.yaml
kubectl get deployments,pods
```

### What to Observe
- Kubernetes automatically created a ReplicaSet under the Deployment.
- The Deployment ensures the correct number of Pods are running.
- You can scale easily by editing the `replicas` value in the YAML and reapplying it.

Example: Change replicas from 3 to 5 in the YAML and apply again.  
```bash
kubectl apply -f deployment.yaml
kubectl get pods
```

**Understanding:**  
Deployment provides an easier way to manage multiple replicas and updates.  
It’s the preferred method to deploy stateless applications.

---

## 4. Practice: DaemonSet (Node-Level Pods)

### Step 1 – Create DaemonSet manifest
Save this as **daemonset.yaml**:
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-monitor
spec:
  selector:
    matchLabels:
      app: node-monitor
  template:
    metadata:
      labels:
        app: node-monitor
    spec:
      containers:
      - name: monitor
        image: busybox
        args: ["sh", "-c", "while true; do echo Monitoring node $(hostname); sleep 20; done"]
```

Apply:
```bash
kubectl apply -f daemonset.yaml
kubectl get ds,pods -o wide
```

### What to Observe
- One Pod should be created **on every worker node**.
- If your cluster has 3 nodes, you’ll see 3 Pods.
- When a node is added, Kubernetes automatically adds a new Pod for that node.

**Understanding:**  
DaemonSets are used for node-level background tasks such as logging or monitoring agents.  
Unlike Deployments, they don’t scale by replicas — they scale automatically with the number of nodes.

---

## 5. Clean Up Resources
To remove all the objects created in this lab:
```bash
kubectl delete deploy --all
kubectl delete rs --all
kubectl delete ds --all
kubectl delete pod --all
```

---

## 6. Summary of What You Learned

| Concept | What You Practiced | What You Observed |
|----------|--------------------|-------------------|
| **Pod** | Ran a single Nginx container | Manual management; no self-healing |
| **ReplicaSet** | Ensured fixed number of Pods | Auto recreation of Pods when deleted |
| **Deployment** | Managed replicas and simplified scaling | Easier updates and scaling control |
| **DaemonSet** | Ran one Pod per node | Used for node-level background tasks |

