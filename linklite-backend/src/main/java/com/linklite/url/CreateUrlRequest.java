
package com.linklite.url;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateUrlRequest(

    @NotBlank(message = "URL is required")
    @Size(max = 2048, message = "URL must not exceed 2048 characters")
    String originalUrl,

    @Future(message = "Expiration date must be in the future")
    LocalDateTime expiresAt,

    @Size(max = 30, message = "Custom alias must not exceed 30 characters")
    @Pattern(
        regexp = "^[a-zA-Z0-9_-]{3,30}$",
        message = "Alias must contain 3-30 letters, numbers, hyphens or underscores"
    )
    String customAlias

) {
}
