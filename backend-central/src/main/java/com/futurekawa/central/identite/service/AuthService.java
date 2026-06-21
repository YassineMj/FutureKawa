package com.futurekawa.central.identite.service;

import com.futurekawa.central.identite.entity.Utilisateur;
import com.futurekawa.central.identite.repository.UtilisateurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UtilisateurRepository utilisateurRepository, JwtService jwtService) {
        this.utilisateurRepository = utilisateurRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public String login(String email, String motDePasse) {
        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides"));

        if (!u.isActif()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Compte désactivé");
        }
        if (!encoder.matches(motDePasse, u.getMotDePasseHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides");
        }
        u.setDerniereConnexion(Instant.now());
        return jwtService.genererAccessToken(u);
    }
}