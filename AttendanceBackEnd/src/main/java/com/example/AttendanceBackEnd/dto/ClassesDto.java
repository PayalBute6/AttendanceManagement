package com.example.AttendanceBackEnd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassesDto {
    private Long id;
    private String name;
    private String section;
    private String subject;
    private Long teacherId;
    private String teacherName;
    private int numberOfStudents;
    private int numberOfTeachers;
}
