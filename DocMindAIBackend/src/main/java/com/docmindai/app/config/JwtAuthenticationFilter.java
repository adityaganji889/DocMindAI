package com.docmindai.app.config;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.docmindai.app.entities.User;
import com.docmindai.app.repositories.UserRepository;
import com.docmindai.app.services.CustomUserDetail;
import com.docmindai.app.services.CustomUserDetailService;
import com.docmindai.app.services.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;


@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	
	private final CustomUserDetailService userDetailService;
	
	private final UserRepository userRepository;
	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws IOException, ServletException {
		
		//Logic to implement validations and other stuff
		
		String authHeader = request.getHeader("Authorization");
		if(authHeader==null || !authHeader.startsWith("Bearer ")) {
		   filterChain.doFilter(request, response);
		   return;
		}
		
		String token = authHeader.substring(7);
		
		String username = null;
        try {
		   username = jwtService.extractUsername(token);
		   if(username == null || jwtService.isTokenValid(token, userDetailService.loadUserByUsername(username))) {
			   filterChain.doFilter(request, response);
			   return;
		   }
		   //Setting security context
		   User user = userRepository.findByUsername(username).orElseThrow(()->new RuntimeException("User not found"));
		   CustomUserDetail userModified = new CustomUserDetail(user);
		   Authentication authentication = new UsernamePasswordAuthenticationToken(user,null,userModified.getAuthorities());
		   
		   ((AbstractAuthenticationToken) authentication).setDetails(
			  new WebAuthenticationDetailsSource().buildDetails(request)	   
		   );
		   
		   SecurityContextHolder.getContext().setAuthentication(authentication);
			
		}
		catch(Exception e) {
			filterChain.doFilter(request, response);
			e.printStackTrace();
			return;
		}
		filterChain.doFilter(request, response);
	}
	
	
}
