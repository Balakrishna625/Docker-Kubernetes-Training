## What is a Docker Image?

A **Docker image** is a **read-only, layered file system** that contains everything needed to run a specific application inside a Docker container.

Each Docker image includes:
- A minimal **base operating system** (e.g., Ubuntu or Alpine)
- A **language runtime** (Python, Java, Node.js, etc.)
- The **application source code**
- All **dependencies** required to run the application
- Environment variables and startup instructions

Docker images are built using a **Dockerfile** and can be reused, shared, and version-controlled.

---

## Python Example: Flask Application

### App Structure
```
/my-python-app
├── app.py
├── requirements.txt
└── Dockerfile
```

### Sample `app.py`
```python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello from Python + Docker"
```

### Sample `requirements.txt`
```
flask==2.3.2
```

### Dockerfile
```Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

### Layers in This Image:
1. Python 3.11 runtime on minimal Linux
2. Set working directory `/app`
3. Install Flask using `pip`
4. Copy application code
5. Expose port 5000 and run app

---

## Java Example: Spring Boot Application

### App Structure (after build)
```
/my-java-app
├── target/
│   └── myapp.jar
└── Dockerfile
```

### Dockerfile
```Dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/myapp.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

### Layers in This Image:
1. Java 17 runtime on Debian/Ubuntu
2. Working directory `/app`
3. Copy compiled JAR file
4. Expose port 8080
5. Run the application using `java -jar`

---

## Comparing Docker Images: Python vs Java

| Feature            | Python App                     | Java App                       |
|--------------------|--------------------------------|-------------------------------|
| Base Image         | `python:3.11-slim`              | `openjdk:17-jdk-slim`         |
| Runtime Included   | Python 3.11                     | Java JDK 17                   |
| App Format         | `.py` file                      | Precompiled `.jar` file       |
| Dependency Install | `pip install`                  | Already bundled in `.jar`     |
| App Start          | `CMD ["python", "app.py"]`      | `CMD ["java", "-jar", ...]`   |

---

## Docker Image Lifecycle

1. **Write Dockerfile**
2. **Build Image** using:
   ```bash
   docker build -t app-name:v1 .
   ```
3. **Run Container** from image:
   ```bash
   docker run -p 8080:80 app-name:v1
   ```
4. **Push to Docker Hub** (optional):
   ```bash
   docker push username/app-name:v1
   ```

---

## Common `.dockerignore` File

```dockerignore
node_modules
*.log
*.pyc
__pycache__/
.env
.git
.DS_Store
```

---

## Summary

- Docker images are **layered**, **immutable**, and **portable** environments built using Dockerfiles.
- They can contain anything your application needs to run, such as the runtime, dependencies, and source code.
- Images can be shared, versioned, and reused across any environment (development, QA, production).