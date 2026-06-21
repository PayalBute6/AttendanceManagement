package com.example.AttendanceBackEnd.dto;

import javax.validation.constraints.Email;

public class UserProfileUpdateRequest {
    private String fullName;
    
    @Email
    private String email;
    
    private String phoneNumber;

    public UserProfileUpdateRequest() {
    }

    public UserProfileUpdateRequest(String fullName, String email, String phoneNumber) {
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
