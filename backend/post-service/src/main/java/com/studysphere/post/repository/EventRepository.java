package com.studysphere.post.repository;

import com.studysphere.post.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    // Fetch all events, ordering by the event date (soonest first)
    List<Event> findAllByOrderByEventDateAsc();
}