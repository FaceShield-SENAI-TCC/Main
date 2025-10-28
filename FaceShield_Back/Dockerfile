FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copiar primeiro os arquivos essenciais
COPY pom.xml .
COPY mvnw .
RUN chmod +x mvnw

# Tentar copiar .mvn se existir, se não, continuar
RUN if [ -d ".mvn" ]; then COPY .mvn .mvn; fi

# Baixar dependências
RUN ./mvnw dependency:go-offline -B || true

# Copiar código fonte
COPY src ./src

# Compilar
RUN ./mvnw clean package -DskipTests

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "target/FaceShield_Back-0.0.1-SNAPSHOT.jar"]