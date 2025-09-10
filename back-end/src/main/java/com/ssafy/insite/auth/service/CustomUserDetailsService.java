package com.ssafy.insite.auth.service;

import com.ssafy.insite.auth.jwt.CustomUserDetails;
import com.ssafy.insite.auth.repository.UserRepository;
import com.ssafy.insite.auth.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService {

    private final UserRepository userRepository;

    public UserDetails loadUserByUuid(String uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new UsernameNotFoundException("해당 UUID의 사용자를 찾을 수 없습니다."));
        return new CustomUserDetails(user);
    }
}
