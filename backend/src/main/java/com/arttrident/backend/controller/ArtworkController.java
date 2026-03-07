package com.arttrident.backend.controller;

import com.arttrident.backend.dto.ArtworkRequest;
import com.arttrident.backend.dto.ArtworkResponse;
import com.arttrident.backend.model.User;
import com.arttrident.backend.service.ArtworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/v1/artworks")
@RequiredArgsConstructor
public class ArtworkController {

    private final ArtworkService artworkService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArtworkResponse> uploadArtwork(
            @RequestPart("artwork") ArtworkRequest request,
            @RequestPart(value = "image", required = false) MultipartFile file,
            @AuthenticationPrincipal User artist // Spring Security automatically injects the logged-in user
    ) throws IOException {
        // Technically, we should check if status = VERIFIED first depending on business
        // logic
        return ResponseEntity.ok(artworkService.createArtwork(request, file, artist));
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<ArtworkResponse>> getArtworkFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(artworkService.getFeed(
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/artist/{username}")
    public ResponseEntity<Page<ArtworkResponse>> getArtistPortfolio(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(artworkService.getArtistPortfolio(
                username, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }
}
