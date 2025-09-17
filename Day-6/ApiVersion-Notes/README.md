#  Understanding `apiVersion` and `kind` in Kubernetes YAML Files

This guide is written for beginners to clearly understand what `apiVersion` and `kind` mean in Kubernetes YAML configuration files, and how to use them correctly.

---

##  What is `apiVersion`?

The `apiVersion` field tells Kubernetes **which version of its internal API** should be used to process and understand your YAML file.

###  Why is it needed?
- Kubernetes is constantly evolving. Different types of resources (like Pod, Deployment, Service) are managed under different **API groups** and **versions**.
- The `apiVersion` helps Kubernetes **know the correct schema and behavior** for that object.

###  Key Rule
You **must use the correct `apiVersion` for the resource type (`kind`) you are creating**.

###  Common `apiVersion` Values

| Resource      | Correct `apiVersion`     |
|---------------|---------------------------|
| Pod           | `v1`                      |
| Service       | `v1`                      |
| ConfigMap     | `v1`                      |
| Secret        | `v1`                      |
| Deployment    | `apps/v1`                 |
| ReplicaSet    | `apps/v1`                 |
| StatefulSet   | `apps/v1`                 |
| CronJob       | `batch/v1`                |
| Ingress       | `networking.k8s.io/v1`    |

---

##  What is `kind`?

The `kind` field tells Kubernetes **what type of object** you are creating with your YAML.

###  Examples of `kind` values

- `Pod`
- `Deployment`
- `Service`
- `ConfigMap`
- `Secret`
- `ReplicaSet`
- `StatefulSet`
- `PersistentVolume`
- `Ingress`

Every object you define in Kubernetes must include a valid `kind` that maps to a Kubernetes resource.

###  Relation Between `kind` and `apiVersion`

- Some `kind` values are managed by the **core API group**, and use `v1`.
- Others are part of named API groups, like `apps/v1`, `batch/v1`, `networking.k8s.io/v1`, etc.

| kind        | apiVersion              |
|-------------|--------------------------|
| Pod         | `v1`                     |
| Deployment  | `apps/v1`                |
| Job         | `batch/v1`               |
| Ingress     | `networking.k8s.io/v1`   |

You must **match them correctly** or your YAML file won’t work.

---

##  How to Find the Correct `apiVersion`

### 1. Recommended Way:
Use the [Kubernetes API documentation](https://kubernetes.io/docs/reference/kubernetes-api/) to find the right `apiVersion` for each kind.

### 2. Quick Terminal Way:
Use `kubectl explain` to check from your terminal:
```bash
kubectl explain pod
kubectl explain deployment
```

This will tell you:
- The correct `apiVersion`
- Supported fields
- Resource documentation

---

##  Examples

###  Pod YAML (Correct)
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
  - name: nginx
    image: nginx
```

###  Pod YAML (Incorrect)
```yaml
apiVersion: apps/v1   #  Wrong for Pod
kind: Pod
```

###  Deployment YAML (Correct)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mydeployment
spec:
  replicas: 2
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
```

---

##  Summary

- `apiVersion`: Tells Kubernetes **which API version** to use for a resource.
- `kind`: Tells Kubernetes **what type of resource** you're defining.
- Both fields are **mandatory** and must match correctly.
- Always refer to **Kubernetes docs** or use `kubectl explain` to avoid errors.

Prepared by Bala for Kubernetes beginner training.