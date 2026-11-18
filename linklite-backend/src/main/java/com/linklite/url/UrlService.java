
package com.linklite.url;

import java.net.URI;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.linklite.analytics.ClickEvent;
import com.linklite.analytics.ClickEventRepository;
import com.linklite.user.User;
import com.linklite.user.UserRepository;

@Service
public class UrlService {

    private static final String CHARACTERS =
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    private static final int CODE_LENGTH = 7;

    private final SecureRandom random = new SecureRandom();

    private final UrlRepository urlRepository;
    private final UserRepository userRepository;
    private final ClickEventRepository clickEventRepository;
    private final String baseUrl;

    public UrlService(
            UrlRepository urlRepository,
            UserRepository userRepository,
            ClickEventRepository clickEventRepository,
            @Value("${linklite.base-url}") String baseUrl) {

        this.urlRepository = urlRepository;
        this.userRepository = userRepository;
        this.clickEventRepository = clickEventRepository;
        this.baseUrl = baseUrl.replaceAll("/+$", "");
    }

    // Create short URL

    // Create short URL with optional expiration

public UrlResponse createShortUrl(
        String originalUrl,
        LocalDateTime expiresAt,
        String customAlias,
        String email) {

    User user = findUserByEmail(email);

    String validatedUrl = validateUrl(originalUrl);

    // Validate expiration date
    if (expiresAt != null && !expiresAt.isAfter(LocalDateTime.now())) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Expiration date must be in the future"
        );
    }

    String code;
    String alias = null;

    // Use custom alias when provided
    if (customAlias != null && !customAlias.isBlank()) {

        alias = customAlias.trim().toLowerCase(java.util.Locale.ROOT);

        if (!alias.matches("^[a-zA-Z0-9_-]{3,30}$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Alias must contain 3-30 letters, numbers, hyphens or underscores"
            );
        }

        // Check whether the alias is already used
        if (urlRepository.existsByShortCode(alias)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This custom alias is already taken"
            );
        }

        code = alias;

    } else {

        // Generate random seven-character code
        do {
            code = generateCode();
        } while (urlRepository.existsByShortCode(code));
    }

    UrlMapping mapping = new UrlMapping(validatedUrl, code, user);

    mapping.setCustomAlias(alias);
    mapping.setExpiresAt(expiresAt);

    return toResponse(urlRepository.save(mapping));
}



    // Get recent URLs belonging to the authenticated user
    public List<UrlResponse> getRecentUrls(String email) {

        User user = findUserByEmail(email);

        return urlRepository
                .findTop50ByUser_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Get total URLs
    public long getTotalUrls(String email) {

        User user = findUserByEmail(email);

        return urlRepository.countByUser_Id(user.getId());
    }

    // Get URL details for the authenticated owner
    public UrlResponse getByCode(String code, String email) {

        User user = findUserByEmail(email);

        UrlMapping mapping = urlRepository
                .findByShortCodeAndUser_Id(code, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "URL not found"
                ));

        return toResponse(mapping);
    }

    // Get original URL and record click analytics

    // Get original URL and record click analytics
 // Get original URL and handle click analytics,
 // inactive links and expired links
 @Transactional(noRollbackFor = ResponseStatusException.class)
 public String getOriginalUrl(String code) {

     UrlMapping mapping = urlRepository.findByShortCode(code)
             .orElseThrow(() -> new ResponseStatusException(
                     HttpStatus.NOT_FOUND,
                     "Short URL not found"
             ));

     // Check whether the URL is deactivated
     if (!mapping.isActive()) {
         throw new ResponseStatusException(
                 HttpStatus.GONE,
                 "This short URL has been deactivated"
         );
     }

     // Check whether the URL has expired
     if (mapping.getExpiresAt() != null
             && !mapping.getExpiresAt().isAfter(LocalDateTime.now())) {

         mapping.setActive(false);
         urlRepository.save(mapping);

         throw new ResponseStatusException(
                 HttpStatus.GONE,
                 "This short URL has expired"
         );
     }

     // Record click only for valid URLs
     ClickEvent clickEvent = new ClickEvent(mapping);
     clickEventRepository.save(clickEvent);

     return mapping.getOriginalUrl();
 }

    // Delete URL belonging to authenticated user
    @Transactional
    public void deleteUrl(Long id, String email) {

        User user = findUserByEmail(email);

        UrlMapping mapping = urlRepository
                .findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "URL not found"));

        urlRepository.delete(mapping);
    }

    // Find authenticated user
    private User findUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));
    }

    // Generate seven-character short code
    private String generateCode() {

        StringBuilder code = new StringBuilder(CODE_LENGTH);

        for (int i = 0; i < CODE_LENGTH; i++) {

            code.append(CHARACTERS.charAt(
                    random.nextInt(CHARACTERS.length())));
        }

        return code.toString();
    }

    // Validate original URL
    private String validateUrl(String value) {

        try {

            URI uri = URI.create(value.trim());

            String scheme = uri.getScheme();

            if (uri.getHost() == null
                    || scheme == null
                    || !(scheme.equalsIgnoreCase("http")
                    || scheme.equalsIgnoreCase("https"))) {

                throw new IllegalArgumentException("Invalid URL");
            }

            return uri.toASCIIString();

        } catch (IllegalArgumentException ex) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter a valid HTTP or HTTPS URL");
        }
    }

    // Convert entity into response DTO

    // Convert entity into response DTO

private UrlResponse toResponse(UrlMapping mapping) {

    return new UrlResponse(
            mapping.getId(),
            mapping.getOriginalUrl(),
            mapping.getShortCode(),
            baseUrl + "/" + mapping.getShortCode(),
            mapping.getCreatedAt(),
            mapping.getExpiresAt(),
            mapping.isActive(),
            mapping.getCustomAlias()
    );
}

    

    // Activate or deactivate a URL owned by the authenticated user

@Transactional
public UrlResponse updateUrlStatus(
        Long id,
        boolean active,
        String email) {

    User user = findUserByEmail(email);

    UrlMapping mapping = urlRepository
            .findByIdAndUser_Id(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "URL not found"
            ));

    // Prevent activation of expired URLs
    if (active
            && mapping.getExpiresAt() != null
            && !mapping.getExpiresAt().isAfter(LocalDateTime.now())) {

        throw new ResponseStatusException(
                HttpStatus.GONE,
                "Expired URLs cannot be activated. Update the expiration date first."
        );
    }

    mapping.setActive(active);

    return toResponse(urlRepository.save(mapping));
}



    // Update or remove expiration for a URL owned by the authenticated user
    @Transactional
    public UrlResponse updateUrlExpiration(
            Long id,
            LocalDateTime expiresAt,
            String email) {

        User user = findUserByEmail(email);

        UrlMapping mapping = urlRepository
                .findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "URL not found"
                ));

        // Validate expiration date when provided
        if (expiresAt != null
                && !expiresAt.isAfter(LocalDateTime.now())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Expiration date must be in the future"
            );
        }

        // Null means the URL will never expire
        mapping.setExpiresAt(expiresAt);

        return toResponse(urlRepository.save(mapping));
    }

    

@Transactional
public UrlResponse updateCustomAlias(
        Long id,
        String customAlias,
        String email) {

    User user = findUserByEmail(email);

    UrlMapping mapping = urlRepository
            .findByIdAndUser_Id(id, user.getId())
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "URL not found"
            ));

    String alias = null;
    String code;

    // Remove custom alias and generate a random code
    if (customAlias == null || customAlias.isBlank()) {

        do {
            code = generateCode();
        } while (urlRepository.existsByShortCode(code));

    } else {

        alias = customAlias.trim().toLowerCase(java.util.Locale.ROOT);

        // Validate alias
        if (!alias.matches("^[a-zA-Z0-9_-]{3,30}$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Alias must contain 3-30 letters, numbers, hyphens or underscores"
            );
        }

        // Allow the current alias, but reject aliases belonging to another URL
        if (!alias.equals(mapping.getShortCode())
                && urlRepository.existsByShortCode(alias)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This custom alias is already taken"
            );
        }

        code = alias;
    }

    mapping.setShortCode(code);
    mapping.setCustomAlias(alias);

    return toResponse(urlRepository.save(mapping));
}


}
