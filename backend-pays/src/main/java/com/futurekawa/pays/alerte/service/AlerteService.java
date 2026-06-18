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

import java.time.Instant;
import java.util.List;

@Service
public class AlerteService {

    private static final Logger log = LoggerFactory.getLogger(AlerteService.class);

    private final AlerteRepository alerteRepository;
    private final LotRepository lotRepository;
    private final SeuilConfig seuils;

    public AlerteService(AlerteRepository alerteRepository,
                         LotRepository lotRepository,
                         SeuilConfig seuils) {
        this.alerteRepository = alerteRepository;
        this.lotRepository = lotRepository;
        this.seuils = seuils;
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
        alerteRepository.save(alerte);

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
}