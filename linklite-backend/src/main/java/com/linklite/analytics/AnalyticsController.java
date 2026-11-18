
package com.linklite.analytics;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // GET /api/analytics/summary
    @GetMapping("/summary")
    public AnalyticsSummaryResponse getSummary(Principal principal) {
        return analyticsService.getSummary(principal.getName());
    }

    // GET /api/analytics/daily
    // Supports today, 7d, 30d and custom date ranges
    @GetMapping("/daily")
    public List<DailyClickResponse> getDailyClicks(
            Principal principal,

            @RequestParam(required = false)
            String range,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {

        return analyticsService.getDailyClicks(
                principal.getName(),
                range,
                startDate,
                endDate
        );
    }

    // GET /api/analytics/top-urls
    @GetMapping("/top-urls")
    public List<TopUrlResponse> getTopUrls(Principal principal) {
        return analyticsService.getTopUrls(principal.getName());
    }

    // GET /api/analytics/urls/{id}
    @GetMapping("/urls/{id}")
    public UrlAnalyticsResponse getUrlAnalytics(
            @PathVariable Long id,
            Principal principal) {

        return analyticsService.getUrlAnalytics(
                id,
                principal.getName()
        );
    }
    
 // GET /api/analytics/recent-clicks
    @GetMapping("/recent-clicks")
    public List<RecentClickResponse> getRecentClicks(
            Principal principal) {

        return analyticsService.getRecentClicks(
                principal.getName()
        );
    }
    

    // GET /api/analytics/comparison
    // Compare URL performance across current and previous periods
    @GetMapping("/comparison")
    public List<UrlComparisonResponse> getUrlPerformanceComparison(
            Principal principal,

            @RequestParam(required = false)
            String range,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {

        return analyticsService.getUrlPerformanceComparison(
                principal.getName(),
                range,
                startDate,
                endDate
        );
    }

}
