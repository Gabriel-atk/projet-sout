package com.example.backend.mappers;

import com.example.backend.dto.request.EventRequest;
import com.example.backend.entites.Event;
import com.example.backend.entites.Organizer;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    public Event toEntity(EventRequest request, Organizer organizer){
        return new Event(
                request.title(),
                request.description(),
                request.location(),
                request.capacity(),
                request.startDateTime(),
                request.endDateTime(),
                request.price(),
                request.status(),
                request.images(),
                organizer
        );
    }
}
