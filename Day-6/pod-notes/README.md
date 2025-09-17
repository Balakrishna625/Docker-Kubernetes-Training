# Kubernetes Pod – Beginner-Friendly Notes

This document explains what a Pod is in Kubernetes, why it is used instead of containers directly, and the most common commands to work with Pods.

---

## What is a Pod?

A Pod is the smallest and most basic object in Kubernetes. It is used to run your application.

You can think of a Pod as a box that wraps your application (container) and gives it a name, identity, and a way to run properly inside a Kubernetes cluster.

Kubernetes does not manage containers directly. It always manages them through Pods.

### Why Not Just Use Containers?

Containers are good for packaging and running apps, but they lack:

- Standard naming or identity
- Built-in lifecycle handling (what if it crashes?)
- Integration into a cluster environment

Kubernetes solves all this by using Pods to wrap and manage containers.

So, **every container you run in Kubernetes must be inside a Pod**.

---

## Pod YAML Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
  - name: myapp
    image: nginx
```

### Explanation:

- `apiVersion: v1` – Version of Kubernetes API used for Pods
- `kind: Pod` – Type of resource to create
- `metadata.name` – Name for the Pod
- `spec.containers` – List of containers in the Pod
- `image: nginx` – Docker image to run inside the Pod

---

## Basic Pod Commands

### 1. Create a Pod from YAML

```bash
kubectl apply -f pod.yaml
```

Creates a Pod using the definition in the file.

### 2. List All Pods

```bash
kubectl get pods
```

Shows all pods running in the current namespace.

### 3. Get Pod Details

```bash
kubectl describe pod <pod-name>
```

Gives detailed info about the pod, such as events, status, and configuration.

### 4. View Pod Logs

```bash
kubectl logs <pod-name>
```

Shows output logs of the container inside the pod.

If your pod has multiple containers:

```bash
kubectl logs <pod-name> -c <container-name>
```

### 5. Open a Shell Inside the Pod

```bash
kubectl exec -it <pod-name> -- /bin/bash
```

This lets you run commands inside the container.

### 6. Delete a Pod

```bash
kubectl delete pod <pod-name>
```

Removes the pod from the cluster.

---

## Summary

- Kubernetes always runs containers inside Pods.
- A Pod gives the container identity, structure, and makes it manageable.
- Use `kubectl` commands to create, inspect, debug, and delete Pods.
- One container per Pod is the most common setup.