
package com.linklite.analytics;

public record TopUrlResponse(
        Long id,
        String shortCode,
        String originalUrl,
        long totalClicks
) {
}
