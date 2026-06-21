package com.example.AttendanceBackEnd.service;

import com.example.AttendanceBackEnd.dto.ClassesDto;
import com.example.AttendanceBackEnd.exception.ResourceNotFoundException;
import com.example.AttendanceBackEnd.model.Classes;
import com.example.AttendanceBackEnd.repository.ClassesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClassesService {

    @Autowired
    private ClassesRepository classesRepository;

    public List<ClassesDto> getAllClasses() {
        return classesRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    public ClassesDto getClassById(Long id) {
        Classes classes = classesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + id));
        return convertToDto(classes);
    }

    @Transactional
    public ClassesDto createClass(ClassesDto classesDto) {
        if (classesRepository.existsByName(classesDto.getName())) {
            throw new IllegalArgumentException("Class with this name already exists");
        }

        Classes classes = new Classes();
        classes.setName(classesDto.getName());
        classes.setSection(classesDto.getSection());
        classes.setSubject(classesDto.getSubject());

        Classes savedClass = classesRepository.save(classes);
        return convertToDto(savedClass);
    }

    @Transactional
    public ClassesDto updateClass(Long id, ClassesDto classesDto) {
        Classes classes = classesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + id));

        if (!classes.getName().equals(classesDto.getName()) &&
                classesRepository.existsByName(classesDto.getName())) {
            throw new IllegalArgumentException("Class with this name already exists");
        }

        classes.setName(classesDto.getName());
        classes.setSection(classesDto.getSection());
        classes.setSubject(classesDto.getSubject());

        Classes updatedClass = classesRepository.save(classes);
        return convertToDto(updatedClass);
    }

    @Transactional
    public void deleteClass(Long id) {
        Classes classes = classesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + id));
        classesRepository.delete(classes);
    }

    private ClassesDto convertToDto(Classes classes) {
        ClassesDto dto = new ClassesDto();
        dto.setId(classes.getId());
        dto.setName(classes.getName());
        dto.setSection(classes.getSection());
        dto.setSubject(classes.getSubject());
        dto.setNumberOfStudents(classes.getStudents() != null ? classes.getStudents().size() : 0);
        // Teacher is now a single entity related to the class
        if (classes.getTeacher() != null) {
            dto.setTeacherId(classes.getTeacher().getId());
            dto.setTeacherName(classes.getTeacher().getName());
            dto.setNumberOfTeachers(1);
        } else {
            dto.setNumberOfTeachers(0);
        }
        return dto;
    }
}
