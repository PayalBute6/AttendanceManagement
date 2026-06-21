package com.example.AttendanceBackEnd.repository;

import com.example.AttendanceBackEnd.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByDate(LocalDate date);
    
    List<Attendance> findByClassesId(Long classId);
    
    List<Attendance> findByClassesIdAndDate(Long classId, LocalDate date);

    Optional<Attendance> findByStudentIdAndDate(Long studentId, LocalDate date);
    
    Optional<Attendance> findByStudentIdAndClassesIdAndDate(Long studentId, Long classId, LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'PRESENT'")
    Long countPresentByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId")
    Long countTotalByStudentId(@Param("studentId") Long studentId);

    List<Attendance> findByStudentIdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
}
