package com.arttrident.backend.repository;

import com.arttrident.backend.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Get all messages in a conversation, newest first (paginated).
     * 'Pageable' is Spring's way of handling pagination — like sending ?page=0&size=50 in React.
     */
    Page<Message> findByConversationIdOrderBySentAtAsc(Long conversationId, Pageable pageable);

    /**
     * Count unread messages in a conversation NOT sent by the current user.
     * Used to show the unread badge count in the sidebar.
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId " +
           "AND m.sender.id != :userId AND m.isRead = false")
    long countUnreadMessages(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    /**
     * Mark all messages in a conversation as read when the user opens it.
     * @Modifying tells Spring this query changes data (UPDATE/DELETE), not just reads.
     * @Transactional would be applied at service level.
     */
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId " +
           "AND m.sender.id != :userId AND m.isRead = false")
    void markMessagesAsRead(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
}
