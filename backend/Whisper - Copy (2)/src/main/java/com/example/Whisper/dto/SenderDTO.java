package com.example.Whisper.dto;

public class SenderDTO {
    private long id;
    private String userName;
    private String fullname;
    private String email;
    private String phoneNumber;
    private boolean online;
    private String lastSeen;
    private String discription;
    private String profileImageUrl;

    // Default constructor
    public SenderDTO() {}

    // Constructor with all fields
    public SenderDTO(long id, String userName, String fullname, String email, 
                    String phoneNumber, boolean online, String lastSeen, 
                    String discription, String profileImageUrl) {
        this.id = id;
        this.userName = userName;
        this.fullname = fullname;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.online = online;
        this.lastSeen = lastSeen;
        this.discription = discription;
        this.profileImageUrl = profileImageUrl;
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getFullname() { return fullname; }
    public void setFullname(String fullname) { this.fullname = fullname; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }

    public String getLastSeen() { return lastSeen; }
    public void setLastSeen(String lastSeen) { this.lastSeen = lastSeen; }

    public String getDiscription() { return discription; }
    public void setDiscription(String discription) { this.discription = discription; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
}
