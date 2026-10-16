package com.docmindai.app.services;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
//import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.docmindai.app.dtos.MailBody;

@Service
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final String emailApiUrl = "https://mail-sender-helper-api.vercel.app/api/users/generateOTPVerifyMail"; // Replace with actual API

    @Autowired
    @Qualifier("ExternalRestTemplate")
    private RestTemplate restTemplate;
    
    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public String sendSimpleMessage(MailBody mailBody, String id) {
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setTo(mailBody.to());
//        message.setFrom("adityaganji889@gmail.com");
//        message.setSubject(mailBody.subject());
//        message.setText(mailBody.text());
//
//        javaMailSender.send(message);
    	// Build headers
    	//SMTP Render Mail changes starts
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Build body
        Map<String, Object> body = new HashMap<>();
     // Nested user map
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("_id", id);   // assuming you add userId() to MailBody
        userMap.put("email", mailBody.to());
        userMap.put("subject", mailBody.subject());
        userMap.put("text", mailBody.text());
        body.put("user", userMap);
//        body.put("subject", mailBody.subject());
//        body.put("text", mailBody.text());
        body.put("appType","Doc Mind AI Auth");
        body.put("mailType","generateOTP");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
 
        // Send request
//        restTemplate.postForEntity(emailApiUrl, request, String.class);
        try {
            // Capture response as Map
            ResponseEntity<Map> response = restTemplate.postForEntity(emailApiUrl, request, Map.class);

            if (response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Boolean status = (Boolean) responseBody.get("status");
                String message = (String) responseBody.get("message");
                String data = (String) responseBody.get("data"); // could be token or other object
                return data;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
        //SMTP Render Mail changes ends
    }
}