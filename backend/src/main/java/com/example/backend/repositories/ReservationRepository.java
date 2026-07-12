package com.example.backend.repositories;

import com.example.backend.entites.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

}
