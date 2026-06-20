package com.arttrident.backend.controller;

import com.arttrident.backend.dto.CommentRequest;
import com.arttrident.backend.dto.CommentResponse;
import com.arttrident.backend.model.User;
import com.arttrident.backend.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/artworks/{artworkId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /** GET /api/v1/artworks/{artworkId}/comments — list all comments (public) */
    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long artworkId) {
        return ResponseEntity.ok(commentService.getComments(artworkId));
    }

    /** POST /api/v1/artworks/{artworkId}/comments — post a comment (authenticated) */
    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long artworkId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal User currentUser) {
        CommentResponse response = commentService.addComment(artworkId, currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** DELETE /api/v1/artworks/{artworkId}/comments/{commentId} — delete own comment */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long artworkId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User currentUser) {
        commentService.deleteComment(commentId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
