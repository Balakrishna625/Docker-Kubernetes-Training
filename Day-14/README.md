# AWS EBS CSI Driver Setup



## Step 0: Prerequisites

- EKS cluster already created (e.g., eksdemo1)
- Region: us-east-1
- IAM Admin access
- eksctl installed (only for Step 1)

## Step 1: Enable OIDC Provider for the Cluster (only once)


```bash
eksctl utils associate-iam-oidc-provider   --cluster eksdemo1 --region us-east-1 --approve
```

## Step 2: Create IAM Policy for EBS CSI

1. In AWS Console, navigate to IAM → Policies → Create Policy.
2. Select JSON tab.
3. Paste the following JSON policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:CreateSnapshot", "ec2:DeleteSnapshot",
        "ec2:AttachVolume", "ec2:DetachVolume",
        "ec2:ModifyVolume", "ec2:CreateTags", "ec2:DeleteTags",
        "ec2:CreateVolume", "ec2:DeleteVolume",
        "ec2:DescribeAvailabilityZones", "ec2:DescribeInstances",
        "ec2:DescribeSnapshots", "ec2:DescribeTags",
        "ec2:DescribeVolumes", "ec2:DescribeVolumesModifications",
        "ec2:DescribeVolumeStatus"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt", "kms:Encrypt", "kms:GenerateDataKey*", "kms:DescribeKey"
      ],
      "Resource": "*"
    }
  ]
}
```

4. Click Next.
5. Name the policy: AmazonEBSCSIDriverPolicy-Manual.
6. Create the policy.

## Step 3: Create IAM Role for ServiceAccount (IRSA)

1. Navigate to IAM → Roles → Create Role.
2. Select Web Identity.
3. Choose:
   - Provider: your EKS cluster's OIDC provider (visible after Step 1).
   - Audience: sts.amazonaws.com.
4. Click Next.
5. Attach the policy: AmazonEBSCSIDriverPolicy-Manual.
6. Name the role: EKS_EBS_CSI_ControllerRole.
7. Create the role.

## Step 4: Create Kubernetes Service Account and Annotate with IAM Role

```bash
kubectl create sa ebs-csi-controller-sa -n kube-system

kubectl annotate sa ebs-csi-controller-sa -n kube-system   eks.amazonaws.com/role-arn=arn:aws:iam::<ACCOUNT_ID>:role/EKS_EBS_CSI_ControllerRole --overwrite
```

Replace <ACCOUNT_ID> with your actual AWS account ID.

## Step 5: Install AWS EBS CSI Driver via Helm

```bash
helm repo add aws-ebs-csi-driver https://kubernetes-sigs.github.io/aws-ebs-csi-driver
helm repo update

helm upgrade --install aws-ebs-csi-driver aws-ebs-csi-driver/aws-ebs-csi-driver   --namespace kube-system   --set controller.serviceAccount.create=false   --set controller.serviceAccount.name=ebs-csi-controller-sa   --set enableVolumeResizing=true   --set enableVolumeSnapshot=true
```

## Step 6: Create gp3 StorageClass

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  fsType: ext4
  encrypted: "true"
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
```

```bash
kubectl apply -f sc-gp3.yaml
```

## Step 7: Test PVC and Pod

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ebs-gp3-test
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 5Gi
  storageClassName: gp3
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ebs-test-pod
spec:
  containers:
  - name: app
    image: public.ecr.aws/docker/library/busybox:stable
    command: ["sh", "-c", "sleep 3600"]
    volumeMounts:
    - mountPath: /data
      name: data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: ebs-gp3-test
```

```bash
kubectl apply -f pvc.yaml
kubectl apply -f pod.yaml
kubectl get pvc,pod
```

This completes the AWS EBS CSI Driver setup with IRSA using AWS Console UI for IAM and Helm for installation.
