package com.arttrident.backend.service;

import com.arttrident.backend.dto.UserProfileResponse;
import com.arttrident.backend.dto.UserSummaryResponse;
import com.arttrident.backend.model.User;
import com.arttrident.backend.repository.ArtworkRepository;
import com.arttrident.backend.repository.FollowRepository;
import com.arttrident.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final ArtworkRepository artworkRepository;

    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Use countBy properties to count relations without loading them
        long followerCount = followRepository.countByFollowing(user);
        long followingCount = followRepository.countByFollower(user);
        long artworkCount = artworkRepository.countByArtist(user);

        return UserProfileResponse.builder()
                .username(user.getUsername())
                .role(user.getRole().name())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .name(user.getName())
                .bio(user.getBio())
                .profilePictureUrl(user.getProfilePictureUrl())
                .followerCount(followerCount)
                .followingCount(followingCount)
                .artworkCount(artworkCount)
                .build();
    }

    public void updateProfile(String username, com.arttrident.backend.dto.ProfileUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null)
            user.setName(request.getName());
        if (request.getBio() != null)
            user.setBio(request.getBio());
        if (request.getProfilePictureUrl() != null)
            user.setProfilePictureUrl(request.getProfilePictureUrl());

        userRepository.save(user);
    }

    /** Returns everyone who follows the given user */
    public List<UserSummaryResponse> getFollowers(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return followRepository.findByFollowing(user).stream()
                .map(f -> toSummary(f.getFollower()))
                .collect(Collectors.toList());
    }

    /** Returns everyone the given user follows */
    public List<UserSummaryResponse> getFollowing(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return followRepository.findByFollower(user).stream()
                .map(f -> toSummary(f.getFollowing()))
                .collect(Collectors.toList());
    }

    /** Search users by username or name — for the global search bar */
    public List<UserSummaryResponse> searchUsers(String query) {
        if (query == null || query.isBlank()) return List.of();
        return userRepository.searchByUsernameOrName(query.toLowerCase()).stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    private UserSummaryResponse toSummary(User u) {
        return UserSummaryResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .profilePictureUrl(u.getProfilePictureUrl())
                .role(u.getRole().name())
                .build();
    }
}
