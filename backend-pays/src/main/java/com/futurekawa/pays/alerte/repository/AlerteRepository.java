package com.futurekawa.pays.alerte.repository;

import com.futurekawa.pays.alerte.StatutAlerte;
import com.futurekawa.pays.alerte.TypeAlerte;
import com.futurekawa.pays.alerte.entity.Alerte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlerteRepository extends JpaRepository<Alerte, Long> {
    boolean existsByTypeAndStatutAndEntrepotId(
            TypeAlerte type, StatutAlerte statut, Long entrepotId);

    List<Alerte> findAllByOrderByDeclencheeAtDesc();

    boolean existsByTypeAndStatutAndLotId(
            TypeAlerte type, StatutAlerte statut, Long lotId);
}