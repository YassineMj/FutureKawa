package com.futurekawa.pays;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PaysApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaysApplication.class, args);
    }
}