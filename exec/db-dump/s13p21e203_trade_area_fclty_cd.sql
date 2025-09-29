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
-- Table structure for table `trade_area_fclty_cd`
--

DROP TABLE IF EXISTS `trade_area_fclty_cd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trade_area_fclty_cd` (
  `STDR_YYQU_CD` varchar(6) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '기준_년분기_코드',
  `TRDAR_SE_CD` char(1) DEFAULT NULL COMMENT '상권_구분_코드',
  `TRDAR_SE_CD_NM` varchar(20) DEFAULT NULL COMMENT '상권_구분_코드_명',
  `TRDAR_CD` int NOT NULL COMMENT '상권_코드',
  `TRDAR_CD_NM` varchar(100) DEFAULT NULL COMMENT '상권_코드_명',
  `VIATR_FCLTY_CO` int unsigned DEFAULT NULL COMMENT '집객시설_수',
  `PBLOFC_CO` int unsigned DEFAULT NULL COMMENT '관공서_수',
  `BANK_CO` int unsigned DEFAULT NULL COMMENT '은행_수',
  `GEHSPT_CO` int unsigned DEFAULT NULL COMMENT '종합병원_수',
  `GNRL_HSPTL_CO` int unsigned DEFAULT NULL COMMENT '일반_병원_수',
  `PARMACY_CO` int unsigned DEFAULT NULL COMMENT '약국_수',
  `KNDRGR_CO` int unsigned DEFAULT NULL COMMENT '유치원_수',
  `ELESCH_CO` int unsigned DEFAULT NULL COMMENT '초등학교_수',
  `MSKUL_CO` int unsigned DEFAULT NULL COMMENT '중학교_수',
  `HGSCHL_CO` int unsigned DEFAULT NULL COMMENT '고등학교_수',
  `UNIV_CO` int unsigned DEFAULT NULL COMMENT '대학교_수',
  `DRTS_CO` int unsigned DEFAULT NULL COMMENT '백화점_수',
  `SUPMK_CO` int unsigned DEFAULT NULL COMMENT '슈퍼마켓_수',
  `THEAT_CO` int unsigned DEFAULT NULL COMMENT '극장_수',
  `STAYNG_FCLTY_CO` int unsigned DEFAULT NULL COMMENT '숙박_시설_수',
  `ARPRT_CO` int unsigned DEFAULT NULL COMMENT '공항_수',
  `RLROAD_STATN_CO` int unsigned DEFAULT NULL COMMENT '철도_역_수',
  `BUS_TRMINL_CO` int unsigned DEFAULT NULL COMMENT '버스_터미널_수',
  `SUBWAY_STATN_CO` int unsigned DEFAULT NULL COMMENT '지하철_역_수',
  `BUS_STTN_CO` int unsigned DEFAULT NULL COMMENT '버스_정거장_수',
  PRIMARY KEY (`STDR_YYQU_CD`,`TRDAR_CD`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
