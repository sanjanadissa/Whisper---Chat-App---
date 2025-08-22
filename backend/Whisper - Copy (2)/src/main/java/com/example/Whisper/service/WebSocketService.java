package com.example.Whisper.service;

import com.example.Whisper.dto.MessageDTO;
import com.example.Whisper.dto.TypingIndicatorDTO;
import com.example.Whisper.dto.UserStatusDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Send message to specific chat
    public void sendMessageToChat(Long chatId, MessageDTO message) {
        messagingTemplate.convertAndSend("/topic/chat/" + chatId, message);
    }

    // Send private message to specific user
    public void sendPrivateMessage(String userPhone, MessageDTO message) {
        messagingTemplate.convertAndSendToUser(userPhone, "/queue/messages", message);
    }

    // Send typing indicator
    public void sendTypingIndicator(Long chatId, TypingIndicatorDTO typingIndicator) {
        messagingTemplate.convertAndSend("/topic/chat/" + chatId + "/typing", typingIndicator);
    }

    // Send user status update (online/offline)
    public void sendUserStatusUpdate(String userPhone, UserStatusDTO status) {
        messagingTemplate.convertAndSend("/topic/user/" + userPhone + "/status", status);
    }

    // Notify chat participants about new message
    public void notifyNewMessage(Long chatId, MessageDTO message) {
        messagingTemplate.convertAndSend("/topic/chat/" + chatId + "/notification", message);
    }
}