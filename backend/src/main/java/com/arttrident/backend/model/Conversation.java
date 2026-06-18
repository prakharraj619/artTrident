package com.arttrident.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents a private chat thread between exactly two users.
 * Think of it like a "DM conversation" on Instagram.
 *
 * @Entity  → Hibernate will create a 'conversations' table in PostgreSQL for this class
 * @Table   → Specifies the exact table name
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "conversations", uniqueConstraints = {
        // Ensures we never create two conversations between the same pair of users
        @UniqueConstraint(columnNames = {"participant1_id", "participant2_id"})
})
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * @ManyToOne → Many conversations can have the same user as participant1
     * @JoinColumn → The FK column name in the conversations table
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant1_id", nullable = false)
    private User participant1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant2_id", nullable = false)
    private User participant2;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Updated every time a new message is sent — used to sort conversations by recency
    private LocalDateTime lastMessageAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastMessageAt = LocalDateTime.now();
    }
}
