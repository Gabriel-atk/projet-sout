package com.example.backend.repositories;

import com.example.backend.entites.Event;
import com.example.backend.entites.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket,Integer> {

    @Query("select e from Ticket e where e.trackingId = :trackingId")
    Optional<Ticket> findTicketByTrackingId(@Param("trackingId") UUID trackingId);

    @Query("SELECT t FROM Ticket t order by t.id desc")
    List<Event> getAllTickets();


}
