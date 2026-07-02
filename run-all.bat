@echo off
echo ===================================================
echo Starting Attendance Management System...
echo ===================================================

echo Starting Backend (Spring Boot)...
start "Backend - Port 5000" cmd /k "cd AttendanceBackEnd && mvnw spring-boot:run"

echo Starting Frontend (Vite + React)...
start "Frontend - Port 3000" cmd /k "cd AttendanceFrontEnd && npm run dev"

echo Both services are booting. You can open http://localhost:3000 in your browser.
