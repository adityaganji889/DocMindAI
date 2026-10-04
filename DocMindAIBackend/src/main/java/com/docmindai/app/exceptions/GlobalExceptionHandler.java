package com.docmindai.app.exceptions;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.docmindai.app.dtos.ApiResponse;
//import com.docmindai.app.repositories.DocumentMetaDataRepo;

//import lombok.RequiredArgsConstructor;

import org.slf4j.LoggerFactory;

@RestControllerAdvice
//@RequiredArgsConstructor
public class GlobalExceptionHandler {

	private static final Logger logger =  LoggerFactory.getLogger(GlobalExceptionHandler.class);
	
//	private final DocumentMetaDataRepo repo;
	
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex){
		logger.warn("Resource not found : {}",ex.getMessage());
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(ApiResponse.builder()
						.success(false)
						.message(ex.getMessage())
						.data(null)
						.timestamp(LocalDateTime.now())
						.build());
	}
	
	@ExceptionHandler(DocumentProcessingException.class)
	public ResponseEntity<ApiResponse<Object>> handleProcessingError(DocumentProcessingException ex){
		logger.error("Document processing error : {}",ex.getMessage());
		return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(ApiResponse.builder()
						.success(false)
						.message("Failed to process document: "+ex.getMessage())
						.data(null)
						.timestamp(LocalDateTime.now())
						.build());
	}
	
	@ExceptionHandler(MaxUploadSizeExceededException.class)
	public ResponseEntity<ApiResponse<Object>> handleMaxSize(MaxUploadSizeExceededException ex){
		logger.warn("File size limit exceeded : {}",ex.getMessage());
		return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT)
				.body(ApiResponse.builder()
						.success(false)
						.message("File size exceeds the allowed limit (25MB), it is:"+ex.getMessage())
						.data(null)
						.timestamp(LocalDateTime.now())
						.build());
	}
	
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(MethodArgumentNotValidException ex){
		Map<String, String> errors = new HashMap<>();
		for(FieldError error : ex.getBindingResult().getFieldErrors()) {
			errors.put(error.getField(), error.getDefaultMessage());
		}
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.<Map<String,String>>builder()
						.success(false)
						.message("Validation failed:"+ex.getMessage())
						.data(errors)
						.timestamp(LocalDateTime.now())
						.build());
	}
	
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex){
		logger.warn("Illegal argument : {}",ex.getMessage());
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.<Void>builder()
						.success(false)
						.message("Illegal argument passed:"+ex.getMessage())
						.data(null)
						.timestamp(LocalDateTime.now())
						.build());
	}
	
	@ExceptionHandler(Exception.class)
	public ResponseEntity<?> handleGeneric(Exception ex){
		logger.warn("Unexpected error occurred : {}",ex.getMessage());
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(ApiResponse.builder()
						.success(false)
						.message("An unexpected error occured:"+ex.getMessage())
						.data(null)
						.timestamp(LocalDateTime.now())
						.build());
	}
	
}
