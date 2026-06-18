package com.futurekawa.pays.mesure.repository;

import com.futurekawa.pays.mesure.entity.Mesure;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MesureRepository extends JpaRepository<Mesure, Long> {
}