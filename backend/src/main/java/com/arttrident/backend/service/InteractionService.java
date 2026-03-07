package com.arttrident.backend.service;

import com.arttrident.backend.model.Artwork;
import com.arttrident.backend.model.Follow;
import com.arttrident.backend.model.SavedArtwork;
import com.arttrident.backend.model.User;
import com.arttrident.backend.repository.ArtworkRepository;
import com.arttrident.backend.repository.FollowRepository;
import com.arttrident.backend.repository.SavedArtworkRepository;
import com.arttrident.backend.repository.UserRepository;
import com.arttrident.backend.dto.ArtworkResponse;
import com.arttrident.backend.dto.ActivityResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final FollowRepository followRepository;
    private final SavedArtworkRepository savedArtworkRepository;
    private final UserRepository userRepository;
    private final ArtworkRepository artworkRepository;

    public void toggleFollow(User follower, String followingUsername) {
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (follower.getId().equals(following.getId())) {
            throw new RuntimeException("You cannot follow yourself");
        }

        followRepository.findByFollowerAndFollowing(follower, following)
                .ifPresentOrElse(
                        followRepository::delete,
                        () -> followRepository.save(Follow.builder().follower(follower).following(following).build()));
    }

    public boolean checkFollowStatus(User follower, String followingUsername) {
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return followRepository.existsByFollowerAndFollowing(follower, following);
    }

    public void toggleSaveArtwork(User user, Long artworkId) {
        Artwork artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new RuntimeException("Artwork not found"));

        savedArtworkRepository.findByUserAndArtwork(user, artwork)
                .ifPresentOrElse(
                        savedArtworkRepository::delete,
                        () -> savedArtworkRepository.save(SavedArtwork.builder().user(user).artwork(artwork).build()));
    }

    public boolean checkSavedStatus(User user, Long artworkId) {
        Artwork artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new RuntimeException("Artwork not found"));
        return savedArtworkRepository.existsByUserAndArtwork(user, artwork);
    }

    public Page<ArtworkResponse> getSavedArtworks(User user, Pageable pageable) {
        return savedArtworkRepository.findByUser(user, pageable)
                .map(saved -> {
                    Artwork artwork = saved.getArtwork();
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
                });
    }

    public List<ActivityResponse> getArtistActivities(User artist) {
        List<ActivityResponse> activities = new ArrayList<>();

        // Get followers
        List<Follow> follows = followRepository.findByFollowing(artist);
        for (Follow follow : follows) {
            activities.add(ActivityResponse.builder()
                    .type("FOLLOW")
                    .actorUsername(follow.getFollower().getUsername())
                    .actorProfileUrl(follow.getFollower().getProfilePictureUrl())
                    .targetName("you")
                    .timestamp(follow.getCreatedAt())
                    .build());
        }

        // Get saves of this artist's artworks (simplified: we'll fetch all artworks
        // then all saves)
        // In a real app this would be a custom JPQL query for performance, but this is
        // fine for now
        List<Artwork> artistArtworks = artworkRepository.findByArtist(artist, Pageable.unpaged()).getContent();
        if (!artistArtworks.isEmpty()) {
            List<SavedArtwork> saves = savedArtworkRepository.findByArtworkIn(artistArtworks);
            for (SavedArtwork save : saves) {
                // Don't notify if the artist saved their own artwork
                if (!save.getUser().getId().equals(artist.getId())) {
                    activities.add(ActivityResponse.builder()
                            .type("SAVE")
                            .actorUsername(save.getUser().getUsername())
                            .actorProfileUrl(save.getUser().getProfilePictureUrl())
                            .targetName(save.getArtwork().getTitle())
                            .targetImageUrl(save.getArtwork().getImageUrl())
                            .timestamp(save.getSavedAt())
                            .build());
                }
            }
        }

        // Sort descending by timestamp
        activities.sort(Comparator.comparing(ActivityResponse::getTimestamp).reversed());

        return activities;
    }
}
