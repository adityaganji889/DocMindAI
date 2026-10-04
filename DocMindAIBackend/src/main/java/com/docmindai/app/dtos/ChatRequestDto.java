package com.docmindai.app.dtos;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatRequestDto {

	@NotBlank(message = "Query cannot be empty")
	private String question;
	private UUID documentId;
    private Integer topK;
    private Double minSimilarity;
    private String conversationId;

}
