package com.example.AttendanceBackEnd.service;

import com.example.AttendanceBackEnd.dto.ClassesDto;
import com.example.AttendanceBackEnd.dto.StudentDto;
import com.example.AttendanceBackEnd.dto.TeacherDto;
import com.example.AttendanceBackEnd.exception.ResourceNotFoundException;
import com.example.AttendanceBackEnd.model.Classes;
import com.example.AttendanceBackEnd.model.Student;
import com.example.AttendanceBackEnd.model.Teacher;
import com.example.AttendanceBackEnd.model.User;
import com.example.AttendanceBackEnd.repository.ClassesRepository;
import com.example.AttendanceBackEnd.repository.StudentRepository;
import com.example.AttendanceBackEnd.repository.TeacherRepository;
import com.example.AttendanceBackEnd.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeacherService {


    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ClassesRepository classesRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Fetch all teachers
    public List<TeacherDto> getAllTeachers() {
        return teacherRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Fetch teacher by ID
    public TeacherDto getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
        return convertToDto(teacher);
    }

    // Create a new teacher (Admin only)
    @Transactional
    public TeacherDto createTeacher(@Valid TeacherDto dto) {
        if (teacherRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        Teacher teacher = new Teacher();
        teacher.setName(dto.getName());
        teacher.setEmail(dto.getEmail());
        teacher.setDepartment(dto.getDepartment());
        teacher.setContactNumber(dto.getContactNumber());
        teacher.setAddress(dto.getAddress());

        // Create user account if credentials are given
        if (dto.getUsername() != null && dto.getPassword() != null) {
            if (userRepository.existsByUsername(dto.getUsername())) {
                throw new IllegalArgumentException("Username is already taken");
            }

            User user = new User();
            user.setUsername(dto.getUsername());
            user.setEmail(dto.getEmail());
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setFullName(dto.getName());
            user.setRole(User.ERole.ROLE_TEACHER);

            User savedUser = userRepository.save(user);
            teacher.setUser(savedUser);
        }

        Teacher savedTeacher = teacherRepository.save(teacher);
        return convertToDto(savedTeacher);
    }

    // Update an existing teacher
    @Transactional
    public TeacherDto updateTeacher(Long id, @Valid TeacherDto dto) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));

        if (!teacher.getEmail().equals(dto.getEmail()) && teacherRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        teacher.setName(dto.getName());
        teacher.setEmail(dto.getEmail());
        teacher.setDepartment(dto.getDepartment());
        teacher.setContactNumber(dto.getContactNumber());
        teacher.setAddress(dto.getAddress());

        // Update user account details if exists
        if (teacher.getUser() != null) {
            User user = teacher.getUser();
            user.setFullName(dto.getName());
            user.setEmail(dto.getEmail());
            userRepository.save(user);
        }

        Teacher updatedTeacher = teacherRepository.save(teacher);
        return convertToDto(updatedTeacher);
    }

    // Delete teacher by ID
    @Transactional
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));

        if (teacher.getUser() != null) {
            userRepository.delete(teacher.getUser());
        }

        teacherRepository.delete(teacher);
    }

    // Get the current logged-in teacher (based on security context)
    public TeacherDto getCurrentLoggedInTeacher() {
        String username = getCurrentUsername();
        Teacher teacher = teacherRepository.findAll().stream()
                .filter(t -> t.getUser() != null && t.getUser().getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for username: " + username));

        return convertToDto(teacher);
    }

    // Fetch username from the security context (authentication object)
    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        throw new IllegalStateException("No authenticated user found");
    }

    /**
     * Check if the current authenticated user is the teacher with the given ID
     * @param teacherId The teacher ID to check
     * @return true if the current user is the teacher, false otherwise
     */
    public boolean isCurrentTeacher(Long teacherId) {
        try {
            String username = getCurrentUsername();
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + teacherId));
            
            return teacher.getUser() != null && teacher.getUser().getUsername().equals(username);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get the classes assigned to the current teacher
     * @return List of ClassesDto objects
     */
    public List<ClassesDto> getAssignedClasses() {
        String username = getCurrentUsername();
        Teacher teacher = teacherRepository.findAll().stream()
                .filter(t -> t.getUser() != null && t.getUser().getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for username: " + username));
        
        return teacher.getAssignedClasses().stream()
                .map(this::convertClassToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get students in a specific class (only if the teacher is assigned to that class)
     * @param classId The class ID
     * @return List of StudentDto objects
     */
    public List<StudentDto> getStudentsInClass(Long classId) {
        String username = getCurrentUsername();
        Teacher teacher = teacherRepository.findAll().stream()
                .filter(t -> t.getUser() != null && t.getUser().getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for username: " + username));
        
        // Check if the teacher is assigned to this class
        boolean isAssigned = teacher.getAssignedClasses().stream()
                .anyMatch(c -> c.getId().equals(classId));
        
        if (!isAssigned) {
            throw new IllegalArgumentException("You are not assigned to this class");
        }
        
        Classes classes = classesRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));
        
        return classes.getStudents().stream()
                .map(this::convertStudentToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Assign a class to a teacher (admin only)
     * @param teacherId The teacher ID
     * @param classId The class ID
     */
    @Transactional
    public void assignClassToTeacher(Long teacherId, Long classId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + teacherId));
        
        Classes classes = classesRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));
        
        // Check if the class is already assigned to this teacher
        boolean alreadyAssigned = teacher.getAssignedClasses().stream()
                .anyMatch(c -> c.getId().equals(classId));
        
        if (alreadyAssigned) {
            throw new IllegalArgumentException("Class is already assigned to this teacher");
        }
        
        // Set the teacher for the class
        classes.setTeacher(teacher);
        classesRepository.save(classes);
    }
    
    /**
     * Remove a class assignment from a teacher (admin only)
     * @param teacherId The teacher ID
     * @param classId The class ID
     */
    @Transactional
    public void removeClassFromTeacher(Long teacherId, Long classId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + teacherId));
        
        Classes classes = classesRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));
        
        // Check if the class is assigned to this teacher
        boolean isAssigned = teacher.getAssignedClasses().stream()
                .anyMatch(c -> c.getId().equals(classId));
        
        if (!isAssigned) {
            throw new IllegalArgumentException("Class is not assigned to this teacher");
        }
        
        // Remove the teacher from the class
        classes.setTeacher(null);
        classesRepository.save(classes);
    }
    
    /**
     * Convert Class entity to ClassesDto
     */
    private ClassesDto convertClassToDto(Classes classes) {
        ClassesDto dto = new ClassesDto();
        dto.setId(classes.getId());
        dto.setName(classes.getName());
        dto.setSection(classes.getSection());
        dto.setSubject(classes.getSubject());
        dto.setNumberOfStudents(classes.getStudents() != null ? classes.getStudents().size() : 0);
        return dto;
    }
    
    /**
     * Convert Student entity to StudentDto
     */
    private StudentDto convertStudentToDto(Student student) {
        StudentDto dto = new StudentDto();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setRollNo(student.getRollNo());
        dto.setContactNumber(student.getContactNumber());
        dto.setAddress(student.getAddress());
        
        if (student.getClasses() != null) {
            dto.setClassId(student.getClasses().getId());
            dto.setClassName(student.getClasses().getName());
        }
        
        if (student.getUser() != null) {
            dto.setUsername(student.getUser().getUsername());
        }
        
        return dto;
    }
    
    // Convert Teacher entity to TeacherDto
    private TeacherDto convertToDto(Teacher teacher) {
        TeacherDto dto = new TeacherDto();
        dto.setId(teacher.getId());
        dto.setName(teacher.getName());
        dto.setEmail(teacher.getEmail());
        dto.setDepartment(teacher.getDepartment());
        dto.setContactNumber(teacher.getContactNumber());
        dto.setAddress(teacher.getAddress());
        dto.setQualification(teacher.getQualification());
        
        if (teacher.getUser() != null) {
            dto.setUsername(teacher.getUser().getUsername());
        }
        
        // Add assigned classes information
        if (teacher.getAssignedClasses() != null && !teacher.getAssignedClasses().isEmpty()) {
            List<Long> assignedClassIds = teacher.getAssignedClasses().stream()
                    .map(Classes::getId)
                    .collect(Collectors.toList());
            dto.setAssignedClassIds(assignedClassIds);
        }
        
        return dto;
    }
}
