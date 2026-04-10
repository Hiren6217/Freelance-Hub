package com.freelancehub.controller;

import com.freelancehub.dto.AuthResponse;
import com.freelancehub.dto.LoginRequest;
import com.freelancehub.dto.SignupRequest;
import com.freelancehub.model.User;
import com.freelancehub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        Map<String, String> response = new HashMap<>();

        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            response.put("error", "Email already registered");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        // Validate role
        String role = signupRequest.getRole();
        if (role == null || (!role.equals("CLIENT") && !role.equals("DEVELOPER"))) {
            role = "DEVELOPER"; // Default to DEVELOPER
        }

        // Create new user
        User user = new User();
        user.setName(signupRequest.getName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole(role);
        user.setReferralScore(0);

        userRepository.save(user);

        response.put("message", "User registered successfully");
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Map<String, String> response = new HashMap<>();

        // Find user by email
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        
        if (userOptional.isEmpty()) {
            response.put("error", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        User user = userOptional.get();

        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            response.put("error", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Create a simple token (in production, use JWT)
        String token = "token_" + user.getId() + "_" + System.currentTimeMillis();

        AuthResponse authResponse = AuthResponse.builder()
                .message("Login successful")
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();

        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestParam String token) {
        Map<String, Object> response = new HashMap<>();
        
        // Simple token verification (in production, verify JWT properly)
        if (token != null && token.startsWith("token_")) {
            try {
                String[] parts = token.split("_");
                Long userId = Long.parseLong(parts[1]);
                
                Optional<User> userOptional = userRepository.findById(userId);
                
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    response.put("valid", true);
                    response.put("userId", user.getId());
                    response.put("email", user.getEmail());
                    response.put("name", user.getName());
                    response.put("role", user.getRole());
                    return ResponseEntity.ok(response);
                }
            } catch (Exception e) {
                // Invalid token format
            }
        }
        
        response.put("valid", false);
        response.put("error", "Invalid or expired token");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
}
