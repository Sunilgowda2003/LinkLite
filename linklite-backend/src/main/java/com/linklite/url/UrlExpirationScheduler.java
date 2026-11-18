
package com.linklite.url;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UrlExpirationScheduler {

    private final UrlRepository urlRepository;

    public UrlExpirationScheduler(UrlRepository urlRepository) {
        this.urlRepository = urlRepository;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void deactivateExpiredUrls() {

        int updatedCount = urlRepository.deactivateExpiredUrls(
                LocalDateTime.now()
        );

        if (updatedCount > 0) {
            System.out.println(
                    updatedCount +
                    " expired URLs automatically deactivated."
            );
        }
    }
}
