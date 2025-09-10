package com.ssafy.insite.auth.repository;

import com.ssafy.insite.auth.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);

    boolean existsByUuid(String uuid);

    Optional<User> findByEmail(String email);

    Optional<User> findByUuid(String uuid);

    Optional<User> findByEmailAndNickname(String email, String nickname);

    void deleteByUuid(String uuid);
}
