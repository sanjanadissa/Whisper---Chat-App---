package com.example.Whisper.dto;

import com.example.Whisper.model.OtpType;

public class VerifyOtpRequest {
    private String email;
    private String otp;
    private OtpType type;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public OtpType getType() {
        return type;
    }

    public void setType(OtpType type) {
        this.type = type;
    }
}