package com.docmindai.app.services;

import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.docmindai.app.entities.User;
import com.docmindai.app.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {
	
	private final UserRepository userRepository;

    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    	//This must be our own implementation
    	Optional<User> user = userRepository.findByUsername(username);
    	if(user.isEmpty()) {
    		throw new UsernameNotFoundException("User doesn't exists.");
    	}
    	CustomUserDetail customUserDetail = new CustomUserDetail(user.get());
    	return customUserDetail;
    }
	
}
