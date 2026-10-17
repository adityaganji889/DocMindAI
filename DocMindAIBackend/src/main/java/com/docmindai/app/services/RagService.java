package com.docmindai.app.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
//import java.util.stream.Collectors;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.Filter;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;

import com.docmindai.app.config.AppProperties;
import com.docmindai.app.dtos.ChatRequestDto;
import com.docmindai.app.dtos.ChatResponseDto;
import com.docmindai.app.dtos.CitationDto;
import com.docmindai.app.dtos.SearchRequestDto;
import com.docmindai.app.dtos.SearchResultDto;
import com.docmindai.app.entities.User;
import com.docmindai.app.repositories.ConversationRepository;

import com.docmindai.app.entities.Conversation;

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

	private final ConversationRepository conversationRepository;

	// confidence score changes starts
	/**
	 * Clamp a numeric value to the range [0, 1].
	 */
	public double clamp(double value) {
		if (!Double.isFinite(value)) {
			return 0.0;
		}

		return Math.max(0.0, Math.min(1.0, value));
	}

	/**
	 * Extract a normalized similarity score from document metadata.
	 *
	 * IMPORTANT: The "distance" conversion below is valid only when the VectorStore
	 * returns a normalized distance in [0, 1] for which similarity = 1 - distance.
	 *
	 * Verify the semantics of your specific VectorStore.
	 */
	public Double getSimilarityScore(Document document) {
		if (document == null || document.getMetadata() == null) {
			return null;
		}

		Map<String, Object> metadata = document.getMetadata();

		// Prefer explicit similarity values.
		Object similarity = metadata.get("similarity");
		if (similarity instanceof Number number) {
			return clamp(number.doubleValue());
		}

		// Some stores expose a normalized relevance score.
		Object score = metadata.get("score");
		if (score instanceof Number number) {
			return clamp(number.doubleValue());
		}

		// Fall back to normalized distance, if supported by the store.
		Object distance = metadata.get("distance");
		if (distance instanceof Number number) {
			double d = number.doubleValue();

			if (Double.isFinite(d) && d >= 0.0 && d <= 1.0) {
				return clamp(1.0 - d);
			}
		}

		return null;
	}

	/**
	 * Calculate relevance confidence from retrieved chunks.
	 *
	 * Uses the best match and the average of available scores. Does not assume
	 * missing scores are zero-valued matches.
	 */
	public double calculateRetrievalConfidence(List<Document> documents) {
		if (documents == null || documents.isEmpty()) {
			return 0.0;
		}

		List<Double> scores = documents.stream().map(this::getSimilarityScore).filter(Objects::nonNull).toList();

		if (scores.isEmpty()) {
			return 0.0;
		}

		double bestScore = scores.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);

		double averageScore = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

		// Prioritize the strongest match without ignoring other chunks.
		return clamp((0.70 * bestScore) + (0.30 * averageScore));
	}

	/**
	 * Get source name from document metadata.
	 */
	public String getSource(Document document) {
		if (document == null || document.getMetadata() == null) {
			return null;
		}

		Map<String, Object> metadata = document.getMetadata();

		Object source = metadata.get("source");
		if (source != null) {
			return source.toString();
		}

		Object fileName = metadata.get("fileName");
		if (fileName != null) {
			return fileName.toString();
		}

		Object documentName = metadata.get("document");
		if (documentName != null) {
			return documentName.toString();
		}

		return null;
	}

	/**
	 * Calculate source agreement using only documents with known sources.
	 */
	public double calculateSourceAgreement(List<Document> documents) {
		if (documents == null || documents.isEmpty()) {
			return 0.0;
		}

		List<String> sources = documents.stream().map(this::getSource)
				.filter(source -> source != null && !source.isBlank()).toList();

		if (sources.isEmpty()) {
			return 0.0;
		}

		Map<String, Long> sourceCounts = sources.stream()
				.collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

		long maxCount = sourceCounts.values().stream().mapToLong(Long::longValue).max().orElse(0L);

		return clamp((double) maxCount / sources.size());
	}

	/**
	 * Retrieval-based confidence.
	 *
	 * This measures retrieval relevance and source agreement. It is NOT a verified
	 * probability that the generated answer is correct.
	 */
	public double calculateFinalConfidence(List<Document> documents) {
		if (documents == null || documents.isEmpty()) {
			return 0.0;
		}

		double retrievalConfidence = calculateRetrievalConfidence(documents);
		double sourceAgreement = calculateSourceAgreement(documents);

		return clamp((0.80 * retrievalConfidence) + (0.20 * sourceAgreement));
	}

	/**
	 * Convert confidence in [0, 1] to a percentage.
	 */
	public int getConfidencePercentage(double confidence) {
		return (int) Math.round(clamp(confidence) * 100);
	}

	/**
	 * Complete retrieval confidence calculation.
	 */
	public double calculate(List<Document> documents) {
		return getConfidencePercentage(calculateFinalConfidence(documents));
	}
	// confidence score changes ends

	private String buildContextString(List<Document> similarDocuments) {
		if (similarDocuments == null || similarDocuments.isEmpty()) {
			return "";
		}
		return similarDocuments.stream().map(doc -> {
			String fileName = (String) doc.getMetadata().getOrDefault("fileName", "Unknown");
			Object page = doc.getMetadata().getOrDefault("pageNumber", "N/A");
			return String.format("[Source: %s | Page: %s]\n%s", fileName, page, doc.getText());
		}).collect(Collectors.joining("\n\n---\n\n"));
//		return null;
	}

	/*
	 * private String buildPrompt(@NotBlank(message = "Query cannot be empty")
	 * String question, String contextText) { if(contextText!=null &&
	 * !contextText.isBlank()) { return String.format(""" Document Context:
	 * --------------------- %s ---------------------
	 * 
	 * User Message / Question: %s
	 * 
	 * Instructions: - If the user's question relates to the document context above,
	 * prioritize answering using that context and reference key sections. - If the
	 * user is asking a general question, greeting, or discussing topics beyond the
	 * document context, respond helpfully and conversationally using your general
	 * knowledge while weaving in relevant document context if applicable.
	 * 
	 * """,contextText,question); } else { return String.format(""" User Message /
	 * Question: %s
	 * 
	 * Instructions: - Respond helpfully, accurately, and conversationally to the
	 * user's message using your broad knowledge base. """,question); } // return
	 * null; }
	 */

	private void ensureConversationExists(String conversationId, User user, String question) {

		Conversation conversation = conversationRepository.findById(conversationId).orElseGet(() -> {
//    			                                        	  String title = question.length() > 10 ? question.substring(0,47) + "..." : question;
			String title = question.substring(0, Math.min(question.length(), 47));

			if (question.length() > 47) {
				title += "...";
			}
			return conversationRepository.save(Conversation.builder().id(conversationId).title(title).user(user)
					.createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());
		});
	}

	// to ask any thing related to document
	public ChatResponseDto askQuestion(ChatRequestDto request, User user) {

		long startTime = System.currentTimeMillis();

		String conversationId = request.getConversationId() != null ? request.getConversationId()
				: UUID.randomUUID().toString();

		ensureConversationExists(conversationId, user, request.getQuestion());

		logger.info("Processing query : '{}', scoped documentId: {}", request.getQuestion(), request.getDocumentId());

		List<Document> similarDocuments = retrieveRelevantDocuments(request.getQuestion(), request.getDocumentId(),
				request.getTopK(), request.getMinSimilarity(), user);

		List<CitationDto> citations = new ArrayList<>();

		for (Document document : similarDocuments) {
			CitationDto citation = mapToCitation(document);
			citations.add(citation);
		}

		String contextText = buildContextString(similarDocuments);

//		String prompt = buildPrompt(request.getQuestion(),contextText);

		String answer = chatClient.prompt().system(system -> system.param("doc_context", contextText))
				.user(request.getQuestion())
				.advisors(a -> a.param(ChatMemory.CONVERSATION_ID, request.getConversationId())).call().content();

		long responseTime = System.currentTimeMillis() - startTime;

		logger.info("Completed Q&A in {} ms with {} citations", responseTime, citations.size());

		// confidence score changes starts
//		double groundednessScore = 0.90;

//		double confidenceScore = calculate(similarDocuments,groundednessScore);
		double confidenceScore = calculate(similarDocuments);
		// confidence score changes ends

		return ChatResponseDto.builder().answer(answer)
				.conversationId(request.getConversationId() != null ? request.getConversationId()
						: UUID.randomUUID().toString())
				.citations(citations).responseTimeMs(responseTime).confidenceScore(confidenceScore) // confidence score
																									// changes
				.build();

//		return null;
	}

	// this streams
	public Flux<String> streamQuestionAnswer(ChatRequestDto request, User user) {

		logger.info("Streaming query: '{}'", request.getQuestion());

		String conversationId = request.getConversationId() != null ? request.getConversationId()
				: UUID.randomUUID().toString();

		ensureConversationExists(conversationId, user, request.getQuestion());

		List<Document> relevantDocuments = retrieveRelevantDocuments(request.getQuestion(), request.getDocumentId(),
				request.getTopK(), request.getMinSimilarity(), user);

		String contextText = buildContextString(relevantDocuments);

//		String userPrompt = buildPrompt(request.getQuestion(),contextText);

		return chatClient.prompt().system(system -> system.param("doc_context", contextText))
				.user(request.getQuestion())
				.advisors(a -> a.param(ChatMemory.CONVERSATION_ID, request.getConversationId())).stream().content();
	}

	// this is very important document that fetches the similar result from vector
	// db
	private List<Document> retrieveRelevantDocuments(@NotBlank(message = "Query cannot be empty") String query,
			UUID documentId, Integer topK, Double similaritySearch, User user) {
		int effectiveTopK = (topK != null && topK > 0) ? topK : appProperties.getRag().getTopK();
		double effectiveSimilarity = (similaritySearch != null) ? similaritySearch
				: appProperties.getRag().getSimilarityThreshold();

		SearchRequest.Builder searchRequestBuilder = SearchRequest.builder().query(query).topK(effectiveTopK);

		if (effectiveSimilarity > 0.0) {
			searchRequestBuilder.similarityThreshold(effectiveSimilarity);
		}

		FilterExpressionBuilder b = new FilterExpressionBuilder();
		Filter.Expression filterExpression = null;
		if (documentId != null) {
			logger.info("Filtering from document:" + documentId.toString());
			// Introduced userId filter
			filterExpression = b.and(b.eq("userId", user.getId().toString()), b.eq("documentId", documentId.toString()))
					.build();
		} else {
			// Introduced userId filter
			logger.info("Filtering from documents from user:" + user.getId().toString());
			filterExpression = b.eq("userId", user.getId().toString()).build();
		}
		searchRequestBuilder.filterExpression(filterExpression);

		try {
			List<Document> documents = vectorStore.similaritySearch(searchRequestBuilder.build());
			logger.info("Retrieved {} chunks for query: '{}' (scoped docId: {})", documents.size(), query, documentId);
			return documents;
		} catch (Exception e) {
			logger.error("Similarity search failed for query: '{}'", query, e);
			return Collections.emptyList();
		}

//		return null;
	}

	private CitationDto mapToCitation(Document document) {

		Map<String, Object> meta = document.getMetadata();
		UUID docId = null;

		if (meta.get("documentId") != null) {
			try {
				docId = UUID.fromString(meta.get("documentId").toString());
			} catch (Exception e) {

			}
		}

		Integer chunkIndex = null;

		if (meta.get("chunkIndex") instanceof Number n) {
			chunkIndex = n.intValue();
		}

		Integer pageNumber = null;

		if (meta.get("pageNumber") instanceof Number n) {
			pageNumber = n.intValue();
		} else if (meta.get("page_number") instanceof Number n) {
			pageNumber = n.intValue();
		}

		Double score = null;

		if (meta.get("distance") instanceof Number n) {
			score = 1.0 - n.doubleValue();
		}

		return CitationDto.builder().documentId(docId)
				.fileName(String.valueOf(meta.getOrDefault("fileName", "Unknown"))).chunkIndex(chunkIndex)
				.pageNumber(pageNumber).snippet(document.getText()).similarityScore(score).metadata(meta).build();

//		return null;
	}

	public SearchResultDto searchSimilarChunks(SearchRequestDto request, User user) {

		List<Document> matchedDocs = retrieveRelevantDocuments(request.getQuery(), request.getDocumentId(),
				request.getTopK(), request.getSimilaritySearch(), user);

		List<CitationDto> citations = new ArrayList<>();

		for (Document document : matchedDocs) {
			CitationDto citation = mapToCitation(document);
			citations.add(citation);
		}

		// confidence score changes starts
//		double groundednessScore = 0.90;

//		double confidenceScore = calculate(matchedDocs,groundednessScore);
		double confidenceScore = calculate(matchedDocs);
		// confidence score changes ends

		return SearchResultDto.builder().query(request.getQuery()).totalMatches(citations.size()).matches(citations)
				.confidenceScore(confidenceScore) // confidence score changes
				.build();
//		return null;
	}

}
