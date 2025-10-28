FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copiar arquivos do Maven
COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .

# Dar permissão de execução e baixar dependências
RUN chmod +x mvnw && \
    ./mvnw dependency:go-offline -B

# Copiar código fonte
COPY src ./src

# Compilar e criar o JAR
RUN ./mvnw clean package -DskipTests

# Expor porta
EXPOSE 8080

# Comando para executar
ENTRYPOINT ["java", "-jar", "target/FaceShield_Back-0.0.1-SNAPSHOT.jar"]