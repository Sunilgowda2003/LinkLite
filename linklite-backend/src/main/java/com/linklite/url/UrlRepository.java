
package com.linklite.url;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UrlRepository extends JpaRepository<UrlMapping, Long> {

    // Find URL by short code (used for public redirection)
    Optional<UrlMapping> findByShortCode(String shortCode);

    // Check whether a short code already exists
    boolean existsByShortCode(String shortCode);

    // Find the latest 50 URLs
    List<UrlMapping> findTop50ByOrderByCreatedAtDesc();

    // Find URLs belonging to a specific user
    List<UrlMapping> findTop50ByUser_IdOrderByCreatedAtDesc(Long userId);

    // Find a URL by ID and owner
    Optional<UrlMapping> findByIdAndUser_Id(Long id, Long userId);

    // Find a URL by short code and owner
    Optional<UrlMapping> findByShortCodeAndUser_Id(
            String shortCode,
            Long userId
    );

    // Count URLs belonging to a specific user
    long countByUser_Id(Long userId);

    // Automatically deactivate expired URLs
    @Modifying
    @Query("""
        UPDATE UrlMapping u
        SET u.active = false
        WHERE u.active = true
          AND u.expiresAt IS NOT NULL
          AND u.expiresAt <= :now
        """)
    int deactivateExpiredUrls(@Param("now") LocalDateTime now);
}
