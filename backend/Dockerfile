FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copy Maven wrapper and project metadata
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# Copy source code
COPY src src

RUN chmod +x mvnw && \
    ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Directory for uploaded files (mapped as a volume in docker-compose)
RUN mkdir -p uploads

EXPOSE 8080

ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

