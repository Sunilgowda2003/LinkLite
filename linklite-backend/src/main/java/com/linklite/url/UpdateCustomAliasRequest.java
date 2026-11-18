
package com.linklite.url;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateCustomAliasRequest(

        @Size(max = 30,
              message = "Custom alias must not exceed 30 characters")
        @Pattern(
                regexp = "^[a-zA-Z0-9_-]{3,30}$",
                message = "Alias must contain 3-30 letters, numbers, hyphens or underscores"
        )
        String customAlias

) {
}
