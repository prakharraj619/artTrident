package com.arttrident.backend.repository;

import com.arttrident.backend.model.Conversation;
import com.arttrident.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Find a conversation between two specific users.
     * Since we store them in a fixed order (lower ID first), we must check both orderings.
     *
     * @Query lets us write custom JPQL (Java Persistence Query Language — like SQL but for Java objects)
     */
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participant1 = :userA AND c.participant2 = :userB) OR " +
           "(c.participant1 = :userB AND c.participant2 = :userA)")
    Optional<Conversation> findByParticipants(@Param("userA") User userA, @Param("userB") User userB);

    /**
     * Find all conversations a user is part of, ordered by most recent message first.
     * Used to populate the conversation sidebar.
     */
    @Query("SELECT c FROM Conversation c WHERE c.participant1 = :user OR c.participant2 = :user " +
           "ORDER BY c.lastMessageAt DESC")
    List<Conversation> findAllByUser(@Param("user") User user);
}
