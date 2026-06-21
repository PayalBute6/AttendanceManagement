package com.example.AttendanceBackEnd.repository;


import com.example.AttendanceBackEnd.model.Student;
import com.example.AttendanceBackEnd.model.Teacher;
import com.example.AttendanceBackEnd.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    Optional<Teacher> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Teacher> findByUser(User user);

}

