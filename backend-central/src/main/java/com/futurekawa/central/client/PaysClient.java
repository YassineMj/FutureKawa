package com.futurekawa.central.client;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class PaysClient {

    private static final ParameterizedTypeReference<List<Map<String, Object>>> LISTE =
            new ParameterizedTypeReference<>() {};

    private final RestClient restClient;

    public PaysClient(RestClient restClient) {
        this.restClient = restClient;
    }

    /** Récupère une liste JSON générique depuis un back-end pays (ex. /lots, /alertes). */
    public List<Map<String, Object>> getListe(String baseUrl, String path) {
        return restClient.get()
                .uri(baseUrl + path)
                .retrieve()
                .body(LISTE);
    }

    /** Vérifie si un back-end pays répond (via Actuator health). */
    public boolean estDisponible(String baseUrl) {
        try {
            restClient.get()
                    .uri(baseUrl + "/actuator/health")
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
