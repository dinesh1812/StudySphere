package com.studysphere.gateway.filter;

import com.studysphere.gateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    @Autowired
    private RouteValidator validator;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        
        // 1. Check if this specific route requires a token
        if (validator.isSecured.test(exchange.getRequest())) {
            
            // 2. Safely grab the Authorization header
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            
            // 3. Check if it's missing entirely OR doesn't start with "Bearer "
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            // 4. Extract the token by removing the "Bearer " prefix (7 characters)
            String token = authHeader.substring(7);

            // 5. Validate the token mathematically against the secret key
            try {
                jwtUtil.validateToken(token);
            } catch (Exception e) {
                // If token is expired or forged, reject the request immediately
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        }
        
        // 6. If everything is good, let the request pass through to the microservices
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1; // Give this filter the highest priority so it runs first
    }
}