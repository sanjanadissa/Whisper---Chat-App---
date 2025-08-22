package com.example.Whisper.dto;

import java.time.LocalDateTime;

public class MessageDTO {
    private long id;
    private String content;
    private LocalDateTime timeSend;
    private String senderPhone;
    private long chatId;
    private boolean read;
    private boolean delivered;
    private SenderDTO sender; // Added sender information

    // Constructors, getters, and setters
    public MessageDTO() {}

    public long getId() { return id; }
    public void setId(long id) {  this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getTimeSend() { return timeSend; }
    public void setTimeSend(LocalDateTime timeSend) { this.timeSend = timeSend; }

    public String getSenderPhone() { return senderPhone; }
    public void setSenderPhone(String senderPhone) { this.senderPhone = senderPhone; }

    public long getChatId() { return chatId; }
    public void setChatId(long chatId) { this.chatId = chatId; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public boolean isDelivered() { return delivered; }
    public void setDelivered(boolean delivered) { this.delivered = delivered; }

    public SenderDTO getSender() { return sender; }
    public void setSender(SenderDTO sender) { this.sender = sender; }
}