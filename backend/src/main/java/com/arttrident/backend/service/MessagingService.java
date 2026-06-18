package com.arttrident.backend.service;

import com.arttrident.backend.dto.ConversationResponse;
import com.arttrident.backend.dto.MessagePayload;
import com.arttrident.backend.dto.MessageResponse;
import com.arttrident.backend.model.Conversation;
import com.arttrident.backend.model.Message;
import com.arttrident.backend.model.User;
import com.arttrident.backend.repository.ConversationRepository;
import com.arttrident.backend.repository.MessageRepository;
import com.arttrident.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    /**
     * SimpMessagingTemplate is Spring's tool for pushing messages to specific WebSocket users.
     * Think of it like: axios.post() but PUSHED from server → browser, not the other way around.
     */
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Find an existing conversation between two users, or create a new one.
     * This is called when a user clicks on another user's profile and hits "Message".
     */
    @Transactional
    public ConversationResponse getOrCreateConversation(User currentUser, Long otherUserId) {
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + otherUserId));

        // Try to find an existing conversation first
        Conversation conversation = conversationRepository
                .findByParticipants(currentUser, otherUser)
                .orElseGet(() -> {
                    // None found — create a brand new one
                    log.info("Creating new conversation between {} and {}", currentUser.getUsername(), otherUser.getUsername());
                    return conversationRepository.save(
                            Conversation.builder()
                                    .participant1(currentUser)
                                    .participant2(otherUser)
                                    .build()
                    );
                });

        return buildConversationResponse(conversation, currentUser);
    }

    /**
     * Handles sending a message.
     * This method is called by the WebSocket controller when React sends a message.
     *
     * Flow:
     * 1. Save the message to PostgreSQL (persistent storage)
     * 2. Update the conversation's lastMessageAt timestamp
     * 3. Push the message to BOTH users' browsers via WebSocket in real time
     */
    @Transactional
    public MessageResponse sendMessage(User sender, MessagePayload payload) {
        Conversation conversation = conversationRepository.findById(payload.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        // Security check: ensure the sender is actually part of this conversation
        boolean isMember = conversation.getParticipant1().getId().equals(sender.getId())
                || conversation.getParticipant2().getId().equals(sender.getId());
        if (!isMember) {
            throw new SecurityException("User is not a participant of this conversation");
        }

        // Step 1: Save message to database
        Message message = messageRepository.save(
                Message.builder()
                        .conversation(conversation)
                        .sender(sender)
                        .content(payload.getContent())
                        .build()
        );

        // Step 2: Update conversation timestamp so it bubbles to top of sidebar
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Step 3: Build the response object that both users' browsers will receive
        MessageResponse response = buildMessageResponse(message);

        // Step 4: Determine the recipient (the OTHER person in the conversation)
        User recipient = conversation.getParticipant1().getId().equals(sender.getId())
                ? conversation.getParticipant2()
                : conversation.getParticipant1();

        // Step 5: Push to RECIPIENT's WebSocket queue
        // This delivers the message to: /user/{recipientEmail}/queue/messages
        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/messages",
                response
        );

        // Step 6: Also push back to SENDER's own queue (so their own UI updates)
        messagingTemplate.convertAndSendToUser(
                sender.getEmail(),
                "/queue/messages",
                response
        );

        log.info("Message sent in conversation {} from {} to {}",
                conversation.getId(), sender.getUsername(), recipient.getUsername());

        return response;
    }

    /**
     * Get all conversations for the sidebar (called on page load).
     */
    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations(User currentUser) {
        return conversationRepository.findAllByUser(currentUser)
                .stream()
                .map(c -> buildConversationResponse(c, currentUser))
                .collect(Collectors.toList());
    }

    /**
     * Get messages in a conversation for the chat history (called when opening a conversation).
     * Marks all unread messages as read at the same time.
     */
    @Transactional
    public Page<MessageResponse> getMessages(Long conversationId, User currentUser, int page, int size) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        // Security: only participants can read messages
        boolean isMember = conversation.getParticipant1().getId().equals(currentUser.getId())
                || conversation.getParticipant2().getId().equals(currentUser.getId());
        if (!isMember) {
            throw new SecurityException("Access denied to this conversation");
        }

        // Mark messages as read since the user just opened the conversation
        messageRepository.markMessagesAsRead(conversationId, currentUser.getId());

        return messageRepository
                .findByConversationIdOrderBySentAtAsc(conversationId, PageRequest.of(page, size))
                .map(this::buildMessageResponse);
    }

    // ─── Private helper methods to convert entities → DTOs ───────────────────

    private MessageResponse buildMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderUsername(message.getSender().getUsername())
                .senderAvatarUrl(message.getSender().getProfilePictureUrl())
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .isRead(message.isRead())
                .build();
    }

    private ConversationResponse buildConversationResponse(Conversation conversation, User currentUser) {
        // The "other user" is whoever is NOT the current user
        User otherUser = conversation.getParticipant1().getId().equals(currentUser.getId())
                ? conversation.getParticipant2()
                : conversation.getParticipant1();

        // Get a preview of the last message
        Page<Message> lastMessagePage = messageRepository
                .findByConversationIdOrderBySentAtAsc(conversation.getId(), PageRequest.of(0, 1));
        // We actually need the last message so let's get total elements and fetch the last page
        String lastMessageContent = null;
        if (!lastMessagePage.isEmpty()) {
            // Simple approach: get last page
            long total = messageRepository.findByConversationIdOrderBySentAtAsc(
                    conversation.getId(), PageRequest.of(0, Integer.MAX_VALUE)).getTotalElements();
            if (total > 0) {
                Page<Message> lastPage = messageRepository.findByConversationIdOrderBySentAtAsc(
                        conversation.getId(), PageRequest.of((int) (total - 1), 1));
                if (!lastPage.isEmpty()) {
                    lastMessageContent = lastPage.getContent().get(0).getContent();
                }
            }
        }

        long unreadCount = messageRepository.countUnreadMessages(conversation.getId(), currentUser.getId());

        return ConversationResponse.builder()
                .id(conversation.getId())
                .otherUserId(otherUser.getId())
                .otherUsername(otherUser.getUsername())
                .otherUserAvatarUrl(otherUser.getProfilePictureUrl())
                .lastMessageContent(lastMessageContent)
                .lastMessageAt(conversation.getLastMessageAt())
                .unreadCount(unreadCount)
                .build();
    }
}
