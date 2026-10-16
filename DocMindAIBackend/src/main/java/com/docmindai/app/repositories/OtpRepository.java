package com.docmindai.app.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.docmindai.app.entities.User;
import com.docmindai.app.entities.Otp;

import jakarta.transaction.Transactional;

public interface OtpRepository extends JpaRepository<Otp, Integer> {

    @Query("select fp from Otp fp where fp.otpValue = ?1 and fp.user = ?2")
    Optional<Otp> findByOtpAndUser(Integer otpValue, User user);

    @Transactional
    @Modifying
    @Query("delete from Otp o where o.user.id = ?1")
	public void deleteOtpByUser(Long userId);
    
}