package com.example.AttendanceBackEnd.dto;

import com.example.AttendanceBackEnd.model.Attendance;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequestDto {
    @NotNull
    private LocalDate date;
    
    @NotNull
    private Long classId;
    
    @NotEmpty
    private List<AttendanceEntry> entries;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceEntry {
        @NotNull
        private Long studentId;
        
        @NotNull
        private Attendance.AttendanceStatus status;
        
        private String remarks;
    }
}
