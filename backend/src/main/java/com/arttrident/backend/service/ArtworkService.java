package com.arttrident.backend.service;

import com.arttrident.backend.dto.ArtworkRequest;
import com.arttrident.backend.dto.ArtworkResponse;
import com.arttrident.backend.model.Artwork;
import com.arttrident.backend.model.User;
import com.arttrident.backend.repository.ArtworkRepository;
import com.arttrident.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ArtworkService {

    private final ArtworkRepository artworkRepository;
    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;

    public ArtworkResponse createArtwork(ArtworkRequest request, MultipartFile file, User artist) throws IOException {
        String imageUrl = null;
        if (file != null && !file.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(file);
        } else {
            imageUrl = request.getImageUrl(); // Fallback to provided URL if no file
        }

        Artwork artwork = Artwork.builder()
                .artist(artist)
                .title(request.getTitle())
                .medium(request.getMedium())
                .description(request.getDescription())
                .imageUrl(imageUrl)
                .price(request.getPrice())
                .isForSale(request.isForSale())
                .build();

        Artwork savedArtwork = artworkRepository.save(artwork);
        return mapToResponse(savedArtwork);
    }

    public Page<ArtworkResponse> getFeed(Pageable pageable) {
        return artworkRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<ArtworkResponse> getArtistPortfolio(String username, Pageable pageable) {
        User artist = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Artist not found"));
        return artworkRepository.findByArtist(artist, pageable).map(this::mapToResponse);
    }

    private ArtworkResponse mapToResponse(Artwork artwork) {
        return ArtworkResponse.builder()
                .id(artwork.getId())
                .artistName(artwork.getArtist().getUsername())
                .artistProfileUrl(artwork.getArtist().getProfilePictureUrl())
                .title(artwork.getTitle())
                .medium(artwork.getMedium())
                .description(artwork.getDescription())
                .imageUrl(artwork.getImageUrl())
                .price(artwork.getPrice())
                .isForSale(artwork.isForSale())
                .createdAt(artwork.getCreatedAt())
                .build();
    }
}
