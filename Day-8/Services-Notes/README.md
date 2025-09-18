# Kubernetes Services – ClusterIP, NodePort, LoadBalancer

## Why Do We Need Services in Kubernetes?
- Pods are ephemeral — they can die, restart, or be rescheduled, and each time they get a new IP.
- If clients connected directly to Pod IPs, communication would constantly break.
- A Service gives a permanent entry point (stable IP + DNS name) that does not change.
- Services also handle routing and load balancing across multiple Pods automatically.

## Demo Setup on Minikube (Mac)
### 1. Start Minikube
```bash
minikube start --driver=docker
```
Minikube creates a lightweight Kubernetes cluster locally. Using the Docker driver is safe for demos without needing a cloud account.

### 2. Build & Load Python App
```bash
unzip python-application.zip
cd python-application
eval $(minikube docker-env)
docker build -t python-app:v1 .
```
This builds the Python app image (`python-app:v1`) inside Minikube’s Docker environment, so the cluster can use it without pushing to Docker Hub.

### 3. Create Deployment
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
        image: python-app:v1
        ports:
        - containerPort: 5000
```
A Deployment ensures two Pods of the Python app run continuously. If one Pod dies, Kubernetes automatically creates another.

## ClusterIP Service
```yaml
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
  type: ClusterIP
```
ClusterIP is the default Service type. It provides an internal IP and DNS name (`python-clusterip:80`) that only works inside the cluster. This solves Pod IP churn by giving a fixed entry point.

Test inside cluster:
```bash
kubectl run curl --image=radial/busyboxplus:curl -it --rm --restart=Never -- sh
curl python-clusterip:80
```

## NodePort Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: python-nodeport
spec:
  selector:
    app: python-app
  ports:
  - port: 80
    targetPort: 5000
    nodePort: 30080
  type: NodePort
```
NodePort exposes the Service externally on every cluster Node at a high port (`30080`). You can access it with `http://<NodeIP>:30080`. In Minikube, the command `minikube service python-nodeport --url` opens the tunnel for you.

## LoadBalancer Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: python-loadbalancer
spec:
  selector:
    app: python-app
  ports:
  - port: 80
    targetPort: 5000
  type: LoadBalancer
```
In cloud clusters, LoadBalancer provisions an external load balancer with a public IP or DNS. In Minikube, this is simulated using a tunnel. Use the command `minikube service python-loadbalancer --url` to test it.

## How Ports Work in a NodePort Service
```yaml
ports:
  - port: 80
    targetPort: 5000
    nodePort: 30080
```
- **port (80):** Service’s internal entry point inside the cluster. Other Pods call `service-name:80`.
- **targetPort (5000):** The port where the containerized app is listening inside the Pod.
- **nodePort (30080):** Externally accessible port on the Node. You reach it as `http://<NodeIP>:30080`.

When a client hits `http://<NodeIP>:30080`, Kubernetes forwards traffic:  
`30080 (NodePort) → 80 (Service Port) → 5000 (Target Port in Pod)` → response is returned back.
