package com.linklite.analytics;

import java.time.LocalDateTime;

public record RecentClickResponse(
        Long id,
        String shortCode,
        String originalUrl,
        LocalDateTime clickedAt
) {
}