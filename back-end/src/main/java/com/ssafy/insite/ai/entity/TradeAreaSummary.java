package com.ssafy.insite.ai.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trade_area_summary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradeAreaSummary {
    @Id
    @Column(name = "trdar_cd")
    private Integer trdarCd; // 상권코드

    @Column(columnDefinition = "TEXT", nullable = false)
    private String summary; // 상권요약

    @Column(columnDefinition = "JSON", nullable = false)
    private String features; // 주요특징

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt; // 갱신시간
}
