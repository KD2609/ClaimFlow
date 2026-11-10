package com.orproject.claim.dto;

import com.orproject.claim.model.Role;

public class AuthResponse {
    private Long id;
    private String username;
    private String fullName;
    private Role role;
    private String token;

    public AuthResponse() {}

    public AuthResponse(Long id, String username, String fullName, Role role, String token) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.token = token;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
