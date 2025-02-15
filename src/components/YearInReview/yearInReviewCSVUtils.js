import instructorIds from '../../data/instructorIDs.json';

/**
 * CSV Data Processing
 * These functions process data that was originally loaded from a CSV file and stored in localStorage
 */

/**
 * Creates a map of workouts by timestamp from CSV data
 * @param {Array} csvData - Array of workout data from CSV
 */
const createWorkoutMap = (csvData) => {
  const workoutMap = new Map();

  csvData.forEach(csvWorkout => {
    if (!csvWorkout['Workout Timestamp']) return;

    // Parse the CSV timestamp format: "2021-11-22 12:14 (UTC)"
    const [datePart, timePart] = csvWorkout['Workout Timestamp'].split(' (UTC)')[0].split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // Create Date object in UTC
    const utcDate = Date.UTC(year, month - 1, day, hours, minutes, 0);
    const timestamp = Math.floor(utcDate / 1000);

    // Store the workout with its timestamp for lookup
    workoutMap.set(timestamp, {
      ...csvWorkout,
      instructor: csvWorkout['Instructor Name'],
      timestamp,
      originalTimestamp: csvWorkout['Workout Timestamp']
    });
  });

  return workoutMap;
};

/**
 * Process instructor data from CSV workouts
 */
const processInstructorData = (yearWorkouts, workoutMap, selectedYear) => {
  const instructorStats = {};

  // Get earliest bike date once
  const earliestBikeDate = findEarliestBikeDate(workoutMap);
  const bikeStartTimestamp = earliestBikeDate.getTime() / 1000;
  
  // Get all unique workouts for the selected period
  const uniqueWorkouts = new Map();
  Array.from(workoutMap.values()).forEach(workout => {
    if (selectedYear === 'bike' && workout.timestamp >= bikeStartTimestamp) {
      uniqueWorkouts.set(workout.timestamp, workout);
    } else if (selectedYear === 'all') {
      uniqueWorkouts.set(workout.timestamp, workout);
    } else {
      const year = new Date(workout.timestamp * 1000).getFullYear();
      if (year === selectedYear) {
        uniqueWorkouts.set(workout.timestamp, workout);
      }
    }
  });

  const workoutsInYear = Array.from(uniqueWorkouts.values());
  
  // Process workouts
  workoutsInYear.forEach(workout => {
    const instructorName = workout['Instructor Name'];
    if (!instructorName || instructorName.trim() === '') return;

    // Find instructor ID from the name
    const instructorId = Object.entries(instructorIds).find(([, data]) => data.name === instructorName)?.[0];
    if (!instructorId) return;

    if (!instructorStats[instructorId]) {
      instructorStats[instructorId] = {
        id: instructorId,
        name: instructorName,
        workouts: 0,
        totalMinutes: 0,
        workoutTypes: {}
      };
    }

    instructorStats[instructorId].workouts += 1;
    const duration = workout['Length (minutes)'] || 0;
    instructorStats[instructorId].totalMinutes += duration;

    const workoutType = workout['Fitness Discipline'] || 'Unknown';
    instructorStats[instructorId].workoutTypes[workoutType] =
      (instructorStats[instructorId].workoutTypes[workoutType] || 0) + 1;
  });

  // Find favorite instructor
  const validInstructors = Object.entries(instructorStats)
    .filter(([id]) => {
      const instructor = instructorIds[id];
      return instructor && instructor.name !== 'Unknown Instructor';
    })
    .sort(([,a], [,b]) => {
      if (b.workouts !== a.workouts) return b.workouts - a.workouts;
      return b.totalMinutes - a.totalMinutes;
    });

  if (validInstructors.length === 0) {
    return {
      name: 'No instructor found',
      workouts: 0,
      totalMinutes: 0,
      workoutTypes: {}
    };
  }

  const favoriteInstructor = validInstructors[0][1];

  // Add top class type
  const topType = Object.entries(favoriteInstructor.workoutTypes)
    .sort((a,b) => b[1] - a[1])[0];
  favoriteInstructor.topClassType = topType ? topType[0] : 'N/A';

  return favoriteInstructor;
};

/**
 * Helper function to format time statistics
 */
const formatTimeStats = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const workingDays = (hours / 8).toFixed(1);

  return {
    hours,
    minutes,
    workingDays: hours >= 8 ? workingDays : null,
    displayText: minutes > 0 ? `${hours} hrs ${minutes} mins` : `${hours} hrs`
  };
};

/**
 * Helper function to check if a workout is within the selected period
 */
const isWorkoutInPeriod = (timestamp, selectedYear, bikeStartTimestamp) => {
  if (selectedYear === 'bike') {
    return timestamp >= bikeStartTimestamp;
  } else if (selectedYear === 'all') {
    return true;
  } else {
    const workoutYear = new Date(timestamp * 1000).getFullYear();
    return workoutYear === selectedYear;
  }
};

/**
 * Get workout time profile from CSV data
 */
const getWorkoutTimeProfile = (workoutMap, selectedYear, bikeStartTimestamp) => {
  const timeSlots = {
    earlyBird: { name: 'Early Bird', count: 0, timeRange: 'Midnight-10am', start: 0, end: 10 },
    daytimeRider: { name: 'Daytime Rider', count: 0, timeRange: '10am-4:30pm', start: 10, end: 16.5 },
    postWorkPro: { name: 'Post Work Pro', count: 0, timeRange: '4:30pm-8pm', start: 16.5, end: 20 },
    nightOwl: { name: 'Night Owl', count: 0, timeRange: '8pm-Midnight', start: 20, end: 24 }
  };

  Array.from(workoutMap.values()).forEach(workout => {
    const timestamp = new Date(workout['Workout Timestamp'].split(' (GMT)')[0]).getTime() / 1000;
    
    if (!isWorkoutInPeriod(timestamp, selectedYear, bikeStartTimestamp)) return;

    const timeStr = workout['Workout Timestamp'].split(' ')[1];
    const [hours, minutes] = timeStr.split(':').map(Number);
    const timeInHours = hours + (minutes / 60);

    if (timeInHours >= timeSlots.earlyBird.start && timeInHours < timeSlots.earlyBird.end) {
      timeSlots.earlyBird.count++;
    } else if (timeInHours >= timeSlots.daytimeRider.start && timeInHours < timeSlots.daytimeRider.end) {
      timeSlots.daytimeRider.count++;
    } else if (timeInHours >= timeSlots.postWorkPro.start && timeInHours < timeSlots.postWorkPro.end) {
      timeSlots.postWorkPro.count++;
    } else {
      timeSlots.nightOwl.count++;
    }
  });

  return Object.values(timeSlots)
    .sort((a,b) => b.count - a.count)
    .map((slot,index) => ({
      ...slot,
      rank: index + 1,
      isTop: index === 0
    }));
};

/**
 * Find earliest bike date from CSV data
 */
const findEarliestBikeDate = (data) => {
  let workouts;
  if (data instanceof Map) {
    workouts = Array.from(data.values());
  } else if (Array.isArray(data)) {
    workouts = data;
  } else {
    console.warn('Invalid data format for findEarliestBikeDate');
    return new Date();
  }

  const bikeDates = workouts
    .filter(workout => {
      const isCycling = workout['Fitness Discipline'] === 'Cycling';
      const hasOutput = parseFloat(workout['Total Output']) > 0;
      return isCycling && hasOutput;
    })
    .map(workout => new Date(workout['Workout Timestamp'].split(' (')[0]));

  if (bikeDates.length === 0) return new Date();

  return new Date(Math.min(...bikeDates));
};

export {
  createWorkoutMap,
  processInstructorData,
  formatTimeStats,
  isWorkoutInPeriod,
  getWorkoutTimeProfile,
  findEarliestBikeDate
};
