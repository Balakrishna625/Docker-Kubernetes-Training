# Kubernetes Deployment Best Practices: Environment Variables, Resources, Probes

This document provides a comprehensive explanation of key features in Kubernetes Deployments:

- Environment Variables (plain, from ConfigMap, from Secret)
- Resource Requests and Limits
- Liveness and Readiness Probes
- When to use or skip these features
- Associated `kubectl` commands
- Real-world use cases and YAML examples

---

## 1. Environment Variables in Kubernetes

Environment variables are used to inject dynamic configuration into containerized applications. Instead of hardcoding values inside your code, you can inject them at runtime using Kubernetes. These variables can be static or externalized via ConfigMaps or Secrets.

Kubernetes supports three main ways to define environment variables:

### 1.1 Plain Environment Variables

Plain environment variables are specified directly in the pod definition using the `env` field.

```yaml
env:
  - name: APP_MODE
    value: "production"
  - name: LOG_LEVEL
    value: "debug"
```

**Explanation:**  
Use plain env variables when the values are static and non-sensitive. These variables are stored in the pod spec and are visible to anyone who can describe the pod. This method is simple and works well for environment tags, feature toggles, or logging levels.

---

### 1.2 Environment Variables from ConfigMap

ConfigMaps allow you to separate configuration from the container image. You can define key-value pairs in a ConfigMap and inject them into the container environment.

```yaml
envFrom:
  - configMapRef:
      name: app-config
```

Create the ConfigMap:

```bash
kubectl create configmap app-config --from-literal=APP_PORT=8080 --from-literal=DB_NAME=mydb
```

**Explanation:**  
ConfigMaps are ideal for non-sensitive values that may change between environments. For example, you might use a ConfigMap to pass API endpoints, application ports, or external URLs. This makes your app easily configurable without rebuilding or redeploying the image.

---

### 1.3 Environment Variables from Secret

Secrets are used to store sensitive information such as passwords, tokens, and keys. Like ConfigMaps, they can be injected into the container as environment variables.

```yaml
envFrom:
  - secretRef:
      name: app-secret
```

Create the Secret:

```bash
kubectl create secret generic app-secret --from-literal=DB_PASSWORD='mypassword'
```

**Explanation:**  
Secrets are stored in base64 encoded format and are meant to prevent accidental exposure of sensitive data. You should use secrets for all credentials, API keys, and secure tokens. Kubernetes supports RBAC to restrict who can access them.

---

## 2. Resources: Requests and Limits

Kubernetes lets you define compute resource boundaries for each container using the `resources` field. This is essential for efficient cluster scheduling and stability.

```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "250m"
  limits:
    memory: "128Mi"
    cpu: "500m"
```

**Explanation:**  
- **Requests** define the minimum resources a container needs to run. The scheduler uses this to find an appropriate node.
- **Limits** define the maximum resources a container can consume. If exceeded, memory is killed and CPU is throttled.
This prevents containers from over-consuming and impacting others in the cluster.

---

## 3. Liveness and Readiness Probes

Kubernetes uses health checks (probes) to monitor the state of containers inside pods. These checks help Kubernetes know when to restart or route traffic to a pod.

### 3.1 Liveness Probe

Liveness probes check whether the container is still alive. If it fails, the pod is restarted automatically.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10
```

**Explanation:**  
Use liveness probes to detect deadlocks, crashes, or unresponsive apps. This is especially useful for long-running services that might hang without crashing. Kubernetes ensures your pod self-heals if it gets stuck.

---

### 3.2 Readiness Probe

Readiness probes check whether the container is ready to serve traffic. If it fails, the pod is temporarily removed from the service endpoint list.

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 5000
  initialDelaySeconds: 5
  periodSeconds: 5
```

**Explanation:**  
Use readiness probes to delay traffic until your app is fully ready. For example, your app might need to connect to a database before handling requests. Without readiness probes, Kubernetes may send traffic too early, causing failures.

---

## 4. When to Use and When Not to Use Probes

### When to Use Readiness Probes:

- Application has startup delay or warm-up time
- Application depends on database, cache, or third-party service
- You want to prevent traffic to a pod during rollout or update
- You want zero downtime during deployment
- You are using Kubernetes Service to load balance traffic

### When to Use Liveness Probes:

- Application can hang or deadlock
- Application crashes silently and appears “running”
- You need Kubernetes to restart unhealthy pods
- Your service is stateful and long-running

### When Probes May Not Be Needed:

- Static content apps like Nginx serving HTML
- Short-lived jobs like CronJobs or batch scripts
- Simple stateless services that are always stable
- Dev/test environments or POC clusters
- Startup probe already covers your use-case

---

## 5. Summary Table

| Scenario                                  | Readiness Needed | Liveness Needed | Reason |
|-------------------------------------------|------------------|-----------------|--------|
| App with DB/cache dependency              | Yes              | Maybe           | Ensure DB is connected before traffic |
| App may deadlock or crash                 | Maybe            | Yes             | Restart if stuck |
| Static website (e.g., HTML on Nginx)      | No               | No              | No dynamic behavior |
| Background Job / CronJob                  | No               | No              | Pod exits quickly |
| Stateless microservice (fast start)       | Yes              | Maybe           | Prevent early traffic |
| Development or test cluster               | No               | No              | Optional for debugging |

---

## 6. Full Deployment YAML Example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo
  template:
    metadata:
      labels:
        app: demo
    spec:
      containers:
        - name: demo-container
          image: myrepo/demo-app:latest
          ports:
            - containerPort: 5000
          envFrom:
            - configMapRef:
                name: app-config
            - secretRef:
                name: app-secret
          resources:
            requests:
              memory: "64Mi"
              cpu: "250m"
            limits:
              memory: "128Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 5000
            initialDelaySeconds: 5
            periodSeconds: 5
```

---

## 7. Useful kubectl Commands

### ConfigMap Commands

```bash
kubectl get configmaps
kubectl describe configmap app-config
kubectl get configmap app-config -o yaml
```

### Secret Commands

```bash
kubectl get secrets
kubectl describe secret app-secret
kubectl get secret app-secret -o yaml
```

### Decode Secret Values (Base64)

```bash
echo 'bXlwYXNzd29yZA==' | base64 --decode
```

### Deployment and Pod Inspection

```bash
kubectl get deployments
kubectl get deployment demo-app -o yaml
kubectl describe deployment demo-app
kubectl get pods
kubectl describe pod <pod-name>
```

---

## Conclusion

Understanding how to manage environment variables, resource usage, and health checks is crucial for running production-grade applications on Kubernetes. Use ConfigMaps and Secrets to cleanly separate config from code. Use readiness and liveness probes to keep your workloads reliable and scalable. Apply resource requests and limits to ensure fair cluster usage.

These best practices not only improve app stability but also enhance the operability and observability of your Kubernetes environments.