package com.futurekawa.pays.mesure.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.futurekawa.pays.mesure.dto.MesurePayload;
import com.futurekawa.pays.mesure.entity.Mesure;
import com.futurekawa.pays.mesure.repository.MesureRepository;
import com.futurekawa.pays.referentiel.entity.Capteur;
import com.futurekawa.pays.referentiel.repository.CapteurRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class MesureIngestionService {

    private static final Logger log = LoggerFactory.getLogger(MesureIngestionService.class);

    private final MesureRepository mesureRepository;
    private final CapteurRepository capteurRepository;
    private final ObjectMapper objectMapper;

    public MesureIngestionService(MesureRepository mesureRepository,
                                  CapteurRepository capteurRepository,
                                  ObjectMapper objectMapper) {
        this.mesureRepository = mesureRepository;
        this.capteurRepository = capteurRepository;
        this.objectMapper = objectMapper;
    }

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void traiterMessage(Message<?> message) {
        String json = message.getPayload().toString();
        try {
            MesurePayload payload = objectMapper.readValue(json, MesurePayload.class);
            enregistrer(payload);
        } catch (Exception e) {
            log.warn("Message MQTT ignoré (illisible) : {}", json, e);
        }
    }

    public void enregistrer(MesurePayload payload) {
        // validation simple
        if (payload.temperature() == null || payload.humidite() == null
                || payload.capteurId() == null) {
            log.warn("Mesure incomplète ignorée : {}", payload);
            return;
        }

        Capteur capteur = capteurRepository.findByIdentifiantMqtt(payload.capteurId())
                .orElse(null);
        if (capteur == null) {
            log.warn("Capteur inconnu '{}', mesure ignorée", payload.capteurId());
            return;
        }

        Mesure mesure = new Mesure();
        mesure.setEntrepot(capteur.getEntrepot());
        mesure.setCapteur(capteur);
        mesure.setTemperature(payload.temperature());
        mesure.setHumidite(payload.humidite());
        mesure.setMesureAt(payload.timestamp() != null ? payload.timestamp() : Instant.now());

        mesureRepository.save(mesure);
        log.info("Mesure enregistrée: entrepot={} temp={} hum={}",
                capteur.getEntrepot().getId(), payload.temperature(), payload.humidite());
        // En Phase 4 : on appellera ici AlerteService.evaluerMesure(mesure)
    }
}