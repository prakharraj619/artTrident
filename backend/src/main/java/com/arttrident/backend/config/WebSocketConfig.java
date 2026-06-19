package com.arttrident.backend.config;

import com.arttrident.backend.repository.UserRepository;
import com.arttrident.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * ============================================================
 * 🎓 LEARNING NOTE: How WebSocket + STOMP works in Spring Boot
 * ============================================================
 *
 * Regular HTTP (what you use for REST APIs):
 *   React ──POST /api/v1/messages──▶ Server  (one request, one response, connection closes)
 *
 * WebSocket (what we use for real-time chat):
 *   React ◀══════ OPEN PIPE ══════▶ Server  (connection stays open forever, both sides can send anytime)
 *
 * STOMP adds structure on top of the raw WebSocket pipe:
 *   - /app/...   → Messages going TO the server (like sending a chat message)
 *   - /user/...  → Messages pushed FROM the server TO a specific user (private delivery)
 *   - /topic/... → Messages broadcast to everyone subscribed (like a public channel)
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    /**
     * Step 1: Register the WebSocket endpoint.
     * React will connect to: ws://localhost:8080/ws
     * SockJS is a fallback if the browser doesn't support WebSockets (rare, but safe to include).
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:5173")
                .withSockJS();  // Enables SockJS fallback
    }

    /**
     * Step 2: Configure the message routing rules.
     *
     * - enableSimpleBroker("/user") → Enables the in-memory broker for user-specific messages.
     *   When we call messagingTemplate.convertAndSendToUser(username, "/queue/messages", msg),
     *   it gets routed to the user subscribed to /user/{username}/queue/messages
     *
     * - setApplicationDestinationPrefixes("/app") → Any message sent from React to /app/...
     *   will be routed to a @MessageMapping handler in our controller.
     *
     * - setUserDestinationPrefix("/user") → Tells the broker which prefix means "send to a specific user"
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/user");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    /**
     * Step 3: Intercept the WebSocket CONNECT command to authenticate via JWT.
     *
     * 🎓 With regular HTTP, your JwtAuthenticationFilter reads the "Authorization: Bearer <token>" header.
     * WebSockets work differently — the token is passed in STOMP headers during the initial CONNECT frame.
     * This interceptor reads it there and sets up Spring Security's context, just like the HTTP filter does.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                // Only run JWT validation on the initial CONNECT command
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    log.debug("WebSocket CONNECT received. Auth header present: {}", authHeader != null);

                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String jwt = authHeader.substring(7);
                        try {
                            // extractUsername() returns the JWT subject, which is set to the username
                            // (see JwtService.buildToken — .subject(userDetails.getUsername()))
                            // We must match the same lookup strategy as ApplicationConfig.userDetailsService()
                            String subject = jwtService.extractUsername(jwt);
                            var userDetails = userRepository.findByEmail(subject)
                                    .or(() -> userRepository.findByUsername(subject))
                                    .orElseThrow(() -> new RuntimeException("User not found"));

                            if (jwtService.isTokenValid(jwt, userDetails)) {
                                var authToken = new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                                SecurityContextHolder.getContext().setAuthentication(authToken);
                                accessor.setUser(authToken);
                                log.info("WebSocket authenticated for user: {}", userDetails.getUsername());
                            }
                        } catch (Exception e) {
                            log.error("WebSocket JWT authentication failed: {}", e.getMessage());
                            // Returning null would reject the connection
                            return null;
                        }
                    }
                }
                return message;
            }
        });
    }
}
