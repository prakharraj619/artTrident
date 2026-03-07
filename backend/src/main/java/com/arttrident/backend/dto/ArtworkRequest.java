package com.arttrident.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArtworkRequest {
    private String title;
    private String medium;
    private String description;
    // Note: We receive the image URL separately after the frontend uploads to
    // S3/Cloudinary
    private String imageUrl;
    private BigDecimal price;
    private boolean isForSale;
}
