
package com.linklite.analytics;

import java.time.LocalDate;

public record DailyClickResponse(
        LocalDate date,
        long clicks
) {
}
