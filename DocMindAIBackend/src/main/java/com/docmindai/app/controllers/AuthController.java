package com.docmindai.app.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docmindai.app.dtos.LoginRequest;
import com.docmindai.app.dtos.LoginResponse;
import com.docmindai.app.dtos.RegisterRequest;
import com.docmindai.app.dtos.UserDto;
import com.docmindai.app.services.UserService;
import com.openai.models.beta.realtime.ResponseCreateEvent.Response;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
	
	private final UserService userService;

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request){
		//Todo
		//Authenticate and return the token and user
		LoginResponse response = userService.loginUser(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
	@PostMapping("/login")
	public ResponseEntity<UserDto> register(@RequestBody RegisterRequest request){
		//Todo
		//Register the new user and return user
		UserDto userDto = userService.registerUser(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(userDto);
	}
}
