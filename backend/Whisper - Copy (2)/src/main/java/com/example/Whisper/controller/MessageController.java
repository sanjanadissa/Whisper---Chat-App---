package com.example.Whisper.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Whisper.dto.MessageDTO;
import com.example.Whisper.dto.SenderDTO;
import com.example.Whisper.dto.TypingIndicatorDTO;
import com.example.Whisper.dto.UserStatusDTO;
import com.example.Whisper.model.Chat;
import com.example.Whisper.model.Message;
import com.example.Whisper.repositoty.ChatRepository;
import com.example.Whisper.service.MessageService;
import com.example.Whisper.service.WebSocketService;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;
    private final ChatRepository chatRepository;
    private final WebSocketService webSocketService;

    @Autowired
    public MessageController(MessageService messageService, ChatRepository chatRepository, WebSocketService webSocketService) {
        this.messageService = messageService;
        this.chatRepository = chatRepository;
        this.webSocketService = webSocketService;
    }

    @PostMapping("/chat/{chatId}/send")
    public ResponseEntity<?> sendMessage(@PathVariable long chatId,
                                         @RequestBody MessageDTO messageDTO,
                                         Authentication auth) {
        try {
            System.out.println("Received request - ChatId: " + chatId + ", Content: " + messageDTO.getContent());

            // Get chat from database
            Chat chat = chatRepository.findById(chatId)
                    .orElseThrow(() -> new RuntimeException("Chat not found with id: " + chatId));

            // Create message
            Message message = new Message();
            message.setContent(messageDTO.getContent());
            message.setChat(chat);

            // Save message to database
            Message savedMessage = messageService.sendMessage(message, auth.getName());

            // Convert to DTO
            MessageDTO responseDTO = convertToDTO(savedMessage);

            // Publish to WebSocket topic for real-time updates
            webSocketService.sendMessageToChat(chatId, responseDTO);

            return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error sending message: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Simple send message (without specific chat)
    @PostMapping("/send")
    public ResponseEntity<?> sendSimpleMessage(@RequestBody MessageDTO messageDTO,
                                               @RequestParam String phone) {
        try {
            System.out.println("Received simple message - Content: " + messageDTO.getContent() + ", Phone: " + phone);

            // Create message
            Message message = new Message();
            message.setContent(messageDTO.getContent());

            // Save message to database
            Message savedMessage = messageService.sendMessage(message, phone);

            // Convert to DTO
            MessageDTO responseDTO = convertToDTO(savedMessage);

            return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error sending message: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Handle typing indicator
    @PostMapping("/chat/{chatId}/typing")
    public ResponseEntity<?> handleTyping(@PathVariable long chatId,
                                          @RequestBody TypingIndicatorDTO typingIndicator,
                                          @RequestParam String userPhone) {
        try {
            typingIndicator.setUserPhone(userPhone);
            typingIndicator.setChatId(chatId);

            // Here you could add logic to broadcast typing indicator
            // For now, just return the indicator

            return new ResponseEntity<>(typingIndicator, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error handling typing: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Update user status
    @PostMapping("/user/status")
    public ResponseEntity<?> updateUserStatus(@RequestBody UserStatusDTO statusDTO,
                                              @RequestParam String userPhone) {
        try {
            statusDTO.setUserPhone(userPhone);

            // Here you could add logic to update user status
            // For now, just return the status

            return new ResponseEntity<>(statusDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error updating status: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Mark message as read
    @PutMapping("/chat/{chatId}/read/{messageId}")
    public ResponseEntity<?> markMessageAsRead(@PathVariable long chatId,
                                               @PathVariable long messageId,
                                               @RequestParam String userPhone) {
        try {
            Message message = messageService.markAsRead(messageId);
            MessageDTO responseDTO = convertToDTO(message);

            return new ResponseEntity<>(responseDTO, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>("Error marking message as read: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<Message>> getChatMessages(@PathVariable long chatId) {
        try {
            List<Message> messages = messageService.getChatMessages(chatId);
            return new ResponseEntity<>(messages, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Message> markAsRead(@PathVariable long messageId) {
        try {
            Message message = messageService.markAsRead(messageId);
            return new ResponseEntity<>(message, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/unread/{phone}")
    public ResponseEntity<List<Message>> getUnreadMessages(@PathVariable String phone) {
        try {
            List<Message> unreadMessages = messageService.getUnreadMessages(phone);
            return new ResponseEntity<>(unreadMessages, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable long messageId) {
        try {
            messageService.deleteMessage(messageId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{messageId}/delivered")
    public ResponseEntity<Message> markAsDelivered(@PathVariable long messageId) {
        try {
            Message message = messageService.markAsDelivered(messageId);
            return new ResponseEntity<>(message, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/chat/{chatId}/unread-count/{phone}")
    public ResponseEntity<Long> getUnreadMessageCount(
            @PathVariable long chatId,
            @PathVariable String phone) {
        try {
            Long count = messageService.getUnreadMessageCount(chatId, phone);
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(0L, HttpStatus.OK);
        }
    }

    // Mark all messages in a chat as read
    @PutMapping("/chat/{chatId}/mark-read")
    public ResponseEntity<?> markAllMessagesInChatAsRead(
            @PathVariable long chatId,
            @RequestBody Map<String, String> request) {
        try {
            String userPhone = request.get("userPhone");
            if (userPhone == null) {
                return new ResponseEntity<>("userPhone is required", HttpStatus.BAD_REQUEST);
            }
            
            messageService.markAllMessagesInChatAsRead(chatId, userPhone);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error marking messages as read: " + e.getMessage(), HttpStatus.BAD_REQUEST);
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