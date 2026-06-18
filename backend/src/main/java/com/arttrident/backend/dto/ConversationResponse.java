package com.arttrident.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents one row in the conversations sidebar on the left side of the chat UI.
 * Contains a summary: who you're talking to, the last message preview, and unread count.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    private Long id;

    // The OTHER user in the conversation (not the logged-in user)
    private Long otherUserId;
    private String otherUsername;
    private String otherUserAvatarUrl;

    // Preview of the last message sent (shown in the sidebar)
    private String lastMessageContent;
    private LocalDateTime lastMessageAt;

    // How many messages the current user hasn't read yet (badge count)
    private long unreadCount;
}
