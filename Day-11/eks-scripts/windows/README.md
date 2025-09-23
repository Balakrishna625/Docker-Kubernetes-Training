# Running EKS Scripts on Windows (PowerShell)



## Execution Policy
By default, Windows blocks running PowerShell scripts. You must allow it once.

Run PowerShell (as your user) and execute:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

You can check your policy with:
```powershell
Get-ExecutionPolicy -List
```

## Steps to Run

1. Open PowerShell in the directory containing the scripts.

2. Run the create script:
```powershell
.\create-cluster.ps1
```

This will:
- Create the EKS cluster control plane.
- Associate the IAM OIDC provider.
- Create a managed node group.

3. Verify the cluster:
```powershell
eksctl get cluster
kubectl get nodes -o wide
```

4. When finished, delete resources:
```powershell
.\delete-cluster.ps1
```

This will delete the node group, then the cluster itself.

---
