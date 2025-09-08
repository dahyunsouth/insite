package com.ssafy.insite.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ssafy.insite.auth.entity.RefreshToken;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisRefreshTokenConfig {

    @Bean
    public RedisTemplate<String, RefreshToken> refreshTokenRedisTemplate(
            RedisConnectionFactory connectionFactory,
            ObjectMapper objectMapper) {

        // LocalDateTime 지원
        ObjectMapper om = objectMapper.copy();
        om.registerModule(new JavaTimeModule());

        Jackson2JsonRedisSerializer<RefreshToken> valueSerializer =
                new Jackson2JsonRedisSerializer<>(om, RefreshToken.class);

        RedisTemplate<String, RefreshToken> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(valueSerializer);
        template.setHashValueSerializer(valueSerializer);
        template.afterPropertiesSet();
        return template;
    }
}
