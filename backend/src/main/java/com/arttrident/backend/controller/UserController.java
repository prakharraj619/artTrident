package com.arttrident.backend.controller;

import com.arttrident.backend.dto.UserProfileResponse;
import com.arttrident.backend.dto.UserSummaryResponse;
import com.arttrident.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserProfile(username));
    }

    @PutMapping("/profile")
    public ResponseEntity<Void> updateProfile(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @RequestBody com.arttrident.backend.dto.ProfileUpdateRequest request) {
        userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok().build();
    }

    /** GET /api/v1/users/{username}/followers — who follows this user */
    @GetMapping("/{username}/followers")
    public ResponseEntity<List<UserSummaryResponse>> getFollowers(@PathVariable String username) {
        return ResponseEntity.ok(userService.getFollowers(username));
    }

    /** GET /api/v1/users/{username}/following — who this user follows */
    @GetMapping("/{username}/following")
    public ResponseEntity<List<UserSummaryResponse>> getFollowing(@PathVariable String username) {
        return ResponseEntity.ok(userService.getFollowing(username));
    }

    /** GET /api/v1/users/search?q=sometext — global user search */
    @GetMapping("/search")
    public ResponseEntity<List<UserSummaryResponse>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(userService.searchUsers(q));
    }
}
