package com.example.AttendanceBackEnd.repository;

import com.example.AttendanceBackEnd.model.Classes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassesRepository extends JpaRepository<Classes, Long> {

    boolean existsByName(String name);
    
    /**
     * Find a class by its name
     * @param name The name of the class
     * @return Optional containing the class if found
     */
    Optional<Classes> findByName(String name);
}
