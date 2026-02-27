package com.studysphere.gateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    // Endpoints that DO NOT require a token
    public static final List<String> openApiEndpoints = List.of(
            "/api/auth/login",
            "/api/users/register/student",
            "/api/users/register/admin",
            "/eureka"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints
                    .stream()
                    .noneMatch(uri -> request.getURI().getPath().contains(uri));
}