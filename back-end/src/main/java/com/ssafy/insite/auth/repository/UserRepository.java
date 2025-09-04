package com.ssafy.insite.auth.repository;

import com.ssafy.insite.common.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);

    boolean existsByUuid(String uuid);

    Optional<User> findByEmail(String email);

    Optional<User> findByUuid(String uuid);

    Optional<User> findByEmailAndName(String email, String name);

    void deleteByUuid(String uuid);
}
