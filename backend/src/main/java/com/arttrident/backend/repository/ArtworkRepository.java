package com.arttrident.backend.repository;

import com.arttrident.backend.model.Artwork;
import com.arttrident.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArtworkRepository extends JpaRepository<Artwork, Long> {
    Page<Artwork> findByArtist(User artist, Pageable pageable);

    long countByArtist(User artist);

    Page<Artwork> findByIsForSaleTrue(Pageable pageable);
}
