package com.studysphere.post.client;

import com.studysphere.common.response.ApiResponse;
import com.studysphere.post.dto.UserSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserClient {
    
    @GetMapping("/api/users/{id}/summary")
    ApiResponse<UserSummaryDto> getUserSummary(@PathVariable("id") Long id);
}