package com.docmindai.app.controllers;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docmindai.app.dtos.ChangePassword;
import com.docmindai.app.dtos.DefaultResponse;
import com.docmindai.app.dtos.LoginRequest;
import com.docmindai.app.dtos.LoginResponse;
import com.docmindai.app.dtos.RegisterRequest;
import com.docmindai.app.dtos.UserDto;
import com.docmindai.app.entities.Otp;
import com.docmindai.app.entities.User;
import com.docmindai.app.services.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(
		  name = "Authentication",
		  description = "Endpoints for user authentication apis."
)
public class AuthController {
	
	private final UserService userService;

	@Operation(
            summary = "Authenticate a user",
            description = "This endpoint allows an existing user to log in to the system."
    )
	@SecurityRequirements
	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request){
		//Todo
		//Authenticate and return the token and user
		LoginResponse response = userService.loginUser(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
	@Operation(
            summary = "Register a new user",
            description = "This endpoint allows a new user to register in the system."
    )
	@SecurityRequirements
	@PostMapping("/register")
	public ResponseEntity<UserDto> register(@RequestBody RegisterRequest request){
		//Todo
		//Register the new user and return user
		UserDto userDto = userService.registerUser(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(userDto);
	}
	
	// send otp to registered user email id for resetting/changing their password
    @Operation(
            summary = "Otp Email Request",
            description = "Sends an OTP to the provided email for resetting/changing password."        
    )
    @SecurityRequirements
    @PostMapping("/forgotPassword/{email}")
    public ResponseEntity<DefaultResponse> verifyEmail(@PathVariable String email) {
        Optional<User> cfu = userService.findByUsername(email);
        User user = null;
        try {
        	user = cfu.get();
        }
        catch(Exception e) {
        	e.printStackTrace();
        }
        if(cfu.isPresent()) {
        	
        	Otp otpR = userService.verifyEmailSend(email, user);
            Otp otp = null;
            try {
            	otp = otpR;
            	return ResponseEntity.ok(new DefaultResponse(true,"Email containing OTP sent successfully to:"+ email +"for resetting/changing password"));	
            }
            catch(Exception e) {
            	e.printStackTrace();
            	new ResponseEntity<>(new DefaultResponse(false, e.getMessage()),HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<>(new DefaultResponse(false, "User with the email id: "+email+" is not found"),HttpStatus.NOT_FOUND);
    }

	
	@Operation(
            summary = "Reset Password",
            description = "Resets the password for the user associated with the provided email."
        )
	@SecurityRequirements
    @PostMapping("/resetPassword/{email}")
    public ResponseEntity<DefaultResponse> changePasswordHandler(@RequestBody ChangePassword changePassword,
                                                        @PathVariable String email) {
        
        Optional<Boolean> cfu = userService.changePasswordHandle(email, changePassword.password(), changePassword.repeatPassword());
        Boolean flag = false;
        try {
        	flag = cfu.get();	
        }
        catch(Exception e) {
        	e.printStackTrace();
        	new ResponseEntity<>(new DefaultResponse(false, e.getMessage()),HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if(flag) {
        	return ResponseEntity.ok(new DefaultResponse(true,"Password is resetted for email: "+email+" successfully. Please verify your email once more."));
        }
        else {
        	return new ResponseEntity<DefaultResponse>(new DefaultResponse(false,"Please enter the password again!"), HttpStatus.EXPECTATION_FAILED);
        }
    }
}
