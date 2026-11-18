
package com.linklite.analytics;

public record UrlComparisonProjection(
        Long urlId,
        String shortCode,
        String originalUrl,
        Long totalClicks,
        Long currentPeriodClicks,
        Long previousPeriodClicks
) {
}
