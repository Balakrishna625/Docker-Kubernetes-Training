# Kubernetes Namespaces — Beginner Teaching Notes

## 1. What is a Namespace?

A Namespace in Kubernetes is a way to divide a cluster into smaller, logical sections.  
Think of a Kubernetes cluster as a big apartment building. Inside this building, there are many rooms. Each room can be used by different people or teams, but they are still part of the same building.  

Similarly, a Namespace is like a room inside the building. You can put your Pods, Services, and Deployments inside a Namespace. By doing this, you keep your resources organized and prevent confusion when multiple people or applications are working in the same cluster.

---

## 2. The Analogy of Two Marks in Two Houses

Imagine two boys named Mark.  

- One lives in the Smith house, the other lives in the Williams house.  
- Inside their own house, people just call them "Mark".  
- But if someone outside the house wants to call them, they must use their full names: "Mark Smith" or "Mark Williams".  

This is exactly how Kubernetes Namespaces work:  

- Inside the same namespace, you can refer to a Service just by its short name.  
- If you want to reach a Service in a different namespace, you must use its full DNS name:  
  ```
  <service-name>.<namespace>.svc.cluster.local
  ```

---

## 3. Why Do We Need Namespaces?

When you start learning Kubernetes, you often work in the default namespace and it feels fine.  
But as your cluster grows, namespaces become very useful.  

Here are some practical situations where namespaces help:

1. **Organizing Applications**  
   Suppose you are running a frontend and backend service for a project. If you have multiple projects running on the same cluster, you can separate them by namespaces so that they do not mix with each other.  

2. **Avoiding Name Conflicts**  
   Two teams may both want to create a Service called `web`. If everything is in the same namespace, this will cause a conflict. But if each team uses its own namespace, both can have a Service called `web` without any problems.  

3. **Separating Environments**  
   You may want to run a development version of your application and a production version in the same cluster. By creating two namespaces, for example `dev` and `prod`, you make sure that the resources from one environment don’t interfere with the other.  

4. **Managing Resources**  
   Each namespace can have resource limits (for example, how many Pods it can run or how much CPU and memory it can use). This prevents one part of the system from consuming everything in the cluster.

---

## 4. Default Namespaces in Kubernetes

Kubernetes comes with a few namespaces created automatically:

- **default**:  
  This is where your resources are created if you don’t specify any namespace.  

- **kube-system**:  
  Used by Kubernetes itself to run important system components like networking and DNS. You normally should not place your own applications here.  

- **kube-public**:  
  Contains information that is available to all users, even those who are not authenticated.  

- **kube-node-lease**:  
  Used by Kubernetes to track the health of cluster nodes. Each node gets a lease object that is regularly updated.  

---

## 5. How Do Namespaces Work?

Within the same namespace, resources can find each other by name.  

For example:  
- A Pod called `frontend` can reach a Service called `backend` by simply using `http://backend:5000`.  

But if the `frontend` Pod is in the `dev` namespace and the `backend` Service is in the `prod` namespace, then the frontend must use the full DNS name:  

```
http://backend.prod.svc.cluster.local:5000
```

This rule applies to all Services in Kubernetes.  
The DNS structure always follows this pattern:

```
<service-name>.<namespace>.svc.cluster.local
```

---

## 6. Creating a Namespace

There are two simple ways to create a namespace:

**Using kubectl command**:
```bash
kubectl create namespace dev
```

**Using a YAML file**:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dev
```

Apply the file:
```bash
kubectl apply -f dev-namespace.yaml
```

---

## 7. Creating Resources in a Namespace

By default, when you run `kubectl apply -f pod.yaml`, the Pod goes into the `default` namespace.  

To make sure a resource belongs to a specific namespace, you can do it in two ways:

**Option 1: Specify namespace with kubectl**:
```bash
kubectl apply -f pod.yaml -n dev
```

**Option 2: Define namespace inside the YAML file**:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
  namespace: dev
spec:
  containers:
  - name: nginx
    image: nginx
```

---

## 8. Switching Between Namespaces

It can be tiring to always type `-n dev` in your commands.  
Instead, you can switch your current context to a different namespace:

```bash
kubectl config set-context --current --namespace=dev
```

Now, every command will run in the `dev` namespace automatically.  
To switch back:

```bash
kubectl config set-context --current --namespace=default
```

You can check your current namespace with:
```bash
kubectl config view --minify | grep namespace:
```

---

## 9. Viewing Resources in Namespaces

- View Pods in the current namespace:
```bash
kubectl get pods
```

- View Pods in a specific namespace:
```bash
kubectl get pods -n dev
```

- View Pods in all namespaces:
```bash
kubectl get pods --all-namespaces
```

- View all namespaces:
```bash
kubectl get namespaces
```

---

## 10. Resource Quotas in a Namespace

Sometimes you may want to control how many resources a namespace can use.  
This is done using a ResourceQuota.

Example:
```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
  namespace: dev
spec:
  hard:
    pods: "10"
    requests.cpu: "4"
    requests.memory: "8Gi"
```

This means the `dev` namespace can run at most 10 Pods, request 4 CPUs, and 8 GiB of memory.  

Apply it:
```bash
kubectl apply -f dev-quota.yaml
```

---

## 11. Key Takeaways

- A namespace is a way to divide a cluster into smaller sections.  
- Think of it like rooms or houses in a larger building.  
- Inside the same namespace, you can use short names for resources. Across namespaces, you need full names.  
- Namespaces help with organization, preventing conflicts, and managing resources.  
- Beginners can work in the `default` namespace, but as clusters grow, namespaces become very important.  
