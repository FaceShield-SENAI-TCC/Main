FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copiar tudo
COPY . .

# Compilar com Maven (não usa mvnw)
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiar o JAR gerado
COPY --from=builder /app/target/FaceShield_Back-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]