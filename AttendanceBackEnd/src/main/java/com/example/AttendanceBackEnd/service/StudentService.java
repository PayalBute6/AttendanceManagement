package com.example.AttendanceBackEnd.service;

import com.example.AttendanceBackEnd.dto.AttendanceDto;
import com.example.AttendanceBackEnd.dto.StudentDto;
import com.example.AttendanceBackEnd.exception.ResourceNotFoundException;
import com.example.AttendanceBackEnd.model.Attendance;
import com.example.AttendanceBackEnd.model.Student;
import com.example.AttendanceBackEnd.model.User;
import com.example.AttendanceBackEnd.repository.AttendanceRepository;
import com.example.AttendanceBackEnd.repository.ClassesRepository;
import com.example.AttendanceBackEnd.repository.StudentRepository;
import com.example.AttendanceBackEnd.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StudentService {
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ClassesRepository classesRepository;
    
    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<StudentDto> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public StudentDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return convertToDto(student);
    }

    @Transactional
    public StudentDto createStudent(StudentDto studentDto) {
        System.out.println("Creating student with data: " + studentDto);
        
        // Check if email already exists
        if (studentRepository.existsByEmail(studentDto.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        // Check if roll number already exists in the same class
        if (studentRepository.existsByRollNoAndClassesId(studentDto.getRollNo(), studentDto.getClassId())) {
            throw new IllegalArgumentException("Roll number already exists in this class");
        }

        Student student = new Student();
        student.setName(studentDto.getName());
        student.setEmail(studentDto.getEmail());
        
        // Set the class reference based on classId or className
        if (studentDto.getClassId() != null) {
            System.out.println("Finding class by ID: " + studentDto.getClassId());
            student.setClasses(classesRepository.findById(studentDto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + studentDto.getClassId())));
        } else if (studentDto.getClassName() != null && !studentDto.getClassName().isEmpty()) {
            System.out.println("Finding class by name: " + studentDto.getClassName());
            try {
                student.setClasses(classesRepository.findByName(studentDto.getClassName())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with name: " + studentDto.getClassName())));
                System.out.println("Class found by name: " + studentDto.getClassName());
            } catch (Exception e) {
                System.err.println("Error finding class by name: " + e.getMessage());
                throw e;
            }
        } else {
            System.out.println("No class ID or name provided");
        }
        
        student.setRollNo(studentDto.getRollNo());
        student.setContactNumber(studentDto.getContactNumber());
        student.setAddress(studentDto.getAddress());

        // Create user account for the student if username and password are provided
        if (studentDto.getUsername() != null && studentDto.getPassword() != null) {
            System.out.println("Creating user account with username: " + studentDto.getUsername());
            
            if (userRepository.existsByUsername(studentDto.getUsername())) {
                throw new IllegalArgumentException("Username is already taken");
            }

            if (userRepository.existsByEmail(studentDto.getEmail())) {
                throw new IllegalArgumentException("Email is already in use for a user account");
            }

            User user = new User();
            user.setUsername(studentDto.getUsername());
            user.setEmail(studentDto.getEmail());
            user.setPassword(passwordEncoder.encode(studentDto.getPassword()));
            user.setFullName(studentDto.getName());
            user.setRole(User.ERole.ROLE_STUDENT);

            User savedUser = userRepository.save(user);
            System.out.println("User created with ID: " + savedUser.getId());
            student.setUser(savedUser);
        } else {
            System.out.println("No username or password provided, skipping user creation");
        }

        Student savedStudent = studentRepository.save(student);
        System.out.println("Student saved with ID: " + savedStudent.getId());
        
        StudentDto result = convertToDto(savedStudent);
        System.out.println("Returning DTO: " + result);
        return result;
    }

    @Transactional
    public StudentDto updateStudent(Long id, StudentDto studentDto) {
        System.out.println("Updating student ID " + id + " with data: " + studentDto);
        
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        System.out.println("Found existing student: " + student.getName() + ", class: " + 
                (student.getClasses() != null ? student.getClasses().getName() : "none"));

        // Check if email is being changed and if it's already in use
        if (!student.getEmail().equals(studentDto.getEmail()) &&
                studentRepository.existsByEmail(studentDto.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        // Check if roll number is being changed and if it's already in use in the same class
        Long currentClassId = student.getClasses() != null ? student.getClasses().getId() : null;
        if ((!student.getRollNo().equals(studentDto.getRollNo()) ||
                (currentClassId == null && studentDto.getClassId() != null) ||
                (currentClassId != null && !currentClassId.equals(studentDto.getClassId()))) &&
                studentRepository.existsByRollNoAndClassesId(studentDto.getRollNo(), studentDto.getClassId())) {
            throw new IllegalArgumentException("Roll number already exists in this class");
        }

        student.setName(studentDto.getName());
        student.setEmail(studentDto.getEmail());
        
        // Handle class assignment based on either classId or className
        if (studentDto.getClassId() != null) {
            System.out.println("Finding class by ID: " + studentDto.getClassId());
            student.setClasses(classesRepository.findById(studentDto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + studentDto.getClassId())));
            System.out.println("Class found by ID: " + student.getClasses().getName());
        } else if (studentDto.getClassName() != null && !studentDto.getClassName().isEmpty()) {
            System.out.println("Finding class by name: '" + studentDto.getClassName() + "'");
            try {
                student.setClasses(classesRepository.findByName(studentDto.getClassName())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with name: " + studentDto.getClassName())));
                System.out.println("Class found by name: " + student.getClasses().getName() + " with ID: " + student.getClasses().getId());
            } catch (Exception e) {
                System.err.println("Error finding class by name: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("No class ID or name provided in update");
        }
        
        student.setRollNo(studentDto.getRollNo());
        student.setContactNumber(studentDto.getContactNumber());
        student.setAddress(studentDto.getAddress());

        // Update user account if it exists
        if (student.getUser() != null) {
            User user = student.getUser();
            System.out.println("Updating user account: " + user.getUsername());
            
            user.setFullName(studentDto.getName());
            user.setEmail(studentDto.getEmail());
            
            // Update password if provided
            if (studentDto.getPassword() != null && !studentDto.getPassword().isEmpty()) {
                System.out.println("Updating password for user: " + user.getUsername());
                user.setPassword(passwordEncoder.encode(studentDto.getPassword()));
            } else {
                System.out.println("No password provided, keeping existing password");
            }
            
            // Update username if provided
            if (studentDto.getUsername() != null && !studentDto.getUsername().isEmpty() && 
                !user.getUsername().equals(studentDto.getUsername())) {
                System.out.println("Updating username from " + user.getUsername() + " to " + studentDto.getUsername());
                
                // Check if the new username is already taken
                if (userRepository.existsByUsername(studentDto.getUsername())) {
                    throw new IllegalArgumentException("Username is already taken");
                }
                user.setUsername(studentDto.getUsername());
            }
            
            User savedUser = userRepository.save(user);
            System.out.println("User updated with ID: " + savedUser.getId());
        } else {
            System.out.println("No user account associated with this student");
        }

        Student updatedStudent = studentRepository.save(student);
        System.out.println("Student updated with ID: " + updatedStudent.getId());
        
        StudentDto result = convertToDto(updatedStudent);
        System.out.println("Returning updated DTO: " + result);
        return result;
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        // Delete associated user account if it exists
        if (student.getUser() != null) {
            userRepository.delete(student.getUser());
        }

        studentRepository.delete(student);
    }

    /**
     * Check if the current authenticated user is the student with the given ID
     * @param studentId The student ID to check
     * @return true if the current user is the student, false otherwise
     */
    public boolean isCurrentStudent(Long studentId) {
        try {
            String username = getCurrentUsername();
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
            
            return student.getUser() != null && student.getUser().getUsername().equals(username);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get the username of the currently authenticated user
     * @return The username
     */
    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return principal.toString();
    }
    
    /**
     * Update only the personal details of a student (for student users)
     * @param id The student ID
     * @param studentDto The student DTO with updated personal details
     * @return The updated student DTO
     */
    @Transactional
    public StudentDto updateStudentPersonalDetails(Long id, StudentDto studentDto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        
        // Only update personal details, not academic info
        student.setContactNumber(studentDto.getContactNumber());
        student.setAddress(studentDto.getAddress());
        
        // Update user account email if it exists and has changed
        if (student.getUser() != null && studentDto.getEmail() != null && 
                !student.getEmail().equals(studentDto.getEmail())) {
            // Check if email is already in use
            if (studentRepository.existsByEmail(studentDto.getEmail())) {
                throw new IllegalArgumentException("Email is already in use");
            }
            
            student.setEmail(studentDto.getEmail());
            User user = student.getUser();
            user.setEmail(studentDto.getEmail());
            userRepository.save(user);
        }
        
        Student updatedStudent = studentRepository.save(student);
        return convertToDto(updatedStudent);
    }
    
    /**
     * Get attendance records for the current student
     * @param username The username of the student
     * @return List of attendance DTOs
     */
    public List<AttendanceDto> getStudentAttendance(String username) {
        Student student = getStudentByUsernameInternal(username);
        List<Attendance> attendanceList = attendanceRepository.findByStudentId(student.getId());
        return attendanceList.stream()
                .map(this::convertToAttendanceDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get attendance records for the current student within a date range
     * @param username The username of the student
     * @param startDate The start date
     * @param endDate The end date
     * @return List of attendance DTOs
     */
    public List<AttendanceDto> getStudentAttendanceByDateRange(String username, LocalDate startDate, LocalDate endDate) {
        Student student = getStudentByUsernameInternal(username);
        List<Attendance> attendanceList = attendanceRepository.findByStudentIdAndDateBetween(
                student.getId(), startDate, endDate);
        return attendanceList.stream()
                .map(this::convertToAttendanceDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get attendance statistics for the current student
     * @param username The username of the student
     * @return Map of attendance statistics
     */
    public Map<String, Object> getStudentAttendanceStats(String username) {
        Student student = getStudentByUsernameInternal(username);
        return getAttendanceStats(student.getId());
    }
    
    /**
     * Get a student by username (internal method)
     * @param username The username
     * @return The student entity
     */
    private Student getStudentByUsernameInternal(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        return studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for username: " + username));
    }
    
    /**
     * Get attendance statistics for a student
     * @param studentId The student ID
     * @return Map of attendance statistics
     */
    private Map<String, Object> getAttendanceStats(Long studentId) {
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
     * Convert Attendance entity to AttendanceDto
     * @param attendance The attendance entity
     * @return The attendance DTO
     */
    private AttendanceDto convertToAttendanceDto(Attendance attendance) {
        AttendanceDto dto = new AttendanceDto();
        dto.setId(attendance.getId());
        dto.setDate(attendance.getDate());
        dto.setStatus(attendance.getStatus());
        dto.setStudentId(attendance.getStudent().getId());
        dto.setStudentName(attendance.getStudent().getName());
        
        if (attendance.getClasses() != null) {
            dto.setClassId(attendance.getClasses().getId());
            dto.setClassName(attendance.getClasses().getName());
        }
        
        dto.setRemarks(attendance.getRemarks());
        return dto;
    }
    
    public StudentDto getStudentByUsername(String username) {
        Student student = getStudentByUsernameInternal(username);
        return convertToDto(student);
    }

    private StudentDto convertToDto(Student student) {
        StudentDto dto = new StudentDto();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        // Set class information
        if (student.getClasses() != null) {
            dto.setClassId(student.getClasses().getId());
            dto.setClassName(student.getClasses().getName());
        }
        dto.setRollNo(student.getRollNo());
        dto.setContactNumber(student.getContactNumber());
        dto.setAddress(student.getAddress());

        // Add username if user account exists
        if (student.getUser() != null) {
            dto.setUsername(student.getUser().getUsername());
        }

        return dto;
    }
}
