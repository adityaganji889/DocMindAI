package com.docmindai.app.repositories;

import com.docmindai.app.entities.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User,Long>{
	
	Optional<User> findByUsername(String username);
    Optional<User> findBuEmail(String email);
    
}
