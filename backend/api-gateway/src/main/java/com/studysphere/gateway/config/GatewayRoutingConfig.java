package com.studysphere.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
}