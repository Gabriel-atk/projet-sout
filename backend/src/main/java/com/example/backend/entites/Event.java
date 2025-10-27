package com.example.backend.entites;

import com.example.backend.utils.BaseEntity;
import com.example.backend.utils.EventStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name="events")
@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Event extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true,updatable = false)
    private UUID trackingId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private Number capacity;

    @Column(nullable = false)
    private LocalDateTime startDateTime;

    @Column(nullable = false)
    private LocalDateTime endDateTime;

    @Column(nullable = false)
    private float price;

    @Enumerated(EnumType.STRING)
    private EventStatus status;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> images;

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private Organizer organizer;

    public Event(String title, String description,
                 String location, Number capacity, LocalDateTime startDateTime,
                 LocalDateTime endDateTime, float price, EventStatus status,
                 List<String> images, Organizer organizer) {
        this.setTitle(title);
        this.setDescription(description);
        this.setLocation(location);
        this.setCapacity(capacity);
        this.setStartDateTime(startDateTime);
        this.setEndDateTime(endDateTime);
        this.setPrice(price);
        this.setStatus(status);
        this.setImages(images);
        this.setOrganizer(organizer);
    }
}
