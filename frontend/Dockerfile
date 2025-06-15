# 1단계: 빌드 전용 이미지
FROM node:22.3.0 AS build
WORKDIR /app

# package.json, package-lock.json만 먼저 복사해서 캐시 활용
COPY package*.json ./

# 의존성 설치
RUN npm install

# 앱 코드 복사
COPY . .

# 빌드 수행
RUN npm run build