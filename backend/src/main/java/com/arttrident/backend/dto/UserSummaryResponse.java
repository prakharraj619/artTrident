package com.arttrident.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight user summary — used for follower/following lists and the "New Message" people picker.
 * Smaller than UserProfileResponse (no counts) — just what the UI needs to show a person card.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserSummaryResponse {
    private Long id;
    private String username;
    private String profilePictureUrl;
    private String role;
}
