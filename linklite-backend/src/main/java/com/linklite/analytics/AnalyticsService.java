
package com.linklite.analytics;

import java.time.LocalDate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.linklite.url.UrlMapping;
import com.linklite.url.UrlRepository;
import com.linklite.user.User;
import com.linklite.user.UserRepository;



@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final ClickEventRepository clickEventRepository;
    private final UrlRepository urlRepository;
    private final UserRepository userRepository;

    public AnalyticsService(
            ClickEventRepository clickEventRepository,
            UrlRepository urlRepository,
            UserRepository userRepository) {

        this.clickEventRepository = clickEventRepository;
        this.urlRepository = urlRepository;
        this.userRepository = userRepository;
    }

    // Overall analytics summary
    public AnalyticsSummaryResponse getSummary(String email) {

        User user = findUserByEmail(email);

        long totalUrls =
                urlRepository.countByUser_Id(user.getId());

        long totalClicks =
                clickEventRepository.countByUrlMapping_User_Id(
                        user.getId()
                );

        return new AnalyticsSummaryResponse(
                totalUrls,
                totalClicks
        );
    }

    // Daily clicks with selectable date ranges
    public List<DailyClickResponse> getDailyClicks(
            String email,
            String range,
            LocalDate startDate,
            LocalDate endDate) {

        User user = findUserByEmail(email);

        LocalDate today = LocalDate.now();

        LocalDate selectedStart;
        LocalDate selectedEnd;

        // Custom date range
        if (startDate != null || endDate != null) {

            if (startDate == null || endDate == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Both startDate and endDate are required"
                );
            }

            if (range != null && !range.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Use either range or custom dates, not both"
                );
            }

            selectedStart = startDate;
            selectedEnd = endDate;

        } else {

            // Default range
            String selectedRange =
                    range == null || range.isBlank()
                            ? "7d"
                            : range.toLowerCase();

            switch (selectedRange) {

                case "today":
                    selectedStart = today;
                    selectedEnd = today;
                    break;

                case "7d":
                    selectedStart = today.minusDays(6);
                    selectedEnd = today;
                    break;

                case "30d":
                    selectedStart = today.minusDays(29);
                    selectedEnd = today;
                    break;

                default:
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Invalid range. Use today, 7d or 30d"
                    );
            }
        }

        // Validate date range
        if (selectedStart.isAfter(selectedEnd)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "startDate cannot be after endDate"
            );
        }

        if (selectedEnd.isAfter(today)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Future dates are not allowed"
            );
        }

        long days = java.time.temporal.ChronoUnit.DAYS.between(
                selectedStart,
                selectedEnd
        ) + 1;

        if (days > 365) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Date range cannot exceed 365 days"
            );
        }

        // End is exclusive, so include the entire end date
        LocalDateTime startDateTime =
                selectedStart.atStartOfDay();

        LocalDateTime endDateTime =
                selectedEnd.plusDays(1).atStartOfDay();

        // Fetch only this authenticated user's click events
        List<ClickEvent> events =
                clickEventRepository
                        .findAllByUrlMapping_User_IdAndClickedAtGreaterThanEqualAndClickedAtLessThanOrderByClickedAtAsc(
                                user.getId(),
                                startDateTime,
                                endDateTime
                        );

        // Group clicks by calendar date
        Map<LocalDate, Long> clickCounts =
                events.stream()
                        .collect(Collectors.groupingBy(
                                event -> event.getClickedAt().toLocalDate(),
                                TreeMap::new,
                                Collectors.counting()
                        ));

        // Include dates with zero clicks
        List<DailyClickResponse> result = new ArrayList<>();

        for (LocalDate date = selectedStart;
             !date.isAfter(selectedEnd);
             date = date.plusDays(1)) {

            result.add(new DailyClickResponse(
                    date,
                    clickCounts.getOrDefault(date, 0L)
            ));
        }

        return result;
    }

    // Top five most-clicked URLs
    public List<TopUrlResponse> getTopUrls(String email) {

        User user = findUserByEmail(email);

        return clickEventRepository.findTopUrlsByUserId(
                user.getId(),
                PageRequest.of(0, 5)
        );
    }

    // Individual URL analytics
    public UrlAnalyticsResponse getUrlAnalytics(
            Long urlId,
            String email) {

        User user = findUserByEmail(email);

        UrlMapping mapping = urlRepository
                .findByIdAndUser_Id(urlId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "URL not found"
                ));

        long totalClicks =
                clickEventRepository.countByUrlMapping_Id(urlId);

        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(6);

        List<ClickEvent> events =
                clickEventRepository
                        .findAllByUrlMapping_IdAndClickedAtGreaterThanEqualOrderByClickedAtAsc(
                                urlId,
                                startDate.atStartOfDay()
                        );

        Map<LocalDate, Long> clickCounts =
                events.stream()
                        .collect(Collectors.groupingBy(
                                event -> event.getClickedAt().toLocalDate(),
                                TreeMap::new,
                                Collectors.counting()
                        ));

        List<DailyClickResponse> dailyClicks = new ArrayList<>();

        for (LocalDate date = startDate;
             !date.isAfter(today);
             date = date.plusDays(1)) {

            dailyClicks.add(new DailyClickResponse(
                    date,
                    clickCounts.getOrDefault(date, 0L)
            ));
        }

        return new UrlAnalyticsResponse(
                mapping.getId(),
                mapping.getShortCode(),
                mapping.getOriginalUrl(),
                totalClicks,
                events.size(),
                dailyClicks
        );
    }
    
    
 // Latest 10 click activities for authenticated user
    public List<RecentClickResponse> getRecentClicks(String email) {

        User user = findUserByEmail(email);

        List<ClickEvent> events =
                clickEventRepository
                        .findAllByUrlMapping_User_IdOrderByClickedAtDesc(
                                user.getId(),
                                PageRequest.of(0, 10)
                        );

        return events.stream()
                .map(event -> new RecentClickResponse(
                        event.getId(),
                        event.getUrlMapping().getShortCode(),
                        event.getUrlMapping().getOriginalUrl(),
                        event.getClickedAt()
                ))
                .toList();
    }
    

    // URL performance comparison
    public List<UrlComparisonResponse> getUrlPerformanceComparison(
            String email,
            String range,
            LocalDate startDate,
            LocalDate endDate) {

        User user = findUserByEmail(email);

        LocalDate today = LocalDate.now();

        LocalDate selectedStart;
        LocalDate selectedEnd;

        // Custom date range
        if (startDate != null || endDate != null) {

            if (startDate == null || endDate == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Both startDate and endDate are required"
                );
            }

            if (range != null && !range.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Use either range or custom dates, not both"
                );
            }

            selectedStart = startDate;
            selectedEnd = endDate;

        } else {

            String selectedRange =
                    range == null || range.isBlank()
                            ? "7d"
                            : range.toLowerCase();

            switch (selectedRange) {

                case "today":
                    selectedStart = today;
                    selectedEnd = today;
                    break;

                case "7d":
                    selectedStart = today.minusDays(6);
                    selectedEnd = today;
                    break;

                case "30d":
                    selectedStart = today.minusDays(29);
                    selectedEnd = today;
                    break;

                default:
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Invalid range. Use today, 7d or 30d"
                    );
            }
        }

        // Validate selected dates
        if (selectedStart.isAfter(selectedEnd)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "startDate cannot be after endDate"
            );
        }

        if (selectedEnd.isAfter(today)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Future dates are not allowed"
            );
        }

        long days = java.time.temporal.ChronoUnit.DAYS.between(
                selectedStart,
                selectedEnd
        ) + 1;

        if (days > 365) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Date range cannot exceed 365 days"
            );
        }

        // Current period boundaries
        LocalDateTime currentStart =
                selectedStart.atStartOfDay();

        LocalDateTime currentEnd =
                selectedEnd.plusDays(1).atStartOfDay();

        // Previous period: same number of days
        LocalDateTime previousStart =
                selectedStart.minusDays(days).atStartOfDay();

        LocalDateTime previousEnd =
                currentStart;

        // Fetch comparison data for this authenticated user
        List<UrlComparisonProjection> projections =
                clickEventRepository.findUrlPerformanceComparison(
                        user.getId(),
                        currentStart,
                        currentEnd,
                        previousStart,
                        previousEnd
                );

        // Calculate growth percentage
        return projections.stream()
                .map(item -> {

                    long totalClicks =
                            item.totalClicks() == null
                                    ? 0L
                                    : item.totalClicks();

                    long currentClicks =
                            item.currentPeriodClicks() == null
                                    ? 0L
                                    : item.currentPeriodClicks();

                    long previousClicks =
                            item.previousPeriodClicks() == null
                                    ? 0L
                                    : item.previousPeriodClicks();

                    Double growthPercentage = null;

                    if (previousClicks > 0) {

                        growthPercentage =
                                ((currentClicks - previousClicks)
                                        * 100.0) / previousClicks;

                    } else if (currentClicks == 0) {

                        growthPercentage = 0.0;
                    }

                    return new UrlComparisonResponse(
                            item.urlId(),
                            item.shortCode(),
                            item.originalUrl(),
                            totalClicks,
                            currentClicks,
                            previousClicks,
                            growthPercentage
                    );
                })
                .toList();
    }


    // Find authenticated user
    private User findUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"
                ));
    }
}
