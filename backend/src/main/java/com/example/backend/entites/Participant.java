package com.example.backend.entites;

import com.example.backend.utils.Role;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@DiscriminatorValue("PARTICIPANT")
public class Participant extends User{
    public Participant(String firstName, String lastName, String email, String password) {
        super(firstName, lastName, email, password);
        this.setRole(Role.PARTICIPANT);
    }
}
