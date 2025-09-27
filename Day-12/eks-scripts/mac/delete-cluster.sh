#!/bin/bash
# Set AWS Profile
export AWS_PROFILE=eks-training

# Delete PDBs (Pod Disruption Budgets) to avoid nodegroup deletion issues
kubectl delete pdb --all --all-namespaces

# Delete Node Group
eksctl delete nodegroup --cluster=eksdemo1 --name=eksdemo1-ng-public1

# Delete EKS Cluster
eksctl delete cluster eksdemo1
