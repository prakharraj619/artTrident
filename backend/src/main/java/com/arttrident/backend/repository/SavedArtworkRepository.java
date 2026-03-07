package com.arttrident.backend.repository;

import com.arttrident.backend.model.Artwork;
import com.arttrident.backend.model.SavedArtwork;
import com.arttrident.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedArtworkRepository extends JpaRepository<SavedArtwork, Long> {
    Optional<SavedArtwork> findByUserAndArtwork(User user, Artwork artwork);

    boolean existsByUserAndArtwork(User user, Artwork artwork);

    Page<SavedArtwork> findByUser(User user, Pageable pageable);

    List<SavedArtwork> findByArtworkIn(List<Artwork> artworks);

    long countByArtwork(Artwork artwork);
}
