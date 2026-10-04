package com.docmindai.app.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
//import java.util.stream.Collectors;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;

import com.docmindai.app.config.AppProperties;
import com.docmindai.app.dtos.ChatRequestDto;
import com.docmindai.app.dtos.ChatResponseDto;
import com.docmindai.app.dtos.CitationDto;
import com.docmindai.app.dtos.SearchRequestDto;
import com.docmindai.app.dtos.SearchResultDto;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class RagService {

	private final Logger logger = LoggerFactory.getLogger(RagService.class);
	
	private final VectorStore vectorStore;
	
	private final ChatClient chatClient;
	
	private final AppProperties appProperties;
	
	private String buildContextString(List<Document> similarDocuments) {
		if(similarDocuments == null || similarDocuments.isEmpty()) {
			return "";
		}
		return similarDocuments.stream()
				.map(doc -> {
					String fileName = (String) doc.getMetadata().getOrDefault("fileName", "Unknown");
					Object page =  doc.getMetadata().getOrDefault("pageNumber", "N/A");
				    return String.format("[Source: %s | Page: %s]\n%s",fileName, page, doc.getText());
				})
				.collect(Collectors.joining("\n\n---\n\n"));
//		return null;
	}
	
	private String buildPrompt(@NotBlank(message = "Query cannot be empty") String question, String contextText) {
		if(contextText!=null && !contextText.isBlank()) {
			return String.format("""
					 Document Context:
					 ---------------------
					 %s
					 ---------------------
					                  
					 User Message / Question: %s
					 
					 Instructions:
					 - If the user's question relates to the document context above, prioritize answering using that context and reference key sections. 
					 - If the user is asking a general question, greeting, or discussing topics beyond the document context, respond helpfully and conversationally using your general knowledge while weaving in relevant document context if applicable.
					   	     
				   """,contextText,question);
		}
		else {
			return String.format("""
					  User Message / Question: %s
					         
					  Instructions:
					  - Respond helpfully, accurately, and conversationally to the user's message using your broad knowledge base.
					""",question);
		}
//		return null;
	}
	
	//to ask any thing related to document
	public ChatResponseDto askQuestion(ChatRequestDto request) {
		
		long startTime = System.currentTimeMillis();
		logger.info("Processing query : '{}', scoped documentId: {}", request.getQuestion(), request.getDocumentId());
		
		List<Document> similarDocuments = retrieveRelevantDocuments(request.getQuestion(),request.getDocumentId(),request.getTopK(),request.getMinSimilarity());
		
		List<CitationDto> citations = new ArrayList<>();

		for (Document document : similarDocuments) {
		    CitationDto citation = mapToCitation(document);
		    citations.add(citation);
		}
		
		String contextText = buildContextString(similarDocuments);
		
		String prompt = buildPrompt(request.getQuestion(),contextText);
		
		String answer = chatClient.prompt()
		          .user(prompt)
		          .call()
		          .content();
		
		long responseTime = System.currentTimeMillis() - startTime;
		
		logger.info("Completed Q&A in {} ms with {} citations",responseTime, citations.size());
		
		return ChatResponseDto.builder()
				.answer(answer)
				.conversationId(request.getConversationId() != null ? request.getConversationId() : UUID.randomUUID().toString())
				.citations(citations)
				.responseTimeMs(responseTime)
				.build();
		
//		return null;
	}
	
	//this streams
	public Flux<String> streamQuestionAnswer(ChatRequestDto request){
		
		logger.info("Streaming query: '{}'", request.getQuestion());
		
		List<Document> relevantDocuments = retrieveRelevantDocuments(request.getQuestion(),request.getDocumentId(),request.getTopK(),request.getMinSimilarity());
		
        String contextText = buildContextString(relevantDocuments);
		
		String userPrompt = buildPrompt(request.getQuestion(),contextText);
		
		return chatClient.prompt()
		          .user(userPrompt)
		          .stream()
		          .content();
	}
	
	private List<Document> retrieveRelevantDocuments(@NotBlank(message = "Query cannot be empty") String query, UUID documentId, Integer topK, Double similaritySearch) {
		int effectiveTopK = (topK != null && topK > 0) ? topK : appProperties.getRag().getTopK();
		double effectiveSimilarity = (similaritySearch != null) ? similaritySearch : appProperties.getRag().getSimilarityThreshold();
		
		SearchRequest.Builder searchRequestBuilder = SearchRequest.builder()
		                .query(query)
		                .topK(effectiveTopK);
		
		if(effectiveSimilarity>0.0) {
			searchRequestBuilder.similarityThreshold(effectiveSimilarity);
		}
		
		if(documentId!=null) {
			FilterExpressionBuilder b = new FilterExpressionBuilder();
			searchRequestBuilder.filterExpression(b.eq("documentId",documentId.toString()).build());
		}
		
		try {
			List<Document> documents = vectorStore.similaritySearch(searchRequestBuilder.build());
		    logger.info("Retrieved {} chunks for query: '{}' (scoped docId: {})",documents.size(),query,documentId);
			return documents;
		}
		catch(Exception e) {
			logger.error("Similarity search failed for query: '{}'", query, e);
			return Collections.emptyList();
		}
		
//		return null;
	}
	
	private CitationDto mapToCitation(Document document) {
		
		Map<String,Object> meta = document.getMetadata();
		UUID docId = null;
		
		if(meta.get("documentId")!=null) {
			try {
				docId = UUID.fromString(meta.get("documentId").toString());
			}
			catch(Exception e) {
				
			}
		}
		
		Integer chunkIndex = null;
		
		if(meta.get("chunkIndex") instanceof Number n) {
			chunkIndex = n.intValue();
		}
		
        Integer pageNumber = null;
		
		if(meta.get("pageNumber") instanceof Number n) {
			pageNumber = n.intValue();
		}
		else if(meta.get("page_number") instanceof Number n) {
			pageNumber = n.intValue();
		}	
		
		Double score = null;
		
		if(meta.get("distance") instanceof Number n) {
			score = 1.0 - n.doubleValue();
		}
		
		return CitationDto.builder()
				.documentId(docId)
				.fileName(String.valueOf(
				        meta.getOrDefault("fileName", "Unknown")
						))
				.chunkIndex(chunkIndex)
				.pageNumber(pageNumber)
				.snippet(document.getText())
				.similarityScore(score)
				.metadata(meta)
				.build();
		
//		return null;
	}
	
	public SearchResultDto searchSimilarChunks(SearchRequestDto request) {
		
		List<Document> matchedDocs = retrieveRelevantDocuments(request.getQuery(),request.getDocumentId(),request.getTopK(),request.getSimilaritySearch());
		
		List<CitationDto> citations = new ArrayList<>();

		for (Document document : matchedDocs) {
		    CitationDto citation = mapToCitation(document);
		    citations.add(citation);
		}
		
		return SearchResultDto.builder()
				.query(request.getQuery())
				.totalMatches(citations.size())
				.matches(citations)
				.build();
//		return null;
	}
	
}
