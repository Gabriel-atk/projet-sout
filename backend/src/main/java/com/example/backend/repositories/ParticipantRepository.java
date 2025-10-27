package com.example.backend.repositories;

import com.example.backend.entites.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    @Query(value= """
            SELECT * FROM  users
            WHERE tracking_id = :trackingId AND
            role = 'PARTICIPANT'
            """ , nativeQuery=true)
    Optional<Participant> findByTrackingId(UUID trackingId);
}
