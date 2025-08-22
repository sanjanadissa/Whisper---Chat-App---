package com.example.Whisper.service.impl;

import com.example.Whisper.service.SmsService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class TwilioSmsService implements SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromPhoneNumber;

    @Override
    public boolean sendSms(String phoneNumber, String message) {
        try {
            Twilio.init(accountSid, authToken);

            Message.creator(
                    new PhoneNumber(phoneNumber),
                    new PhoneNumber(fromPhoneNumber),
                    message
            ).create();

            log.info("SMS sent successfully to: {}", phoneNumber);
            return true;
        } catch (Exception e) {
            log.error("Failed to send SMS to: {}, Error: {}", phoneNumber, e.getMessage());
            return false;
        }
    }
}