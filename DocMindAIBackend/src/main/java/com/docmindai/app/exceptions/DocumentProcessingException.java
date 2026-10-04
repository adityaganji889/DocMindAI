package com.docmindai.app.exceptions;

public class DocumentProcessingException extends RuntimeException {

	public DocumentProcessingException() {
		super("Error in processing documents !!");
	}
	
	
	public DocumentProcessingException(String message) {
		super(message);
	}
	
	public DocumentProcessingException(String message, Throwable ex) {
		super(message,ex);
	}
	
}
