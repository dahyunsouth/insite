package com.ssafy.insite.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {
    @Id
    private String uuid; // 사용자 UUID (User와 1:1)

    @Column(nullable = false, columnDefinition = "TEXT")
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiryAt;

    public void updateToken(String token, LocalDateTime expiryAt) {
        this.token = token;
        this.expiryAt = expiryAt;
    }
}
