package com.docmindai.app.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.docmindai.app.entities.Conversation;
import com.docmindai.app.entities.User;

public interface ConversationRepository extends JpaRepository<Conversation,String> {

//	List<ChatMessage> findByConversationIdOrderByCreatedAt(String conversationId);
	
	List<Conversation> findByUserOrderByUpdatedAtDesc(User user);
	Optional<Conversation> findByIdAndUser(String id, User user);
	void deleteByIdAndUser (String id, User user);
}
