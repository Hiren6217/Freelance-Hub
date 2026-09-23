package com.freelancehub.repository;

import com.freelancehub.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    // Full two-way conversation between two users, oldest first (chat order).
    @Query("SELECT m FROM Message m WHERE "
        + "(m.senderId = :userA AND m.receiverId = :userB) OR "
        + "(m.senderId = :userB AND m.receiverId = :userA) "
        + "ORDER BY m.createdAt ASC, m.id ASC")
    List<Message> findConversation(@Param("userA") Long userA, @Param("userB") Long userB);

    // Every message the user sent or received, newest first — used to build the inbox thread list.
    @Query("SELECT m FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId "
        + "ORDER BY m.createdAt DESC, m.id DESC")
    List<Message> findAllForUser(@Param("userId") Long userId);

    // Marks messages from otherUserId -> userId as read (called when the user opens a thread).
    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.readStatus = true "
        + "WHERE m.receiverId = :userId AND m.senderId = :otherUserId AND m.readStatus = false")
    int markConversationRead(@Param("userId") Long userId, @Param("otherUserId") Long otherUserId);
}
