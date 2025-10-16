
# Kubernetes Pods & Workloads — Ops Cheat Sheet (with Why/When)

**Scope:** Pods, Deployments, ReplicaSets, DaemonSets. Includes: *how to find, inspect, describe, log, exec/enter, follow rollouts, and related helpers.*  
Use `-n <namespace>` (or set default namespace) as needed. Aliases like `k=kubectl` are assumed optional.

---

## 0) Quick Mental Model

- **Deployment** → manages **ReplicaSets** → manage **Pods** (stateless)
- **DaemonSet** → 1 Pod *per node* (agents, log collectors, CNI, etc.)
- **ReplicaSet** → versioned set behind a Deployment (normally not edited directly)
- **Pod** → smallest runnable unit (1+ containers)

---

## 1) List & Find Workloads

### Pods
```bash
kubectl get pods                  # list pods in current namespace
kubectl get pods -o wide          # include Pod IP, Node
kubectl get pods -A               # all namespaces
kubectl get pod <pod-name> -o yaml     # full spec/status
```

### Deployments / ReplicaSets / DaemonSets
```bash
kubectl get deploy                # deployments
kubectl get rs                    # replica sets
kubectl get ds                    # daemon sets
kubectl get deploy -o wide
kubectl get rs -o wide
kubectl get ds -o wide
```
---

## 2) Describe — Deep Inspection

### Commands
```bash
kubectl describe pod <pod>
kubectl describe deploy <name>
kubectl describe rs <name>
kubectl describe ds <name>
```

### When to use **describe**?
- Pod **CrashLoopBackOff** / **ImagePullBackOff** / pending scheduling.
- Probes failing (**liveness/readiness/startup**).

---

## 3) Logs — Read, Filter, and Follow

### Core log commands
```bash
kubectl logs <pod>                         # single-container pod
kubectl logs <pod> -c <container>         # specific container
kubectl logs <pod> --previous             # last-terminated container
kubectl logs -f <pod>                     # follow (real-time streaming)
kubectl logs -f -l app=web                # follow logs for all pods with label
kubectl logs <pod> --since=10m            # recent window
kubectl logs <pod> --tail=200             # last N lines
kubectl logs <pod> --timestamps           # include timestamps
```

### Why check logs?
- To see **runtime errors/exceptions**, request traces, startup output.
- To confirm **health** after deploy, validate traffic, or debug failures.

### When to check logs?
- Immediately after **rollouts** or **incidents** (errors, 5xx spikes).
- During **intermittent** issues (use `-f` and `--since` to reduce noise).
- When **probes** or **readiness** aren’t behaving as expected.

---

## 4) “Enter” (Exec/Attach) into Pods

### Exec an interactive shell
```bash
kubectl exec -it <pod> -- sh         # or -- bash if available
kubectl exec -it <pod> -c <container> -- sh
```

*Use when the base image is minimal and lacks shells/tools.*

---

---

## 5) Common Lifecycle Operations

```bash
kubectl scale deploy/<name> --replicas=3        # scale up/down
kubectl delete pod <pod>                        # let controller recreate
kubectl delete pod <pod> --grace-period=0 --force  # last resort only
```

**Why/When:** right-size replicas, replace unhealthy pods, or move workloads off nodes for maintenance.

```

---

## 6) Minimal Troubleshoot Flow (Pods)

1. `kubectl get pods -o wide` → check status, node, IP.  
2. `kubectl describe pod <pod>` → read **events** (image pull, probe, OOM).  
3. `kubectl logs <pod> [-c <ctr>]` → errors/exceptions; `-f` to stream.  
4. `kubectl exec -it <pod> -- sh` → check processes, ports, DNS, curl.  
5. If from a Deployment: `kubectl rollout status deploy/<name>` → confirm rollout.  
6. Check service endpoints: `kubectl get endpoints <svc> -o wide`.  
7. If node issues: `kubectl describe node <node>` / `kubectl top pods`.  

---
