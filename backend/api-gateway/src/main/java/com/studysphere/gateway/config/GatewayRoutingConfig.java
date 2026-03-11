package com.studysphere.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class GatewayRoutingConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // 1. Auth Service
                .route("auth-service", r -> r.path("/api/auth/**")
                        .uri("lb://auth-service"))
                
                // 2. User Service
                .route("user-service", r -> r.path("/api/users/**")
                        .uri("lb://user-service"))
                
                // 3. Post Service (General & Community Feeds)
                .route("post-service", r -> r.path("/api/posts/**")
                        .uri("lb://post-service"))
                
                // 4. Community Operations (Forwarded to Post Service)
                .route("community-routes", r -> r.path("/api/communities/**")
                        .uri("lb://post-service"))
                
                .build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://127.0.0.1:5173"));
        corsConfig.setMaxAge(3600L);
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}