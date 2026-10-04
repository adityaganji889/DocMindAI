package com.docmindai.app.services;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.docmindai.app.dtos.DocumentMetadataDto;
import com.docmindai.app.dtos.DocumentResponseDto;
import com.docmindai.app.entities.DocumentMetaData;
import com.docmindai.app.enums.DocumentStatus;
import com.docmindai.app.exceptions.DocumentProcessingException;
import com.docmindai.app.exceptions.ResourceNotFoundException;
import com.docmindai.app.repositories.DocumentMetaDataRepo;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
//import java.util.Optional;
import java.util.UUID;

import org.springframework.ai.document.Document;

@Service
@RequiredArgsConstructor
public class DocumentMetaDataService {

	private static final Logger logger = LoggerFactory.getLogger(DocumentMetaDataService.class);

	private final DocumentMetaDataRepo documentMetaDataRepo;

	private final JdbcTemplate jdbcTemplate;

	private final DocumentParserService parserService;

	private final DocumentIngestionService ingestionService;
	
	private final ModelMapper modelMapper;

	// Method to upload and parse document
	public DocumentResponseDto uploadAndProcess(MultipartFile file) {

		String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
		String contentType = file.getContentType() != null ? file.getContentType().toLowerCase()
				: "application/octet-stream";

		// Document meta data create
		DocumentMetaData documentMetaData = DocumentMetaData.builder().filename(fileName).contentType(contentType)
				.status(DocumentStatus.UPLOADING).fileSize(file.getSize()).createdAt(LocalDateTime.now()).build();

		// save the document meta data
		documentMetaData = documentMetaDataRepo.save(documentMetaData);

		List<Document> parsedDocs = null;
		int chunksCreated = 0;
		
		try {
			
			// parse the file
			parsedDocs = parserService.parse(file);

			// ingest service
			chunksCreated = ingestionService.ingest(documentMetaData, parsedDocs);
			
		}
		catch(DocumentProcessingException e) {
			logger.warn("Document metadata deleting due to failed processing: {}",e.getMessage());
			documentMetaDataRepo.delete(documentMetaData);
			throw e;
		}

//		documentMetaData.setTotalChunks(chunksCreated);

		// save the document meta data
//	    documentMetaData = documentMetaDataRepo.save(documentMetaData);

		return DocumentResponseDto.builder().id(documentMetaData.getId()).fileName(documentMetaData.getFilename())
				.fileSize(documentMetaData.getFileSize()).chunksCreated(chunksCreated)
				.status(documentMetaData.getStatus()).message("Document successfully processed and indexed.").build();
	}

	// Method to upload and parse multiple documents
	public List<DocumentResponseDto> uploadMultipleDocuments(List<MultipartFile> files) {

		List<DocumentResponseDto> documents = new ArrayList<DocumentResponseDto>();

		for (MultipartFile file : files) {

			DocumentResponseDto document = uploadAndProcess(file);

			documents.add(document);

		}

		return documents;

	}

	// Method to fetch all uploaded documents
	public List<DocumentMetadataDto> getAllDocuments() {

		List<DocumentMetadataDto> documents = new ArrayList<DocumentMetadataDto>();

		List<DocumentMetaData> fetchedDocuments = documentMetaDataRepo.findAllByOrderByCreatedAtDesc();

		for (DocumentMetaData fetchedDocument : fetchedDocuments) {

			DocumentMetadataDto document = modelMapper.map(fetchedDocument,DocumentMetadataDto.class);

			documents.add(document);

		}

		return documents;
	}

	// Method to fetch a particular uploaded document
	public DocumentMetadataDto getDocumentById(UUID id) {

	    DocumentMetaData documentMetaData = documentMetaDataRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Document with given id:"+ id.toString() +" not found"));

		return modelMapper.map(documentMetaData, DocumentMetadataDto.class);
	}

	// Method to delete a particular uploaded document
	public void deleteDocumentById(UUID id) {
        
		DocumentMetaData documentMetaData = documentMetaDataRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Document with given id:"+ id.toString() +" not found"));
		
		//delete the vector entries
		try {
			String deleteVectorSql = "DELETE FROM vector_store WHERE metadata->>'documentId' = ?";
			int deletedCount = jdbcTemplate.update(deleteVectorSql, id.toString());
			logger.info("Deleted {} vector chunks for document id {} ",deletedCount, id);
		}
		catch(Exception e) {
			logger.warn("Could not be able to delete vectors from vector store directly {}", e.getMessage());
		}
		
		documentMetaDataRepo.deleteById(id);
		
		return;

	}

}
