package com.example.backend.entites;

import com.example.backend.utils.BaseEntity;
import com.example.backend.utils.TicketStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
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

    @ManyToOne
    @JoinColumn(name = "participant_id")
    private Participant participant;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;


}
