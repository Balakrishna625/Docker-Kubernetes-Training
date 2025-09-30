# EKS PV/PVC Demo

This repo demonstrates the difference between running a Pod **without persistent storage** and **with PV/PVC on AWS EBS**.

##  Part 1: Without PV/PVC (Data Lost)
- Apply the pod:
  ```bash
  kubectl apply -f 01-no-pv/pod-no-pv.yaml
  ```
- Exec into it and write data:
  ```bash
  kubectl exec -it pod-no-pv -- sh
  echo "Hello from non-persistent storage" > /test.txt
  cat /test.txt
  exit
  ```
- Delete and recreate pod:
  ```bash
  kubectl delete pod pod-no-pv
  kubectl apply -f 01-no-pv/pod-no-pv.yaml
  kubectl exec -it pod-no-pv -- cat /test.txt
  ```
-  Data is gone.

##  Part 2: With PV/PVC (Data Persists)
1. Create an EBS volume in AWS (5 GiB, same AZ as your nodes).
2. Update `02-with-pv/pv.yaml` with your EBS `volumeID`.
3. Apply the manifests:
   ```bash
   kubectl apply -f 02-with-pv/pv.yaml
   kubectl apply -f 02-with-pv/pvc.yaml
   kubectl apply -f 02-with-pv/pod-with-pv.yaml
   ```
4. Exec into the pod and write data:
   ```bash
   kubectl exec -it pod-with-pv -- /bin/sh
   echo "Hello from Persistent Storage" > /data/test.txt
   cat /data/test.txt
   exit
   ```
5. Delete and recreate pod:
   ```bash
   kubectl delete pod pod-with-pv
   kubectl apply -f 02-with-pv/pod-with-pv.yaml
   kubectl exec -it pod-with-pv -- cat /data/test.txt
   ```
6.  Data is still there!


