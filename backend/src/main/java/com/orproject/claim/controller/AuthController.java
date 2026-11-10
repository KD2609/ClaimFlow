package com.orproject.claim.controller;

import com.orproject.claim.dto.AuthResponse;
import com.orproject.claim.dto.LoginRequest;
import com.orproject.claim.model.User;
import com.orproject.claim.security.JwtService;
import com.orproject.claim.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserService userService, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        boolean valid = userService.validateCredentials(request.getUsername(), request.getPassword(), passwordEncoder);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }

        User user = userService.findByUsername(request.getUsername()).get();
        String token = jwtService.generateToken(user);

        AuthResponse response = new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                token
        );
        return ResponseEntity.ok(response);
    }
}
