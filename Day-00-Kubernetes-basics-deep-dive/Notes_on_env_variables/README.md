# Kubernetes Notes

### Understanding Environment Variables, Liveness & Readiness Probes, and Resource Requests & Limits

------------------------------------------------------------------------

## 1. Why do we use Environment Variables in Pods or Deployments?

In Kubernetes, environment variables allow us to pass configuration
values into a container at runtime --- things like database URLs,
usernames, or feature flags.

**Example:**

``` yaml
env:
  - name: DB_URL
    value: "mysql://dev-db:3306"
  - name: DEBUG_MODE
    value: "true"
```

**Explanation:**\
Here, we're injecting two variables into the container --- one for the
database URL and another for debug mode.\
If tomorrow you deploy the same app in production, you just change
`DB_URL` to `"mysql://prod-db:3306"` --- no need to rebuild your image.\
This gives you portability and flexibility.

------------------------------------------------------------------------

## 2. When do we need to use Environment Variables?

We use them when our application behavior or connections change between
environments but the code stays the same.

**Typical use cases:**\
- Database or API endpoints (`DB_URL`, `API_BASE_URL`)\
- Authentication credentials (`USERNAME`, `TOKEN`)\
- Feature toggles (`ENABLE_METRICS`, `DEBUG_MODE`)\
- Environment identification (`ENVIRONMENT=dev`)

**Example:**

``` yaml
env:
  - name: ENVIRONMENT
    value: "qa"
```

**Explanation:**\
This tells the app it is running in **QA (testing area)**.\
So the app knows to **use the QA database** and **save logs in the QA
folder**, not production ones.

------------------------------------------------------------------------

## 3. What happens if we don't use Environment Variables?

If you hardcode credentials or URLs in your code:

-   You'll need to rebuild the image every time a config changes.\
-   You risk exposing sensitive information in your source code.\
-   The same image can't be reused across Dev, QA, and Prod.

**Example of bad practice:**

``` python
db_url = "mysql://prod-db:3306"
```

**Explanation (Why this is bad practice):**\
If you write values like database URLs or passwords directly inside your
code, it causes problems:

1.  Every small change needs a rebuild -- if the database name or
    password changes, you must edit the code, rebuild the image, and
    redeploy.\
2.  Security risk -- anyone who sees your code can also see your
    passwords or connection details.\
3.  No flexibility -- you can't reuse the same Docker image in Dev, QA,
    and Prod because each has different settings.

That's why we use **environment variables** instead --- to keep the code
the same but change the values easily and safely.

------------------------------------------------------------------------

## 4. What are Liveness Probes?

A **Liveness Probe** tells Kubernetes if your container is still healthy
and working internally.

**Example:**

``` yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 3
```

**Explanation:**\
Kubernetes checks the app's `/healthz` URL every 5 seconds to see if
it's working.\
It waits 10 seconds after the container starts before doing the first
check.\
If this check fails 3 times continuously, Kubernetes assumes the app is
stuck and restarts the container automatically.

This ensures your application keeps running even if it stops responding.

------------------------------------------------------------------------

## 5. Where do we define Liveness Probes?

Inside the container spec of a Pod or Deployment YAML:

``` yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  replicas: 2
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
        - name: webapp
          image: bala/webapp:v1
          ports:
            - containerPort: 8080
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
```

------------------------------------------------------------------------

## 6. Why do we use Liveness Probes?

A **Liveness Probe** is used so that Kubernetes can automatically detect
and fix problems inside a running container.

Sometimes, a container might not crash but gets stuck --- for example:

-   The application code goes into an **infinite loop** (never finishes
    a task).\
-   The app becomes **unresponsive** because of a **deadlock** (two
    parts of the code waiting on each other forever).\
-   The process is **running but not serving requests** anymore.

In these cases, Kubernetes will not know anything just by the container
status (`Running`).\
So, a liveness probe helps Kubernetes actively check if the container is
still healthy and performing its job.

If the probe fails several times in a row (as per the configuration),
Kubernetes will restart the container automatically --- without waiting
for a human to intervene.

------------------------------------------------------------------------

## 7. What happens if we don't use Liveness Probes?

If your container stops responding, Kubernetes won't know it's unhealthy
and keeps it in **Running** state forever.

------------------------------------------------------------------------

## 8. When can we ignore Liveness Probes?

You can skip **liveness probes** in these cases:

### 1. Short-lived jobs or CronJobs

These containers start, do their work, and stop automatically.\
Example: a job that copies data once a day or sends a report email.\
Since they finish quickly and don't stay running for long, there's no
need for Kubernetes to check if they are still "alive."

### 2. Very stable background apps

Some internal or helper containers run simple scripts or very
lightweight services that almost never hang or crash.\
Example: a container that just syncs files or updates a status flag.\
For such stable tools, a liveness probe is optional --- you can add it
later if issues start happening.

### 3. Demo or test setups

In learning or temporary environments, you may skip probes to keep YAML
simple and focus on other concepts.

------------------------------------------------------------------------

## 9. Is it mandatory to use Liveness Probes?

No, **liveness probes are not mandatory**, but they are **highly
recommended** --- especially for applications that run continuously in
**production**.

Kubernetes does not automatically know if your app inside the container
has stopped working or got stuck.\
The container might still be "Running" from the outside, but the app
inside could be frozen or not responding.\
Without a liveness probe, Kubernetes will never restart such a container
--- it will just assume everything is fine.

That's why production-grade deployments (like APIs, web apps, and
microservices) almost always use liveness probes.\
They help your system recover automatically when something goes wrong
inside the container.

However, for **development**, **testing**, or **demo** environments,
it's fine to skip liveness probes if:\
- The application restarts quickly anyway, or\
- You are still experimenting and don't need auto-restart behavior.

------------------------------------------------------------------------

## 10. What are Readiness Probes?

A **Readiness Probe** tells Kubernetes whether your container is ready
to serve requests.

``` yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

**Explanation:**\
Until the readiness probe passes, Kubernetes won't send traffic to that
Pod.\
Once it starts responding, traffic begins.

------------------------------------------------------------------------

## 11. Where do we define Readiness Probes?

Inside the container section like liveness probes:

``` yaml
containers:
  - name: api
    image: bala/api:v2
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
```

------------------------------------------------------------------------

## 12. Why do we use Readiness Probes?

To ensure users never hit an app that's still starting up or
unavailable.

------------------------------------------------------------------------

## 13. What happens if we don't use Readiness Probes?

If skipped:\
- Kubernetes sends traffic too early.\
- Users might see 503 errors.\
- Rolling updates can cause downtime.

------------------------------------------------------------------------

## 14. When can we ignore Readiness Probes?

For background tasks or jobs that don't serve traffic.

------------------------------------------------------------------------

## 15. Is it mandatory to use Readiness Probes?

Not mandatory, but highly recommended for services that receive
requests.

------------------------------------------------------------------------

## 16. Example: Both Liveness and Readiness Together

``` yaml
containers:
  - name: webapp
    image: bala/webapp:1.0
    ports:
      - containerPort: 8080
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 5
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
```

------------------------------------------------------------------------

## 17. What are Requests and Limits?

These define how much CPU and memory a container needs.

``` yaml
resources:
  requests:
    cpu: "200m"
    memory: "256Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

------------------------------------------------------------------------

## 18. Why do we use Requests and Limits?

They keep the cluster stable by ensuring each container gets only the
CPU and memory it's allowed to use.\
This prevents one heavy application from using up all the system
resources and slowing down or crashing other apps.\
By defining requests and limits, Kubernetes can balance workloads
properly across nodes.\
As a result, your cluster stays healthy, predictable, and fair for all
running applications.

------------------------------------------------------------------------

## 19. What happens if we don't use them?

If no limits are set, one app can consume all CPU/memory, crashing
others.

------------------------------------------------------------------------

## 20. What advantages do we get if we use them?

-   Efficient scheduling\
-   Predictable performance\
-   Resource protection\
-   Cost control

------------------------------------------------------------------------

## 21. When can we ignore Requests and Limits?

You can skip defining requests and limits in a few specific cases ---
mostly in non-production environments or temporary workloads.

### 1. Demo or Learning Clusters

When you are running a Kubernetes cluster for practice, training, or
quick demos, it's fine to ignore resource settings.\
The goal there is to learn how things work --- not to optimize
performance or resource usage.

### 2. Temporary or One-Time Testing Pods

For example, if you just want to test if an image starts correctly or
debug a small issue.\
These Pods don't stay long or affect others, so setting requests and
limits is optional.

### 3. Very Small, Low-Impact Workloads

If your container runs a very lightweight task that uses almost no CPU
or memory, you can skip defining limits.\
However, once it becomes part of a shared or production environment,
always add them.

------------------------------------------------------------------------

## Summary Table

  ----------------------------------------------------------------------------------
  Concept       Purpose      What Happens if Missing?  Mandatory?      Example Use
  ------------- ------------ ------------------------- --------------- -------------
  Environment   Inject       Hardcoding configs,       No              DB URLs,
  Variables     config into  rebuilds needed                           Tokens
                containers                                             

  Liveness      Restart      Pod stays unhealthy       No              /healthz
  Probe         stuck        forever                   (recommended)   endpoint
                containers                                             

  Readiness     Delay        Users get 503 errors      No              /ready
  Probe         traffic                                (recommended)   endpoint
                until ready                                            

  Requests &    Manage CPU & Node instability, crashes No (best        CPU
  Limits        memory                                 practice)       200m--500m,
                                                                       Memory
                                                                       256--512Mi
  ----------------------------------------------------------------------------------
