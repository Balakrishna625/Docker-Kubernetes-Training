# EKS - Horizontal Pod Autoscaling (HPA)

## Step-01: Introduction
- What is Horizontal Pod Autoscaling?
- How HPA Works?
- How HPA configured?

## Step-02: Install Metrics Server
```
# Verify if Metrics Server already Installed (metrics server is pre installed in eks)
kubectl -n kube-system get deployment/metrics-server

```

## Step-03: Review Deploy our Application
```
# Deploy
kubectl apply -f hpa-demo.yaml

# List Pods, Deploy & Service
kubectl get pod,svc,deploy

```

## Step-04: Create a Horizontal Pod Autoscaler resource for the "hpa-demo-deployment" 
- This command creates an autoscaler that targets 50 percent CPU utilization for the deployment, with a minimum of one pod and a maximum of ten pods. 
- When the average CPU load is below 50 percent, the autoscaler tries to reduce the number of pods in the deployment, to a minimum of one. 
- When the load is greater than 50 percent, the autoscaler tries to increase the number of pods in the deployment, up to a maximum of ten
```
# Template
kubectl autoscale deployment <deployment-name> --cpu=50% --min=1 --max=6

# Replace
kubectl autoscale deployment hpa-demo-deployment --cpu=50% --min=1 --max=6

# Describe HPA
kubectl describe hpa/hpa-demo-deployment 

# List HPA
kubectl get horizontalpodautoscaler.autoscaling/hpa-demo-deployment 
```

## Step-05: Create the load & Verify how HPA is working
```
# Generate Load
kubectl run apache-bench \
  --rm -i --tty \                                                      
  --image=httpd \
  --restart=Never \
  -- ab -n 500000 -c 1000 http://hpa-demo-service-nginx.default.svc.cluster.local/

# List all HPA
kubectl get hpa

# List specific HPA
kubectl get hpa hpa-demo-deployment 

# Describe HPA
kubectl describe hpa/hpa-demo-deployment 

# List Pods
kubectl get pods
```

## Step-06: Cooldown / Scaledown
- Default cooldown period is 5 minutes. 
- Once CPU utilization of pods is less than 50%, it will starting terminating pods and will reach to minimum 1 pod as configured.


## Step-07: Clean-Up
```
# Delete HPA
kubectl delete hpa hpa-demo-deployment

# Delete Deployment & Service
kubectl delete -f hpa-demo.yaml
```
