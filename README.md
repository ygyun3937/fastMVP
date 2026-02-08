# 재고 및 프로젝트 관리 시스템

프로젝트 수주 시 필요한 구성품의 재고 상황을 실시간으로 체크하고 관리할 수 있는 웹 시스템입니다.

## 🎯 주요 기능

### 1. 재고 관리
- 재고 CRUD (등록, 조회, 수정, 삭제)
- 재고 검색 및 필터링
- 최소 재고 미달 자동 감지 및 알림
- 카테고리별 재고 관리

### 2. 프로젝트 관리
- 프로젝트 CRUD
- 프로젝트 상태 관리 (대기, 진행중, 완료, 취소)
- 프로젝트별 필요 구성품 관리
- **프로젝트 재고 가용성 체크 (핵심 기능)**

### 3. 재고 입출고 관리
- 입고/출고 등록
- 프로젝트 연계 출고
- 입출고 이력 조회 및 추적
- 재고 수량 자동 업데이트

### 4. 알림 시스템
- 최소 재고 미달 알림
- 프로젝트 구성품 부족 알림
- 실시간 알림 표시

### 5. 보고서 및 통계
- 재고 현황 대시보드
- 프로젝트별 재고 현황
- 입출고 통계
- 실시간 데이터 집계

## 🛠 기술 스택

### Backend
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA**
- **MySQL 8.0**
- **Lombok**

### Frontend
- **React 18**
- **TypeScript**
- **Vite**
- **React Router DOM**
- **Axios**
- **Recharts** (차트 라이브러리)

## 📁 프로젝트 구조

```
/
├── backend/                      # Spring Boot 백엔드
│   ├── src/main/java/com/inventory/
│   │   ├── controller/          # REST API 컨트롤러
│   │   ├── service/             # 비즈니스 로직
│   │   ├── repository/          # JPA 리포지토리
│   │   ├── model/               # 엔티티 클래스
│   │   ├── dto/                 # DTO 클래스
│   │   ├── config/              # 설정 클래스
│   │   └── InventoryApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml      # 애플리케이션 설정
│   │   └── schema.sql           # DB 스키마
│   └── pom.xml
│
└── frontend/                     # React 프론트엔드
    ├── src/
    │   ├── components/          # 재사용 컴포넌트
    │   ├── pages/               # 페이지 컴포넌트
    │   ├── services/            # API 서비스
    │   ├── types/               # TypeScript 타입
    │   ├── styles/              # CSS 스타일
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## 🚀 시작하기

### 사전 요구사항

1. **Java 17** 이상
2. **Node.js 18** 이상
3. **MySQL 8.0** 이상
4. **Maven 3.6** 이상

### 데이터베이스 설정

1. MySQL 서버를 실행합니다.

2. 데이터베이스를 생성합니다 (선택사항 - application.yml에서 자동 생성 설정됨):
```sql
CREATE DATABASE inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. `backend/src/main/resources/application.yml` 파일에서 데이터베이스 접속 정보를 확인/수정합니다:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/inventory_db?createDatabaseIfNotExist=true
    username: root
    password: root  # 실제 MySQL 비밀번호로 변경
```

### 백엔드 실행

```bash
# 백엔드 디렉토리로 이동
cd backend

# Maven으로 프로젝트 빌드 및 실행
mvn spring-boot:run
```

백엔드 서버가 `http://localhost:8080/api`에서 실행됩니다.

### 프론트엔드 실행

```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드 서버가 `http://localhost:5173`에서 실행됩니다.

브라우저에서 http://localhost:5173 을 열어 애플리케이션에 접속합니다.

## 📡 API 엔드포인트

### Inventory API
- `GET    /api/inventory` - 재고 목록 조회
- `GET    /api/inventory/{id}` - 재고 상세 조회
- `POST   /api/inventory` - 재고 등록
- `PUT    /api/inventory/{id}` - 재고 수정
- `DELETE /api/inventory/{id}` - 재고 삭제
- `GET    /api/inventory/low-stock` - 최소 재고 미달 목록

### Project API
- `GET    /api/projects` - 프로젝트 목록 조회
- `GET    /api/projects/{id}` - 프로젝트 상세 조회
- `POST   /api/projects` - 프로젝트 등록
- `PUT    /api/projects/{id}` - 프로젝트 수정
- `DELETE /api/projects/{id}` - 프로젝트 삭제
- `GET    /api/projects/{id}/items` - 프로젝트 필요 구성품 조회
- `POST   /api/projects/{id}/items` - 프로젝트 구성품 추가
- `GET    /api/projects/{id}/availability` - 프로젝트 재고 가용성 체크

### Transaction API
- `GET    /api/transactions` - 입출고 이력 조회
- `POST   /api/transactions` - 입출고 등록
- `GET    /api/transactions/inventory/{id}` - 특정 재고의 이력

### Notification API
- `GET    /api/notifications` - 알림 목록
- `PUT    /api/notifications/{id}/read` - 알림 읽음 처리
- `GET    /api/notifications/unread-count` - 읽지 않은 알림 수

### Report API
- `GET    /api/reports/inventory-status` - 재고 현황 리포트
- `GET    /api/reports/project-summary` - 프로젝트 요약 통계
- `GET    /api/reports/transaction-history` - 입출고 통계

## 🧪 테스트 시나리오

### 1. 재고 관리 테스트
```
1. 재고 등록: 여러 품목 등록
2. 재고 조회: 등록된 품목 확인
3. 최소 재고 설정: 알림 테스트를 위한 최소 재고 설정
4. 재고 수정: 현재 재고를 최소 재고 미만으로 변경 → 알림 확인
```

### 2. 프로젝트 재고 가용성 체크 (핵심 기능)
```
1. 프로젝트 생성
2. 필요 구성품 추가 (여러 재고 아이템 추가)
3. 재고 가용성 체크: /projects/{id}/availability 호출
4. 부족한 품목이 있으면 알림 생성 확인
5. 재고 입고 처리 후 다시 가용성 체크
```

### 3. 입출고 관리 테스트
```
1. 입고 등록: 재고 수량 증가 확인
2. 출고 등록: 재고 수량 감소 확인
3. 프로젝트 연계 출고: 프로젝트 ID와 함께 출고 처리
4. 입출고 이력 조회: 모든 거래 내역 확인
```

## 🔧 개발 참고사항

### 백엔드 개발
- **CORS 설정**: `CorsConfig.java`에서 프론트엔드 주소 허용됨
- **JPA Auditing**: Entity의 생성일/수정일 자동 관리
- **트랜잭션**: 재고 변경 시 자동 롤백 처리

### 프론트엔드 개발
- **API 기본 URL**: `src/services/api.ts`에서 `API_BASE_URL` 수정 가능
- **라우팅**: React Router DOM 사용
- **스타일**: CSS 모듈 방식

## 📝 향후 개선 사항

- [ ] 사용자 인증/인가 기능 추가 (Spring Security)
- [ ] 재고 등록/수정 모달 UI 구현
- [ ] 프로젝트 등록/수정 모달 UI 구현
- [ ] 입출고 등록 페이지 구현
- [ ] 보고서 페이지 차트 추가
- [ ] 알림 페이지 구현
- [ ] 페이지네이션 추가
- [ ] 엑셀 내보내기 기능
- [ ] 단위 테스트 작성
- [ ] Docker 컨테이너화

## 📄 라이선스

이 프로젝트는 학습 목적으로 만들어졌습니다.

## 👨‍💻 개발자

Claude & User

---

**문의사항이나 버그 리포트는 Issue를 통해 남겨주세요.**
