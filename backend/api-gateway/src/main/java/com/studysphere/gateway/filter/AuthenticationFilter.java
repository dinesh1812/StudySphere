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
import org.springframework.http.server.reactive.ServerHttpRequest;
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
                
                // --- CRITICAL IDOR & PRIVILEGE ESCALATION FIX ---
                // Industry Standard: Extract identity at the gateway and inject as trusted X-Headers
                String userId = jwtUtil.extractUserId(token);
                String role = jwtUtil.extractRole(token);
                
                // Mutate the request to add these trusted headers
                ServerHttpRequest request = exchange.getRequest()
                        .mutate()
                        .header("X-User-Id", userId)
                        .header("X-User-Role", role)
                        .build();
                        
                // Pass the mutated request to the next filter in the chain
                return chain.filter(exchange.mutate().request(request).build());
                
            } catch (Exception e) {
                // If token is expired or forged, reject the request immediately
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        }
        
        // 6. If everything is good (and it didn't require auth), let the request pass through
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1; // Give this filter the highest priority so it runs first
    }
}