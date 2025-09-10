# Docker Commands Cheat Sheet 

## 1. docker --version
**Purpose**: Check Docker is installed and the version.
**Example**:
```bash
docker --version
```
Shows: `Docker version 24.0.5, build 1234567`

---

## 2. docker pull <image-name>
**Purpose**: Download an image from Docker Hub.
**Example**:
```bash
docker pull nginx
```
Pulls latest Nginx image to your local system.

---

## 3. docker run <options> <image-name>
**Purpose**: Create and start a new container.
**Examples**:
```bash
docker run nginx
```
(runs Nginx in foreground)

```bash
docker run -d -p 8080:80 nginx
```
(runs in background and maps port 8080 on host to 80 in container)

-d = detached, -p = port mapping

---

## 4. docker ps
**Purpose**: Show running containers
**Example**:
```bash
docker ps
```

---

## 5. docker ps -a
**Purpose**: Show all containers (even stopped ones)
**Example**:
```bash
docker ps -a
```

---

## 6. docker images
**Purpose**: List all downloaded Docker images
**Example**:
```bash
docker images
```

---

## 7. docker stop <container-id/name>
**Purpose**: Gracefully stop a running container
**Example**:
```bash
docker stop friendly_nginx
```

---

## 8. docker kill <container-id/name>
**Purpose**: Forcefully stop (kill) a running container
**Example**:
```bash
docker kill friendly_nginx
```

---

## 9. docker rm <container-id/name>
**Purpose**: Remove a stopped container
**Example**:
```bash
docker rm my-old-container
```

---

## 10. docker rmi <image-id/name>
**Purpose**: Remove a Docker image
**Example**:
```bash
docker rmi nginx
```

---

## 11. docker exec -it <container> <command>
**Purpose**: Run command inside a running container (e.g., bash)
**Example**:
```bash
docker exec -it mycontainer bash
```

---

## 12. docker build -t <image-name> .
**Purpose**: Build an image from Dockerfile in current folder
**Example**:
```bash
docker build -t my-flask-app .
```

---

## 13. docker logs <container-id/name>
**Purpose**: See logs/output of a container
**Example**:
```bash
docker logs my-nginx
```

---

## 14. Clean-up Commands

### Remove all stopped containers
```bash
docker container prune
```

### Remove all unused images
```bash
docker image prune
```

---

