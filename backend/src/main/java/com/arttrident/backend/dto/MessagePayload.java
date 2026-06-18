package com.arttrident.backend.dto;

import lombok.Data;

/**
 * What the React frontend SENDS over WebSocket when the user hits "Send".
 * Think of this like the body of a POST request, but over WebSocket.
 */
@Data
public class MessagePayload {
    private Long conversationId;
    private String content;
}
