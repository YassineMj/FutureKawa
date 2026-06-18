package com.futurekawa.central.controller;

import com.futurekawa.central.dto.PaysStatutDto;
import com.futurekawa.central.service.ConsolidationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final ConsolidationService consolidation;

    public ApiController(ConsolidationService consolidation) {
        this.consolidation = consolidation;
    }

    /** Liste des pays et leur disponibilité. */
    @GetMapping("/pays")
    public List<PaysStatutDto> pays() {
        return consolidation.statutPays();
    }

    /** Tous les lots, tous pays confondus. */
    @GetMapping("/lots")
    public List<Map<String, Object>> lots() {
        return consolidation.consoliderTous("/lots");
    }

    /** Toutes les alertes, tous pays confondus. */
    @GetMapping("/alertes")
    public List<Map<String, Object>> alertes() {
        return consolidation.consoliderTous("/alertes");
    }

    /** Lots d'un pays précis. */
    @GetMapping("/pays/{code}/lots")
    public List<Map<String, Object>> lotsPays(@PathVariable String code) {
        return consolidation.consoliderPays(code, "/lots");
    }

    /** Alertes d'un pays précis. */
    @GetMapping("/pays/{code}/alertes")
    public List<Map<String, Object>> alertesPays(@PathVariable String code) {
        return consolidation.consoliderPays(code, "/alertes");
    }

    /** Courbes d'un lot : mesures de son entrepôt depuis sa date de stockage. */
    @GetMapping("/pays/{code}/lots/{lotId}/mesures")
    public List<Map<String, Object>> mesuresLot(@PathVariable String code,
                                                @PathVariable Long lotId) {
        return consolidation.consoliderPays(code, "/lots/" + lotId + "/mesures");
    }

    /** Historique des mesures d'un entrepôt d'un pays. */
    @GetMapping("/pays/{code}/entrepots/{entrepotId}/mesures")
    public List<Map<String, Object>> mesuresEntrepot(@PathVariable String code,
                                                     @PathVariable Long entrepotId) {
        return consolidation.consoliderPays(code, "/entrepots/" + entrepotId + "/mesures");
    }
}
