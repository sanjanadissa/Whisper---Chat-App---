// Add these methods to your MessageRepository interface

package com.example.Whisper.repositoty;

import com.example.Whisper.model.Chat;
import com.example.Whisper.model.Message;
import com.example.Whisper.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Find messages in a chat ordered by time sent
    List<Message> findByChatOrderByTimeSendAsc(Chat chat);

    // Find unread messages for a user (messages in chats where user participates but didn't send)
    @Query("SELECT m FROM Message m JOIN m.chat.participents p " +
            "WHERE p = :user AND m.sender != :user AND m.isRead = false " +
            "ORDER BY m.timeSend DESC")
    List<Message> findUnreadMessagesForUser(@Param("user") User user);

    // Find undelivered messages
    List<Message> findByIsDeliveredFalse();

    // Find messages by sender
    List<Message> findBySenderOrderByTimeSendDesc(User sender);

    // Count unread messages for a user in a specific chat
    @Query("SELECT COUNT(m) FROM Message m JOIN m.chat.participents p " +
            "WHERE p = :user AND m.sender != :user AND m.isRead = false AND m.chat = :chat")
    Long countUnreadMessagesInChat(@Param("user") User user, @Param("chat") Chat chat);

    // Find unread messages in a specific chat for a user
    @Query("SELECT m FROM Message m JOIN m.chat.participents p " +
            "WHERE p = :user AND m.sender != :user AND m.isRead = false AND m.chat = :chat " +
            "ORDER BY m.timeSend ASC")
    List<Message> findUnreadMessagesInChatForUser(@Param("user") User user, @Param("chat") Chat chat);

    // Find latest message in each chat for a user
    @Query("SELECT m FROM Message m WHERE m.id IN " +
            "(SELECT MAX(m2.id) FROM Message m2 JOIN m2.chat.participents p " +
            "WHERE p = :user GROUP BY m2.chat.id) " +
            "ORDER BY m.timeSend DESC")
    List<Message> findLatestMessagesForUser(@Param("user") User user);
}