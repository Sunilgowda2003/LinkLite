
package com.linklite.auth.dto;

public record AuthResponse(
    String message,
    Long userId,
    String fullName,
    String email,
    String role
) {}
