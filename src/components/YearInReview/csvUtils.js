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
  console.log('end create workout map:', workoutMap);
  return workoutMap;
};

/**
 * Process CSV workout data
 */
const processCSVWorkoutData = (csvData, selectedYear) => {
  if (!csvData || !Array.isArray(csvData)) {
    console.error('Invalid CSV data:', csvData);
    return null;
  }

  console.log('Processing CSV data:', csvData);

  const workoutMap = createWorkoutMap(csvData);
  const earliestBikeDate = findEarliestBikeDate(csvData);

  // Filter workouts for selected year
  const yearWorkouts = Array.from(workoutMap.values()).filter(workout => {
    const workoutDate = new Date(workout.originalTimestamp);
    if (selectedYear === 'all') {
      return true;
    } else if (selectedYear === 'bike') {
      const bikeDate = new Date(earliestBikeDate);
      return workoutDate >= bikeDate;
    } else {
      return workoutDate.getFullYear() === selectedYear;
    }
  });

  console.log('calced year workouts:', yearWorkouts);

  // Calculate workouts per week
  let startDate;
  if (selectedYear === new Date(earliestBikeDate).getFullYear()) {
    // If we're looking at the first year, use the earliest bike date
    startDate = new Date(earliestBikeDate);
  } else {
    // Otherwise use January 1st of the selected year
    startDate = new Date(Date.UTC(selectedYear, 0, 1));
  }

  // End date is either December 31st of selected year or today if it's the current year
  const currentYear = new Date().getFullYear();
  let endDate;
  if (selectedYear === currentYear) {
    endDate = new Date();
  } else {
    endDate = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59));
  }

  // Calculate number of weeks
  const totalWeeks = Math.max(1, Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000)));
  const workoutsPerWeek = (yearWorkouts.length / totalWeeks).toFixed(1);

  // Process cycling stats
  const cyclingStats = processCyclingStats(yearWorkouts);

  // Process heart rate data
  const heartRateData = processHeartRateData(yearWorkouts);

  // Calculate calories stats
  const caloriesStats = yearWorkouts.reduce((stats, workout) => {
    const calories = parseFloat(workout['Calories Burned']) || 0;
    stats.total += calories;
    if (calories > 0) stats.workoutsWithCalories++;
    return stats;
  }, { total: 0, workoutsWithCalories: 0 });

  const totalCalories = Math.round(caloriesStats.total);
  const caloriesPerWorkout = caloriesStats.workoutsWithCalories > 0 ?
    Math.round(caloriesStats.total / caloriesStats.workoutsWithCalories) : 0;

  // Calculate distance stats
  const distanceStats = yearWorkouts.reduce((stats, workout) => {
    const distance = parseFloat(workout['Distance (mi)']) || 0;
    stats.total += distance;
    if (distance > 0) stats.workoutsWithDistance++;
    return stats;
  }, { total: 0, workoutsWithDistance: 0 });

  const totalDistance = Math.round(distanceStats.total * 10) / 10; // Round to 1 decimal place
  const distancePerWorkout = distanceStats.workoutsWithDistance > 0 ?
    Math.round((distanceStats.total / distanceStats.workoutsWithDistance) * 10) / 10 : 0;

  console.log('distance stats:', {
    totalDistance,
    distancePerWorkout
  });
  return {
    cyclingStats,
    heartRateData,
    earliestBikeDate,
    totalCalories,
    caloriesPerWorkout,
    totalDistance,
    distancePerWorkout
  };
};

/**
 * Process cycling stats from CSV data
 */
const processCyclingStats = (workouts) => {
  const cyclingWorkouts = workouts.filter(w => w['Fitness Discipline'] === 'Cycling');
  
  let totalOutput = 0;
  let avgResistance = 0;
  let avgCadence = 0;
  let workoutCount = 0;
  let fastestRide = null;
  let highestOutput = 0;

  cyclingWorkouts.forEach(workout => {
    const output = parseFloat(workout['Total Output']) || 0;
    const resistance = parseFloat(workout['Avg. Resistance']) || 0;
    const cadence = parseFloat(workout['Avg. Cadence (RPM)']) || 0;

    totalOutput += output;
    avgResistance += resistance;
    avgCadence += cadence;
    workoutCount++;

    if (output > highestOutput) {
      highestOutput = output;
      fastestRide = workout;
    }
  });

  return {
    averages: {
      resistance: workoutCount ? (avgResistance / workoutCount).toFixed(1) : 0,
      cadence: workoutCount ? (avgCadence / workoutCount).toFixed(1) : 0,
      output: workoutCount ? (totalOutput / workoutCount).toFixed(1) : 0
    },
    fastestRide,
    totalOutput: totalOutput.toFixed(1)
  };
};

/**
 * Process heart rate data from CSV data
 */
const processHeartRateData = (workouts) => {
  const workoutsWithHR = workouts.filter(w => w['Avg. Heartrate'] && w['Max. Heartrate']);
  
  let totalAvgHR = 0;
  let totalMaxHR = 0;
  let workoutCount = 0;

  workoutsWithHR.forEach(workout => {
    const avgHR = parseFloat(workout['Avg. Heartrate']) || 0;
    const maxHR = parseFloat(workout['Max. Heartrate']) || 0;

    totalAvgHR += avgHR;
    totalMaxHR += maxHR;
    workoutCount++;
  });

  return {
    averageHR: workoutCount ? (totalAvgHR / workoutCount).toFixed(1) : 0,
    maxHR: workoutCount ? (totalMaxHR / workoutCount).toFixed(1) : 0,
    workoutsWithHR: workoutCount
  };
};

/**
 * Find earliest bike date from CSV data
 */
const findEarliestBikeDate = (csvData) => {
  let earliestDate = new Date();

  csvData.forEach(workout => {
    if (!workout['Workout Timestamp']) return;

    const [datePart] = workout['Workout Timestamp'].split(' (UTC)');
    const workoutDate = new Date(datePart);

    if (!isNaN(workoutDate.getTime()) && workoutDate < earliestDate) {
      earliestDate = workoutDate;
    }
  });

  return earliestDate;
};

export {
  processCSVWorkoutData,
  createWorkoutMap,
  processCyclingStats,
  processHeartRateData,
  findEarliestBikeDate
};