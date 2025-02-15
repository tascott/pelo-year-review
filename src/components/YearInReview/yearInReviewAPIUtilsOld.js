import instructorIds from '../../data/instructorIDs.json';
import { findEarliestBikeDate } from './yearInReviewCSVUtils';
/**
 * API Data Processing
 * These functions process data that was originally loaded from the Peloton API and stored in localStorage
 */

/**
 * Process workout data from API
 */
const processWorkoutData = (workouts, csvData, selectedYear) => {
  // Get earliest bike date

  console.log('xxxxxxxxx', workouts)
  const earliestBikeDate = findEarliestBikeDate(csvData);
  const bikeStartTimestamp = earliestBikeDate.getTime() / 1000;


  // Create a map of workouts by timestamp
  const workoutMap = new Map();
  workouts.forEach(workout => {
    workoutMap.set(workout.start_time, workout);
  });

  // Process instructor data
  const favoriteInstructor = processInstructorData(workouts, workoutMap, selectedYear);

  // Get workout time profile
  const workoutTimeProfile = getWorkoutTimeProfile(workoutMap, selectedYear, bikeStartTimestamp);

  // Process workout stats
  const totalWorkouts = workouts.length;
  console.log('totalWorkoutsSSSSSSSS: ', workouts)
  const totalMinutes = workouts.reduce((sum, workout) => sum + ((workout.duration || 0) / 60), 0);
  const timeStats = formatTimeStats(totalMinutes);

  // Get workout types
  const workoutTypes = {};
  workouts.forEach(workout => {
    const type = workout.fitness_discipline || 'Unknown';
    workoutTypes[type] = (workoutTypes[type] || 0) + 1;
  });

  return {
    favoriteInstructor,
    workoutTimeProfile,
    totalWorkouts,
    timeStats,
    workoutTypes
  };
};

/**
 * Process instructor data from API workouts
 */
const processInstructorData = (workouts, workoutMap, selectedYear) => {
  const instructorStats = {};

  workouts.forEach(workout => {
    const instructorId = workout.instructor_id;
    if (!instructorId || !instructorIds[instructorId]) return;

    if (!instructorStats[instructorId]) {
      instructorStats[instructorId] = {
        id: instructorId,
        name: instructorIds[instructorId].name,
        workouts: 0,
        totalMinutes: 0,
        workoutTypes: {}
      };
    }

    instructorStats[instructorId].workouts += 1;
    instructorStats[instructorId].totalMinutes += workout.duration || 0;

    const workoutType = workout.fitness_discipline || 'Unknown';
    instructorStats[instructorId].workoutTypes[workoutType] =
      (instructorStats[instructorId].workoutTypes[workoutType] || 0) + 1;
  });

  // Find favorite instructor
  const validInstructors = Object.entries(instructorStats)
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
 * Get workout time profile from API data
 */
const getWorkoutTimeProfile = (workoutMap, selectedYear, bikeStartTimestamp) => {
  const timeSlots = {
    earlyBird: { name: 'Early Bird', count: 0, timeRange: 'Midnight-10am', start: 0, end: 10 },
    daytimeRider: { name: 'Daytime Rider', count: 0, timeRange: '10am-4:30pm', start: 10, end: 16.5 },
    postWorkPro: { name: 'Post Work Pro', count: 0, timeRange: '4:30pm-8pm', start: 16.5, end: 20 },
    nightOwl: { name: 'Night Owl', count: 0, timeRange: '8pm-Midnight', start: 20, end: 24 }
  };

  Array.from(workoutMap.values()).forEach(workout => {
    const timestamp = workout.start_time;
    
    if (!isWorkoutInPeriod(timestamp, selectedYear, bikeStartTimestamp)) return;

    const date = new Date(timestamp * 1000);
    const timeInHours = date.getHours() + (date.getMinutes() / 60);

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

export {
  processWorkoutData,
  processInstructorData,
  getWorkoutTimeProfile,
  formatTimeStats,
  isWorkoutInPeriod
};
