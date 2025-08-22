package com.example.Whisper.dto;

import com.example.Whisper.model.Contact;
import com.example.Whisper.model.User;

public class ContactDTO {
    private Long id;
    private String phoneNumber;
    private String contactName;
    private Boolean isBlocked;
    private String profileImageUrl;

    public ContactDTO() {}

    public ContactDTO(Contact contact, User contactUser) {
        this.id = contact.getId();
        this.phoneNumber = contact.getPhoneNumber();
        this.contactName = contact.getContactName();
        this.isBlocked = contact.isBlocked();
        this.profileImageUrl = contactUser != null ? contactUser.getProfileImageUrl() : null;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public Boolean getIsBlocked() {
        return isBlocked;
    }

    public void setIsBlocked(Boolean isBlocked) {
        this.isBlocked = isBlocked;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
}
