package com.example.Whisper.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.example.Whisper.dto.ChatDTO;
import com.example.Whisper.dto.ContactDTO;
import com.example.Whisper.dto.ContactRequest;
import com.example.Whisper.model.Contact;
import com.example.Whisper.model.User;
import com.example.Whisper.repositoty.UserRepository;
import com.example.Whisper.service.UserService;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @Autowired
    public UserController(UserService userService, UserRepository userRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

//    @GetMapping("/search")
//    public ResponseEntity<List<User>> searchPhone(@RequestParam String phoneNumber) {
//        List<User> userList = userService.findAllByPhoneNumber(phoneNumber);
//        return ResponseEntity.ok(userList);
//    }

    @GetMapping("/searchPhone")
    public ResponseEntity<List<User>> findPhone(@RequestParam String phoneNumber) {
        List<User> users = userRepository.findByPhoneNumberContaining(phoneNumber);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/find")
    public ResponseEntity<User> searchPhone(@RequestParam String phoneNumber) {
        Optional<User> user = userService.findByPhoneNumber(phoneNumber);
        return ResponseEntity.ok(user.orElseThrow());
    }

    @PostMapping("/addContact")
    public ResponseEntity<Contact> addContact(Authentication auth, @RequestParam String otherPhone, @RequestParam String contactName){

        Contact contact = userService.addContact(auth.getName(),otherPhone,contactName);
        return ResponseEntity.ok(contact);
    }

    @GetMapping("/getcontacts")
    public ResponseEntity<Set<ContactDTO>> getAllContacts(Authentication auth) {
        Set<ContactDTO> contactList = userService.getAllContacts(auth.getName());
        return ResponseEntity.ok(contactList);
    }

    @GetMapping("/getchats")
    public ResponseEntity<Set<ChatDTO>> getChats(Authentication auth){
        Set<ChatDTO> chatList = userService.getAllChats(auth.getName());
        return ResponseEntity.ok(chatList);
    }

    @DeleteMapping("/deleteContact/{contactId}")
    public ResponseEntity<String> deleteContact(Authentication auth, @PathVariable Long contactId) {
        boolean deleted = userService.deleteContact(auth.getName(), contactId);
        if (deleted) {
            return ResponseEntity.ok("Contact deleted successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to delete contact");
        }
    }

    @PutMapping("/updateContact/{contactId}")
    public ResponseEntity<Contact> updateContact(
            Authentication auth, 
            @PathVariable Long contactId,
            @RequestBody ContactRequest contactName,
            @RequestParam(required = false) Boolean isBlocked) {
        
        Contact updatedContact = userService.updateContact(auth.getName(), contactId, contactName, isBlocked);
        if (updatedContact != null) {
            return ResponseEntity.ok(updatedContact);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

        @PostMapping("/toggleBlockContact/{contactId}")
    public ResponseEntity<Contact> toggleBlockContact(Authentication auth, @PathVariable Long contactId) {
        Contact updatedContact = userService.toggleBlockContact(auth.getName(), contactId);
        if (updatedContact != null) {
            return ResponseEntity.ok(updatedContact);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/update-profile-image")
    public ResponseEntity<Map<String, Object>> updateProfileImage(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        try {
            String profileImageUrl = request.get("profileImageUrl");
            if (profileImageUrl == null || profileImageUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Profile image URL is required"
                ));
            }

            User updatedUser = userService.updateProfileImage(authentication.getName(), profileImageUrl);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile image updated successfully",
                "user", userService.convertToDto(updatedUser)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/update-profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        try {
            String userName = request.get("userName");
            String fullname = request.get("fullname");
            String description = request.get("description");

            User updatedUser = userService.updateProfile(authentication.getName(), userName, fullname, description);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile updated successfully",
                "user", userService.convertToDto(updatedUser)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<Map<String, Object>> heartbeat(Authentication authentication) {
        try {
            userService.updateUserOnlineStatus(authentication.getName(), true);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Online status updated"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}