package com.arttrident.backend.controller;

import com.arttrident.backend.dto.AuthenticationRequest;
import com.arttrident.backend.dto.AuthenticationResponse;
import com.arttrident.backend.dto.RegisterRequest;
import com.arttrident.backend.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @org.springframework.web.bind.annotation.GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@org.springframework.web.bind.annotation.RequestParam("token") String token) {
        service.verifyEmail(token);
        return ResponseEntity.ok("Email verified successfully");
    }
}
