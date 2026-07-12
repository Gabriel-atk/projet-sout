package com.example.backend.repositories;

import com.example.backend.entites.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventsRepository extends JpaRepository<Event, Long> {
    Optional<Event> getEventByTrackingId(@Param("trackingId") UUID trackingId);

    @Query("select e from Event e where e.trackingId = :trackingId")
    Optional<Event> findByTrackingId(@Param("trackingId") UUID trackingId);

    @Query("SELECT e FROM Event e order by e.id desc")
    List<Event> getAllEvents();

    @Query("SELECT e FROM Event e WHERE e.organizer.trackingId = :organizerTrackingId ORDER BY e.startDateTime DESC")
    List<Event> findEventsByOrganizerTrackingId(@Param("organizerTrackingId") UUID organizerTrackingId);


}
