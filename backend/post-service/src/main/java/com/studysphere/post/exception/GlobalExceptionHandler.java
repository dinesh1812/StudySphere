package com.studysphere.post.exception;

import com.studysphere.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // This method intercepts ANY RuntimeException thrown anywhere in the post-service
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException ex) {
        
        // We package the error message securely into your standard JSON format
        ApiResponse<Void> errorResponse = new ApiResponse<>(false, ex.getMessage(), null);
        
        // Return a graceful 400 Bad Request instead of a fatal 500 Internal Server Error
        return ResponseEntity.badRequest().body(errorResponse);
    }
}