    package com.example.Whisper.model;

    import java.time.LocalDateTime;
    import java.util.List;
    import java.util.Set;

    import com.fasterxml.jackson.annotation.JsonManagedReference;

    import jakarta.persistence.CascadeType;
    import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

    @Entity
    @Table(name = "users")
    public class User {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private long id;

        @Column(nullable = false)
        private String userName;

        @Column(nullable = false)
        private String fullname;

        @Column(unique = true, nullable = false)
        private String email;

        @Column(nullable = false, unique = true)
        private String phoneNumber;

        private boolean online;

        private LocalDateTime lastSeen;

        private String discription;

        @Column(name = "profile_image_url", columnDefinition = "TEXT")
        private String profileImageUrl;

        @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL)
        @JsonManagedReference
        private List<Message> sentMessages;

        @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
        @JsonManagedReference
        private Set<Contact> contactList;

        @ManyToMany(mappedBy = "participents")
        @JsonManagedReference
        private Set<Chat> chats;

        public List<Message> getSentMessages() {
            return sentMessages;
        }

        public void setSentMessages(List<Message> sentMessages) {
            this.sentMessages = sentMessages;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Set<Chat> getChats() {
            return chats;
        }

        public void setChats(Set<Chat> chats) {
            this.chats = chats;
        }

        public Set<Contact> getContactList() {
            return contactList;
        }

        public void setContactList(Set<Contact> contactList) {
            this.contactList = contactList;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public long getId() {
            return id;
        }

        public String getFullname() {
            return fullname;
        }

        public void setFullname(String fullname) {
            this.fullname = fullname;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public LocalDateTime getLastSeen() {
            return lastSeen;
        }

        public void setLastSeen(LocalDateTime lastSeen) {
            this.lastSeen = lastSeen;
        }

        public boolean isOnline() {
            return online;
        }

        public void setOnline(boolean online) {
            this.online = online;
        }

        public String getDiscription() {
            return discription;
        }

        public void setDiscription(String discription) {
            this.discription = discription;
        }

        public String getProfileImageUrl() {
            return profileImageUrl;
        }

        public void setProfileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
        }

    }
