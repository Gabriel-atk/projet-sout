package com.example.backend.repositories;

import com.example.backend.entites.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    Optional<User> findByTrackingId(UUID trackingId);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u  order by u.id desc" )
    List<User> findAllUsers();

    @Query(value= """
            SELECT * FROM users
            WHERE role = 'ORGANIZER'
            ORDER BY id DESC
            
            """ , nativeQuery = true)
    List<User> findAllOrganizers();

    @Query(value= """
            SELECT * FROM users
            WHERE role = 'PARTICIPANT'
            ORDER BY id DESC
            
            """ , nativeQuery = true)
    List<User> findAllParticipants();

    @Query(value = """
            SELECT * FROM users
            WHERE role = 'ORGANIZER' AND tracking_id = :trackingId
            ORDER BY id DESC
            """ , nativeQuery = true)
    Optional<User> findOrganizer(@Param("trackingId")UUID trackingId);

    @Query(value = """
            SELECT * FROM users
            WHERE role = 'PARTICIPANT' AND tracking_id = :trackingId
            ORDER BY id DESC
            """ , nativeQuery = true)
    Optional<User> findParticipant(@Param("trackingId")UUID trackingId);

    @Query(value= """
            SELECT * FROM  users
            ORDER BY id DESC
            """ , nativeQuery = true)
    List<User> getAll()  ;

    @Query(value="SELECT COUNT(*)  FROM  users WHERE  actif = true" , nativeQuery = true)
    Integer totalUserActif();

}
