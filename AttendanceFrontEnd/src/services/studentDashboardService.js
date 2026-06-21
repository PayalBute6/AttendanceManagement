import api from './api';
import attendanceService from './attendanceService';
import studentService from './studentService';

const studentDashboardService = {
  // Get student dashboard data (combines student info and attendance stats)
  getStudentDashboardData: async (studentId) => {
    try {
      // Get student data
      const studentData = await studentService.getStudentById(studentId);
      
      // Get attendance statistics
      const attendanceStats = await attendanceService.getAttendanceStats(studentId);
      
      return {
        studentData,
        attendanceStats
      };
    } catch (error) {
      console.error('Error fetching student dashboard data:', error);
      throw error.response?.data || { message: 'Failed to fetch student dashboard data' };
    }
  },
  
  // Get attendance history for a student with date range
  getAttendanceHistory: async (studentId, startDate, endDate) => {
    try {
      const attendanceData = await attendanceService.getAttendanceByDateRange(
        studentId,
        startDate,
        endDate
      );
      
      // Transform the data to include day names and proper status format
      return attendanceData.map(record => {
        const date = new Date(record.date);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        return {
          id: record.id,
          date: record.date,
          formattedDate: new Date(record.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          day: dayNames[date.getDay()],
          status: record.status.toLowerCase(), // Convert 'PRESENT'/'ABSENT' to 'present'/'absent'
          className: record.className || '',
          notes: record.notes || ''
        };
      });
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      throw error.response?.data || { message: 'Failed to fetch attendance history' };
    }
  },
  
  // Get attendance summary for current month
  getCurrentMonthSummary: async (studentId) => {
    try {
      // Calculate current month date range
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const formattedFirstDay = firstDayOfMonth.toISOString().split('T')[0];
      const formattedLastDay = lastDayOfMonth.toISOString().split('T')[0];
      
      // Get attendance for current month
      const monthlyAttendance = await attendanceService.getAttendanceByDateRange(
        studentId,
        formattedFirstDay,
        formattedLastDay
      );
      
      // Calculate summary statistics
      const totalDays = monthlyAttendance.length;
      const presentDays = monthlyAttendance.filter(record => 
        record.status.toUpperCase() === 'PRESENT').length;
      const absentDays = totalDays - presentDays;
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      
      return {
        month: today.toLocaleString('default', { month: 'long' }),
        year: today.getFullYear(),
        totalDays,
        presentDays,
        absentDays,
        attendanceRate: Math.round(attendanceRate)
      };
    } catch (error) {
      console.error('Error fetching monthly attendance summary:', error);
      throw error.response?.data || { message: 'Failed to fetch monthly attendance summary' };
    }
  }
};

export default studentDashboardService;
