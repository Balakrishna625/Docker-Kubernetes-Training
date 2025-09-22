# Working with Kubernetes Contexts

When managing multiple clusters, Kubernetes uses a **kubeconfig file** that stores connection details.  
A **context** defines which cluster, user, and namespace `kubectl` will talk to by default.

## View All Contexts
```bash
kubectl config get-contexts
```
- Lists all contexts configured in your kubeconfig.
- The current context is marked with a `*`.

## View Current Context
```bash
kubectl config current-context
```
- Shows the name of the cluster/context you are currently connected to.

## Switch to a Different Context
```bash
kubectl config use-context <context-name>
```
- Switches your `kubectl` session to the given context.

## Example
```bash
kubectl config get-contexts
# OUTPUT:
# CURRENT   NAME                  CLUSTER           AUTHINFO          NAMESPACE
# *         eksdemo1              eksdemo1         eksdemo1

kubectl config current-context
# eksdemo1

kubectl config use-context minikube
# Switched to context "minikube".
```

## Where Contexts Are Stored
- Contexts are stored in the kubeconfig file (usually at `~/.kube/config`).
- You can merge multiple cluster configs into one file to switch easily.
