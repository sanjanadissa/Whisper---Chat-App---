package com.example.Whisper.service;

import com.example.Whisper.model.Chat;
import com.example.Whisper.model.Message;
import com.example.Whisper.model.User;
import com.example.Whisper.repositoty.ChatRepository;
import com.example.Whisper.repositoty.MessageRepository;
import com.example.Whisper.repositoty.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    @Autowired
    public MessageService(ChatRepository chatRepository, UserRepository userRepository, MessageRepository messageRepository) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
    }

    public Message sendMessage(Message message, String phone) {
        // Get chat from the message's chat ID
        Chat chat = chatRepository.findById(message.getChat().getId())
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Set message properties
        message.setTimeSend(LocalDateTime.now());
        message.setChat(chat);
        message.setSender(user);
        message.setRead(false);
        message.setDelivered(true); // Set as delivered when sent

        return messageRepository.save(message);
    }

    public List<Message> getChatMessages(long chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        return messageRepository.findByChatOrderByTimeSendAsc(chat);
    }

    public Message markAsRead(long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setRead(true);
        return messageRepository.save(message);
    }

    public List<Message> getUnreadMessages(String phone) {
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Get unread messages from chats where user is a participant but not the sender
        return messageRepository.findUnreadMessagesForUser(user);
    }

    public void deleteMessage(long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        messageRepository.delete(message);
    }

    public Message markAsDelivered(long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setDelivered(true);
        return messageRepository.save(message);
    }

    public Long getUnreadMessageCount(long chatId, String phone) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return messageRepository.countUnreadMessagesInChat(user, chat);
    }

    public void markAllMessagesInChatAsRead(long chatId, String phone) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get all unread messages in this chat that were sent by others
        List<Message> unreadMessages = messageRepository.findUnreadMessagesInChatForUser(user, chat);
        
        // Mark all as read
        for (Message message : unreadMessages) {
            message.setRead(true);
            messageRepository.save(message);
        }
    }
}