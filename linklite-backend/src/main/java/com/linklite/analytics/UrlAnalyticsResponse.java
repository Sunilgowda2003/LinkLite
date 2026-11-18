
package com.linklite.analytics;

import java.util.List;

public record UrlAnalyticsResponse(
        Long urlId,
        String shortCode,
        String originalUrl,
        long totalClicks,
        long clicksLast7Days,
        List<DailyClickResponse> dailyClicks
) {
}
