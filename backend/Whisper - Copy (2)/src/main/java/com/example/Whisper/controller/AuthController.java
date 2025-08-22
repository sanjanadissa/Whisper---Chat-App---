package com.example.Whisper.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Whisper.dto.AuthResponse;
import com.example.Whisper.dto.OtpResponse;
import com.example.Whisper.dto.RegisterRequest;
import com.example.Whisper.dto.SendOtpRequest;
import com.example.Whisper.dto.VerifyOtpRequest;
import com.example.Whisper.model.User;
import com.example.Whisper.service.AuthService;
import com.example.Whisper.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        User user = userService.findByPhoneNumber(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("userName", user.getUserName());
        response.put("fullname", user.getFullname());
        response.put("email", user.getEmail());
        response.put("phoneNumber", user.getPhoneNumber());
        response.put("discription", user.getDiscription());
        response.put("profileImageUrl", user.getProfileImageUrl());
        response.put("online", user.isOnline());
        response.put("lastSeen", user.getLastSeen());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-registration-otp")
    public ResponseEntity<OtpResponse> sendRegistrationOtp(@Valid @RequestBody SendOtpRequest request) {
        System.out.println("Received registration OTP request for email: " + request.getEmail());
        try {
            OtpResponse response = authService.sendRegistrationOtp(request);
            System.out.println("Registration OTP sent successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error sending registration OTP: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/send-login-otp")
    public ResponseEntity<OtpResponse> sendLoginOtp(@RequestBody SendOtpRequest request) {
        OtpResponse response = authService.sendLoginOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        System.out.println("Received registration request for email: " + request.getEmail());
        System.out.println("Username: " + request.getUserName());
        System.out.println("Full name: " + request.getFullname());
        System.out.println("Phone number: " + request.getPhoneNumber());
        System.out.println("Profile Image URL: " + request.getProfileImageUrl());
        System.out.println("Description: " + request.getDiscription());
        try {
            AuthResponse response = authService.register(request);
            System.out.println("Registration successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error during registration: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(Authentication authentication) {
        authService.logout(authentication.getName());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
}