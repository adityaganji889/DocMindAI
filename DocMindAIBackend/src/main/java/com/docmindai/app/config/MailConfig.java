package com.docmindai.app.config;

import java.util.Properties;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class MailConfig {

	@Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        
        //SMTP Render Mail changes starts
//        mailSender.setUsername("SENDER_EMAIL");
//        mailSender.setPassword("SENDER_EMAIL_PASSKEY");
        //SMTP Render Mail changes ends
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", true);
        props.put("mail.smtp.starttls.enable", true);
        props.put("mail.debug", true);
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
        
        return mailSender;
    }

}

