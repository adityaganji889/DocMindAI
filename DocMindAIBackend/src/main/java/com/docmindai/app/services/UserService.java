package com.docmindai.app.services;

import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.docmindai.app.dtos.LoginRequest;
import com.docmindai.app.dtos.LoginResponse;
import com.docmindai.app.dtos.RegisterRequest;
import com.docmindai.app.dtos.UserDto;
import com.docmindai.app.entities.User;
import com.docmindai.app.enums.Role;
import com.docmindai.app.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	
	private final PasswordEncoder passwordEncoder;
	
	private final AuthenticationManager authenticationManager;
	
	private final JwtService jwtService;
	
	public LoginResponse loginUser(LoginRequest request) {
		String username = request.getUsername();
		Optional<User> existingUser = userRepository.findByUsername(username);
		if(existingUser.isPresent()) {
			User user = existingUser.get();
			String encryptedPassword = user.getPassword();
			if(!passwordEncoder.matches(request.getPassword(), encryptedPassword)) {
				throw new IllegalArgumentException("Wrong password");	
			}
		    Authentication authentication = new UsernamePasswordAuthenticationToken(
		    		                           request.getUsername(),
		    		                           request.getPassword()
		    		                        );
		    Authentication authenticated = authenticationManager.authenticate(authentication);
		    String token = jwtService.generateToken(new CustomUserDetail(user));
		    UserDto userDto = new UserDto(
		    		                user.getId(),
		    		                user.getUsername(),
		    		                user.getRole(),
		    		                user.getEmail()
		    		              );
		    LoginResponse response = new LoginResponse(
		    		                       token,
		    		                       userDto
		    		                     );
		    return response; 		
		}
		else {
			throw new RuntimeException("User not found");
		}
//		return null;
	}
	
    public UserDto registerUser(RegisterRequest request) {
		String username = request.getUsername();
		Optional<User> existingUser = userRepository.findByUsername(username);
		if(existingUser.isPresent()) {
			throw new IllegalArgumentException("Username already exists");
		}
		String encryptedPassword = passwordEncoder.encode(request.getPassword());
		User user = new User();
		user.setUsername(username);
		user.setPassword(encryptedPassword);
		user.setRole(Role.USER);
		user.setEmail(username);
		User savedUser = userRepository.save(user);
	    UserDto response = new UserDto();
	    response.setId(savedUser.getId());
	    response.setUsername(savedUser.getUsername());
	    response.setRole(savedUser.getRole());
	    response.setEmail(savedUser.getEmail());
	    return response;
	}
}
