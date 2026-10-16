package com.docmindai.app.services;

import java.util.Date;
import java.util.Optional;
import java.util.Random;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.docmindai.app.dtos.LoginRequest;
import com.docmindai.app.dtos.LoginResponse;
import com.docmindai.app.dtos.RegisterRequest;
import com.docmindai.app.dtos.UserDto;
import com.docmindai.app.dtos.MailBody;
import com.docmindai.app.entities.User;
import com.docmindai.app.entities.Otp;
import com.docmindai.app.enums.Role;
import com.docmindai.app.repositories.OtpRepository;
import com.docmindai.app.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	
	private final OtpRepository otpRepository;
	
	private final PasswordEncoder passwordEncoder;
	
	private final AuthenticationManager authenticationManager;
	
	private final JwtService jwtService;
	
	private final EmailService emailService;
	
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
    
    private Integer otpGenerator() {
		Random random = new Random();
		return random.nextInt(100_000, 999_999);
	}
    
    
    public Otp verifyEmailSend(String email, User user) {
//		return CompletableFuture.supplyAsync(() -> {
			int otp = otpGenerator();
			MailBody mailBody = MailBody.builder().to(email)
					.text("This is the OTP for your Forgot Password/Verify Email request : " + otp +" is valid till next 10 minutes.")
					.subject("OTP for Forgot Password/Verify Email request").build();

			Otp fp = Otp.builder().otpValue(otp).expirationTime(new Date(System.currentTimeMillis() + 10 * 60 * 1000))
					.user(user).build();
            
			//SMTP Render Mail changes starts
			String token = emailService.sendSimpleMessage(mailBody, String.valueOf(user.getId())); //SMTP Render Mail changes
			Otp newOtp = null;
			if(token != null) {
				otpRepository.deleteOtpByUser(user.getId());
				newOtp = otpRepository.save(fp);
			}
			return newOtp;
			//SMTP Render Mail changes ends
//		});
	}
    
    public void deleteOtpById(Integer id) {
//		return CompletableFuture.runAsync(() -> {
			Optional<Otp> otp = otpRepository.findById(id);
			if (otp.isPresent()) {
				otpRepository.deleteById(otp.get().getFpid());
			}
//		});
	}
    
    public Optional<Otp> findByOtpAndUser(Integer otpValue, User user) {
		return otpRepository.findByOtpAndUser(otpValue, user);
	}
    
    public Optional<Boolean> changePasswordHandle(String email, Integer Otp, String newPassword, String repeatPassword) {
//		return CompletableFuture.supplyAsync(() -> {
			Boolean isPasswordMatched = false;
			if (!newPassword.equals(repeatPassword)) {
				return Optional.of(isPasswordMatched);
			} else {
				isPasswordMatched = true;
			}

			String encodedPassword = passwordEncoder.encode(newPassword);
			userRepository.updatePassword(email, encodedPassword);
//			userRepository.updateIsActiveStatus(email,false);
			return Optional.of(isPasswordMatched);
//		});
	}
    
    public Optional<User> findByUsername(String email){
    	Optional<User> user = userRepository.findByUsername(email);
    	return user;
    }

}
