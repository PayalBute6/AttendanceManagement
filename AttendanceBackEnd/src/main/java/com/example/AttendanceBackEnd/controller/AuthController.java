package com.example.AttendanceBackEnd.controller;

import com.example.AttendanceBackEnd.dto.JwtResponse;
import com.example.AttendanceBackEnd.dto.LoginRequest;
import com.example.AttendanceBackEnd.dto.MessageResponse;
import com.example.AttendanceBackEnd.dto.SignupRequest;
import com.example.AttendanceBackEnd.dto.PasswordChangeRequest;
import com.example.AttendanceBackEnd.dto.UserProfileUpdateRequest;
import com.example.AttendanceBackEnd.model.User;
import com.example.AttendanceBackEnd.model.Student;
import com.example.AttendanceBackEnd.model.Teacher;
import com.example.AttendanceBackEnd.repository.UserRepository;
import com.example.AttendanceBackEnd.repository.StudentRepository;
import com.example.AttendanceBackEnd.repository.TeacherRepository;
import org.springframework.transaction.annotation.Transactional;
import com.example.AttendanceBackEnd.security.jwt.JwtUtils;
import java.util.List;
import com.example.AttendanceBackEnd.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    TeacherRepository teacherRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getFullName(),
                userDetails.getAuthorities().stream().findFirst().get().getAuthority()
        ));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setFullName(signUpRequest.getFullName());

        // Determine role
        String strRole = signUpRequest.getRole();
        User.ERole role = User.ERole.ROLE_STUDENT; // default

        if ("admin".equalsIgnoreCase(strRole)) {
            role = User.ERole.ROLE_ADMIN;
        } else if ("teacher".equalsIgnoreCase(strRole)) {
            role = User.ERole.ROLE_TEACHER;
        }

        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        return ResponseEntity.ok(userDetails);
    }
    
    @PutMapping("/update")
    public ResponseEntity<?> updateUserProfile(@Valid @RequestBody UserProfileUpdateRequest updateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Optional<User> userOptional = userRepository.findById(userDetails.getId());
        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }
        
        User user = userOptional.get();
        
        // Update fields if provided
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().isEmpty()) {
            // Check if email is already in use by another user
            if (!user.getEmail().equals(updateRequest.getEmail()) && 
                userRepository.existsByEmail(updateRequest.getEmail())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Email is already in use"));
            }
            user.setEmail(updateRequest.getEmail());
        }
        
        if (updateRequest.getFullName() != null && !updateRequest.getFullName().isEmpty()) {
            user.setFullName(updateRequest.getFullName());
        }
        
        if (updateRequest.getPhoneNumber() != null) {
            user.setPhoneNumber(updateRequest.getPhoneNumber());
        }
        
        userRepository.save(user);
        
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody PasswordChangeRequest passwordRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        Optional<User> userOptional = userRepository.findById(userDetails.getId());
        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }
        
        User user = userOptional.get();
        
        // Verify current password
        if (!encoder.matches(passwordRequest.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Current password is incorrect"));
        }
        
        // Update password
        user.setPassword(encoder.encode(passwordRequest.getNewPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findByRole(User.ERole.ROLE_ADMIN));
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> editUser(@PathVariable Long id, @RequestBody User profileData) {
        Optional<User> userOptional = userRepository.findById(id);
        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found"));
        }
        User user = userOptional.get();

        // Only allow editing if the user is an admin
        if (user.getRole() != User.ERole.ROLE_ADMIN) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: You can only edit admin accounts here. Students and Teachers must be edited via their respective portals."));
        }

        if (profileData.getUsername() != null && !profileData.getUsername().trim().isEmpty()) {
            Optional<User> existingUser = userRepository.findByUsername(profileData.getUsername());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
            }
            user.setUsername(profileData.getUsername());
        }

        if (profileData.getEmail() != null && !profileData.getEmail().trim().isEmpty()) {
            Optional<User> existingEmail = userRepository.findByEmail(profileData.getEmail());
            if (existingEmail.isPresent() && !existingEmail.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already taken!"));
            }
            user.setEmail(profileData.getEmail());
        }

        if (profileData.getFullName() != null) {
            user.setFullName(profileData.getFullName());
        }

        if (profileData.getPhoneNumber() != null) {
            user.setPhoneNumber(profileData.getPhoneNumber());
        }

        if (profileData.getPassword() != null && !profileData.getPassword().trim().isEmpty()) {
            user.setPassword(encoder.encode(profileData.getPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Admin user updated successfully"));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found"));
        }
        User user = userOptional.get();

        // Only allow deleting if the user is an admin
        if (user.getRole() != User.ERole.ROLE_ADMIN) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: You can only delete admin accounts here. Students and Teachers must be deleted via their respective portals."));
        }

        // Admins are not linked to Student or Teacher profiles, so we can delete directly.
        userRepository.delete(user);
        return ResponseEntity.ok(new MessageResponse("Admin user deleted successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        return ResponseEntity.ok(new MessageResponse("Log out successful"));
    }
}
