# Multi-Stage vs Single-Stage Dockerfile

## What is a Multi-Stage Dockerfile?

A multi-stage Dockerfile uses multiple `FROM` instructions to define separate stages during the build. This approach allows you to use one stage to build your application and a separate, minimal stage to run it.

## Why Use Multi-Stage Dockerfiles?

Multi-stage builds allow you to:

1. **Reduce Final Image Size**  
   Only the final build artifacts are copied into the runtime image.

2. **Improve Security**  
   Final images don't include compilers or build tools like Maven.

3. **Faster CI/CD Pipelines**  
   Dependencies can be cached for faster rebuilds.

4. **Separation of Concerns**  
   Clean distinction between build-time and runtime environments.

## When Not to Use Multi-Stage Dockerfiles

- For very simple applications or quick demos.
- During initial prototyping where build size is not a concern.
- If you already build your JAR externally and just need to run it in Docker.

## Multi-Stage Dockerfile Example

```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 as builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/static-site-1.0.0.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

## Single-Stage Dockerfile Example

```dockerfile
FROM maven:3.9-eclipse-temurin-17
WORKDIR /app
COPY . .
RUN mvn dependency:go-offline
RUN mvn clean package -DskipTests
EXPOSE 8080
CMD ["java", "-jar", "target/static-site-1.0.0.jar"]
```

## Why is Multi-Stage Smaller than Single-Stage?

| Aspect              | Multi-Stage                  | Single-Stage                      |
|---------------------|-------------------------------|-----------------------------------|
| Base Image Size     | Small (JRE only)              | Large (Maven + JDK + tools)       |
| Source Code Inside? | No                            | Yes                               |
| Maven Installed?    | No                            | Yes                               |
| Build Artifacts     | Only final JAR                | JAR + temp files + .m2 cache      |
| Image Size          | ~120MB                        | ~500MB                            |

## Summary

- Use multi-stage Dockerfiles to build clean, optimized, production-grade images.
- They reduce image size, improve security, and accelerate deployment.
- Single-stage Dockerfiles are okay for quick tests or internal tools.
