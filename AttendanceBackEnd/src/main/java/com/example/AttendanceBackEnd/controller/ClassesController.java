
package com.example.AttendanceBackEnd.controller;

import com.example.AttendanceBackEnd.dto.ClassesDto;
import com.example.AttendanceBackEnd.model.Classes;
import com.example.AttendanceBackEnd.repository.ClassesRepository;
import com.example.AttendanceBackEnd.service.ClassesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*")
public class ClassesController {

    @Autowired
    private ClassesService classesService;
    
    @Autowired
    private ClassesRepository classesRepository;

    @GetMapping
    public List<ClassesDto> getAllClasses() {
        return classesService.getAllClasses();
    }

    @GetMapping("/{id}")
    public ClassesDto getClassById(@PathVariable Long id) {
        return classesService.getClassById(id);
    }

    @PostMapping("/debug")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> debugCreateClass(@RequestBody ClassesDto dto) {
        Map<String, Object> response = new HashMap<>();
        response.put("receivedData", dto);
        
        // Validate required fields
        boolean hasName = dto.getName() != null && !dto.getName().isEmpty();
        boolean hasSection = dto.getSection() != null && !dto.getSection().isEmpty();
        boolean hasSubject = dto.getSubject() != null && !dto.getSubject().isEmpty();
        
        response.put("validation", Map.of(
            "hasName", hasName,
            "hasSection", hasSection,
            "hasSubject", hasSubject,
            "allFieldsPresent", hasName && hasSection && hasSubject
        ));
        
        // Check if name already exists
        boolean nameExists = classesRepository.existsByName(dto.getName());
        response.put("nameExists", nameExists);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ClassesDto createClass(@RequestBody ClassesDto dto) {
        System.out.println("Creating class with data: " + dto);
        return classesService.createClass(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClassesDto> updateClass(@PathVariable Long id, @RequestBody ClassesDto dto) {
        ClassesDto updated = classesService.updateClass(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteClass(@PathVariable Long id) {
        classesService.deleteClass(id);
    }
}
