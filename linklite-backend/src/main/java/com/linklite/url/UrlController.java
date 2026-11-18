
package com.linklite.url;

import java.net.URI;
import java.security.Principal;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class UrlController {

    private final UrlService urlService;

    public UrlController(UrlService urlService) {
        this.urlService = urlService;
    }

    // Create short URL with optional custom alias and expiration
    @PostMapping("/api/urls")
    public ResponseEntity<UrlResponse> createUrl(
            @Valid @RequestBody CreateUrlRequest request,
            Principal principal) {

        UrlResponse response = urlService.createShortUrl(
                request.originalUrl(),
                request.expiresAt(),
                request.customAlias(),
                principal.getName()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    // Get recent URLs
    @GetMapping("/api/urls")
    public List<UrlResponse> getRecentUrls(Principal principal) {

        return urlService.getRecentUrls(principal.getName());
    }

    // Get total URL count
    @GetMapping("/api/urls/stats/count")
    public long getTotalUrls(Principal principal) {

        return urlService.getTotalUrls(principal.getName());
    }

    // Get URL details
    @GetMapping("/api/urls/{code}")
    public UrlResponse getUrl(
            @PathVariable String code,
            Principal principal) {

        return urlService.getByCode(
                code,
                principal.getName()
        );
    }

    // Redirect using generated code or custom alias
    @GetMapping("/{code:[A-Za-z0-9_-]{3,30}}")
    public ResponseEntity<Void> redirect(@PathVariable String code) {

        String originalUrl = urlService.getOriginalUrl(code);

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(originalUrl));

        return ResponseEntity.status(HttpStatus.FOUND)
                .headers(headers)
                .build();
    }

    // Delete URL
    @DeleteMapping("/api/urls/{id}")
    public ResponseEntity<Void> deleteUrl(
            @PathVariable Long id,
            Principal principal) {

        urlService.deleteUrl(id, principal.getName());

        return ResponseEntity.noContent().build();
    }

    // Activate or deactivate URL
    @PatchMapping("/api/urls/{id}/status")
    public UrlResponse updateUrlStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUrlStatusRequest request,
            Principal principal) {

        return urlService.updateUrlStatus(
                id,
                request.active(),
                principal.getName()
        );
    }

    // Update or remove URL expiration
    @PatchMapping("/api/urls/{id}/expiration")
    public UrlResponse updateUrlExpiration(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUrlExpirationRequest request,
            Principal principal) {

        return urlService.updateUrlExpiration(
                id,
                request.expiresAt(),
                principal.getName()
        );
    }
    

@PatchMapping("/api/urls/{id}/alias")
public UrlResponse updateCustomAlias(
        @PathVariable Long id,
        @Valid @RequestBody UpdateCustomAliasRequest request,
        Principal principal) {

    return urlService.updateCustomAlias(
            id,
            request.customAlias(),
            principal.getName()
    );
}

}
