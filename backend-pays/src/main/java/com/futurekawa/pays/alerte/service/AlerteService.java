package com.futurekawa.pays.alerte.service;

import com.futurekawa.pays.alerte.entity.Alerte;
import com.futurekawa.pays.alerte.repository.AlerteRepository;
import com.futurekawa.pays.alerte.StatutAlerte;
import com.futurekawa.pays.alerte.TypeAlerte;
import com.futurekawa.pays.lot.entity.Lot;
import com.futurekawa.pays.lot.repository.LotRepository;
import com.futurekawa.pays.lot.StatutLot;
import com.futurekawa.pays.mesure.entity.Mesure;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.futurekawa.pays.notification.service.NotificationService;
import java.time.Instant;
import java.util.List;
import com.futurekawa.pays.alerte.dto.AlerteDto;


import org.springframework.scheduling.annotation.Scheduled;
@Service
public class AlerteService {

    private static final Logger log = LoggerFactory.getLogger(AlerteService.class);

    private final AlerteRepository alerteRepository;
    private final LotRepository lotRepository;
    private final SeuilConfig seuils;

    private final NotificationService notificationService;

    public AlerteService(AlerteRepository alerteRepository,
                         LotRepository lotRepository,
                         SeuilConfig seuils,
                         NotificationService notificationService) {
        this.alerteRepository = alerteRepository;
        this.lotRepository = lotRepository;
        this.seuils = seuils;
        this.notificationService = notificationService;
    }

    /** Appelée à chaque mesure ingérée. Lève une alerte si hors bande. */
    @Transactional
    public void evaluerMesure(Mesure mesure) {
        if (seuils.estDansLaBande(mesure.getTemperature(), mesure.getHumidite())) {
            return; // conditions correctes, rien à faire
        }

        Long entrepotId = mesure.getEntrepot().getId();

        // Anti-rebond : on ne recrée pas d'alerte CONDITION si une est déjà ACTIVE sur cet entrepôt
        boolean dejaActive = alerteRepository
                .existsByTypeAndStatutAndEntrepotId(
                        TypeAlerte.CONDITION, StatutAlerte.ACTIVE, entrepotId);
        if (dejaActive) {
            return;
        }

        Alerte alerte = new Alerte();
        alerte.setType(TypeAlerte.CONDITION);
        alerte.setStatut(StatutAlerte.ACTIVE);
        alerte.setEntrepot(mesure.getEntrepot());
        alerte.setValeurTemperature(mesure.getTemperature());
        alerte.setValeurHumidite(mesure.getHumidite());
        alerte.setDeclencheeAt(Instant.now());
        alerte.setMessage(String.format(
                "Conditions hors plage dans l'entrepot %d : %.1f°C / %.1f%% " +
                        "(attendu %.0f-%.0f°C / %.0f-%.0f%%)",
                entrepotId, mesure.getTemperature(), mesure.getHumidite(),
                seuils.tempMin(), seuils.tempMax(), seuils.humMin(), seuils.humMax()));
        alerte.setEmailEnvoye(true);
        alerteRepository.save(alerte);
        notificationService.envoyerAlerteEmail(alerte);

        // Tous les lots de cet entrepôt passent EN_ALERTE
        List<Lot> lots = lotRepository.findByEntrepotIdOrderByDateStockageAsc(entrepotId);
        for (Lot lot : lots) {
            if (lot.getStatut() == StatutLot.CONFORME) {
                lot.setStatut(StatutLot.EN_ALERTE);
            }
        }
        log.warn("ALERTE CONDITION levée : {}", alerte.getMessage());
        // En étape 12 : envoi de l'email ici
    }

    /** S'exécute au démarrage puis toutes les heures. Repère les lots > 365 jours. */
    @Scheduled(initialDelay = 5000, fixedRate = 3600000) // 5 s après démarrage, puis chaque heure
    @Transactional
    public void evaluerPeremptions() {
        Instant seuil365 = Instant.now().minusSeconds(365L * 24 * 60 * 60);
        List<Lot> lotsAnciens = lotRepository
                .findByDateStockageBeforeAndStatutNot(seuil365, StatutLot.PERIME);

        for (Lot lot : lotsAnciens) {
            // garde anti-doublon : ne pas recréer si une alerte PEREMPTION est déjà ACTIVE pour ce lot
            boolean dejaActive = alerteRepository
                    .existsByTypeAndStatutAndLotId(
                            TypeAlerte.PEREMPTION, StatutAlerte.ACTIVE, lot.getId());
            if (dejaActive) {
                continue;
            }

            lot.setStatut(StatutLot.PERIME);

            Alerte alerte = new Alerte();
            alerte.setType(TypeAlerte.PEREMPTION);
            alerte.setStatut(StatutAlerte.ACTIVE);
            alerte.setEntrepot(lot.getEntrepot());
            alerte.setLot(lot);
            alerte.setDeclencheeAt(Instant.now());
            long jours = (Instant.now().getEpochSecond() - lot.getDateStockage().getEpochSecond())
                    / (24 * 60 * 60);            alerte.setMessage(String.format(
                    "Lot %s périmé : %d jours de stockage (> 365)",
                    lot.getReference(), jours));
            alerte.setEmailEnvoye(true);
            alerteRepository.save(alerte);
            notificationService.envoyerAlerteEmail(alerte);

            log.warn("ALERTE PEREMPTION levée : {}", alerte.getMessage());
        }

    }

    @Transactional(readOnly = true)
    public List<AlerteDto> listerAlertes(StatutAlerte statut, TypeAlerte type) {
        return alerteRepository.rechercher(statut, type).stream()
                .map(this::toDto).toList();
    }

    private AlerteDto toDto(Alerte a) {
        return new AlerteDto(
                a.getId(),
                a.getType().name(),
                a.getStatut().name(),
                a.getEntrepot() != null ? a.getEntrepot().getId() : null,
                a.getLot() != null ? a.getLot().getId() : null,
                a.getLot() != null ? a.getLot().getReference() : null,
                a.getMessage(),
                a.getValeurTemperature(),
                a.getValeurHumidite(),
                a.getDeclencheeAt(),
                a.isEmailEnvoye()
        );
    }

    @Transactional
    public AlerteDto resoudre(Long id) {
        Alerte alerte = alerteRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Alerte introuvable"));

        if (alerte.getStatut() == StatutAlerte.RESOLUE) {
            return toDto(alerte); // déjà résolue, rien à faire
        }
        alerte.setStatut(StatutAlerte.RESOLUE);
        alerte.setResolueAt(java.time.Instant.now());
        return toDto(alerte); // sauvegarde automatique en fin de transaction (entité suivie)
    }
}