package com.ssafy.insite.common.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
        info = @Info(title = "Insite API", version = "v1",
                description = "Insite REST API Server",
                termsOfService = "http://swagger.io/terms/")

)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer"
)
@Configuration
@RequiredArgsConstructor
public class SwaggerConfig {

    //Authorize 버튼
    @Bean
    public OpenAPI openAPISecurity() {
        return new OpenAPI()
                .addServersItem(new Server().url("/"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new io.swagger.v3.oas.models.security.SecurityScheme()
                                        .type(io.swagger.v3.oas.models.security.SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")))
                .addSecurityItem(new io.swagger.v3.oas.models.security.SecurityRequirement().addList("bearerAuth"));
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("auth API")                  // Swagger UI에서 선택할 그룹명
                .pathsToMatch("/api/v1/auth/**")    // API 경로 지정
                .build();
    }

    @Bean
    public GroupedOpenApi dataApi() {
        return GroupedOpenApi.builder()
                .group("data API")                  // Swagger UI에서 선택할 그룹명
                .pathsToMatch("/api/v1/data/**")    // API 경로 지정
                .build();
    }

    @Bean
    public GroupedOpenApi favoriteApi() {
        return GroupedOpenApi.builder()
                .group("favorite API")                  // Swagger UI에서 선택할 그룹명
                .pathsToMatch("/api/v1/favorites/**")    // API 경로 지정
                .build();
    }

    @Bean
    public GroupedOpenApi aiApi() {
        return GroupedOpenApi.builder()
                .group("ai API")                  // Swagger UI에서 선택할 그룹명
                .pathsToMatch("/api/v1/ai/**")    // API 경로 지정
                .build();
    }
}
