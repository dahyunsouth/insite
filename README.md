<p align="center">
  <picture>
    <!-- Dark mode -->
    <source media="(prefers-color-scheme: dark)" srcset="resources/insite-logo-wh.png" />
    <!-- Light mode -->
    <source media="(prefers-color-scheme: light)" srcset="resources/insite-logo-bl.png" />
    <!-- Fallback -->
    <img alt="Insite Logo" src="resources/insite-logo-bl.png" width="220" />
  </picture>
</p>

<h1 align="center">Insite: 상권분석 플랫폼</h1>
<h3 align="center">FROM INSIGHT TO SITE - POWERED BY DATA.</h3>

> 인구와 소비 데이터를 포함한 다양한 도시 데이터와 상권 분석 모델을 기반으로 창업자가 최적의 입지를 찾을 수 있도록 상권추천·비교·분석 서비스를 제공하는 플랫폼 입니다.

**참여인원**: 5명  
**수행기간**: 2025. 08. 25 - 2025. 10. 02 (7주)  
**수행배경**: 삼성청년SW·AI아카데미 2학기 특화 프로젝트

---

## Our Team

<div align="center">

<table>
  <tr>
      <td width="25%" align="center">
      <img src="resources/profile-천광민.png" alt="천광민" width="125" height="125" /><br/>
      <strong>천광민</strong><br/>
      <sub><span style="color:gray">팀장<br/></span></sub>
    </td>
    <td width="25%" align="center">
      <img src="resources/profile-남다현.png" alt="남다현" width="125" height="125" /><br/>
      <strong>남다현</strong><br/>
      <sub><span style="color:gray">Front-end<br/></span></sub>
    </td>
  </tr>
    <tr>
    <td width="25%" align="center">
      <img src="resources/profile-정필교.png" alt="정필교" width="125" height="125" /><br/>
      <strong>정필교</strong><br/>
      <sub><span style="color:gray">API | DB<br/></span></sub>
    </td>
    <td width="25%" align="center">
      <img src="resources/profile-홍지훈.png" alt="홍지훈" width="125" height="125" /><br/>
      <strong>홍지훈</strong><br/>
      <sub><span style="color:gray">Infra<br/></span></sub>
    </td>
  </tr>
    </tr>
    <tr>
    <td width="25%" align="center">
      <img src="resources/profile-김범주.png" alt="김범주" width="125" height="125" /><br/>
      <strong>김범주</strong><br/>
      <sub><span style="color:gray">상권분석 모델<br/></span></sub>
    </td>
        <td width="25%" align="center">
      <img src="resources/profile-김재유.png" alt="김재유" width="125" height="125" /><br/>
      <strong>김재유</strong><br/>
      <sub><span style="color:gray">상권분석 모델<br/></span></sub>
    </td>
  </tr>
</table>

</div>

---

## Key Features

> 본 문단은 Insite 플랫폼의 Minimum Viable Product로 팀 평가를 위해 임의로 작성되었으며, 추후 변경 될 수 있음을 알림

<ul>
  <li>
    <a href="project-deliverable/mid-term-report.pdf" target="_blank">
      📄 중간발표자료.pdf
    </a>
  </li>
  <li>
    <a href="https://www.figma.com/design/gq5rM8qe4bREXNcoOEkZiu/S13P21E203?node-id=27-115&t=9PjAI0bDAXV0q7lU-1" target="_blank">
      📄 Figma 와이어프레임
    </a>
  </li>
  <li>
    <a href="https://www.notion.so/PJT_Insite-24d5c80a61df80729a14efd760641cfa?source=copy_link" target="_blank">
      📄 Notion 프로젝트문서
    </a>
  </li>
</ul>

### 1. 상권 평가 모델

상권 데이터를 다양한 지표로 정량화하여 **100점 만점의 종합 점수**로 제공하며, 사용자가 빠르게 상권의 전반적인 상태를 이해할 수 있도록 시각화합니다.

- **주요 지표**:
  - 유동인구, 상주인구, 직장인구
  - 유사업종 점포 수, 집객시설
  - 상권변화지표, 소득 및 소비, 임대료 

### 2. AI 상권 추천

사용자 조건을 기반으로 상권을 자동 추천하는 기능입니다.  

- **입력 조건 예시**:
  - 업종
  - 상권 종류 (발달상권/골목상권)
  - 업장 규모 (평수)
  - 선호 지역 (행정구)
  - 임대료 수준 등  

- **추천 방식**:
  - 키워드 필터링 + 우선순위 반영
  - 종합 점수 기반 추천
  - 최종 Top 3 상권 제안

### 3. 상권 상세 조회

상권을 클릭하면 상세한 분석 정보를 제공합니다.

- 상권의 시간대별 유동 변화
- 업종 구성 및 변동
- 상권 내 경쟁도 및 임대료 수준
- 상권 유형 분석 (주거/상업/혼합 등)
- 창업 생애주기 추정 (성장기/성숙기 등)

### 4. 후보 상권 비교 보드

2~3개 상권을 선택하여 핵심 지표를 **한눈에 비교**할 수 있습니다.

- 비교 항목:
  - 유동인구
  - 월 임대료
  - 점포 수 및 밀도
  - 경쟁 업종 수
  - 종합 점수 등

- 제공 방식:
  - 표 + 그래프 + 지도 연동
  - 모든 정보가 **한 화면**에 집약
