package com.example.AttendanceBackEnd.bootstrap;

import com.example.AttendanceBackEnd.model.User;
import com.example.AttendanceBackEnd.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== Starting Database Seeding Check ===");
        System.out.println("Total users in database: " + userRepository.count());
        userRepository.findAll().forEach(u -> System.out.println("Found user in database: " + u.getUsername() + " (Role: " + u.getRole() + ")"));

        java.util.Optional<User> adminOpt = userRepository.findByUsername("admin");
        if (!adminOpt.isPresent()) {
            System.out.println("Admin user not found. Seeding default system administrator...");
            User admin = User.builder()
                    .username("admin")
                    .email("admin@attendance.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .role(User.ERole.ROLE_ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Default admin user seeded successfully with password: admin123");
        } else {
            System.out.println("Admin user already exists. Updating/resetting password to: admin123");
            User admin = adminOpt.get();
            admin.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
            System.out.println("Admin user password reset successfully.");
        }
        System.out.println("=== Database Seeding Check Finished ===");
    }
}
