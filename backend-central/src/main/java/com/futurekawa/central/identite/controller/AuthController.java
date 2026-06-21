package com.futurekawa.central.identite.controller;

import com.futurekawa.central.identite.dto.LoginRequest;
import com.futurekawa.central.identite.dto.LoginResponse;
import com.futurekawa.central.identite.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        String token = authService.login(req.email(), req.motDePasse());
        return new LoginResponse(token, "Bearer");
    }
}