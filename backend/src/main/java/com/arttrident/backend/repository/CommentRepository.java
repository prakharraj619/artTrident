package com.arttrident.backend.repository;

import com.arttrident.backend.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /** All comments for a given artwork, oldest first */
    List<Comment> findByArtworkIdOrderByCreatedAtAsc(Long artworkId);

    /** Count comments on an artwork (used for the comment badge) */
    long countByArtworkId(Long artworkId);
}
