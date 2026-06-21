import api from './api';

const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      // Get total students count
      const studentsResponse = await api.get('/students');
      const totalStudents = studentsResponse.data.length;

      // Get total teachers count
      const teachersResponse = await api.get('/teachers');
      const totalTeachers = teachersResponse.data.length;
      
      // Get total classes count
      let totalClasses = 0;
      try {
        const classesResponse = await api.get('/classes');
        totalClasses = classesResponse.data.length;
        console.log('Total classes:', totalClasses);
      } catch (classError) {
        console.error('Error fetching classes count:', classError);
      }

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      // Get today's attendance
      const attendanceResponse = await api.get(`/attendance/date/${today}`);
      const todayAttendance = attendanceResponse.data || [];

      // Calculate present and absent counts
      const presentToday = todayAttendance.filter(record => record.status === 'PRESENT').length;
      const absentToday = todayAttendance.filter(record => record.status === 'ABSENT').length;

      // Calculate attendance rate (if no records, default to 100%)
      const attendanceRate = todayAttendance.length > 0 
        ? Math.round((presentToday / todayAttendance.length) * 100) 
        : 100;

      return {
        totalStudents,
        totalTeachers,
        totalClasses,  // Adding classes count
        presentToday,
        absentToday,
        attendanceRate
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values if API calls fail
      return {
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,  // Default for classes in case of error
        presentToday: 0,
        absentToday: 0,
        attendanceRate: 0
      };
    }
  },

  // Get recent activity (since we don't have a dedicated API for this,
  // we'll combine attendance and user activity logs)
  getRecentActivity: async () => {
    try {
      let activities = [];
      let activityId = 1;
      
      try {
        const studentsResponse = await api.get('/students');
        const students = studentsResponse.data || [];
        
        // Take the 3 most recent students (assuming they're sorted by creation date)
        const recentStudents = students.slice(0, 3);
        
        recentStudents.forEach(student => {
          activities.push({
            id: activityId++,
            action: `New student added: ${student.name}`,
            timestamp: new Date().toISOString() // Use current time as we don't have creation timestamps
          });
        });
      } catch (error) {
        console.error('Error fetching recent students:', error);
      }

      // Get recent attendance records
      try {
        // Get attendance for the last 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        // Since we don't have a date range API, we'll just use today's date
        const attendanceResponse = await api.get(`/attendance/date/${formattedEndDate}`);
        const recentAttendance = attendanceResponse.data || [];
        
        if (recentAttendance.length > 0) {
          activities.push({
            id: activityId++,
            action: `Attendance marked for ${recentAttendance.length} students`,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error fetching recent attendance:', error);
      }

      // Get recent teachers (newest first)
      try {
        const teachersResponse = await api.get('/teachers');
        const teachers = teachersResponse.data || [];
        
        // Take the 3 most recent teachers (assuming they're sorted by creation date)
        const recentTeachers = teachers.slice(0, 3);
        
        recentTeachers.forEach(teacher => {
          activities.push({
            id: activityId++,
            action: `New teacher added: ${teacher.name}`,
            timestamp: new Date().toISOString() // Use current time as we don't have creation timestamps
          });
        });
      } catch (error) {
        console.error('Error fetching recent teachers:', error);
      }

      // Sort activities by timestamp (newest first)
      return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  },

  // Get teacher-specific dashboard statistics
  getTeacherAttendanceStats: async (teacherId) => {
    try {
      console.log(`Fetching attendance stats for teacher ID: ${teacherId}`);
      
      // Get classes assigned to this teacher using the correct endpoint
      // Use getAssignedClasses if no teacherId is provided (for current teacher)
      let teacherClasses = [];
      try {
        if (teacherId) {
          const classesResponse = await api.get(`/teachers/${teacherId}/classes`);
          teacherClasses = classesResponse.data || [];
        } else {
          const classesResponse = await api.get('/teachers/classes');
          teacherClasses = classesResponse.data || [];
        }
        console.log('Teacher classes:', teacherClasses);
      } catch (classError) {
        console.error('Error fetching teacher classes:', classError);
        teacherClasses = [];
      }
      
      // Get all students in teacher's classes
      let totalStudents = 0;
      for (const classItem of teacherClasses) {
        try {
          // Use the correct endpoint for fetching students by class
          const studentsResponse = await api.get(`/teachers/classes/${classItem.id}/students`);
          const classStudents = studentsResponse.data || [];
          totalStudents += classStudents.length;
          console.log(`Class ${classItem.name} has ${classStudents.length} students`);
        } catch (studentError) {
          console.error(`Error fetching students for class ${classItem.id}:`, studentError);
          // Try alternative endpoint
          try {
            const altResponse = await api.get(`/classes/${classItem.id}/students`);
            const altStudents = altResponse.data || [];
            totalStudents += altStudents.length;
            console.log(`Class ${classItem.name} has ${altStudents.length} students (alt endpoint)`);
          } catch (altError) {
            console.error(`Alternative endpoint also failed for class ${classItem.id}:`, altError);
          }
        }
      }
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      console.log(`Getting attendance for date: ${today}`);
      
      // Get today's attendance for teacher's classes
      let presentToday = 0;
      let absentToday = 0;
      
      for (const classItem of teacherClasses) {
        try {
          // Use the correct endpoint for fetching attendance by class and date
          // The endpoint is: /api/attendance/class/{classId}?date={date}
          const attendanceResponse = await api.get(`/attendance/class/${classItem.id}`, {
            params: { date: today }
          });
          const classAttendance = attendanceResponse.data || [];
          console.log(`Class ${classItem.name} attendance:`, classAttendance);
          
          presentToday += classAttendance.filter(record => record.status === 'PRESENT').length;
          absentToday += classAttendance.filter(record => record.status === 'ABSENT').length;
        } catch (error) {
          console.error(`Error fetching attendance for class ${classItem.id}:`, error);
        }
      }
      
      // Calculate attendance rate (if no records, default to 0%)
      const totalMarked = presentToday + absentToday;
      const attendanceRate = totalMarked > 0 
        ? Math.round((presentToday / totalMarked) * 100) 
        : 0;
      
      const stats = {
        totalStudents,
        presentToday,
        absentToday,
        attendanceRate
      };
      
      console.log('Calculated teacher stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching teacher attendance stats:', error);
      // Return default values if API calls fail
      return {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        attendanceRate: 0
      };
    }
  },
  
  // Get recent activity specific to a teacher
  getTeacherRecentActivity: async (teacherId) => {
    try {
      console.log(`Fetching recent activity for teacher ID: ${teacherId}`);
      let activities = [];
      let activityId = 1;
      
      // Get classes assigned to this teacher using the correct endpoint
      let teacherClasses = [];
      try {
        if (teacherId) {
          const classesResponse = await api.get(`/teachers/${teacherId}/classes`);
          teacherClasses = classesResponse.data || [];
        } else {
          const classesResponse = await api.get('/teachers/classes');
          teacherClasses = classesResponse.data || [];
        }
        console.log('Teacher classes for activity:', teacherClasses);
        
        if (teacherClasses.length > 0) {
          activities.push({
            id: activityId++,
            action: `You have ${teacherClasses.length} classes assigned`,
            timestamp: new Date().toISOString()
          });
        }
      } catch (classError) {
        console.error('Error fetching teacher classes for activity:', classError);
      }
      
      // Get recent attendance for teacher's classes
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      console.log(`Fetching attendance from ${formattedStartDate} to ${formattedEndDate}`);
      
      for (const classItem of teacherClasses) {
        try {
          // Get today's attendance using the correct endpoint
          const today = new Date().toISOString().split('T')[0];
          const attendanceResponse = await api.get(`/attendance/class/${classItem.id}`, {
            params: { date: today }
          });
          const classAttendance = attendanceResponse.data || [];
          
          if (classAttendance.length > 0) {
            activities.push({
              id: activityId++,
              action: `Attendance marked for ${classAttendance.length} students in ${classItem.name || classItem.className}`,
              timestamp: new Date().toISOString()
            });
          }
          
          // Try to get attendance for the past week
          try {
            // Use the attendance report endpoint we implemented earlier
            const reportResponse = await api.get(`/attendance/class/${classItem.id}/range`, {
              params: {
                startDate: formattedStartDate,
                endDate: formattedEndDate
              }
            });
            
            if (reportResponse.data && reportResponse.data.length > 0) {
              activities.push({
                id: activityId++,
                action: `${reportResponse.data.length} attendance records in the past week for ${classItem.name || classItem.className}`,
                timestamp: new Date(startDate).toISOString()
              });
            }
          } catch (rangeError) {
            console.error(`Error fetching attendance range for class ${classItem.id}:`, rangeError);
            // Fallback: Don't add this activity
          }
        } catch (error) {
          console.error(`Error fetching attendance for class ${classItem.id}:`, error);
        }
      }
      
      // Add some student-related activities if we don't have many activities
      if (activities.length < 3 && teacherClasses.length > 0) {
        try {
          // Try to get students from the first class
          const firstClass = teacherClasses[0];
          const studentsResponse = await api.get(`/teachers/classes/${firstClass.id}/students`);
          const students = studentsResponse.data || [];
          
          if (students.length > 0) {
            activities.push({
              id: activityId++,
              action: `${students.length} students enrolled in ${firstClass.name || firstClass.className}`,
              timestamp: new Date(startDate).toISOString()
            });
          }
        } catch (studentError) {
          console.error('Error fetching students for activity:', studentError);
        }
      }
      
      // Sort activities by timestamp (newest first)
      const sortedActivities = activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      console.log('Teacher activities:', sortedActivities);
      return sortedActivities;
    } catch (error) {
      console.error('Error fetching teacher recent activity:', error);
      return [];
    }
  }
};

export default dashboardService;
