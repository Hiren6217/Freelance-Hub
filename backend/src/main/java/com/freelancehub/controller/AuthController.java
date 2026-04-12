package com.freelancehub.controller;

import com.freelancehub.dto.AuthResponse;
import com.freelancehub.dto.LoginRequest;
import com.freelancehub.dto.OtpRequest;
import com.freelancehub.dto.OtpVerifyRequest;
import com.freelancehub.dto.SignupRequest;
import com.freelancehub.model.User;
import com.freelancehub.repository.UserRepository;
import com.freelancehub.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private static final int OTP_EXPIRY_MINUTES = 10;

    private static String generateOtpCode() {
        int code = new Random().nextInt(900_000) + 100_000;
        return String.valueOf(code);
    }

    private User saveOtp(User user, String purpose) {
        user.setOtpCode(generateOtpCode());
        user.setOtpExpiry(LocalDateTime.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES));
        user.setOtpPurpose(purpose);
        return userRepository.save(user);
    }

    private boolean sendOtpEmail(User user, String purpose) {
        try {
            emailService.sendOtpEmail(user.getEmail(), user.getOtpCode(), purpose);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send OTP email to " + user.getEmail() + ": " + e.getMessage());
            return false;
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        Map<String, String> response = new HashMap<>();

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            response.put("error", "Email already registered");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        String role = signupRequest.getRole();
        if (role == null || (!role.equals("CLIENT") && !role.equals("DEVELOPER") && !role.equals("ADMIN"))) {
            role = "DEVELOPER";
        }

        User user = new User();
        user.setName(signupRequest.getName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole(role);
        user.setReferralScore(0);
        user.setEmailVerified(false);

        userRepository.save(user);
        user = saveOtp(user, "SIGNUP");
        boolean emailSent = sendOtpEmail(user, "signup verification");

        response.put("message", "Signup successful. Verify your email with the OTP sent to you.");
        response.put("email", user.getEmail());
        if (!emailSent) {
            response.put("warning", "Email delivery failed. Use the OTP code returned in this response.");
            response.put("otp", user.getOtpCode());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify-signup")
    public ResponseEntity<?> verifySignup(@RequestBody OtpVerifyRequest request) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        User user = userOptional.get();
        if (user.getOtpCode() == null
                || user.getOtpExpiry() == null
                || user.getOtpPurpose() == null
                || !user.getOtpPurpose().equals("SIGNUP")) {
            response.put("error", "No signup OTP pending for this user");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            response.put("error", "OTP expired. Please sign up again or request a new OTP.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (!user.getOtpCode().equals(request.getCode())) {
            response.put("error", "Invalid OTP code");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        user.setOtpPurpose(null);
        userRepository.save(user);

        response.put("message", "Email verified successfully. You can now sign in.");
        response.put("email", user.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Map<String, String> response = new HashMap<>();

        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        if (userOptional.isEmpty()) {
            response.put("error", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        User user = userOptional.get();
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            response.put("error", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        if (!user.isEmailVerified()) {
            response.put("error", "Email not verified");
            response.put("email", user.getEmail());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

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

    @PostMapping("/request-login-otp")
    public ResponseEntity<?> requestLoginOtp(@RequestBody OtpRequest request) {
        Map<String, String> response = new HashMap<>();

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        User user = userOptional.get();
        if (!user.isEmailVerified()) {
            response.put("error", "Email not verified. Please complete signup verification first.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        user = saveOtp(user, "LOGIN");
        boolean emailSent = sendOtpEmail(user, "login");
        response.put("message", "A login OTP has been sent to your email.");
        if (!emailSent) {
            response.put("warning", "Email delivery failed. Use the OTP code returned in this response.");
            response.put("otp", user.getOtpCode());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-login-otp")
    public ResponseEntity<?> verifyLoginOtp(@RequestBody OtpVerifyRequest request) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        User user = userOptional.get();
        if (user.getOtpCode() == null
                || user.getOtpExpiry() == null
                || user.getOtpPurpose() == null
                || !user.getOtpPurpose().equals("LOGIN")) {
            response.put("error", "No login OTP pending for this user");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            response.put("error", "OTP expired. Request a new code.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (!user.getOtpCode().equals(request.getCode())) {
            response.put("error", "Invalid OTP code");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        user.setOtpCode(null);
        user.setOtpExpiry(null);
        user.setOtpPurpose(null);
        userRepository.save(user);

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
