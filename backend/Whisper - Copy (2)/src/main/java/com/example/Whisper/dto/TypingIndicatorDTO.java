package com.example.Whisper.dto;

public class TypingIndicatorDTO {
    private String userPhone;
    private boolean typing;
    private Long chatId;

    // Constructors, getters, and setters
    public TypingIndicatorDTO() {}

    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }

    public boolean isTyping() { return typing; }
    public void setTyping(boolean typing) { this.typing = typing; }

    public Long getChatId() { return chatId; }
    public void setChatId(Long chatId) { this.chatId = chatId; }
}