package com.docmindai.app.config;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class DocMindAIConfig {

	@Bean  //Method to customize Open API documentation UI part
	public OpenAPI openAPI() {
		return new OpenAPI().info(
				new Info()
				.title("DocMind - AI Document Intelligence & RAG APIs")
				.description("REST API for DocMind: Multi-format document ingestion, vector embeddings with PostgreSQL pgvector, and hybrid conversational Q&A with OpenAI.")
				.version("1.0.0")
				.contact(new Contact()
						 .name("Aditya Ganji")
						 .email("adityaganji889@gmail.com")
						 .url("https://peerlist.io/adityaganji889")
						)
				)
				.servers(
				 List.of(
					new Server().description("Local Env").url("http://localhost:8081") // similar add another entry of Server for Prod Env
				  )
				)
				.security(
				 List.of(
					new SecurityRequirement().addList("BearerAuth") //Enabling Security Requirement Globally
				 )		
				);
	}
	
	@Bean
	public SecurityScheme securityScheme() {
		return new SecurityScheme().name("BearerAuth")
				   .description("JWT Auth Description")
				   .scheme("bearer")
				   .type(SecurityScheme.Type.HTTP)
				   .bearerFormat("JWT")
				   .in(SecurityScheme.In.HEADER); //injects JWT Token in the header
	}
	
	@Bean
	public ChatClient chatClient(ChatClient.Builder builder) {
		return builder
			   .defaultSystem("""
			   		                  You are DocMind, an intelligent, versatile, and friendly AI doucment intelligence assistant.
			   		                  Your Capabilities:
			   		                  1. Document-Grounded Q&A: When context from the user's uploaded documents is provided, prioritize and base your answer directly on that context, citing document names and page numbers when available.
			   		                  2. General  Konwledge & Conversation: If the user engages in general conversation (Greetings, chit-chat, programming questions, math, explanations, summaries, or general knowledge) that may not be present in the uploaded documents, answer helpfully, accurately, and naturally.
			   		                  3. Hybrid Synthesis: If the document context partially covers a topic, synthesize the document facts with your broaded knowledge to give a complete, high-quality answer.
			   		                  4. Tone & Format: Always be warm, professional, clear, and structured. Use Markdown (headings, bullet points, bold text, code blocks) to make responses easy to read.
			   		""")
			   .build();
	}
	
	@Bean
	public ModelMapper modelMapper() {
		return new ModelMapper();
	}
}
