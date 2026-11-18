
package com.linklite.analytics;

public record UrlComparisonResponse(
        Long urlId,
        String shortCode,
        String originalUrl,
        long totalClicks,
        long currentPeriodClicks,
        long previousPeriodClicks,
        Double growthPercentage
) {
}
