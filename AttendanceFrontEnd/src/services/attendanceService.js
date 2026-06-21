import api from './api';

const attendanceService = {
  // Mark attendance for students (both admin and teacher)
  markAttendance: async (attendanceData) => {
    try {
      console.log('Marking attendance with data:', attendanceData);
      
      // Format the data as expected by the backend
      const formattedData = {
        date: attendanceData.date,
        classId: attendanceData.classId,
        entries: attendanceData.entries.map(entry => ({
          studentId: entry.studentId,
          classId: entry.classId,
          status: entry.status,
          remarks: entry.remarks || ''
        }))
      };
      
      console.log('Formatted attendance data:', formattedData);
      
      // Use the correct endpoint from the backend
      const response = await api.post('/attendance/mark', formattedData);
      console.log('Attendance marked successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      throw error.response?.data || { message: 'Failed to mark attendance' };
    }
  },

  // Get attendance by date (admin only)
  getAttendanceByDate: async (date) => {
    try {
      const response = await api.get(`/attendance/date/${date}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendance' };
    }
  },

  // Get attendance by student ID
  getAttendanceByStudentId: async (studentId) => {
    try {
      const response = await api.get(`/attendance/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendance' };
    }
  },

  // Get attendance by student ID and date range
  getAttendanceByDateRange: async (studentId, startDate, endDate) => {
    try {
      const response = await api.get(`/attendance/student/${studentId}/range`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendance' };
    }
  },

  // Get attendance statistics for a student
  getAttendanceStats: async (studentId) => {
    try {
      const response = await api.get(`/attendance/percentage/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendance statistics' };
    }
  },
  
  // Get attendance statistics for a student by username
  getStudentAttendanceStats: async (username) => {
    try {
      const response = await api.get(`/students/attendance/stats`);
      console.log('Student attendance stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching student attendance stats:', error);
      throw error.response?.data || { message: 'Failed to fetch student attendance statistics' };
    }
  },
  
  // Get attendance for a student by username and date range
  getStudentAttendanceByDateRange: async (username, startDate, endDate) => {
    try {
      const response = await api.get(`/students/attendance`, {
        params: { startDate, endDate }
      });
      console.log('Student attendance by date range response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching student attendance by date range:', error);
      throw error.response?.data || { message: 'Failed to fetch student attendance' };
    }
  },
  
  // Get attendance by date and class
  getAttendanceByDateAndClass: async (date, classId) => {
    try {
      console.log(`Fetching attendance for date ${date} and class ${classId}`);
      
      // Use the correct endpoint from the backend
      // The backend expects: /api/attendance/class/{classId}?date={date}
      const response = await api.get(`/attendance/class/${classId}`, {
        params: { date }
      });
      
      console.log('Attendance data retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch attendance by date and class:', error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },
  
  // Get attendance report for a class within a date range
  getAttendanceReportByClass: async (classId, startDate, endDate) => {
    try {
      console.log(`Fetching attendance report for class ${classId} from ${startDate} to ${endDate}`);
      
      // Fetch all attendance records for the class
      const response = await api.get(`/attendance/class/${classId}`);
      console.log('Raw attendance data retrieved:', response.data);
      
      // Filter by date range (if the backend doesn't support date range filtering)
      const attendanceRecords = Array.isArray(response.data) ? response.data.filter(record => {
        const recordDate = new Date(record.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Set hours to 0 to compare dates only
        recordDate.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return recordDate >= start && recordDate <= end;
      }) : [];
      
      console.log('Filtered attendance records:', attendanceRecords);
      
      // Calculate statistics
      const uniqueStudents = new Set(attendanceRecords.map(record => record.studentId));
      const totalStudents = uniqueStudents.size;
      
      const uniqueDates = new Set(attendanceRecords.map(record => record.date));
      const totalDays = uniqueDates.size;
      
      const presentCount = attendanceRecords.filter(record => record.status === 'PRESENT').length;
      const absentCount = attendanceRecords.filter(record => record.status === 'ABSENT').length;
      
      // Prepare the report data
      const reportData = {
        attendanceRecords,
        totalStudents,
        totalDays,
        presentCount,
        absentCount
      };
      
      console.log('Processed attendance report:', reportData);
      return reportData;
    } catch (error) {
      console.error('Failed to fetch attendance report:', error);
      // Return empty report data to prevent UI errors
      return {
        attendanceRecords: [],
        totalStudents: 0,
        totalDays: 0,
        presentCount: 0,
        absentCount: 0
      };
    }
  }
};

export default attendanceService;
