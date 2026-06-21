package com.futurekawa.central.identite.controller;

import com.futurekawa.central.identite.dto.UtilisateurDto;
import com.futurekawa.central.identite.service.UtilisateurService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN_PAYS')")   // gestion des comptes réservée aux admins
public class UtilisateurController {

    private final UtilisateurService service;

    public UtilisateurController(UtilisateurService service) {
        this.service = service;
    }

    @GetMapping
    public List<UtilisateurDto> lister() {
        return service.lister();
    }

    @GetMapping("/{id}")
    public UtilisateurDto parId(@PathVariable Long id) {
        return service.parId(id);
    }
}