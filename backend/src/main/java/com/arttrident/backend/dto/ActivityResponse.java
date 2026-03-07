package com.arttrident.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ActivityResponse {
    private String type; // "FOLLOW" or "SAVE"
    private String actorUsername;
    private String actorProfileUrl;
    private String targetName; // Artwork title or "you"
    private String targetImageUrl;
    private LocalDateTime timestamp;
}
