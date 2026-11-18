
package com.linklite.analytics;

import java.time.LocalDateTime;
import com.linklite.url.UrlMapping;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

public interface ClickEventRepository
        extends JpaRepository<ClickEvent, Long> {

    // Total clicks for one URL
    long countByUrlMapping_Id(Long urlMappingId);

    // Total clicks for all URLs owned by a user
    long countByUrlMapping_User_Id(Long userId);

    // User's click events from a given starting date
    List<ClickEvent>
    findAllByUrlMapping_User_IdAndClickedAtGreaterThanEqualOrderByClickedAtAsc(
            Long userId,
            LocalDateTime since
    );

    // User's click events within a selected date range
    List<ClickEvent>
    findAllByUrlMapping_User_IdAndClickedAtGreaterThanEqualAndClickedAtLessThanOrderByClickedAtAsc(
            Long userId,
            LocalDateTime start,
            LocalDateTime end
    );
    
 // Latest click activity for a specific user
    List<ClickEvent> findAllByUrlMapping_User_IdOrderByClickedAtDesc(
            Long userId,
            Pageable pageable
    );

    // Click events for one URL within a date range
    List<ClickEvent>
    findAllByUrlMapping_IdAndClickedAtGreaterThanEqualOrderByClickedAtAsc(
            Long urlMappingId,
            LocalDateTime since
    );

    // Top five most-clicked URLs belonging to a user
    @Query("""
        SELECT new com.linklite.analytics.TopUrlResponse(
            u.id,
            u.shortCode,
            u.originalUrl,
            COUNT(c.id)
        )
        FROM ClickEvent c
        JOIN c.urlMapping u
        WHERE u.user.id = :userId
        GROUP BY u.id, u.shortCode, u.originalUrl
        ORDER BY COUNT(c.id) DESC
        """)
    List<TopUrlResponse> findTopUrlsByUserId(
            @Param("userId") Long userId,
            org.springframework.data.domain.Pageable pageable
    );
    
 // URL performance comparison for an authenticated user's URLs
    @Query("""
        SELECT new com.linklite.analytics.UrlComparisonProjection(
            u.id,
            u.shortCode,
            u.originalUrl,
            COUNT(c.id),
            SUM(
                CASE
                    WHEN c.clickedAt >= :currentStart
                     AND c.clickedAt < :currentEnd
                    THEN 1L
                    ELSE 0L
                END
            ),
            SUM(
                CASE
                    WHEN c.clickedAt >= :previousStart
                     AND c.clickedAt < :previousEnd
                    THEN 1L
                    ELSE 0L
                END
            )
        )
        FROM UrlMapping u
        LEFT JOIN ClickEvent c ON c.urlMapping.id = u.id
        WHERE u.user.id = :userId
        GROUP BY u.id, u.shortCode, u.originalUrl
        ORDER BY COUNT(c.id) DESC
        """)
    List<UrlComparisonProjection> findUrlPerformanceComparison(
            @Param("userId") Long userId,
            @Param("currentStart") LocalDateTime currentStart,
            @Param("currentEnd") LocalDateTime currentEnd,
            @Param("previousStart") LocalDateTime previousStart,
            @Param("previousEnd") LocalDateTime previousEnd
    );
}
