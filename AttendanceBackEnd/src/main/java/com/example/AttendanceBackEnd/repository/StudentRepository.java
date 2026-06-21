package com.example.AttendanceBackEnd.repository;

import com.example.AttendanceBackEnd.model.Student;
import com.example.AttendanceBackEnd.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    Optional<Student> findByRollNoAndClassesId(String rollNo, Long classId);

    Boolean existsByEmail(String email);

    Boolean existsByRollNoAndClassesId(String rollNo, Long classId);

    Optional<Student> findByUser(User user);
}
