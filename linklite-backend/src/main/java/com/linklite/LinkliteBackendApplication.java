
package com.linklite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LinkliteBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(LinkliteBackendApplication.class, args);
    }

}
