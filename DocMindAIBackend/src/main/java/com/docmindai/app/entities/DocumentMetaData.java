package com.docmindai.app.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import com.docmindai.app.enums.DocumentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "document_metadata")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DocumentMetaData {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;
	
	@Column(nullable = false)
	private String filename;
	@Column(nullable = false)
	private String contentType;
	private Long fileSize;
	private Integer totalPages;
	private Integer totalChunks;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private DocumentStatus status;
	
	@Column(length = 1000)
	private String errorMessage;
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="user_id",nullable=false)
	private User user;
	
}
