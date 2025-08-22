package com.example.Whisper.service;

public interface SmsService {
    boolean sendSms(String phoneNumber, String message);
}
