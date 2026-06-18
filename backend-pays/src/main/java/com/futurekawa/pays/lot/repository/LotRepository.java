package com.futurekawa.pays.lot.repository;

import com.futurekawa.pays.lot.StatutLot;
import com.futurekawa.pays.lot.entity.Lot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LotRepository extends JpaRepository<Lot, Long> {

    boolean existsByReference(String reference);

    // FIFO : les plus anciens d'abord
    List<Lot> findAllByOrderByDateStockageAsc();

    List<Lot> findByEntrepotIdOrderByDateStockageAsc(Long entrepotId);

    List<Lot> findByStatutOrderByDateStockageAsc(StatutLot statut);
}