
# Kubernetes Service Accounts 

## What is a Service Account in Kubernetes?

A Service Account is a Kubernetes object that provides an identity for processes that run in a Pod. It allows pods to authenticate themselves to the Kubernetes API server.

### Technical Definition

A ServiceAccount is used by pods to:
- Authenticate against the Kubernetes API
- Automatically receive a token, CA certificate, and namespace information inside the pod at runtime
- Be attached to pods to identify them to the API server

In simple terms: It’s a way to say "this pod is allowed to speak to the Kubernetes API as X".

## Real-World Analogy

Imagine a delivery person (Pod) working in a secured building (Kubernetes cluster). To enter rooms (like the mailroom, security office, or data center), the person needs a badge (ServiceAccount).

This badge tells security (API server):
- Who the person is
- What rooms they can enter (authorization comes later)

## Key Points

| Concept              | Description                                                                                       |
|----------------------|---------------------------------------------------------------------------------------------------|
| Used By              | Pods (not humans)                                                                                 |
| Purpose              | To authenticate the pod to the Kubernetes API                                                     |
| Default Behavior     | Pods automatically get the `default` ServiceAccount in the namespace                             |
| Location in Pod      | Token and cert are mounted at `/var/run/secrets/kubernetes.io/serviceaccount/`                  |
| Can Customize        | Yes — you can create your own ServiceAccounts and attach them to specific pods                   |

## How to Create and Use a Service Account

### 1. Create a Custom Service Account

```yaml
# my-serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app-sa
  namespace: default
```

Apply it:

```bash
kubectl apply -f my-serviceaccount.yaml
```

### 2. Use It in a Pod

```yaml
# pod-with-sa.yaml
apiVersion: v1
kind: Pod
metadata:
  name: sa-demo-pod
spec:
  serviceAccountName: my-app-sa
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "sleep 3600"]
```

Apply it:

```bash
kubectl apply -f pod-with-sa.yaml
```

### 3. Verify the Pod is Using the Correct ServiceAccount

```bash
kubectl get pod sa-demo-pod -o jsonpath='{.spec.serviceAccountName}'
```

Expected output:
```
my-app-sa
```

## How Service Accounts Help in EKS (IAM Integration)

In Amazon EKS, you can use IAM Roles for Service Accounts (IRSA) to let your pods access AWS services securely without storing long-term credentials inside the pod.

### Example Use Case

A pod needs to upload files to S3. Instead of hardcoding AWS keys inside the pod, you:

1. Create a Service Account in Kubernetes
2. Attach an IAM Role to that ServiceAccount using OIDC
3. The pod uses the ServiceAccount, and AWS automatically allows it to access resources like S3, DynamoDB, etc.

### Flow

```
Pod --> Uses ServiceAccount --> Mapped to IAM Role --> AWS Permissions (via IAM)
```

This is secure and follows best practices:
- No static AWS credentials in pods
- Follows principle of least privilege
- Enables fine-grained permissions per pod

## Summary

- ServiceAccounts give pods an identity to access Kubernetes APIs.
- Every pod gets a default one unless specified.
- You can create custom ServiceAccounts and attach them to pods.
- In EKS, ServiceAccounts can be used to securely assume IAM roles and access AWS services without credentials in the container.
