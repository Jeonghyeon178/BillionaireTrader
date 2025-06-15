# 📈 BillionaireTrader

> 주식 자동매매 백엔드 시스템  
> 한국투자증권 Open API 기반으로 리밸런싱 전략을 자동화한 프로젝트입니다.  
> 추후 여러 전략들을 반영할 계획입니다.

---

## 🚀 주요 기능

- 한국투자증권 API를 통한 매수/매도 자동 주문
- 스케줄 기반 자동 트레이딩 (Spring Scheduler)
- 포트폴리오 비중 실시간 조회
- 주요 지수 (NASDAQ, DOW, S&P), 원달러 환율 차트 구성 (2008년 1월 2일자 ~ )

---

## 🛠 기술 스택

- **Backend**: Spring Boot, Spring Data JPA
- **Frontend**: React.js, Tailwind CSS, ApexCharts
- **Database**: PostgreSQL
- **Infra**: Docker, Docker Compose, Nginx


---

## 📦 사용 방법

### 1. 프로젝트 클론

```bash
git clone https://github.com/Jeonghyeon178/BillionaireTrader.git
```

### 2. 한국투자증권 Open API 신청

https://securities.koreainvestment.com/main/Main.jsp 를 방문하여 API 신청 진행

### 3. 루트 디렉토리에 .env 파일 생성 후 다음과 같이 작성
```bash
# 한국투자증권 홈페이지에서 발급받은 appkey
KS_APP_KEY=
# 한국투자증권 홈페이지에서 발급받은 appsecret
KS_APP_SECRET=
# 계좌번호 체계(8-2)의 앞 8자리
KS_ACCOUNT_NUMBER=
# 계좌번호 체계(8-2)의 뒤 2자리
KS_ACCOUNT_PRODUCT_CODE=
```

### 4. docker-compose.yml 실행

```bash
docker-compose up --build
```

실행되면 아래의 서비스들이 컨테이너로 구성됩니다:  
- postgres-db – PostgreSQL 데이터베이스  
- backend-app – Spring Boot 백엔드 서버  
- frontend-build – React 빌드용 임시 컨테이너 (정적 파일 생성 후 종료)  
- nginx-server – 빌드된 프론트엔드 정적 파일을 서빙

⚠️ 최초 실행 시 React의 build 과정이 완료될 때까지 약간의 시간이 걸릴 수 있습니다.

### 5. 접속 확인

http://localhost 아래 주소 접속
