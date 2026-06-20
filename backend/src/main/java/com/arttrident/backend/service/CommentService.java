package com.arttrident.backend.service;

import com.arttrident.backend.dto.CommentRequest;
import com.arttrident.backend.dto.CommentResponse;
import com.arttrident.backend.model.Artwork;
import com.arttrident.backend.model.Comment;
import com.arttrident.backend.model.User;
import com.arttrident.backend.repository.ArtworkRepository;
import com.arttrident.backend.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ArtworkRepository artworkRepository;

    /** Get all comments for an artwork */
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long artworkId) {
        return commentRepository.findByArtworkIdOrderByCreatedAtAsc(artworkId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Post a new comment */
    @Transactional
    public CommentResponse addComment(Long artworkId, User author, CommentRequest request) {
        Artwork artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new IllegalArgumentException("Artwork not found: " + artworkId));

        Comment comment = Comment.builder()
                .artwork(artwork)
                .author(author)
                .content(request.getContent().trim())
                .build();

        return toResponse(commentRepository.save(comment));
    }

    /** Delete a comment — only the author or the artwork owner can delete */
    @Transactional
    public void deleteComment(Long commentId, User requestingUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        boolean isAuthor  = comment.getAuthor().getId().equals(requestingUser.getId());
        boolean isArtworkOwner = comment.getArtwork().getArtist().getId().equals(requestingUser.getId());

        if (!isAuthor && !isArtworkOwner) {
            throw new SecurityException("You are not allowed to delete this comment");
        }

        commentRepository.delete(comment);
    }

    /** Count of comments on an artwork */
    @Transactional(readOnly = true)
    public long countComments(Long artworkId) {
        return commentRepository.countByArtworkId(artworkId);
    }

    private CommentResponse toResponse(Comment c) {
        return CommentResponse.builder()
                .id(c.getId())
                .artworkId(c.getArtwork().getId())
                .authorId(c.getAuthor().getId())
                .authorUsername(c.getAuthor().getUsername())
                .authorAvatarUrl(c.getAuthor().getProfilePictureUrl())
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
