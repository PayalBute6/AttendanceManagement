package com.example.AttendanceBackEnd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDto {

    private Long id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 100)
    @Email
    private String email;

    @NotBlank
    @Size(max = 50)
    private String department;

    @Size(max = 20)
    private String contactNumber;

    @Size(max = 255)
    private String address;
    
    @Size(max = 255)
    private String qualification;
    
    // List of class IDs assigned to this teacher
    private List<Long> assignedClassIds;

    // For creating a user account for the teacher
    private String username;
    private String password;
}
