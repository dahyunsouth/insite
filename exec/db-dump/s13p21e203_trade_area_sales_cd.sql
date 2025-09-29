-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: ssafy-mysql-db.mysql.database.azure.com    Database: s13p21e203
-- ------------------------------------------------------
-- Server version	8.0.42-azure

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `trade_area_sales_cd`
--

DROP TABLE IF EXISTS `trade_area_sales_cd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trade_area_sales_cd` (
  `STDR_YYQU_CD` varchar(6) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '기준_년분기_코드 | (year_quarter_code)',
  `TRDAR_SE_CD` char(1) DEFAULT NULL COMMENT '상권_구분_코드 | (area_category_code)',
  `TRDAR_SE_CD_NM` varchar(20) DEFAULT NULL COMMENT '상권_구분_코드_명 | (area_category_name)',
  `TRDAR_CD` int NOT NULL COMMENT '상권_코드 | (area_code)',
  `TRDAR_CD_NM` varchar(100) DEFAULT NULL COMMENT '상권_코드_명 | (area_name)',
  `SVC_INDUTY_CD` varchar(20) NOT NULL COMMENT '서비스_업종_코드 | (service_industry_code)',
  `SVC_INDUTY_CD_NM` varchar(50) DEFAULT NULL COMMENT '서비스_업종_코드_명 | (service_industry_name)',
  `THSMON_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '당월_매출_금액 | (monthly_sales_amount)',
  `MDWK_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '주중_매출_금액 | (weekday_sales_amount)',
  `WKEND_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '주말_매출_금액 | (weekend_sales_amount)',
  `MON_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '월요일_매출_금액 | (mon_sales_amount)',
  `TUES_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '화요일_매출_금액 | (tue_sales_amount)',
  `WED_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '수요일_매출_금액 | (wed_sales_amount)',
  `THUR_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '목요일_매출_금액 | (thu_sales_amount)',
  `FRI_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '금요일_매출_금액 | (fri_sales_amount)',
  `SAT_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '토요일_매출_금액 | (sat_sales_amount)',
  `SUN_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '일요일_매출_금액 | (sun_sales_amount)',
  `TMZON_00_06_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '시간대_00~06_매출_금액 | (time_00_06_sales_amount)',
  `TMZON_06_11_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '시간대_06~11_매출_금액 | (time_06_11_sales_amount)',
  `TMZON_11_14_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '시간대_11~14_매출_금액 | (time_11_14_sales_amount)',
  `TMZON_14_17_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '시간대_14~17_매출_금액 | (time_14_17_sales_amount)',
  `TMZON_17_21_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '시간대_17~21_매출_금액 | (time_17_21_sales_amount)',
  `TMZON_21_24_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '시간대_21~24_매출_금액 | (time_21_24_sales_amount)',
  `ML_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '남성_매출_금액 | (male_sales_amount)',
  `FML_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '여성_매출_금액 | (female_sales_amount)',
  `AGRDE_10_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '연령대_10_매출_금액 | (age_10_sales_amount)',
  `AGRDE_20_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '연령대_20_매출_금액 | (age_20_sales_amount)',
  `AGRDE_30_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '연령대_30_매출_금액 | (age_30_sales_amount)',
  `AGRDE_40_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '연령대_40_매출_금액 | (age_40_sales_amount)',
  `AGRDE_50_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '연령대_50_매출_금액 | (age_50_sales_amount)',
  `AGRDE_60_ABOVE_SELNG_AMT` bigint unsigned DEFAULT NULL COMMENT '연령대_60_이상_매출_금액 | (age_60_plus_sales_amount)',
  `THSMON_SELNG_CO` int unsigned DEFAULT NULL COMMENT '당월_매출_건수 | (monthly_sales_count)',
  `MDWK_SELNG_CO` int unsigned DEFAULT NULL COMMENT '주중_매출_건수 | (weekday_sales_count)',
  `WKEND_SELNG_CO` int unsigned DEFAULT NULL COMMENT '주말_매출_건수 | (weekend_sales_count)',
  `MON_SELNG_CO` int unsigned DEFAULT NULL COMMENT '월요일_매출_건수 | (mon_sales_count)',
  `TUES_SELNG_CO` int unsigned DEFAULT NULL COMMENT '화요일_매출_건수 | (tue_sales_count)',
  `WED_SELNG_CO` int unsigned DEFAULT NULL COMMENT '수요일_매출_건수 | (wed_sales_count)',
  `THUR_SELNG_CO` int unsigned DEFAULT NULL COMMENT '목요일_매출_건수 | (thu_sales_count)',
  `FRI_SELNG_CO` int unsigned DEFAULT NULL COMMENT '금요일_매출_건수 | (fri_sales_count)',
  `SAT_SELNG_CO` int unsigned DEFAULT NULL COMMENT '토요일_매출_건수 | (sat_sales_count)',
  `SUN_SELNG_CO` int unsigned DEFAULT NULL COMMENT '일요일_매출_건수 | (sun_sales_count)',
  `TMZON_00_06_SELNG_CO` int unsigned DEFAULT NULL COMMENT '시간대_00~06_매출_건수 | (time_00_06_sales_count)',
  `TMZON_06_11_SELNG_CO` int unsigned DEFAULT NULL COMMENT '시간대_06~11_매출_건수 | (time_06_11_sales_count)',
  `TMZON_11_14_SELNG_CO` int unsigned DEFAULT NULL COMMENT '시간대_11~14_매출_건수 | (time_11_14_sales_count)',
  `TMZON_14_17_SELNG_CO` int unsigned DEFAULT NULL COMMENT '시간대_14~17_매출_건수 | (time_14_17_sales_count)',
  `TMZON_17_21_SELNG_CO` int unsigned DEFAULT NULL COMMENT '시간대_17~21_매출_건수 | (time_17_21_sales_count)',
  `TMZON_21_24_SELNG_CO` int unsigned DEFAULT NULL COMMENT '시간대_21~24_매출_건수 | (time_21_24_sales_count)',
  `ML_SELNG_CO` int unsigned DEFAULT NULL COMMENT '남성_매출_건수 | (male_sales_count)',
  `FML_SELNG_CO` int unsigned DEFAULT NULL COMMENT '여성_매출_건수 | (female_sales_count)',
  `AGRDE_10_SELNG_CO` int unsigned DEFAULT NULL COMMENT '연령대_10_매출_건수 | (age_10_sales_count)',
  `AGRDE_20_SELNG_CO` int unsigned DEFAULT NULL COMMENT '연령대_20_매출_건수 | (age_20_sales_count)',
  `AGRDE_30_SELNG_CO` int unsigned DEFAULT NULL COMMENT '연령대_30_매출_건수 | (age_30_sales_count)',
  `AGRDE_40_SELNG_CO` int unsigned DEFAULT NULL COMMENT '연령대_40_매출_건수 | (age_40_sales_count)',
  `AGRDE_50_SELNG_CO` int unsigned DEFAULT NULL COMMENT '연령대_50_매출_건수 | (age_50_sales_count)',
  `AGRDE_60_ABOVE_SELNG_CO` int unsigned DEFAULT NULL COMMENT '연령대_60_이상_매출_건수 | (age_60_plus_sales_count)',
  PRIMARY KEY (`STDR_YYQU_CD`,`TRDAR_CD`,`SVC_INDUTY_CD`),
  KEY `ix_sales_trdar_svc_qu` (`TRDAR_CD`,`SVC_INDUTY_CD_NM`,`STDR_YYQU_CD` DESC),
  KEY `ix_sales_trdar_svc_qu_cover` (`TRDAR_CD`,`SVC_INDUTY_CD_NM`,`STDR_YYQU_CD`,`THSMON_SELNG_AMT`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='서울시 상권 추정매출: 컬럼명=공식 코드, COMMENT=한글 명칭 | (기존 영문 별칭)';
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed
