import instructorIds from '../../data/instructorIDs.json';

/**
 * API Data Processing
 * These functions process data that was originally loaded from the Peloton API and stored in localStorage
 */

/**
 * Process workout data from API
 */
const processAPIWorkoutData = (workouts, selectedYear) => {
  if (!workouts || !Array.isArray(workouts)) {
    console.error('Invalid workouts data:', workouts);
    return null;
  }

  // Create a map of workouts by timestamp
  const workoutMap = new Map();
  workouts.forEach(workout => {
    workoutMap.set(workout.start_time, workout);
  });

  // Process instructor data
  const favoriteInstructor = processInstructorData(workouts, selectedYear);

  // Get workout time profile
  const workoutTimeProfile = getWorkoutTimeProfile(workoutMap, selectedYear);

  // Process workout stats
  const totalWorkouts = workouts.length;
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
const processInstructorData = (workouts, selectedYear) => {
  const instructorStats = {};
  
  workouts.forEach(workout => {
    if (!workout.instructor_id) return;
    
    const instructorId = workout.instructor_id;
    const instructorName = instructorIds[instructorId] || 'Unknown';
    
    if (!instructorStats[instructorId]) {
      instructorStats[instructorId] = {
        name: instructorName,
        count: 0,
        totalMinutes: 0,
        workouts: [],
        difficulty: 0
      };
    }
    
    instructorStats[instructorId].count++;
    instructorStats[instructorId].totalMinutes += (workout.duration || 0) / 60;
    instructorStats[instructorId].workouts.push(workout);
    if (workout.difficulty_estimate) {
      instructorStats[instructorId].difficulty += workout.difficulty_estimate;
    }
  });

  // Calculate averages and find favorite
  let favoriteInstructor = null;
  let maxWorkouts = 0;

  Object.entries(instructorStats).forEach(([id, stats]) => {
    stats.averageDifficulty = stats.difficulty / stats.count;
    if (stats.count > maxWorkouts) {
      maxWorkouts = stats.count;
      favoriteInstructor = { id, ...stats };
    }
  });

  return favoriteInstructor;
};

/**
 * Get workout time profile from API data
 */
const getWorkoutTimeProfile = (workoutMap, selectedYear) => {
  const timeProfile = {
    morningWorkouts: 0,    // 5am - 11:59am
    afternoonWorkouts: 0,  // 12pm - 4:59pm
    eveningWorkouts: 0,    // 5pm - 8:59pm
    nightWorkouts: 0       // 9pm - 4:59am
  };

  workoutMap.forEach((workout, timestamp) => {
    if (!isWorkoutInSelectedYear(timestamp, selectedYear)) return;

    const date = new Date(timestamp * 1000);
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) timeProfile.morningWorkouts++;
    else if (hour >= 12 && hour < 17) timeProfile.afternoonWorkouts++;
    else if (hour >= 17 && hour < 21) timeProfile.eveningWorkouts++;
    else timeProfile.nightWorkouts++;
  });

  return timeProfile;
};

/**
 * Helper function to check if a workout is within the selected year
 */
const isWorkoutInSelectedYear = (timestamp, selectedYear) => {
  const date = new Date(timestamp * 1000);
  return date.getFullYear() === selectedYear;
};

/**
 * Helper function to format time statistics
 */
const formatTimeStats = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return {
    totalMinutes,
    hours,
    minutes,
    formatted: `${hours}h ${minutes}m`
  };
};

export {
  processAPIWorkoutData,
  processInstructorData,
  getWorkoutTimeProfile,
  formatTimeStats
};


// const minimizeWorkoutData = (workout) => ({
//     id: workout.id,
//     start_time: workout.start_time,
//     end_time: workout.end_time,
//     fitness_discipline: workout.fitness_discipline,
//     difficulty_estimate: workout?.peloton?.ride?.difficulty_estimate,
//     duration: workout?.peloton?.ride?.duration,
//     instructor_id: workout?.peloton?.ride?.instructor_id,
//     ride_title: workout?.peloton?.ride?.title,
//     effort_zones: workout.effort_zones,
//   });



/**
 * Count the number of rides by fitness discipline
 * @param {Array} workouts - Array of workout objects
 * @returns {Object} Object with discipline counts
 */
function countRidesByDiscipline(workouts) {
    return workouts.reduce((acc, workout) => {
        const discipline = workout.fitness_discipline;
        acc[discipline] = (acc[discipline] || 0) + 1;
        return acc;
    }, {});
}

/**
 * Calculate total hours of exercise from workout data
 * @param {Array} workouts - Array of workout objects
 * @returns {Object} Object containing total hours and breakdown by discipline
 */
function calculateTotalHours(workouts) {
    const result = workouts.reduce((acc, workout) => {
        const discipline = workout.fitness_discipline;
        // Use duration in seconds from the ride data
        const durationInSeconds = workout.peloton?.ride?.duration || 0;
        const durationInHours = durationInSeconds / 3600;

        // Add to total
        acc.totalHours += durationInHours;

        // Add to discipline breakdown
        acc.byDiscipline[discipline] = (acc.byDiscipline[discipline] || 0) + durationInHours;

        return acc;
    }, { totalHours: 0, byDiscipline: {} });

    // Round all numbers to 2 decimal places
    result.totalHours = Number(result.totalHours.toFixed(2));
    Object.keys(result.byDiscipline).forEach(key => {
        result.byDiscipline[key] = Number(result.byDiscipline[key].toFixed(2));
    });

    return result;
}

/**
 * Count the top 10 most repeated workouts by their ID
 * @param {Array} workouts - Array of workout objects
 * @returns {Object} Object with workout IDs as keys and counts as values
 */
function getTopRepeatedWorkout(workouts) {
    // Count occurrences of each workout ID
    const workoutCounts = workouts.reduce((acc, workout) => {
        const id = workout.id;
        if (id) {
            acc[id] = (acc[id] || 0) + 1;
        }
        return acc;
    }, {});

    // Convert to array, sort by count, and take top 10
    const topWorkouts = Object.entries(workoutCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 10)
        .reduce((acc, [id, count]) => {
            acc[id] = count;
            return acc;
        }, {});

    return topWorkouts;
}

/**
 * Count the top 10 most repeated cycling workouts by their ID
 * @param {Array} workouts - Array of workout objects
 * @returns {Object} Object with workout IDs as keys and counts as values, cycling only
 */
function getTopRepeatedCyclingRides(workouts) {
    // Count occurrences of each cycling workout ID
    const workoutCounts = workouts.reduce((acc, workout) => {
        // Only include cycling workouts
        if (workout.fitness_discipline === 'cycling') {
            const id = workout.id;
            if (id) {
                acc[id] = (acc[id] || 0) + 1;
            }
        }
        return acc;
    }, {});

    // Convert to array, sort by count, and take top 10
    const topRides = Object.entries(rideCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 10)
        .reduce((acc, [id, count]) => {
            acc[id] = count;
            return acc;
        }, {});

    return topRides;
}

/**
 * Get the top 5 most common workout names
 * @param {Array} workouts - Array of workout objects
 * @returns {Object} Object with workout names as keys and counts as values
 */
function getTopWorkoutNames(workouts) {
    // Count occurrences of each workout name
    const nameCounts = workouts.reduce((acc, workout) => {
        const name = workout.peloton?.ride?.title;
        if (name) {
            acc[name] = (acc[name] || 0) + 1;
        }
        return acc;
    }, {});

    // Convert to array, sort by count, and take top 5
    const topNames = Object.entries(nameCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5)
        .reduce((acc, [name, count]) => {
            acc[name] = count;
            return acc;
        }, {});

    return topNames;
}

/**
 * Analyze workouts by instructor ID, including total hours and workout type breakdown
 * @param {Array} workouts - Array of workout objects
 * @returns {Array} Array of instructor stats sorted by total hours (descending)
 */
function getWorkoutsByInstructor(workouts) {
    // First, collect all stats in an object
    const statsObject = workouts.reduce((acc, workout) => {
        const instructorId = workout.instructor_id;
        if (!instructorId) return acc;

        // Initialize instructor entry if it doesn't exist
        if (!acc[instructorId]) {
            acc[instructorId] = {
                id: instructorId,
                name: instructors[instructorId]?.name || 'Unknown Instructor',
                imageUrl: instructors[instructorId]?.image_url,
                totalHours: 0,
                totalWorkouts: 0,
                workoutsByType: {},
                totalDifficulty: 0,
                difficultyCount: 0
            };
        }

        if (!instructors[instructorId]) {
            console.log('workout: ', workout.id);
            console.log('instructor not found: ', instructorId);
        }

        // Add duration in hours
        const durationInSeconds = workout.duration || 0;
        const durationInHours = durationInSeconds / 3600;
        acc[instructorId].totalHours = Number((acc[instructorId].totalHours + durationInHours).toFixed(2));

        // Increment total workouts
        acc[instructorId].totalWorkouts += 1;

        // Count workout by type
        const workoutType = workout.fitness_discipline;
        if (workoutType) {
            acc[instructorId].workoutsByType[workoutType] =
                (acc[instructorId].workoutsByType[workoutType] || 0) + 1;
        }

        // Track difficulty if available
        if (workout.difficulty_estimate) {
            acc[instructorId].totalDifficulty += workout.difficulty_estimate;
            acc[instructorId].difficultyCount++;
        }

        return acc;
    }, {});

    // Convert to array, calculate averages, and sort by total hours
    return Object.values(statsObject)
        .map(instructor => ({
            ...instructor,
            averageDifficulty: instructor.difficultyCount > 0 
                ? Number((instructor.totalDifficulty / instructor.difficultyCount).toFixed(2))
                : null
        }))
        .sort((a, b) => b.totalHours - a.totalHours);
}

/**
 * Find the earliest workout from API data
 * @param {Array} workouts - Array of workout objects from API
 * @returns {Object} The earliest workout object, or null if no workouts
 */
const getEarliestWorkout = (workouts) => {
    if (!workouts || workouts.length === 0) return null;

    return workouts.reduce((earliest, current) => {
        if (!earliest || current.start_time < earliest.start_time) {
            return current;
        }
        return earliest;
    }, null);
};

export {
    countRidesByDiscipline,
    calculateTotalHours,
    getTopRepeatedWorkout,
    getTopRepeatedCyclingRides,
    getTopWorkoutNames,
    getWorkoutsByInstructor,
    getEarliestWorkout
};