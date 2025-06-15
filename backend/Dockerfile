# 1단계: 빌드 환경
FROM gradle:8.4.0-jdk17 AS builder
WORKDIR /app
COPY . .
RUN gradle clean build -x test

# 2단계: 실제 실행 이미지
FROM openjdk:17-jdk-slim
WORKDIR /app

# 빌드된 jar 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 포트 열기 (필요시 변경)
EXPOSE 8080

# 실행
ENTRYPOINT ["java", "-jar", "app.jar"]