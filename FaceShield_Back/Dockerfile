FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Configurar encoding UTF-8
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

COPY . .
RUN mvn clean package -DskipTests -Dfile.encoding=UTF-8

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/FaceShield_Back-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Dfile.encoding=UTF-8", "-jar", "app.jar"]