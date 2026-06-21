package com.example.AttendanceBackEnd.controller;

import com.example.AttendanceBackEnd.dto.ClassesDto;
import com.example.AttendanceBackEnd.dto.MessageResponse;
import com.example.AttendanceBackEnd.dto.StudentDto;
import com.example.AttendanceBackEnd.dto.TeacherDto;

import com.example.AttendanceBackEnd.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@Validated
@CrossOrigin(origins = "http://localhost:3000") // Adjust if frontend is hosted elsewhere
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    // Get all teachers (admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeacherDto>> getAllTeachers() {
        List<TeacherDto> teachers = teacherService.getAllTeachers();
        return new ResponseEntity<>(teachers, HttpStatus.OK);
    }

    // Get teacher by ID (admin only or self)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @teacherService.isCurrentTeacher(#id)")
    public ResponseEntity<TeacherDto> getTeacherById(@PathVariable Long id) {
        TeacherDto teacher = teacherService.getTeacherById(id);
        return new ResponseEntity<>(teacher, HttpStatus.OK);
    }

    // Get currently logged-in teacher's profile
    @GetMapping("/profile")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<TeacherDto> getCurrentTeacher() {
        TeacherDto currentTeacher = teacherService.getCurrentLoggedInTeacher();
        return new ResponseEntity<>(currentTeacher, HttpStatus.OK);
    }

    // Create new teacher (admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherDto> createTeacher(@Valid @RequestBody TeacherDto teacherDto) {
        TeacherDto createdTeacher = teacherService.createTeacher(teacherDto);
        return new ResponseEntity<>(createdTeacher, HttpStatus.CREATED);
    }

    // Update teacher by ID (admin only or self)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @teacherService.isCurrentTeacher(#id)")
    public ResponseEntity<TeacherDto> updateTeacher(@PathVariable Long id, @Valid @RequestBody TeacherDto teacherDto) {
        TeacherDto updatedTeacher = teacherService.updateTeacher(id, teacherDto);
        return new ResponseEntity<>(updatedTeacher, HttpStatus.OK);
    }

    // Delete teacher by ID (admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    // Get assigned classes for the current teacher
    @GetMapping("/classes")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<ClassesDto>> getAssignedClasses() {
        List<ClassesDto> classes = teacherService.getAssignedClasses();
        return new ResponseEntity<>(classes, HttpStatus.OK);
    }
    
    // Get students in a specific class (only if teacher is assigned to that class)
    @GetMapping("/classes/{classId}/students")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<StudentDto>> getStudentsInClass(@PathVariable Long classId) {
        List<StudentDto> students = teacherService.getStudentsInClass(classId);
        return new ResponseEntity<>(students, HttpStatus.OK);
    }
    
    // Assign a class to a teacher (admin only)
    @PostMapping("/{teacherId}/classes/{classId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> assignClassToTeacher(
            @PathVariable Long teacherId,
            @PathVariable Long classId) {
        teacherService.assignClassToTeacher(teacherId, classId);
        return ResponseEntity.ok(new MessageResponse("Class assigned to teacher successfully"));
    }
    
    // Remove a class assignment from a teacher (admin only)
    @DeleteMapping("/{teacherId}/classes/{classId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> removeClassFromTeacher(
            @PathVariable Long teacherId,
            @PathVariable Long classId) {
        teacherService.removeClassFromTeacher(teacherId, classId);
        return ResponseEntity.ok(new MessageResponse("Class removed from teacher successfully"));
    }
}
