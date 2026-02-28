package com.studysphere.post.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
public class FeignClientInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate requestTemplate) {
        // Grab the current active incoming HTTP Request
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            // Extract the Authorization header (the JWT)
            String authorizationHeader = request.getHeader("Authorization");
            
            // If it exists, append it to the outgoing Feign request
            if (authorizationHeader != null) {
                requestTemplate.header("Authorization", authorizationHeader);
            }
        }
    }
}