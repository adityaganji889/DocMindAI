package com.docmindai.app.dtos;

import java.util.UUID;

import com.docmindai.app.enums.DocumentStatus;

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
public class DocumentResponseDto {

	private UUID id;
	private String fileName;
	private Long fileSize;
	private DocumentStatus status;
	private Integer chunksCreated;
	private String message;
}
