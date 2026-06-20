package com.arttrident.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private Long artworkId;
    private Long authorId;
    private String authorUsername;
    private String authorAvatarUrl;
    private String content;
    private LocalDateTime createdAt;
}
