## 1. What is a Service Account in Kubernetes

A **Service Account (SA)** is an identity used by **Pods** or **controllers** (like Deployments, Jobs, etc.) to interact securely with the **Kubernetes API** or external **cloud services**.

Every Pod that needs to communicate with the Kubernetes API or external systems requires an identity. Service Accounts are designed to provide that identity safely within Kubernetes.

Typical use cases:
- Accessing Kubernetes resources such as secrets or configmaps.
- Authenticating to AWS, Azure, or GCP services.
- Using IAM permissions (via IRSA in EKS) without storing access keys inside containers.

---

## 2. Why We Use Service Accounts

| Use Case | Benefit |
|-----------|----------|
| Connect pods securely to AWS services | Pods assume IAM roles automatically without credentials |
| Assign minimal permissions | Only the required IAM role is attached to a specific Service Account |
| Track activity | Kubernetes events show which Service Account performed an action |
| Eliminate static credentials | Avoids using hardcoded AWS keys in pods |

Example:
```bash
kubectl create serviceaccount webapp-sa
kubectl get sa
```

---

## 3. Giving Pods IAM Permissions (EKS Example)

In **Amazon EKS**, we use **IRSA** (IAM Roles for Service Accounts) to give pods IAM permissions.

Instead of attaching IAM roles to worker nodes, we link IAM roles directly to Service Accounts.  
This allows fine-grained control — each pod can have its own IAM permissions.

### How IRSA Works
1. Create a Service Account in Kubernetes.  
2. Annotate it with an IAM Role ARN.  
3. Deploy pods that use this Service Account.  
4. EKS automatically provides credentials via the OIDC identity provider.

---

## 4. IAM Role Annotation for Service Accounts

Annotation connects a Kubernetes Service Account to an AWS IAM Role.

Example:
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: s3-reader-sa
  namespace: data-pipeline
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::111122223333:role/S3ReaderRole
```

This tells the **EKS control plane** that any pod using this Service Account should assume the given IAM Role using IRSA.

---

## 5. Prerequisites for Service Account and IAM Role Integration

For IRSA to work, the following must be ensured:

1. **OIDC provider** must be associated with the EKS cluster.
   ```bash
   eksctl utils associate-iam-oidc-provider --cluster <cluster-name> --approve
   ```

2. **IAM Role trust policy** must reference the OIDC provider. Example:
   ```json
   {
     "Effect": "Allow",
     "Principal": {
       "Federated": "arn:aws:iam::<account-id>:oidc-provider/oidc.eks.<region>.amazonaws.com/id/<oidc-id>"
     },
     "Action": "sts:AssumeRoleWithWebIdentity",
     "Condition": {
       "StringEquals": {
         "oidc.eks.<region>.amazonaws.com/id/<oidc-id>:sub": "system:serviceaccount:data-pipeline:s3-reader-sa"
       }
     }
   }
   ```

3. The Service Account annotation must exactly match the IAM Role ARN.  
4. The Pod specification must reference the correct Service Account:
   ```yaml
   serviceAccountName: s3-reader-sa
   ```
5. The IAM Role must have the necessary policies attached (for example, `AmazonS3ReadOnlyAccess`).

---

## 6. Example - Pod Using Service Account with IAM Role

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: s3-reader-app
  namespace: data-pipeline
spec:
  replicas: 1
  selector:
    matchLabels:
      app: s3-reader
  template:
    metadata:
      labels:
        app: s3-reader
    spec:
      serviceAccountName: s3-reader-sa
      containers:
        - name: reader
          image: amazonlinux:2
          command: ["aws", "s3", "ls", "s3://my-bucket"]
```

Result:  
The pod automatically assumes the IAM Role linked to `s3-reader-sa` and securely accesses S3 using temporary credentials managed by EKS.

---

## 7. What Are Namespaces in Kubernetes

A **Namespace** is a logical partition inside a cluster. It helps **organize**, **isolate**, and **manage** groups of resources.

Think of it as a folder structure inside your Kubernetes cluster. Each namespace can contain its own pods, deployments, and services.

Each namespace has:
- Separate resources (pods, deployments, services, etc.)
- Independent service accounts and secrets
- Individual resource limits and quotas

---

## 8. Why We Use Namespaces

| Purpose | Description |
|----------|--------------|
| Isolate environments | Separate dev, qa, and prod workloads in one cluster |
| Simplify management | Use `kubectl get all -n dev` to view only related resources |
| Independent service accounts | Each namespace can have its own IAM-linked SAs |
| Prevent name conflicts | Teams can use same resource names under different namespaces |

---

## 9. Commands for Namespaces

```bash
# List all namespaces
kubectl get ns

# Create a new namespace
kubectl create ns dev

# View resources in a namespace
kubectl get all -n dev

# Delete a namespace
kubectl delete ns dev

# Set default namespace for current context
kubectl config set-context --current --namespace=dev
```

---

## 10. How Service Accounts and Namespaces Work Together

- Each namespace maintains its own service accounts.
- IAM Role trust relationships must include both the namespace and the service account name.
- A pod in one namespace cannot use a service account from another namespace.

Example structure:
```
Namespace: dev
 ├── ServiceAccount: s3-dev-reader
 │     ↳ annotated to IAM Role arn:aws:iam::1111:role/S3DevAccess
 └── Pods using this SA get S3DevAccess permissions
```

---

## 11. Common Questions

**Q:** Can a pod in `dev` namespace use a Service Account from `prod`?  
**A:** No, Service Accounts are namespace-scoped.

**Q:** What is the default Service Account?  
**A:** Each namespace automatically has a Service Account named `default`.

**Q:** How can I find which Service Account a pod is using?  
```bash
kubectl get pod <pod> -o jsonpath='{.spec.serviceAccountName}'
```

**Q:** How can I check which IAM Role is linked to a Service Account?  
```bash
kubectl describe sa <sa-name> -n <namespace>
```
Look for annotation `eks.amazonaws.com/role-arn`.

---

## 12. Summary

| Concept | Purpose | Key Benefit |
|----------|----------|-------------|
| Service Account | Provides identity for pods | Enables secure access without static credentials |
| IAM Role Annotation | Links SA with IAM Role | Gives fine-grained AWS permissions via IRSA |
| Namespace | Logical grouping | Isolates workloads and organizes resources |

---
