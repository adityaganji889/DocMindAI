package com.docmindai.app.controllers;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docmindai.app.services.RagService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

import com.docmindai.app.dtos.ApiResponse;
import com.docmindai.app.dtos.ChatRequestDto;
import com.docmindai.app.dtos.ChatResponseDto;
import com.docmindai.app.dtos.SearchRequestDto;
import com.docmindai.app.dtos.SearchResultDto;
import com.docmindai.app.entities.User;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/v1/chat")
@SecurityRequirement(name = "BearerAuth") // Should match the SecurityScheme name
@Tag(
  name = "Chat Management",
  description = "Endpoints for chat related apis."
)
@RequiredArgsConstructor
public class ChatController {

	private final RagService ragService;
	
	@PostMapping("/query")
	@Operation(
			   summary = "Ask a question against all documents or a specific document with citations",	
			   description = "This api is used to ask a question against all documents or a specific document with citations."
	)
	public ResponseEntity<ApiResponse<ChatResponseDto>> askQuestion(
			 @Valid @RequestBody ChatRequestDto request,
			 Authentication authentication
			){
		User user  = (User) authentication.getPrincipal();
		ChatResponseDto chatResponse = ragService.askQuestion(request,user);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.<ChatResponseDto>builder()
				.success(true)
				.message(null)
				.data(chatResponse)
				.timestamp(LocalDateTime.now())
				.build());
		
//		return ResponseEntity.ok("This is just testing configurations");
				
	}
	
	@PostMapping("/stream")
	@Operation(
			   summary = "Stream real-time Q&A answer tokens via Server-Sent Events (SSE)",	
			   description = "This api is used to stream real-time Q&A answer tokens via Server-Sent Events (SSE)."
	)
	public Flux<String> streamQuestion(
			 @Valid @RequestBody ChatRequestDto request,
			 Authentication authentication
			){
		User user  = (User) authentication.getPrincipal();
		Flux<String> chatResponse = ragService.streamQuestionAnswer(request,user);
		return chatResponse;
		
//		return ResponseEntity.ok("This is just testing configurations");
				
	}
	
	@PostMapping("/search/similarity")
	@Operation(
			   summary = "Perform semantic similarity search on stored document vectors",	
			   description = "This api is used to perform semantic similarity search on stored document vectors."
	)
	public ResponseEntity<ApiResponse<SearchResultDto>> searchSimilar(
			 @Valid @RequestBody SearchRequestDto request,
			 Authentication authentication
			){
		User user  = (User) authentication.getPrincipal();
		SearchResultDto chatResponse = ragService.searchSimilarChunks(request,user);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.<SearchResultDto>builder()
				.success(true)
				.message(null)
				.data(chatResponse)
				.timestamp(LocalDateTime.now())
				.build());
		
//		return ResponseEntity.ok("This is just testing configurations");
				
	}

}
