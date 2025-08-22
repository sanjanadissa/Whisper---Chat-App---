package com.example.Whisper.repositoty;

import com.example.Whisper.model.Message;
import com.example.Whisper.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.phoneNumber = :phoneNumber")
    User searchByPhoneNumber(@Param("phoneNumber") String phoneNumber);

    List<User> findByPhoneNumberContaining(String phoneNumber);
    List<User> findByOnlineTrue();

    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByUserName(String userName);

    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phone);
}