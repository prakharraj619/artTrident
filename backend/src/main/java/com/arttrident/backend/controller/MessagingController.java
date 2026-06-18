package com.arttrident.backend.controller;

import com.arttrident.backend.dto.ConversationResponse;
import com.arttrident.backend.dto.MessagePayload;
import com.arttrident.backend.dto.MessageResponse;
import com.arttrident.backend.model.User;
import com.arttrident.backend.service.MessagingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * Note: @Controller (not @RestController) because we mix WebSocket + REST handlers.
 * The REST methods still return ResponseEntity and work fine.
 */
@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/messages")
public class MessagingController {

    private final MessagingService messagingService;

    // ─── WebSocket Handler ────────────────────────────────────────────────────

    /**
     * 🎓 LEARNING: @MessageMapping is the WebSocket equivalent of @PostMapping.
     *
     * When React sends a STOMP message to the destination "/app/chat.send",
     * it lands here. The 'principal' tells us who sent it (from the JWT we validated in WebSocketConfig).
     *
     * React sends to:   /app/chat.send   (STOMP message)
     * Server pushes to: /user/{email}/queue/messages  (handled inside MessagingService)
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessagePayload payload, Principal principal) {
        // principal.getName() returns the email (the JWT "subject" field)
        // Spring resolves this from the auth we set in WebSocketConfig's interceptor
        User sender = (User) ((org.springframework.security.authentication.UsernamePasswordAuthenticationToken) principal).getPrincipal();
        messagingService.sendMessage(sender, payload);
    }

    // ─── REST Endpoints ───────────────────────────────────────────────────────

    /**
     * Start or resume a conversation with another user.
     * Called when the user clicks "Message" on an artist's profile.
     * POST /api/v1/messages/conversations/{otherUserId}
     */
    @PostMapping("/conversations/{otherUserId}")
    @ResponseBody
    public ResponseEntity<ConversationResponse> getOrCreateConversation(
            @PathVariable Long otherUserId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(messagingService.getOrCreateConversation(currentUser, otherUserId));
    }

    /**
     * Get all conversations for the sidebar.
     * GET /api/v1/messages/conversations
     */
    @GetMapping("/conversations")
    @ResponseBody
    public ResponseEntity<List<ConversationResponse>> getConversations(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(messagingService.getConversations(currentUser));
    }

    /**
     * Get paginated message history for a specific conversation.
     * GET /api/v1/messages/conversations/{conversationId}/messages?page=0&size=50
     */
    @GetMapping("/conversations/{conversationId}/messages")
    @ResponseBody
    public ResponseEntity<Page<MessageResponse>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(messagingService.getMessages(conversationId, currentUser, page, size));
    }
}
