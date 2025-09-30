# Kubernetes Storage with AWS EBS

## 1. AWS EBS Volumes in Detail

### What is EBS?
- Elastic Block Store (EBS) is block storage that attaches to EC2 instances (like a virtual hard disk).
- It is persistent → data stays even after the EC2 instance stops.
- It is replicated within one AZ → provides durability against single hardware failure.

Analogy: Think of EC2 as a computer without a hard disk, and EBS as the hard disk you attach to it.

---

### Properties of EBS Volumes

1. **Size**
   - Can range from 1 GiB to 16 TiB.
   - You pick the size at creation.
   - Some types (gp3, io1, io2) support online resizing.
   - More size does not always mean more performance (depends on volume type).

2. **IOPS (Input/Output Operations per Second)**
   - Defines how many read/write requests the volume can handle.
   - Example: A database requires high IOPS to handle thousands of small queries per second.
   - Types:
     - gp3 → 3,000 IOPS default, scalable to 16,000.
     - io1/io2 → can provision up to 64,000 IOPS.

3. **Throughput (MB/s)**
   - Defines how much data per second can be transferred.
   - Example: Streaming large files needs high throughput.
   - gp3 starts with 125 MB/s → scalable up to 1,000 MB/s.
   - st1/sc1 (HDD types) give better throughput than IOPS.

4. **Volume Types**
   - gp2 / gp3 (General Purpose SSD): Balanced, good for most apps.
   - io1 / io2 (Provisioned IOPS SSD): High performance, low-latency apps (databases).
   - st1 (Throughput Optimized HDD): Big data, logs, analytics.
   - sc1 (Cold HDD): Archival, rarely accessed.

5. **AZ Specific**
   - An EBS volume belongs to one AZ only.
   - You cannot attach an EBS volume in `us-east-1a` to an instance in `us-east-1b`.
   - Reason: The physical storage is in one data center (AZ).
   - If you want cross-AZ availability → use EFS (shared file system) or S3 (object storage).

Analogy: Imagine each AZ is a separate building. If you rent a locker in building A, you cannot use it from building B.

---

## 2. Kubernetes Storage Abstractions

In Kubernetes, applications should not worry about how/where storage is created. That’s why Kubernetes uses PV (PersistentVolume) and PVC (PersistentVolumeClaim).

### PV (PersistentVolume)
- PV is like a storage resource advertised to the cluster.
- It can map to different storage backends: EBS, NFS, EFS, Azure Disk, etc.
- Created either manually (static) or automatically (dynamic via StorageClass).
- Properties: capacity, access modes, reclaim policy.

### PVC (PersistentVolumeClaim)
- A PVC is like a request from a Pod asking for storage.
- Example: “I need 10 GiB, ReadWriteOnce.”
- Kubernetes finds a suitable PV and binds them.
- If StorageClass is set, Kubernetes will provision a new EBS volume automatically.

### Access Modes
- ReadWriteOnce (RWO): Volume can be mounted by a single node. (EBS supports this only).
- ReadOnlyMany (ROX): Multiple nodes can read.
- ReadWriteMany (RWX): Multiple nodes can read & write (EBS does not support this; EFS does).

---

## 3. How EBS, PV, and PVC Work Together

### Example Workflow
1. Developer creates a PVC requesting 5Gi.
2. Kubernetes checks if a PV already exists that matches.
   - If yes → PVC binds to PV → PV is backed by an EBS volume.
   - If no → If StorageClass is set → Kubernetes provisions a new EBS volume in that AZ → creates a PV → binds to PVC.
3. Pod uses the PVC → which is actually mounted from an EBS volume.

Analogy:
- EBS = Locker in the building.
- PV = Tag on the locker that Kubernetes recognizes.
- PVC = Student asking for a locker of certain size.
- Kubernetes: “Okay, I’ll assign this locker to you.”

---

## 4. Example YAMLs

### PersistentVolume (static binding to EBS volume)
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: ebs-pv
spec:
  capacity:
    storage: 5Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  awsElasticBlockStore:
    volumeID: vol-0abcd1234efgh5678   # AWS EBS volume ID
    fsType: ext4
```

### PersistentVolumeClaim
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ebs-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

### Pod using PVC
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-using-ebs
spec:
  containers:
  - name: myapp
    image: nginx
    volumeMounts:
    - mountPath: "/data"
      name: ebs-volume
  volumes:
  - name: ebs-volume
    persistentVolumeClaim:
      claimName: ebs-pvc
```

---

## 5. Why PV + PVC Matter in EKS
- Pods are ephemeral (can die anytime). Without PV/PVC, all data is lost.
- With PV/PVC (backed by EBS):
  - Data persists even if Pod is deleted.
  - Pod restarts → data still there.
- Limitation: Since EBS is AZ-specific, Pods using it must run in the same AZ.
  - If Kubernetes reschedules Pod to another AZ → it won’t work.
  - Solution: Use StorageClass with EBS carefully, or use EFS for multi-AZ.

---

## ✅ Summary
- EBS = AWS hard disk (AZ-specific, with size/IOPS/throughput).
- PV = Kubernetes object wrapping that disk.
- PVC = User’s request for storage.
- Together → Apps get reliable, persistent storage without caring about AWS details.
