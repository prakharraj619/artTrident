package com.arttrident.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArtworkResponse {
    private Long id;
    private String artistName;
    private String artistProfileUrl;
    private String title;
    private String medium;
    private String description;
    private String imageUrl;
    private BigDecimal price;
    private boolean isForSale;
    private LocalDateTime createdAt;
}
