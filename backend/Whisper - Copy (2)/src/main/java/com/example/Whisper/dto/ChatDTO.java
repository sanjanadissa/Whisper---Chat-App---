package com.example.Whisper.dto;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.Whisper.model.Chat;
import com.example.Whisper.model.Contact;
import com.example.Whisper.model.Message;
import com.example.Whisper.model.User;

public class ChatDTO {
    private long id;
    private List<MessageDTO> messageList;
    private MessageDTO lastMessage;
    private String otherParticipantPhone;
    private String otherParticipantName;
    private String contactName; // If the other participant is in contacts
    private String otherParticipantLastSeen;
    private boolean otherParticipantOnline;// Added last seen for the other participant
    private String otherParticipantProfileImageUrl; // Added profile image URL for the other participant

    public ChatDTO(Chat chat, User currentUser, Set<Contact> userContacts) {
        this.id = chat.getId();
        this.messageList = chat.getMessageList().stream()
                .map(this::convertToMessageDTO)
                .collect(Collectors.toList());
        
        if (!chat.getMessageList().isEmpty()) {
            this.lastMessage = convertToMessageDTO(chat.getLastMessage());
        }
        
        // Find the other participant
        User otherParticipant = chat.getParticipents().stream()
                .filter(participant -> !participant.getPhoneNumber().equals(currentUser.getPhoneNumber()))
                .findFirst()
                .orElse(null);
        
        if (otherParticipant != null) {
            this.otherParticipantPhone = otherParticipant.getPhoneNumber();
            this.otherParticipantName = otherParticipant.getFullname();
            this.otherParticipantLastSeen = otherParticipant.getLastSeen() != null ? 
                otherParticipant.getLastSeen().toString() : null;
            this.otherParticipantOnline = otherParticipant.isOnline();
            this.otherParticipantProfileImageUrl = otherParticipant.getProfileImageUrl(); // Set profile image URL
            
            // Check if other participant is in contacts
            this.contactName = userContacts.stream()
                    .filter(contact -> contact.getPhoneNumber().equals(otherParticipant.getPhoneNumber()))
                    .map(Contact::getContactName)
                    .findFirst()
                    .orElse(null);
        }
    }

    private MessageDTO convertToMessageDTO(Message message) {
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

    // Getters and Setters
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public List<MessageDTO> getMessageList() {
        return messageList;
    }

    public void setMessageList(List<MessageDTO> messageList) {
        this.messageList = messageList;
    }

    public MessageDTO getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(MessageDTO lastMessage) {
        this.lastMessage = lastMessage;
    }

    public String getOtherParticipantPhone() {
        return otherParticipantPhone;
    }

    public void setOtherParticipantPhone(String otherParticipantPhone) {
        this.otherParticipantPhone = otherParticipantPhone;
    }

    public String getOtherParticipantName() {
        return otherParticipantName;
    }

    public void setOtherParticipantName(String otherParticipantName) {
        this.otherParticipantName = otherParticipantName;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getOtherParticipantLastSeen() {
        return otherParticipantLastSeen;
    }

    public void setOtherParticipantLastSeen(String otherParticipantLastSeen) {
        this.otherParticipantLastSeen = otherParticipantLastSeen;
    }

    public boolean isOtherParticipantOnline() {
        return otherParticipantOnline;
    }

    public void setOtherParticipantOnline(boolean otherParticipantOnline) {
        this.otherParticipantOnline = otherParticipantOnline;
    }

    public String getOtherParticipantProfileImageUrl() {
        return otherParticipantProfileImageUrl;
    }

    public void setOtherParticipantProfileImageUrl(String otherParticipantProfileImageUrl) {
        this.otherParticipantProfileImageUrl = otherParticipantProfileImageUrl;
    }
}