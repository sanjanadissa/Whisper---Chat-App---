package com.example.Whisper.repositoty;

import com.example.Whisper.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    @Query("SELECT c FROM Chat c JOIN c.participents p WHERE p.id IN :userIds GROUP BY c.id HAVING COUNT(p.id) = :size")
    List<Chat> findChatsByParticipantIds(@Param("userIds") Set<Long> userIds, @Param("size") long size);
}
