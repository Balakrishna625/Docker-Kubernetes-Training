# IAM Role, IAM Policy, and Trust Relationship

## 1. IAM Role
An IAM Role is like a permission identity in AWS.  
It is not owned by anyone. Instead, AWS services (like EC2, Lambda) can take the role when they need to do something.  
A role gives **temporary permissions** that are defined by the attached policy.  
**Example:** An EC2 instance can take a role to get access to an S3 bucket.  
**Analogy:** Think of a visitor badge in an office. The badge itself is not tied to a person, but whoever wears it temporarily gets access to certain rooms.

---

## 2. IAM Policy
An IAM Policy is a set of rules written in JSON.  
It defines exactly **what actions are allowed or denied** and **on which resources**.  
Policies are always attached to a role to give permissions.  
**Example:** A policy may allow the action `s3:GetObject` so an EC2 instance can read files from a specific bucket.  
**Analogy:** It’s like the rule sheet for the visitor badge. The rule might say: “You can enter the meeting room but not the finance room.”

---

## 3. IAM Role Trust Relationship
A trust relationship tells AWS **which service is allowed to take the role**.  
Without this trust relationship, no service can use the role, even if it has a policy.  
**Example:** A trust relationship may say that only `ec2.amazonaws.com` is allowed to assume the role. Then only EC2 instances can use it.  
**Analogy:** HR approval that says: “Only delivery staff are allowed to use this badge.” If not approved, the badge is useless.

---

## 4. Putting It Together
- The **Role** is the badge.  
- The **Policy** is the list of permissions written for that badge.  
- The **Trust Relationship** decides which AWS service can wear the badge.  

**Example:** An EC2 instance (approved in trust relationship) takes the role, and the attached policy allows it to read/write objects in an S3 bucket.  
**Analogy:** A delivery person (EC2) wears the visitor badge (role). The badge rules (policy) let them go to the mail room (S3). HR approval (trust relationship) ensures only delivery staff can use this badge.




# Understanding DaemonSet in Kubernetes 


## 1. What is a DaemonSet?
A DaemonSet is a special type of Kubernetes controller.  
It makes sure that a **copy of a specific Pod runs on every node** in the cluster (or on selected nodes if you set rules).  
Whenever a new node is added, Kubernetes automatically places that Pod on the new node.  

---

## 2. Why DaemonSet?
Some Pods are not for running applications, but for **supporting the cluster itself**.  
These Pods need to run **everywhere** so they can monitor, manage, or give extra features to all nodes.  
That’s why Kubernetes created DaemonSets — to guarantee those helper Pods are present on each node.  

---

## 3. Example in EKS (Pod Identity Agent)
- The **Pod Identity Agent** is an addon that runs on every node in your EKS cluster.  
- It helps Pods on that node get temporary AWS credentials from IAM roles (without storing keys inside the Pod).  
- To make sure this agent is always available on **all nodes**, AWS deploys it using a DaemonSet.  

---

## 4. Simple Analogy
Think of each node in your cluster as a **classroom**.  
The Pod Identity Agent is like a **security guard** who needs to sit in every classroom to check IDs.  
The DaemonSet is the rule that says:  
“Whenever a new classroom opens, automatically assign a security guard there.”  

---

## 5. What to Understand in This Context
- A DaemonSet ensures that the **Pod Identity Agent runs on every node**.  
- Without a DaemonSet, only a few nodes might get the agent, and Pods on other nodes wouldn’t be able to get IAM credentials.  
- So, the DaemonSet is **not for your app Pods**, but for **cluster-wide services** like logging agents, monitoring agents, or the Pod Identity Agent.  
