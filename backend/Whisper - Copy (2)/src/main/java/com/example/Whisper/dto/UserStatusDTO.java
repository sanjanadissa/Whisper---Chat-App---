package com.example.Whisper.dto;

public class UserStatusDTO {
    private String userPhone;
    private String status; // "online", "offline", "away"
    private Long lastSeen;

    // Constructors, getters, and setters
    public UserStatusDTO() {}

    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getLastSeen() { return lastSeen; }
    public void setLastSeen(Long lastSeen) { this.lastSeen = lastSeen; }
}
