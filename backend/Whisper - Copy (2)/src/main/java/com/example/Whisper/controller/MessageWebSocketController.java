package com.example.Whisper.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.Whisper.dto.MessageDTO;
import com.example.Whisper.dto.SenderDTO;
import com.example.Whisper.dto.TypingIndicatorDTO;
import com.example.Whisper.dto.UserStatusDTO;
import com.example.Whisper.model.Chat;
import com.example.Whisper.model.Message;
import com.example.Whisper.repositoty.ChatRepository;
import com.example.Whisper.service.MessageService;
import com.example.Whisper.service.WebSocketService;

@Controller
public class MessageWebSocketController {

    private final MessageService messageService;
    private final WebSocketService webSocketService;
    private final ChatRepository chatRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public MessageWebSocketController(MessageService messageService,
                                      WebSocketService webSocketService,
                                      ChatRepository chatRepository,
                                      SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.webSocketService = webSocketService;
        this.chatRepository = chatRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat/{chatId}/send")
    public void sendMessage(@DestinationVariable long chatId,
                            @Payload MessageDTO messageDTO,
                            Principal principal) {
        try {
            // Get chat from database
            Chat chat = chatRepository.findById(chatId)
                    .orElseThrow(() -> new RuntimeException("Chat not found"));

            // Create message
            Message message = new Message();
            message.setContent(messageDTO.getContent());
            message.setChat(chat);

            // Save message to database
            Message savedMessage = messageService.sendMessage(message, principal.getName());

            // Convert to DTO
            MessageDTO responseDTO = convertToDTO(savedMessage);

            // Send to all chat participants via WebSocket
            webSocketService.sendMessageToChat(chatId, responseDTO);

        } catch (Exception e) {
            // Send error message back to sender
            MessageDTO errorDTO = new MessageDTO();
            errorDTO.setContent("Error sending message: " + e.getMessage());
            messagingTemplate.convertAndSendToUser(
                    principal.getName(),
                    "/queue/errors",
                    errorDTO
            );
        }
    }

    @MessageMapping("/chat/{chatId}/typing")
    @SendTo("/topic/chat/{chatId}/typing")
    public TypingIndicatorDTO handleTyping(@DestinationVariable long chatId,
                                           @Payload TypingIndicatorDTO typingIndicator,
                                           Principal principal) {
        // Set the user phone from principal for security
        typingIndicator.setUserPhone(principal.getName());
        typingIndicator.setChatId(chatId);
        return typingIndicator;
    }

    @MessageMapping("/user/status")
    public void updateUserStatus(@Payload UserStatusDTO statusDTO, Principal principal) {
        statusDTO.setUserPhone(principal.getName());
        webSocketService.sendUserStatusUpdate(principal.getName(), statusDTO);
    }

    @MessageMapping("/chat/{chatId}/read")
    public void markMessageAsRead(@DestinationVariable long chatId,
                                  @Payload MessageDTO messageDTO,
                                  Principal principal) {
        try {
            Message message = messageService.markAsRead(messageDTO.getId());
            MessageDTO responseDTO = convertToDTO(message);

            // Notify chat participants that message was read
            webSocketService.sendMessageToChat(chatId, responseDTO);

        } catch (Exception e) {
            // Handle error
        }
    }

    private MessageDTO convertToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setTimeSend(message.getTimeSend());
        if (message.getSender() != null) {
            dto.setSenderPhone(message.getSender().getPhoneNumber());
            
            // Create and set SenderDTO with profile image information
            SenderDTO senderDTO = new SenderDTO(
                message.getSender().getId(),
                message.getSender().getUserName(),
                message.getSender().getFullname(),
                message.getSender().getEmail(),
                message.getSender().getPhoneNumber(),
                message.getSender().isOnline(),
                message.getSender().getLastSeen() != null ? message.getSender().getLastSeen().toString() : null,
                message.getSender().getDiscription(),
                message.getSender().getProfileImageUrl()
            );
            dto.setSender(senderDTO);
        }
        if (message.getChat() != null) {
            dto.setChatId(message.getChat().getId());
        }
        dto.setRead(message.isRead());
        dto.setDelivered(message.isDelivered());
        return dto;
    }
}