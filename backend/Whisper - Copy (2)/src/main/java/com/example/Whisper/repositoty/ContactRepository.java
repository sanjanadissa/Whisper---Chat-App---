package com.example.Whisper.repositoty;

import com.example.Whisper.model.Contact;
import com.example.Whisper.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    Optional<Contact> findByUserAndPhoneNumber(User user, String phoneNumber);
}
