package com.arttrident.backend.service;

import com.arttrident.backend.dto.AuthenticationRequest;
import com.arttrident.backend.dto.AuthenticationResponse;
import com.arttrident.backend.dto.RegisterRequest;
import com.arttrident.backend.model.User;
import com.arttrident.backend.repository.UserRepository;
import com.arttrident.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final com.arttrident.backend.repository.VerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthenticationResponse register(RegisterRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (repository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already in use");
        }

        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        var savedUser = repository.save(user);

        // Generate Verification Token
        String token = java.util.UUID.randomUUID().toString();
        var verificationToken = com.arttrident.backend.model.VerificationToken.builder()
                .token(token)
                .user(savedUser)
                .expiryDate(java.time.LocalDateTime.now().plusHours(24))
                .build();
        tokenRepository.save(verificationToken);

        // Send Email
        String verificationUrl = "http://localhost:5173/verify?token=" + token;
        emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getUsername(), verificationUrl);

        return AuthenticationResponse.builder()
                .token("VERIFICATION_REQUIRED") // Signal to frontend that email verify is needed
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!user.isVerified()) {
            throw new IllegalStateException("USER_UNVERIFIED");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));
        
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public void verifyEmail(String token) {
        var verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or missing verification token"));

        if (verificationToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            tokenRepository.delete(verificationToken);
            throw new IllegalStateException("Verification token has expired");
        }

        var user = verificationToken.getUser();
        user.setVerified(true);
        repository.save(user);

        // Clean up token after successful verification
        tokenRepository.delete(verificationToken);
    }
}
