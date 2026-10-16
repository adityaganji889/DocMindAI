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
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RequestBody;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

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
            description = "This endpoint allows an existing user to log in to the system.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "User login credentials",
                content = @Content(schema = @Schema(implementation = LoginRequest.class))
            ),
            responses = {
                @ApiResponse(responseCode = "200", description = "User logged in successfully", 
                             content = @Content(schema = @Schema(implementation = LoginResponse.class))),
                @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid credentials", 
                             content = @Content),
                @ApiResponse(responseCode = "500", description = "Internal Server Error - Error occurred during login", 
                content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            },
            security = {}
        )
	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request){
		//Todo
		//Authenticate and return the token and user
		LoginResponse response = userService.loginUser(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
	@Operation(
            summary = "Register a new user",
            description = "This endpoint allows a new user to register in the system.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "User registration details",
                content = @Content(schema = @Schema(implementation = RegisterRequest.class))
            ),
            responses = {
                @ApiResponse(responseCode = "200", description = "User registered successfully", 
                             content = @Content(schema = @Schema(implementation = UserDto.class))),
                @ApiResponse(responseCode = "400", description = "Invalid input data", 
                             content = @Content),
                @ApiResponse(responseCode = "500", description = "Internal Server Error - Error occurred during register", 
                content = @Content(schema = @Schema(implementation = UserDto.class))),
            },
            security = {}
        )
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
            description = "Sends an OTP to the provided email for resetting/changing password.",
            parameters = @Parameter(name = "email", description = "Registered user email for resetting/changing password for Doc Mind AI app", required = true),
            responses = {
                @ApiResponse(responseCode = "200", description = "Email containing OTP sent successfully", 
                             content = @Content(schema = @Schema(implementation = DefaultResponse.class))),
                @ApiResponse(responseCode = "404", description = "User not found with the provided email", 
                             content = @Content),
                @ApiResponse(responseCode = "500", description = "Internal Server Error", 
                             content = @Content)
            },
            security = {}
        )
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
            description = "Resets the password for the user associated with the provided email.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "New password details",
                content = @Content(schema = @Schema(implementation = ChangePassword.class))
            ),
            parameters = @Parameter(name = "email", description = "User email to reset the password", required = true),
            responses = {
                @ApiResponse(responseCode = "200", description = "Password changes successfully", 
                             content = @Content(schema = @Schema(implementation = DefaultResponse.class))),
                @ApiResponse(responseCode = "417", description = "Passwords do not match", 
                             content = @Content),
                @ApiResponse(responseCode = "500", description = "Internal Server Error", 
                             content = @Content)
            },
            security = {}
        )
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
