package com.example.backend.entites;

import com.example.backend.utils.BaseEntity;
import com.example.backend.utils.TicketStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name="tickets")
@Getter
@Setter
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Ticket extends BaseEntity {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_id" , nullable = false , unique = true)
    private UUID trackingId ;

    @Column(name = "code_qr", unique = true, nullable = false, length = 500)
    private String qrCode;

    @Enumerated(EnumType.STRING)
    private TicketStatus ticketStatus;

    private float price;

    private int numberOfAvailableTickets;

    @Builder.Default
    private int numberOfTicketsSold = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private Organizer organizer;


    public boolean isAvailable() {
        return numberOfAvailableTickets == -1 || numberOfTicketsSold < numberOfAvailableTickets;
    }

    public int getNombreRestant() {
        if (numberOfAvailableTickets == -1) return -1;
        return Math.max(0, numberOfAvailableTickets - numberOfTicketsSold);
    }
}