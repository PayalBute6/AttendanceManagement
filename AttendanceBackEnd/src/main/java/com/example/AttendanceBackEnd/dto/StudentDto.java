package com.example.AttendanceBackEnd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    private Long id;
    
    @NotBlank
    @Size(max = 100)
    private String name;
    
    @NotBlank
    @Size(max = 100)
    @Email
    private String email;
    
    private Long classId;
    
    private String className;
    
    @NotBlank
    @Size(max = 20)
    private String rollNo;
    
    @Size(max = 20)
    private String contactNumber;
    
    @Size(max = 255)
    private String address;
    
    // For creating a user account for the student
    private String username;
    private String password;
}
