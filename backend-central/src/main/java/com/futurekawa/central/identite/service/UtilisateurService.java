package com.futurekawa.central.identite.service;

import com.futurekawa.central.identite.dto.UtilisateurDto;
import com.futurekawa.central.identite.entity.Role;
import com.futurekawa.central.identite.entity.Utilisateur;
import com.futurekawa.central.identite.repository.UtilisateurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final IsolationPaysService isolation;

    public UtilisateurService(UtilisateurRepository utilisateurRepository,
                              IsolationPaysService isolation) {
        this.utilisateurRepository = utilisateurRepository;
        this.isolation = isolation;
    }

    /** Liste filtrée : super admin voit tout, admin pays voit son pays uniquement. */
    @Transactional(readOnly = true)
    public List<UtilisateurDto> lister() {
        List<Utilisateur> users = isolation.peutVoirTousLesPays()
                ? utilisateurRepository.findAll()
                : utilisateurRepository.findByPays(isolation.paysDeLUtilisateur());
        return users.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public UtilisateurDto parId(Long id) {
        Utilisateur u = trouver(id);
        verifierPerimetre(u);   // un admin pays ne peut pas lire un user d'un autre pays
        return toDto(u);
    }

    // --- helpers internes ---

    Utilisateur trouver(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
    }

    /** Vérifie que l'utilisateur cible est dans le périmètre de l'appelant. */
    void verifierPerimetre(Utilisateur cible) {
        if (isolation.peutVoirTousLesPays()) return;            // super admin : OK partout
        String monPays = isolation.paysDeLUtilisateur();
        if (cible.getPays() == null || !cible.getPays().equalsIgnoreCase(monPays)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Accès refusé : cet utilisateur n'est pas dans votre périmètre");
        }
    }

    UtilisateurDto toDto(Utilisateur u) {
        return new UtilisateurDto(
                u.getId(), u.getEmail(), u.getNom(), u.getPrenom(),
                u.getPays(), u.isActif(), u.getDerniereConnexion(),
                u.getRoles().stream().map(Role::getCode).toList());
    }
}