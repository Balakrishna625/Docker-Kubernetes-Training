# Running EKS Scripts on macOS / Linux


## Steps to Run

1. Make the script executable:
```bash
chmod +x create-cluster.sh
chmod +x delete-cluster.sh
```

2. Run the create script:
```bash
./create-cluster.sh
```

This will:
- Create the EKS cluster control plane.
- Associate the IAM OIDC provider.
- Create a managed node group.

3. Verify the cluster:
```bash
eksctl get cluster
kubectl get nodes -o wide
```

4. When finished, delete resources:
```bash
./delete-cluster.sh
```

This will delete the node group, then the cluster itself.

---
