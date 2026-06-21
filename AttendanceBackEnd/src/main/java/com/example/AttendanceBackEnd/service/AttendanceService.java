package com.example.AttendanceBackEnd.service;

import com.example.AttendanceBackEnd.dto.AttendanceDto;
import com.example.AttendanceBackEnd.dto.AttendanceRequestDto;
import com.example.AttendanceBackEnd.exception.ResourceNotFoundException;
import com.example.AttendanceBackEnd.model.Attendance;
import com.example.AttendanceBackEnd.model.Classes;
import com.example.AttendanceBackEnd.model.Student;
import com.example.AttendanceBackEnd.model.Teacher;
import com.example.AttendanceBackEnd.model.User;
import com.example.AttendanceBackEnd.repository.AttendanceRepository;
import com.example.AttendanceBackEnd.repository.ClassesRepository;
import com.example.AttendanceBackEnd.repository.StudentRepository;
import com.example.AttendanceBackEnd.repository.TeacherRepository;
import com.example.AttendanceBackEnd.repository.UserRepository;
import com.example.AttendanceBackEnd.security.jwt.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceService {
    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private ClassesRepository classesRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Checks if a teacher is authorized to manage attendance for a specific class
     * @param teacherId The ID of the teacher
     * @param classId The ID of the class
     * @return True if the teacher is authorized, false otherwise
     */
    private boolean isTeacherAuthorizedForClass(Long teacherId, Long classId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + teacherId));
        
        // Check if the teacher is assigned to this class
        return teacher.getAssignedClasses().stream()
                .anyMatch(cls -> cls.getId().equals(classId));
    }
    
    /**
     * Gets the user from the JWT token
     * @param token The JWT token
     * @return The User object
     */
    private User getUserFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        String username = jwtUtils.getUserNameFromJwtToken(token);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }
    
    /**
     * Checks if the user is authorized to manage attendance for a specific class
     * @param user The user
     * @param classId The ID of the class
     * @throws AccessDeniedException If the user is not authorized
     */
    private void checkClassAccessAuthorization(User user, Long classId) {
        // Admin has access to all classes
        if (user.getRole() == User.ERole.ROLE_ADMIN) {
            return;
        }
        
        // For teachers, check if they are assigned to this class
        if (user.getRole() == User.ERole.ROLE_TEACHER) {
            Teacher teacher = teacherRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user: " + user.getUsername()));
            
            if (!isTeacherAuthorizedForClass(teacher.getId(), classId)) {
                throw new AccessDeniedException("You are not authorized to manage attendance for this class");
            }
        } else {
            throw new AccessDeniedException("Only admins and teachers can manage attendance");
        }
    }
    
    @Transactional
    public void markAttendance(@Valid AttendanceRequestDto attendanceRequest, String token) {
        LocalDate date = attendanceRequest.getDate();
        Long classId = attendanceRequest.getClassId();
        
        // Get the user from the token and check authorization
        User user = getUserFromToken(token);
        checkClassAccessAuthorization(user, classId);
        
        // Get the class
        Classes classes = classesRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));
        
        for (AttendanceRequestDto.AttendanceEntry entry : attendanceRequest.getEntries()) {
            Student student = studentRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + entry.getStudentId()));
            
            // Verify that the student belongs to this class
            if (student.getClasses() == null || !student.getClasses().getId().equals(classId)) {
                throw new AccessDeniedException("Student does not belong to this class");
            }

            // Check if attendance record already exists for this student, class and date
            Optional<Attendance> existingAttendance = attendanceRepository.findByStudentIdAndClassesIdAndDate(
                    entry.getStudentId(), classId, date);

            if (existingAttendance.isPresent()) {
                // Update existing record
                Attendance attendance = existingAttendance.get();
                attendance.setStatus(entry.getStatus());
                attendance.setRemarks(entry.getRemarks());
                attendance.setMarkedBy(user);
                attendanceRepository.save(attendance);
            } else {
                // Create new record
                Attendance attendance = new Attendance();
                attendance.setStudent(student);
                attendance.setClasses(classes);
                attendance.setDate(date);
                attendance.setStatus(entry.getStatus());
                attendance.setRemarks(entry.getRemarks());
                attendance.setMarkedBy(user);
                attendanceRepository.save(attendance);
            }
        }
    }

    public List<com.example.AttendanceBackEnd.dto.AttendanceDto> getAttendanceByStudentId(Long studentId) {
        // Verify student exists
        studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        List<Attendance> attendanceList = attendanceRepository.findByStudentId(studentId);
        return attendanceList.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<com.example.AttendanceBackEnd.dto.AttendanceDto> getAttendanceByDate(LocalDate date) {
        List<Attendance> attendanceList = attendanceRepository.findByDate(date);
        return attendanceList.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<com.example.AttendanceBackEnd.dto.AttendanceDto> getAttendanceByDateRange(Long studentId, LocalDate startDate, LocalDate endDate) {
        // Verify student exists
        studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        List<Attendance> attendanceList = attendanceRepository.findByStudentIdAndDateBetween(studentId, startDate, endDate);
        return attendanceList.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getAttendanceStats(Long studentId) {
        // Verify student exists
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Long totalDays = attendanceRepository.countTotalByStudentId(studentId);
        Long presentDays = attendanceRepository.countPresentByStudentId(studentId);

        double percentage = 0.0;
        if (totalDays > 0) {
            percentage = (double) presentDays / totalDays * 100;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("studentId", studentId);
        stats.put("studentName", student.getName());
        stats.put("totalDays", totalDays);
        stats.put("presentDays", presentDays);
        stats.put("absentDays", totalDays - presentDays);
        stats.put("attendancePercentage", Math.round(percentage * 100.0) / 100.0); // Round to 2 decimal places

        return stats;
    }

    /**
     * Gets attendance records for a specific class
     * @param classId The ID of the class
     * @param token The JWT token for authorization
     * @return List of attendance DTOs
     */
    public List<AttendanceDto> getAttendanceByClass(Long classId, String token) {
        // Get the user from the token and check authorization
        User user = getUserFromToken(token);
        checkClassAccessAuthorization(user, classId);
        
        List<Attendance> attendanceList = attendanceRepository.findByClassesId(classId);
        return attendanceList.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Gets attendance records for a specific class and date
     * @param classId The ID of the class
     * @param date The date
     * @param token The JWT token for authorization
     * @return List of attendance DTOs
     */
    public List<AttendanceDto> getAttendanceByClassAndDate(Long classId, LocalDate date, String token) {
        // Get the user from the token and check authorization
        User user = getUserFromToken(token);
        checkClassAccessAuthorization(user, classId);
        
        List<Attendance> attendanceList = attendanceRepository.findByClassesIdAndDate(classId, date);
        return attendanceList.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private AttendanceDto convertToDto(Attendance attendance) {
        AttendanceDto dto = new AttendanceDto();
        dto.setId(attendance.getId());
        dto.setDate(attendance.getDate());
        dto.setStatus(attendance.getStatus());
        dto.setStudentId(attendance.getStudent().getId());
        dto.setStudentName(attendance.getStudent().getName());
        dto.setClassId(attendance.getClasses().getId());
        dto.setClassName(attendance.getClasses().getName());
        dto.setRemarks(attendance.getRemarks());
        
        if (attendance.getMarkedBy() != null) {
            dto.setMarkedById(attendance.getMarkedBy().getId());
            dto.setMarkedByName(attendance.getMarkedBy().getFullName());
        }
        
        return dto;
    }
}
