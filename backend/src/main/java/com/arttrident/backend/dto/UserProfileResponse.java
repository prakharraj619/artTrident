package com.arttrident.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {
    private String username;
    private String name;
    private String role;
    private String status;
    private String bio;
    private String profilePictureUrl;
    private long followerCount;
    private long followingCount;
    private long artworkCount;
}
