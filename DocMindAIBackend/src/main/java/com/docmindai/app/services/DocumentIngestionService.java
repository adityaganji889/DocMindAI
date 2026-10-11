package com.docmindai.app.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import com.docmindai.app.config.AppProperties;
import com.docmindai.app.entities.DocumentMetaData;
import com.docmindai.app.enums.DocumentStatus;
import com.docmindai.app.exceptions.DocumentProcessingException;
import com.docmindai.app.repositories.DocumentMetaDataRepo;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class DocumentIngestionService {
	
	private final static Logger logger = LoggerFactory.getLogger(DocumentIngestionService.class);

	private final VectorStore vectorStore;
	
	private final DocumentMetaDataRepo documentMetaDataRepo;
	
	private final AppProperties appProperties;
	
	public int ingest(DocumentMetaData metaData, List<Document> parsedDocs) {
	    logger.info("Ingesting document [id={}, name={}, pages={}]",metaData.getId(),metaData.getFilename(),parsedDocs.size());	
		try {
			metaData.setStatus(DocumentStatus.PROCESSING);
			metaData.setTotalPages(parsedDocs.size());
			
			//1. Text chunking using TokenTextSplitter
			TokenTextSplitter tokenTextSplitter = TokenTextSplitter
					                              .builder()
					                              .withChunkSize(appProperties.getRag().getChunkSize())
					                              .withMinChunkSizeChars(appProperties.getRag().getMinChunkSizeChars())
					                              .withMinChunkLengthToEmbed(appProperties.getRag().getMinChunkLengthToEmbed())
					                              .withMaxNumChunks(appProperties.getRag().getMaxNumChunks())
					                              .withKeepSeparator(true)
					                              .build();
		    
			List<Document> chunks = tokenTextSplitter.apply(parsedDocs);
			if(chunks.isEmpty()) {
				metaData.setStatus(DocumentStatus.FAILED);
				metaData.setErrorMessage("Document appears to be empty or unscannable");
                documentMetaDataRepo.save(metaData);
                return 0;
			}
			
			//2. Meta data emrichment on each chunk
			List<Document> enrichedChunks = new ArrayList<>();
			
			for(int i=0; i<chunks.size(); i++) {
				Document chunk = chunks.get(i);
				Map<String, Object> enrichedMetaData = new HashMap<>(chunk.getMetadata());
				enrichedMetaData.put("documentId", metaData.getId().toString());
				enrichedMetaData.put("fileName", metaData.getFilename());
				enrichedMetaData.put("contentType", metaData.getContentType());
				enrichedMetaData.put("chunkIndex", i);
				enrichedMetaData.put("userId", metaData.getUser().getId().toString()); //embedding user id also in chunks //important step for user based document
				//Preserve or calculate page number if available
				Object pageNumber = chunk.getMetadata().get("page_number");
				if(pageNumber == null) {
					pageNumber = chunk.getMetadata().get("pageNumber");
				}
				if(pageNumber != null) {
			        enrichedMetaData.put("pageNumber", pageNumber);
				}
				Document enrichedDoc = new Document(chunk.getText(),enrichedMetaData);
				enrichedChunks.add(enrichedDoc);
			}
			
			//3. Write chunks and embedding to pg vector
			logger.info("Writing {} vector chunks to PgVectorStore for document: {}", enrichedChunks.size(),metaData.getFilename());
			vectorStore.add(enrichedChunks);
			
			//4. Update document status to index
			metaData.setStatus(DocumentStatus.INDEXED);
			metaData.setTotalChunks(enrichedChunks.size());
			metaData.setErrorMessage(null);
			documentMetaDataRepo.save(metaData);
			
			logger.info("Successfully indexed document [id={}, name={}, chunks={}]",metaData.getId(),metaData.getFilename(),enrichedChunks.size());
			
			
			return enrichedChunks.size();
		}
		catch(Exception e) {
			logger.error("Failed to ingest document into vector store: {}",metaData.getFilename(),e);
			metaData.setStatus(DocumentStatus.FAILED);
			metaData.setErrorMessage(e.getMessage());
		    documentMetaDataRepo.save(metaData);
		    throw new DocumentProcessingException("Failed to index document: "+e.getMessage(),e);
		}
//	    return 0;
	}
}
