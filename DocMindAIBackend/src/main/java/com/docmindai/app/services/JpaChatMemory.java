package com.docmindai.app.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Collections;
import java.util.Comparator;

import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.docmindai.app.repositories.ChatMessageRepository;
import com.docmindai.app.repositories.ConversationRepository;


import com.docmindai.app.entities.ChatMessage;
import com.docmindai.app.entities.Conversation;
import com.docmindai.app.enums.MessageType;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class JpaChatMemory implements ChatMemory {
	
	private final ChatMessageRepository chatMessageRepository;
	
	private final ConversationRepository conversationRepository;
	
	@Transactional
	@Override
	public void add(String conversationId, List<Message> messages) {
		// TODO Auto-generated method stub
		if(messages == null || messages.isEmpty()) {
			return;
		}
		
		// Get or create a new conversation
		
		Conversation conversation = conversationRepository.findById(conversationId)
				                    .orElseGet(()->{
				                    	log.warn("Conversation {} not found when adding messages. Creating placeholder.",conversationId);
				                    	return conversationRepository.save(
				                    			   Conversation.builder()
				                    			               .id(conversationId)
				                    			               .title("New Conversation")
				                    			               .createdAt(LocalDateTime.now())
				                    			               .updatedAt(LocalDateTime.now())
				                    			               .build()
				                    			);
				                    });
		
		for(Message msg : messages) {
			MessageType type = switch(msg.getMessageType()) {
			case USER -> MessageType.USER;
			case ASSISTANT -> MessageType.ASSISTANT;
			case SYSTEM -> MessageType.SYSTEM;
			default -> MessageType.USER;
			};
			
			ChatMessage chatMessage = ChatMessage.builder()
					                             .conversation(conversation)
					                             .messageType(type)
					                             .content(msg.getText())
					                             .createdAt(LocalDateTime.now())
					                             .build();
			
			chatMessageRepository.save(chatMessage);
		}
		
		conversation.setUpdatedAt(LocalDateTime.now());
		conversationRepository.save(conversation);
		
	}

	@Override
	@Transactional(readOnly = true)
	public List<Message> get(String conversationId) {
		// TODO Auto-generated method stub
		List<ChatMessage> all = chatMessageRepository.findLastNMessages(conversationId,10);
		if(all == null || all.isEmpty()) {
			return Collections.emptyList();
		}
//		Collections.reverse(all);
		all.sort(Comparator.comparing(ChatMessage::getCreatedAt).reversed());
		List<Message> springAIMessages = new ArrayList<Message>();
		for(ChatMessage chatMessage : all) {
			switch(chatMessage.getMessageType()) {
			  case USER -> springAIMessages.add(new UserMessage(chatMessage.getContent()));
			  case ASSISTANT -> springAIMessages.add(new AssistantMessage(chatMessage.getContent()));
			  case SYSTEM -> springAIMessages.add(new SystemMessage(chatMessage.getContent()));
			}
		}
		return springAIMessages;
	}

	@Override
	public void clear(String conversationId) {
		// TODO Auto-generated method stub
		chatMessageRepository.deleteByConversation_Id(conversationId);
	}
	
}
