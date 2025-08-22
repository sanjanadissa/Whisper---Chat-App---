package com.example.Whisper.service;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Whisper.dto.ChatDTO;
import com.example.Whisper.dto.ContactDTO;
import com.example.Whisper.dto.ContactRequest;
import com.example.Whisper.dto.UserDto;
import com.example.Whisper.model.Contact;
import com.example.Whisper.model.User;
import com.example.Whisper.repositoty.ContactRepository;
import com.example.Whisper.repositoty.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ContactRepository contactRepository;

    @Autowired
    public UserService(UserRepository userRepository, ContactRepository contactRepository) {
        this.userRepository = userRepository;
        this.contactRepository = contactRepository;
    }

    public Optional<User> findByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber);
    }

//    public List<User> findAllByPhoneNumber(String phoneNumber) {
//        return userRepository.findByPhoneNumberContaining(phoneNumber);
//    }

    public Contact addContact(String phone, String otherPhone, String contactName) {
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not Found"));
//        User contactUser = userRepository.findByPhoneNumber(otherPhone).orElseThrow(() -> new RuntimeException("User Not Found"));
        Optional<Contact> existingContact = contactRepository.findByUserAndPhoneNumber(user, otherPhone);

        if (existingContact.isPresent()) {
            Contact contact = existingContact.get();
            contact.setContactName(contactName);
            return contactRepository.save(contact);
        }
        Contact contact = new Contact();
        contact.setUser(user);
        contact.setPhoneNumber(otherPhone);
        contact.setContactName(contactName);

        user.getContactList().add(contact);
        return contactRepository.save(contact);
    }

    public Set<ContactDTO> getAllContacts(String phone){
       User user = userRepository.findByPhoneNumber(phone)
               .orElseThrow(() -> new RuntimeException("User not Found"));

       return user.getContactList().stream()
               .map(contact -> {
                   // Find the contact user by phone number to get profile picture
                   User contactUser = userRepository.findByPhoneNumber(contact.getPhoneNumber()).orElse(null);
                   return new ContactDTO(contact, contactUser);
               })
               .collect(Collectors.toSet());
    }

    public Set<ChatDTO> getAllChats(String phone){
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not Found"));

        Set<Contact> userContacts = user.getContactList();
        
        return user.getChats().stream()
                .map(chat -> new ChatDTO(chat, user, userContacts))
                .collect(Collectors.toSet());
    }

    public boolean deleteContact(String phone, Long contactId) {
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not Found"));
        
        Optional<Contact> contactOpt = contactRepository.findById(contactId);
        if (contactOpt.isPresent()) {
            Contact contact = contactOpt.get();
            // Check if the contact belongs to the user
            if (contact.getUser().getId()==user.getId()) {
                user.getContactList().remove(contact);
                contactRepository.delete(contact);
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    public Contact updateContact(String phone, Long contactId, ContactRequest contactName, Boolean isBlocked) {
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not Found"));
        
        Optional<Contact> contactOpt = contactRepository.findById(contactId);
        if (contactOpt.isPresent()) {
            Contact contact = contactOpt.get();
            // Check if the contact belongs to the user
            if (contact.getUser().getId()==user.getId()) {
                if (contactName != null && !contactName.getContactName().trim().isEmpty()) {
                    contact.setContactName(contactName.getContactName().trim());
                }
                if (isBlocked != null) {
                    contact.setBlocked(isBlocked);
                }
                return contactRepository.save(contact);
            }
        }
        return null;
    }

    public Contact toggleBlockContact(String phone, Long contactId) {
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not Found"));
        
        Optional<Contact> contactOpt = contactRepository.findById(contactId);
        if (contactOpt.isPresent()) {
            Contact contact = contactOpt.get();
            // Check if the contact belongs to the user
            if (contact.getUser().getId()==user.getId()) {
                contact.setBlocked(!contact.isBlocked());
                return contactRepository.save(contact);
            }
        }
        return null;
    }

    public User updateProfileImage(String phone, String profileImageUrl) {
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not Found"));
        
        user.setProfileImageUrl(profileImageUrl);
        return userRepository.save(user);
    }

    public User updateProfile(String phone, String userName, String fullname, String description) {
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new RuntimeException("User not Found"));
        
        if (userName != null && !userName.trim().isEmpty()) {
            user.setUserName(userName.trim());
        }
        if (fullname != null && !fullname.trim().isEmpty()) {
            user.setFullname(fullname.trim());
        }
        if (description != null) {
            user.setDiscription(description.trim());
        }
        
        return userRepository.save(user);
    }

    public UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUserName(user.getUserName());
        dto.setFullname(user.getFullname());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setOnline(user.isOnline());
        dto.setLastSeen(user.getLastSeen());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        return dto;
    }

    public void updateUserOnlineStatus(String phoneNumber, boolean online) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setOnline(online);
        user.setLastSeen(java.time.LocalDateTime.now());
        userRepository.save(user);
    }
}
