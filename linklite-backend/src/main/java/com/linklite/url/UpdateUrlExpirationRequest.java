
package com.linklite.url;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;

public record UpdateUrlExpirationRequest(

    @Future(message = "Expiration date must be in the future")
    LocalDateTime expiresAt

) {
}
