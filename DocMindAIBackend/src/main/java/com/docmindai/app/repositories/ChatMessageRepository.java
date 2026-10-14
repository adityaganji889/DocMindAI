package com.docmindai.app.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.docmindai.app.entities.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage,Long> {

	List<ChatMessage> findByConversation_IdOrderByCreatedAt(String conversationId);
	
	@Query(value = "SELECT * FROM chat_messages where conversation_id =  :conversationId ORDER BY created_at DESC LIMIT :lastN", nativeQuery = true)
	List<ChatMessage> findLastNMessages(@Param("conversationId") String conversationId, @Param("lastN") int lastN);
	
	void deleteByConversation_Id(String conversationId);
}
