package com.example.Whisper.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Whisper.dto.AuthResponse;
import com.example.Whisper.dto.OtpResponse;
import com.example.Whisper.dto.RegisterRequest;
import com.example.Whisper.dto.SendOtpRequest;
import com.example.Whisper.dto.UserDto;
import com.example.Whisper.dto.VerifyOtpRequest;
import com.example.Whisper.model.OtpType;
import com.example.Whisper.model.User;
import com.example.Whisper.repositoty.UserRepository;
import com.example.Whisper.util.JwtUtil;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthService(UserRepository userRepository, OtpService otpService, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.otpService = otpService;
        this.jwtUtil = jwtUtil;
    }

    public OtpResponse sendRegistrationOtp(SendOtpRequest request) {
        // Validate email format
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        
        // Check if email already exists in database
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new RuntimeException("Email already registered. Please use a different email or try logging in.");
        }
        
        request.setType(OtpType.REGISTRATION);
        return otpService.sendOtp(request);
    }

    public OtpResponse sendLoginOtp(SendOtpRequest request) {
        // Validate email format
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        
        request.setType(OtpType.LOGIN);
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found with this email. Please check your email or register first."));
        return otpService.sendOtp(request);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Verify OTP first
        VerifyOtpRequest verifyRequest = new VerifyOtpRequest();
        verifyRequest.setEmail(request.getEmail());
        verifyRequest.setOtp(request.getOtp());
        verifyRequest.setType(OtpType.REGISTRATION);

        OtpResponse otpResponse = otpService.verifyOtp(verifyRequest);
        if (!otpResponse.isSuccess()) {
            throw new RuntimeException(otpResponse.getMessage());
        }

        // Validate required fields
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
            throw new RuntimeException("Phone number is required");
        }
        if (request.getUserName() == null || request.getUserName().trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        if (request.getFullname() == null || request.getFullname().trim().isEmpty()) {
            throw new RuntimeException("Full name is required");
        }
        
        // Normalize email to lowercase
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        
        // Check if user already exists with this email
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("User already exists with this email");
        }
        
        // Check if user already exists with this phone number
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber().trim())) {
            throw new RuntimeException("User already exists with this phone number");
        }
        
        // Check if username already exists
        if (userRepository.existsByUserName(request.getUserName().trim())) {
            throw new RuntimeException("Username already taken. Please choose a different username.");
        }

        // Create new user
        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPhoneNumber(request.getPhoneNumber().trim());
        user.setProfileImageUrl(request.getProfileImageUrl());
        user.setUserName(request.getUserName().trim());
        user.setFullname(request.getFullname().trim());
        user.setDiscription(request.getDiscription() != null ? request.getDiscription().trim() : null);
        user.setOnline(true);
        user.setLastSeen(LocalDateTime.now());

        System.out.println("About to save user with profileImageUrl: " + user.getProfileImageUrl());
        System.out.println("Request profileImageUrl: " + request.getProfileImageUrl());
        user = userRepository.save(user);
        System.out.println("User saved with ID: " + user.getId() + ", profileImageUrl: " + user.getProfileImageUrl());

        // Generate tokens (using phone number as identifier)
        String token = jwtUtil.generateToken(user.getPhoneNumber());
        String refreshToken = jwtUtil.generateRefreshToken(user.getPhoneNumber());

        // Convert to DTO
        UserDto userDto = convertToDto(user);

        return new AuthResponse(token, refreshToken, userDto);
    }

    @Transactional
    public AuthResponse login(VerifyOtpRequest request) {
        request.setType(OtpType.LOGIN);

        // Verify OTP
        OtpResponse otpResponse = otpService.verifyOtp(request);
        if (!otpResponse.isSuccess()) {
            throw new RuntimeException(otpResponse.getMessage());
        }

        // Find user by email - verify the user exists
        userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find user by email to get full user object for response
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update online status
        user.setOnline(true);
        user.setLastSeen(LocalDateTime.now());
        user = userRepository.save(user);

        // Generate tokens (using email as identifier)
        String token = jwtUtil.generateToken(user.getPhoneNumber());
        String refreshToken = jwtUtil.generateRefreshToken(user.getPhoneNumber());

        // Convert to DTO
        UserDto userDto = convertToDto(user);

        return new AuthResponse(token, refreshToken, userDto);
    }

    private UserDto convertToDto(User user) {
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

    @Transactional
    public void logout(String phoneNumber) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setOnline(false);
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);
    }

    // Scheduled task to set users offline if they haven't been active for 5 minutes
    @Scheduled(fixedRate = 60000) // Run every minute
    public void markInactiveUsersOffline() {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        List<User> onlineUsers = userRepository.findByOnlineTrue();
        
        for (User user : onlineUsers) {
            if (user.getLastSeen() != null && user.getLastSeen().isBefore(fiveMinutesAgo)) {
                user.setOnline(false);
                userRepository.save(user);
            }
        }
    }
}