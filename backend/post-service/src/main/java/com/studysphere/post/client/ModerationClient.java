package com.studysphere.post.client;

import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.fasterxml.jackson.annotation.JsonProperty;

// Bypasses Eureka and calls the Python server directly
@FeignClient(name = "moderation-service", url = "${MODERATION_SERVICE_URL}")
public interface ModerationClient {

    @PostMapping("/api/moderate")
    ModerationResponse checkContent(@RequestBody ModerationRequest request);

    @Data
    class ModerationRequest {
        private String text;
        public ModerationRequest(String text) { this.text = text; }
    }

    @Data
    class ModerationResponse {
        @JsonProperty("isToxic")
        private boolean isToxic;
        private float score;
        private String reason;
    }
}