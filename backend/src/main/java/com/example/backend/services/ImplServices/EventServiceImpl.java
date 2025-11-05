package com.example.backend.services.ImplServices;

import com.example.backend.dto.request.EventRequest;
import com.example.backend.dto.response.EventResponse;
import com.example.backend.entites.Event;
import com.example.backend.mappers.EventMapper;
import com.example.backend.repositories.EventsRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventsRepository eventsRepository;
    private final EventMapper eventMapper;
    private final UserRepository userRepository;


    public EventsRepository getEventsRepository() {return eventsRepository;}

    @Override
    public EventResponse createEvent(EventRequest request, List<MultipartFile> images) {
        Event event=eventMapper.toEntity(request);

    }

    @Override
    public List<EventResponse> getAllEvents() {
        return List.of();
    }

    @Override
    public EventResponse getEventByTrackingId(UUID trackingId) {
        return null;
    }

    @Override
    public EventResponse updateEvent(UUID trackingId, EventRequest request) {
        return null;
    }

    @Override
    public void deleteEvent(UUID trackingId) {

    }

    @Override
    public List<EventResponse> getEventsByOrganizer(UUID organizerTrackingId) {
        return List.of();
    }
}
