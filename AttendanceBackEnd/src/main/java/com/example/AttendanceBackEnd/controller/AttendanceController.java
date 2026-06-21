 package com.example.AttendanceBackEnd.controller;

import com.example.AttendanceBackEnd.dto.AttendanceDto;
import com.example.AttendanceBackEnd.dto.AttendanceRequestDto;
import com.example.AttendanceBackEnd.dto.MessageResponse;
import com.example.AttendanceBackEnd.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/mark")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<MessageResponse> markAttendance(
            @Valid @RequestBody AttendanceRequestDto attendanceRequest,
            @RequestHeader("Authorization") String token) {
        attendanceService.markAttendance(attendanceRequest, token);
        return ResponseEntity.ok(new MessageResponse("Attendance marked successfully"));
    }
    
    @GetMapping("/class/{classId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<AttendanceDto>> getAttendanceByClassId(
            @PathVariable Long classId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String token) {
        List<AttendanceDto> attendanceList;
        if (date != null) {
            attendanceList = attendanceService.getAttendanceByClassAndDate(classId, date, token);
        } else {
            attendanceList = attendanceService.getAttendanceByClass(classId, token);
        }
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<List<AttendanceDto>> getAttendanceByStudentId(@PathVariable Long studentId) {
        List<AttendanceDto> attendanceList = attendanceService.getAttendanceByStudentId(studentId);
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AttendanceDto>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceDto> attendanceList = attendanceService.getAttendanceByDate(date);
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/student/{studentId}/range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<List<AttendanceDto>> getAttendanceByDateRange(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceDto> attendanceList = attendanceService.getAttendanceByDateRange(studentId, startDate, endDate);
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/percentage/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getAttendancePercentage(@PathVariable Long studentId) {
        Map<String, Object> stats = attendanceService.getAttendanceStats(studentId);
        return ResponseEntity.ok(stats);
    }
}
