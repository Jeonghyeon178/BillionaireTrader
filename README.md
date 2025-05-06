# 📈 BillionaireTrader

> 주식 자동매매 백엔드 시스템  
> 한국투자증권 Open API 기반으로 리밸런싱 전략을 자동화한 프로젝트입니다.

---

## 🚀 주요 기능

- 주식 종목 자동 리밸런싱 알고리즘
- 한국투자증권 API를 통한 매수/매도 자동 주문
- 스케줄 기반 자동 트레이딩 (Spring Scheduler)
- 주식 및 외화예수금 잔고 실시간 조회

---

## 🛠 기술 스택

- **Backend**: Spring Boot, Spring Data JPA
- **Database**: PostgreSQL
- **Build Tool**: Gradle
- **Infra**: Docker
- **Scheduler**: Spring `@Scheduled`, Cron

---

## 📦 설치 방법

```bash
# 1. 프로젝트 클론
git clone https://github.com/Jeonghyeon178/BillionaireTrader.git
cd BillionaireTrader/backend

# 2. 환경변수 설정
# application.properties
# 한국투자증권 Open API 설정
ks.app-key=Your_App_Key
ks.app-secret=Your_App_Secret
ks.account-number=Your_Account_Number
ks.account-product-code=Your_Account_Product_Code

# 3. 실행
./gradlew bootRun
