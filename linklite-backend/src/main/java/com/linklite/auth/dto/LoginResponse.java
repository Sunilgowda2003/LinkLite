
package com.linklite.auth.dto;

public record LoginResponse(
    String message,
    String accessToken,
    String tokenType,
    long expiresIn,
    Long userId,
    String fullName,
    String email,
    String role
) {}
