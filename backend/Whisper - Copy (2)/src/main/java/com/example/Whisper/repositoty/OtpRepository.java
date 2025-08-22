package com.example.Whisper.repositoty;

import com.example.Whisper.model.OtpVerification;
import com.example.Whisper.model.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findByPhoneNumberAndTypeAndVerifiedFalse(String phoneNumber, OtpType type);

    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(LocalDateTime now);

    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.phoneNumber = :phoneNumber AND o.type = :type")
    void deleteByPhoneNumberAndType(String phoneNumber, OtpType type);
}
