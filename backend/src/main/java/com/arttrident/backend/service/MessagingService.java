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
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ConversationResponse getOrCreateConversation(User currentUser, Long otherUserId) {
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + otherUserId));

        Conversation conversation = conversationRepository
                .findByParticipants(currentUser, otherUser)
                .orElseGet(() -> {
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

    @Transactional
    public MessageResponse sendMessage(User sender, MessagePayload payload) {
        Conversation conversation = conversationRepository.findById(payload.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found: " + payload.getConversationId()));

        boolean isMember = conversation.getParticipant1().getId().equals(sender.getId())
                || conversation.getParticipant2().getId().equals(sender.getId());
        if (!isMember) {
            throw new SecurityException("User is not a participant of this conversation");
        }

        Message message = messageRepository.save(
                Message.builder()
                        .conversation(conversation)
                        .sender(sender)
                        .content(payload.getContent())
                        .build()
        );

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        MessageResponse response = buildMessageResponse(message);

        User recipient = conversation.getParticipant1().getId().equals(sender.getId())
                ? conversation.getParticipant2()
                : conversation.getParticipant1();

        // Push to recipient — Spring resolves principal name (email) to their WebSocket session
        messagingTemplate.convertAndSendToUser(recipient.getEmail(), "/queue/messages", response);
        // Push back to sender so their UI also updates
        messagingTemplate.convertAndSendToUser(sender.getEmail(), "/queue/messages", response);

        log.info("Message sent in conversation {} from {} to {}",
                conversation.getId(), sender.getUsername(), recipient.getUsername());

        return response;
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations(User currentUser) {
        return conversationRepository.findAllByUser(currentUser)
                .stream()
                .map(c -> buildConversationResponse(c, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional
    public Page<MessageResponse> getMessages(Long conversationId, User currentUser, int page, int size) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        boolean isMember = conversation.getParticipant1().getId().equals(currentUser.getId())
                || conversation.getParticipant2().getId().equals(currentUser.getId());
        if (!isMember) {
            throw new SecurityException("Access denied to this conversation");
        }

        messageRepository.markMessagesAsRead(conversationId, currentUser.getId());

        return messageRepository
                .findByConversationIdOrderBySentAtAsc(conversationId, PageRequest.of(page, size))
                .map(this::buildMessageResponse);
    }

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
        User otherUser = conversation.getParticipant1().getId().equals(currentUser.getId())
                ? conversation.getParticipant2()
                : conversation.getParticipant1();

        // Efficiently fetch just the last message (one SQL query, one row — ORDER BY sent_at DESC LIMIT 1)
        String lastMessageContent = messageRepository
                .findLastMessage(conversation.getId(), PageRequest.of(0, 1))
                .getContent()
                .stream()
                .findFirst()
                .map(Message::getContent)
                .orElse(null);

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
