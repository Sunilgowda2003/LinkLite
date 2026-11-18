
package com.linklite.url;

import java.time.LocalDateTime;

public record UrlResponse(

    Long id,

    String originalUrl,

    String shortCode,

    String shortUrl,

    LocalDateTime createdAt,

    LocalDateTime expiresAt,

    boolean active,

    String customAlias

) {

}
