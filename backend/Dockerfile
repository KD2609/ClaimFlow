# ==============================================================================
# Multi-Stage Dockerfile for ClaimFlow Spring Boot Backend (Java 21)
# Production-ready, lightweight runtime image optimized for Render deployment
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Application
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /build

# Copy Maven Wrapper and POM first to leverage Docker layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Normalize line endings (fixes CRLF from Windows) and set execute permission
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Pre-fetch dependencies (offline caching)
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build production JAR package
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B && \
    cp target/insurance-claim-automation-1.0.0.jar app.jar

# ------------------------------------------------------------------------------
# Stage 2: Production JRE Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-jammy AS runner

WORKDIR /app

# Security: Run as non-privileged system user
RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

# Copy built artifact from builder stage
COPY --from=builder --chown=spring:spring /build/app.jar app.jar

# Expose default HTTP port
EXPOSE 8080

# Production environment defaults
ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=postgres

# Exec-form entrypoint
CMD ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

