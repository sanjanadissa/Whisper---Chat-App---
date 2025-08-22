package com.example.Whisper.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name:Whisper}")
    private String appName;

    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(String.format("%s - OTP Verification", appName));

            String emailBody = buildOtpEmailBody(otp, purpose);
            message.setText(emailBody);

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send OTP email");
        }
    }

    private String buildOtpEmailBody(String otp, String purpose) {
        StringBuilder emailBody = new StringBuilder();
        emailBody.append("Hello,\n\n");
        emailBody.append("Your OTP for ").append(purpose).append(" is: ").append(otp).append("\n\n");
        emailBody.append("This OTP is valid for 10 minutes. Please do not share this code with anyone.\n\n");
        emailBody.append("If you didn't request this OTP, please ignore this email.\n\n");
        emailBody.append("Best regards,\n");
        emailBody.append(appName).append(" Team");

        return emailBody.toString();
    }
}