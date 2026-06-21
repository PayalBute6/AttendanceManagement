package com.example.AttendanceBackEnd.dto;

import com.example.AttendanceBackEnd.model.Attendance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDto {
    private Long id;
    
    @NotNull
    private LocalDate date;
    
    @NotNull
    private Attendance.AttendanceStatus status;
    
    @NotNull
    private Long studentId;
    
    private String studentName;
    
    private Long classId;
    
    private String className;
    
    private Long markedById;
    
    private String markedByName;
    
    private String remarks;
}
