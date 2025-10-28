package com.example.FaceShield_Back.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/health")
    public String health() {
        return "OK";
    }

    @GetMapping("/")
    public String home() {
        return "FaceShield Backend is running!";
    }
}
