package com.example.Whisper.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.example.Whisper.dto.OtpResponse;
import com.example.Whisper.dto.SendOtpRequest;
import com.example.Whisper.dto.VerifyOtpRequest;
import com.example.Whisper.model.OtpType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final EmailService emailService;

    // In-memory storage for OTPs (consider using Redis for production)
    private final ConcurrentHashMap<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final SecureRandom random = new SecureRandom();

    public OtpResponse sendOtp(SendOtpRequest request) {
        try {
            String otp = generateOtp();
            String key = generateKey(request.getEmail(), request.getType());

            // Store OTP with expiry
            OtpData otpData = new OtpData(otp, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES), request.getType());
            otpStorage.put(key, otpData);

            // Send email
            String purpose = request.getType() == OtpType.REGISTRATION ? "registration" : "login";
            emailService.sendOtpEmail(request.getEmail(), otp, purpose);

            // Clean up expired OTPs
            cleanupExpiredOtps();

            log.info("OTP sent successfully to email: {}", request.getEmail());
            return new OtpResponse(true, "OTP sent successfully to your email");

        } catch (Exception e) {
            log.error("Failed to send OTP to email: {}", request.getEmail(), e);
            return new OtpResponse(false, "Failed to send OTP. Please try again.");
        }
    }

    public OtpResponse verifyOtp(VerifyOtpRequest request) {
        String key = generateKey(request.getEmail(), request.getType());
        OtpData otpData = otpStorage.get(key);

        if (otpData == null) {
            return new OtpResponse(false, "OTP not found or expired");
        }

        if (LocalDateTime.now().isAfter(otpData.getExpiryTime())) {
            otpStorage.remove(key);
            return new OtpResponse(false, "OTP has expired");
        }

        if (!otpData.getOtp().equals(request.getOtp())) {
            return new OtpResponse(false, "Invalid OTP");
        }

        // Remove OTP after successful verification
        otpStorage.remove(key);
        log.info("OTP verified successfully for email: {}", request.getEmail());
        return new OtpResponse(true, "OTP verified successfully");
    }

    private String generateOtp() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    private String generateKey(String email, OtpType type) {
        return email + "_" + type.name();
    }

    private void cleanupExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        otpStorage.entrySet().removeIf(entry -> now.isAfter(entry.getValue().getExpiryTime()));
    }

    // Inner class to store OTP data
    private static class OtpData {
        private final String otp;
        private final LocalDateTime expiryTime;
        private final OtpType type;

        public OtpData(String otp, LocalDateTime expiryTime, OtpType type) {
            this.otp = otp;
            this.expiryTime = expiryTime;
            this.type = type;
        }

        public String getOtp() { return otp; }
        public LocalDateTime getExpiryTime() { return expiryTime; }
        public OtpType getType() { return type; }
    }
}