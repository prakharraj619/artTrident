package com.arttrident.backend.controller;

import com.arttrident.backend.dto.ActivityResponse;
import com.arttrident.backend.dto.ArtworkResponse;
import com.arttrident.backend.model.User;
import com.arttrident.backend.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    @PostMapping("/follow/{username}")
    public ResponseEntity<?> toggleFollow(
            @PathVariable String username,
            @AuthenticationPrincipal User user) {
        try {
            interactionService.toggleFollow(user, username);
            return ResponseEntity.ok(Map.of("message", "Follow status toggled"));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/follow/{username}/status")
    public ResponseEntity<Map<String, Boolean>> checkFollowStatus(
            @PathVariable String username,
            @AuthenticationPrincipal User user) {
        boolean isFollowing = interactionService.checkFollowStatus(user, username);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    @PostMapping("/save/{artworkId}")
    public ResponseEntity<?> toggleSaveArtwork(
            @PathVariable Long artworkId,
            @AuthenticationPrincipal User user) {
        interactionService.toggleSaveArtwork(user, artworkId);
        return ResponseEntity.ok(Map.of("message", "Save status toggled"));
    }

    @GetMapping("/save/{artworkId}/status")
    public ResponseEntity<Map<String, Boolean>> checkSavedStatus(
            @PathVariable Long artworkId,
            @AuthenticationPrincipal User user) {
        boolean isSaved = interactionService.checkSavedStatus(user, artworkId);
        return ResponseEntity.ok(Map.of("isSaved", isSaved));
    }

    @GetMapping("/saved")
    public ResponseEntity<Page<ArtworkResponse>> getSavedArtworks(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(interactionService.getSavedArtworks(
                user, PageRequest.of(page, size, Sort.by("savedAt").descending())));
    }

    @GetMapping("/activities")
    public ResponseEntity<List<ActivityResponse>> getArtistActivities(
            @AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(interactionService.getArtistActivities(artist));
    }
}
