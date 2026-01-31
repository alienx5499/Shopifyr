FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# 1) Copy only Maven wrapper and POM first → dependency layer is cached by Railway
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# 2) Download dependencies (cached until pom.xml changes)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# 3) Copy source last → only code changes trigger recompile
COPY src src

RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Directory for uploaded files (mapped as a volume in docker-compose)
RUN mkdir -p uploads

EXPOSE 8080

# Limit heap so the container stays under Railway memory (avoids OOM kill).
# Override in Railway: JAVA_OPTS=-Xmx512m (or unset for no limit if you have more RAM).
ENV JAVA_OPTS="-Xmx256m -Xms128m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

