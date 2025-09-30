# Docker Interview Q&A — 


### Q1: *Can you explain what Docker is in simple terms?*  
**Answer:** Docker is a platform to package apps and dependencies into a single unit called a container. Containers run the same way across any environment.  
**Example:** `docker run python:3.11 python -V` instantly gives me Python 3.11 without installing it on my machine.

---

### Q2: *Why did Docker come into the picture? What problem was it solving?*  
**Answer:** Docker solved two key problems:  
1. **Dependency mismatch** – works on my machine issues.  
2. **Heavy VMs** – slow to start, resource hungry.  
Docker provides lightweight, portable containers that start in seconds.  
**Example:** A Java app that takes minutes on a VM can boot in seconds inside Docker.

---

### Q3: * how is Docker different from a Virtual Machine?*  
**Answer:**  
- VM = full OS + kernel → heavy.  
- Docker = shares host kernel → lightweight.  
**Analogy:** VM is like giving each guest a separate house; Docker is giving each guest a separate room in the same house.

---

### Q4: *What’s the difference between a Docker image and a Docker container?*  
**Answer:**  
- **Image** = blueprint (read-only).  
- **Container** = running instance of the image.  
**Example:** The `nginx` image is like a recipe; when you run it, you get a running Nginx container.

---

### Q5: *How do you normally create a Docker image?*  
**Answer:** By writing a **Dockerfile**, a set of instructions.  
**Example:**  
```dockerfile
FROM python:3.11-slim
COPY app.py /app/app.py
CMD ["python", "/app/app.py"]
```
This builds a Python image that always runs `app.py`.

---

### Q6: *Can you explain the difference between CMD and ENTRYPOINT?*  
**Answer:**  
- `ENTRYPOINT` = fixed main command.  
- `CMD` = default arguments.  
**Example:**  
```dockerfile
ENTRYPOINT ["python"]
CMD ["app.py"]
```
- `docker run myapp` → runs `python app.py`.  
- `docker run myapp -V` → runs `python -V`.

---

### Q7: *What happens if a container crashes? How do you handle persistence of data?*  
**Answer:** Containers are ephemeral, so data vanishes when they’re removed. To persist, we use **volumes**.  
**Example:**  
```bash
docker run -v mydata:/var/lib/mysql mysql
```
Data remains even if the container is deleted.

---

### Q8: *How can two containers talk to each other?*  
**Answer:** By putting them on the same **Docker network**.  
**Example:**  
```bash
docker network create appnet
docker run -d --name db --network appnet mysql
docker run -d --name api --network appnet myapi
```
Now, `api` can reach `db` by name.

---

### Q9: *If I gave you a Dockerfile with ADD instead of COPY, what would you say?*  
**Answer:** Both copy files, but `ADD` also extracts tar archives and fetches remote URLs. Best practice is to use **COPY** unless you need auto-extract. Using `ADD` for URLs hides behavior.

---

### Q10: *How does Docker speed up builds?*  
**Answer:** Docker caches each Dockerfile layer. If nothing changed, the cached layer is reused.  
**Best practice:** put less-changing steps (like installing packages) earlier, and app code later.  
**Example:** Copying `requirements.txt` before app code ensures Python deps don’t reinstall every build.

---

### Q11: *If I see you pushing images tagged as ‘latest’, what is the problem?*  
**Answer:** `latest` is just a tag and not reliable. For production, we should use version tags like `1.0.2` for reproducibility and rollbacks.

---

### Q12: *How do you debug a container that’s failing?*  
**Answer:**  
1. `docker logs <c>` – check logs.  
2. `docker exec -it <c> sh` – get inside.  
3. `docker inspect <c>` – config details.  
4. Run image interactively with `sh` to test.

---

### Q13: *What are Docker volumes and bind mounts? When would you use each?*  
**Answer:**  
- **Volume** → managed by Docker, good for databases.  
- **Bind mount** → links a host folder, good for development.  
**Example:**  
```bash
docker run -v myvol:/data busybox
docker run -v $(pwd):/app node
```

---

### Q14: *Can you explain Docker networks — bridge, host, none?*  
**Answer:**  
- **Bridge (default):** private network with NAT.  
- **Host:** shares host network, no port mapping needed.  
- **None:** no networking.  
For multi-container apps, user-defined bridge is best since containers can resolve each other by name.

---

### Q15: *What are multi-stage builds and why do we need them?*  
**Answer:** They let us build in one stage (with compilers, SDKs) and copy only artifacts into a smaller runtime image. This makes images smaller and more secure.  
**Example:** Building a Node app in a `node:20` image, then copying only `dist/` into `node:20-slim`.

---

### Q16: *How would you limit resources for a container?*  
**Answer:** We can restrict memory and CPU at runtime.  
**Example:**  
```bash
docker run --memory=512m --cpus=1 myapp
```
This ensures the container doesn’t consume more than 512 MB and 1 CPU.

---

### Q17: *Imagine your containerized web app is working locally but not accessible outside. What could be the issue?*  
**Answer:** Likely the port is not published. `EXPOSE` in Dockerfile only documents ports; we must use `-p`.  
**Example:**  
```bash
docker run -p 8080:80 nginx
```
Without `-p`, the service runs inside container but isn’t reachable from host.

