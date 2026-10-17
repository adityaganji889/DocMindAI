package com.docmindai.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.docmindai.app.enums.Role;

import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) {
		return configuration.getAuthenticationManager();
	}
	
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) {
		
		
		//customization
	   
		httpSecurity.csrf(AbstractHttpConfigurer::disable)
		            .cors(Customizer.withDefaults())
		            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
		            .authorizeHttpRequests(
		               auth -> auth
		                       .dispatcherTypeMatchers(DispatcherType.ASYNC).permitAll()
		                       .requestMatchers("/api/v1/auth/**",
		                    		            "/v3/api-docs/**",
		                    		            "/swagger-ui/**",
		                    		            "/swagger-ui.html").permitAll()
		                       .requestMatchers("/api/v1/admin/**").hasRole(Role.ADMIN.toString())
		                       .requestMatchers("/api/v1/documents/**").hasAnyRole(Role.USER.toString(),Role.ADMIN.toString())
		                       .requestMatchers("/api/v1/chat/**").hasAnyRole(Role.USER.toString(),Role.ADMIN.toString())
		                       .anyRequest().authenticated()	
		            )
		            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
		            .exceptionHandling(
		              exception -> exception.authenticationEntryPoint((request,response,authException)->{
		            	  System.out.println("Unauthorized");
		            	  response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unauthorized");  
		              })		
		            );
		
		return httpSecurity.build();
	}
	
}
