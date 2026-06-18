package com.futurekawa.pays.referentiel.service;

import com.futurekawa.pays.referentiel.dto.EntrepotDto;
import com.futurekawa.pays.referentiel.dto.ExploitationDto;
import com.futurekawa.pays.referentiel.repository.EntrepotRepository;
import com.futurekawa.pays.referentiel.repository.ExploitationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class ReferentielService {

    private final ExploitationRepository exploitationRepository;
    private final EntrepotRepository entrepotRepository;

    public ReferentielService(ExploitationRepository exploitationRepository,
                              EntrepotRepository entrepotRepository) {
        this.exploitationRepository = exploitationRepository;
        this.entrepotRepository = entrepotRepository;
    }

    public List<ExploitationDto> listerExploitations() {
        return exploitationRepository.findAll().stream()
                .map(e -> new ExploitationDto(e.getId(), e.getNom(), e.getPays()))
                .toList();
    }

    public List<EntrepotDto> listerEntrepots(Long exploitationId) {
        if (!exploitationRepository.existsById(exploitationId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Exploitation introuvable");
        }
        return entrepotRepository.findByExploitationId(exploitationId).stream()
                .map(e -> new EntrepotDto(e.getId(), e.getNom(), e.getLocalisation(),
                        e.getExploitation().getId()))
                .toList();
    }
}