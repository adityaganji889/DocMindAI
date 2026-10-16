package com.docmindai.app.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.docmindai.app.dtos.ApiResponse;
import com.docmindai.app.dtos.DocumentMetadataDto;
import com.docmindai.app.dtos.DocumentResponseDto;
import com.docmindai.app.entities.User;
import com.docmindai.app.services.DocumentMetaDataService;
import com.docmindai.app.services.RagService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/documents")
//@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Document Management", description = "Endpoints for uploading, listing and managing documents and their vector embeddings.")
public class DocumentController {

	@Autowired
	private DocumentMetaDataService documentService;
	
	private final Logger logger = LoggerFactory.getLogger(DocumentController.class);

	@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(summary = "Upload and index a document(PDF, DOCX, TEXT, MD, CSV)", description = "This api is used to upload and index document file.")
	public ResponseEntity<ApiResponse<DocumentResponseDto>> uploadDocument(@RequestParam("file") MultipartFile file, Authentication authentication) {
		
		logger.info("Document uploading started:");
		
		User user = (User) authentication.getPrincipal();
		
		// process the file
		DocumentResponseDto documentResponseDto = documentService.uploadAndProcess(file,user);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.<DocumentResponseDto>builder().success(true)
						.message("Documents uploaded and indexed successfully").data(documentResponseDto)
						.timestamp(LocalDateTime.now()).build());
		// return ResponseEntity.ok("uploaded");

	}

	// api to upload multiple documents
	@PostMapping(value = "/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(summary = "Upload and index multiple documents(PDF, DOCX, TEXT, MD, CSV) simultaneously", description = "This api is used to upload and index multiple documents.")
	public ResponseEntity<ApiResponse<List<DocumentResponseDto>>> uploadDocuments(
			@RequestParam("files") List<MultipartFile> files, Authentication authentication) {
		User user = (User) authentication.getPrincipal();
		List<DocumentResponseDto> documents = documentService.uploadMultipleDocuments(files,user);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.<List<DocumentResponseDto>>builder().success(true)
						.message("Documents uploaded and indexed successfully").data(documents)
						.timestamp(LocalDateTime.now()).build());
		// return ResponseEntity.ok("uploaded");

	}

	// api to list all uploaded documents of logged in user
	@GetMapping(value = "/user")
	@Operation(summary = "List all uploaded documents of a user and their indexing status", description = "This api is used to fetch info of all uploaded documents along with their indexing status.")
	public ResponseEntity<ApiResponse<List<DocumentMetadataDto>>> getAllDocumentsOfUser(Authentication authentication) {
		User user = (User) authentication.getPrincipal();
		List<DocumentMetadataDto> documents = documentService.getAllDocumentsOfUser(user);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.<List<DocumentMetadataDto>>builder().success(true)
						.message("All documents are fetched successfully").data(documents)
						.timestamp(LocalDateTime.now()).build());
		// return ResponseEntity.ok("uploaded");

	}
	
	// api to list all uploaded documents
	// method to be used by admin
	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping
	@Operation(summary = "List all uploaded documents and their indexing status", description = "This api is used to fetch info of all uploaded documents along with their indexing status.")
	public ResponseEntity<ApiResponse<List<DocumentMetadataDto>>> getAllDocuments() {
		List<DocumentMetadataDto> documents = documentService.getAllDocuments();
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.<List<DocumentMetadataDto>>builder().success(true)
						.message("All documents are fetched successfully").data(documents)
						.timestamp(LocalDateTime.now()).build());
		// return ResponseEntity.ok("uploaded");

	}

	// api to fetch a particular uploaded document
	@GetMapping("/{id}")
	@Operation(summary = "Get metadata of a specific document by Id", description = "This api is used to fetch info of a specific document by it's id.")
	public ResponseEntity<ApiResponse<DocumentMetadataDto>> getDocumentById(@PathVariable("id") UUID id) {
		DocumentMetadataDto document = documentService.getDocumentById(id);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.<DocumentMetadataDto>builder().success(true)
						.message("Document with id:" + id.toString() + " is fetched successfully").data(document)
						.timestamp(LocalDateTime.now()).build());
		// return ResponseEntity.ok("uploaded");

	}

	// api to fetch a particular uploaded document
	@DeleteMapping("/{id}")
	@Operation(summary = "Delete metadata of a specific document by Id", description = "This api is used to delete info of a specific document by it's id.")
	public ResponseEntity<ApiResponse<Void>> deleteDocumentById(@PathVariable("id") UUID id) {
		documentService.deleteDocumentById(id);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.<Void>builder().success(true)
						.message("Document with id:" + id.toString() + " is deleted successfully").data(null)
						.timestamp(LocalDateTime.now()).build());
		// return ResponseEntity.ok("uploaded");

	}

}
