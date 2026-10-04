package com.docmindai.app.repositories;

import java.util.List;
import java.util.UUID;
import com.docmindai.app.entities.DocumentMetaData;
import org.springframework.data.jpa.repository.JpaRepository;
import com.docmindai.app.enums.DocumentStatus;

public interface DocumentMetaDataRepo extends JpaRepository<DocumentMetaData,UUID> {

	public List<DocumentMetaData> findByStatus(DocumentStatus status);
	public List<DocumentMetaData> findAllByOrderByCreatedAtDesc();
	
}
