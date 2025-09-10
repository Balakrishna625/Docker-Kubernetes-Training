# Dockerfile Instructions - Explained for Beginners

A `Dockerfile` is a script with step-by-step instructions for building a Docker image. Each instruction tells Docker what to do, and each creates a layer in the final image.

This document explains **each important Dockerfile instruction** with examples, so that beginners can understand and remember easily.

---

## 1. `FROM`

**Purpose**: Sets the base image to use for the Docker image.

```Dockerfile
FROM python:3.11-slim
```

---

## 2. `WORKDIR`

**Purpose**: Sets the working directory inside the image.

```Dockerfile
WORKDIR /app
```

---

## 3. `COPY`

**Purpose**: Copies files/folders from the local machine into the Docker image.

```Dockerfile
COPY requirements.txt .
COPY . .
```

---

## 4. `RUN`

**Purpose**: Executes a command while building the image.

```Dockerfile
RUN pip install -r requirements.txt
```

---

## 5. `CMD`

**Purpose**: Defines the default command to run when a container starts.

```Dockerfile
CMD ["python", "app.py"]
```

---

## 6. `ENTRYPOINT`

**Purpose**: Defines the primary executable. Often used in conjunction with CMD.

```Dockerfile
ENTRYPOINT ["python"]
CMD ["app.py"]
```

> This runs as: `python app.py`

---

## CMD vs ENTRYPOINT

| Feature | CMD | ENTRYPOINT |
|--------|-----|------------|
| Purpose | Default command | Fixed command |
| Overridable via CLI | ✅ Yes | 🚫 No (unless explicitly configured) |
| Common Use | Apps/scripts | Containers that act like binaries |
| Combination | `ENTRYPOINT ["python"]` + `CMD ["app.py"]` = `python app.py` |

### Python Example:

```Dockerfile
ENTRYPOINT ["python"]
CMD ["main.py"]
```

When you run:
```bash
docker run myimage script.py
```
It becomes: `python script.py`

---

## 7. `EXPOSE`

**Purpose**: Documents the port used by the container.

```Dockerfile
EXPOSE 5000
```

---

## 8. `ENV`

**Purpose**: Sets environment variables.

```Dockerfile
ENV FLASK_ENV=development
```

---

## 9. `LABEL`

**Purpose**: Adds metadata to the image.

```Dockerfile
LABEL maintainer="team@example.com"
```

---

## 10. `.dockerignore`

**Purpose**: Excludes files from the image build context.

```dockerignore
__pycache__
*.log
node_modules
.env
.git
```

---

## 🧪 Full Dockerfile Example (All Instructions Combined)

```Dockerfile
# Base image
FROM python:3.11-slim

# Metadata
LABEL maintainer="team@example.com"

# Set working directory
WORKDIR /app

# Set environment variable
ENV FLASK_ENV=development

# Copy dependencies and install
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Define entrypoint and cmd
ENTRYPOINT ["python"]
CMD ["app.py"]
```

This example includes:
- OS + Python
- Dependency installation
- App code setup
- Port exposure
- Startup instructions (entrypoint + cmd)
- Metadata and environment variable

---

## Summary Table

| Instruction | Purpose |
|-------------|---------|
| `FROM` | Set base image |
| `WORKDIR` | Set working directory |
| `COPY` | Copy files from host to image |
| `RUN` | Run shell command during build |
| `CMD` | Default command on container start |
| `ENTRYPOINT` | Main executable |
| `EXPOSE` | Document exposed port |
| `ENV` | Set environment variable |
| `LABEL` | Add metadata |
| `.dockerignore` | Ignore files during build |





----------------------------------------------------------------------------------------------------------------------

## What Happens While Building Docker Images

----------------------------------------------------------------------------------------------------------------------


## How Does Docker Use a Dockerfile to Build an Image?

When you run:

```bash
docker build -t myapp:v1 .
```

Docker performs the following actions:

1. **Reads the Dockerfile line by line**
2. For each instruction (e.g., `FROM`, `COPY`, `RUN`, etc.):
   - Docker prepares the corresponding file system changes
   - For `RUN` commands specifically, Docker:
     - **Creates a temporary container**
     - Executes the command inside that container
     - Captures the output (i.e., changes to the filesystem)
     - **Commits it as a new read-only layer**
     - Deletes the temporary container
3. At the end, Docker stacks all layers into a single **image**.

This image is now portable and reusable.

---

## Layer-by-Layer Explanation

Assume the following Dockerfile:

```Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

Docker will process it like this:

| Instruction               | Action                                                    | Layer Created? |
|---------------------------|-----------------------------------------------------------|----------------|
| `FROM python:3.11-slim`   | Base image pulled from registry                           | ✅ Yes          |
| `WORKDIR /app`            | Set working directory in image                            | ✅ Yes          |
| `COPY requirements.txt .` | Copy dependency file                                      | ✅ Yes          |
| `RUN pip install ...`     | **Creates temp container, runs pip, commits result**      | ✅ Yes          |
| `COPY . .`                | Copy all source files                                     | ✅ Yes          |
| `CMD ["python", "app.py"]`| Set default command (metadata only)                       | ❌ No           |

> So yes — Docker creates a **temporary container for RUN**, uses it to execute, then saves the changes and deletes the container.


## Full Dockerfile with All Key Instructions

```Dockerfile
FROM python:3.11-slim

LABEL maintainer="team@example.com"
ENV FLASK_ENV=development

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

ENTRYPOINT ["python"]
CMD ["app.py"]
```

---

## Summary

- Dockerfile is a **build plan**, not a runtime script.
- Docker **processes it step-by-step**, creating **layers**.
- For `RUN` commands, Docker **creates a temporary container**, runs the command, **commits the result**, then deletes it.
- These layers are stacked into a **Docker image**.
- You can run the image to create containers — isolated, lightweight environments.

This understanding is essential for building, debugging, and optimizing Docker images professionally.