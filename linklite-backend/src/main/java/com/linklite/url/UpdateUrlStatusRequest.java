
package com.linklite.url;

import jakarta.validation.constraints.NotNull;

public record UpdateUrlStatusRequest(

    @NotNull(message = "Active status is required")
    Boolean active

) {
}
