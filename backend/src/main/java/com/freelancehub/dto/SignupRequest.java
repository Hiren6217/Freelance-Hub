package com.freelancehub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private String role = "DEVELOPER"; // Default to DEVELOPER if not provided
}
