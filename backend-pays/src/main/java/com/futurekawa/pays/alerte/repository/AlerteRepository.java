package com.futurekawa.pays.alerte.repository;

import com.futurekawa.pays.alerte.entity.Alerte;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlerteRepository extends JpaRepository<Alerte, Long> {
}