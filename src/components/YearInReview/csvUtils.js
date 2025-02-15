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
 * Process CSV workout data
 */
const processCSVWorkoutData = (csvData, selectedYear) => {
  if (!csvData || !Array.isArray(csvData)) {
    console.error('Invalid CSV data:', csvData);
    return null;
  }

  const workoutMap = createWorkoutMap(csvData);
  const earliestBikeDate = findEarliestBikeDate(csvData);

  // Filter workouts for selected year
  const yearWorkouts = Array.from(workoutMap.values()).filter(workout => {
    const date = new Date(workout.timestamp * 1000);
    return date.getFullYear() === selectedYear;
  });

  // Process cycling stats
  const cyclingStats = processCyclingStats(yearWorkouts);

  // Process heart rate data
  const heartRateData = processHeartRateData(yearWorkouts);

  return {
    cyclingStats,
    heartRateData,
    earliestBikeDate
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

//     'Avg. Speed (mph)': workout['Avg. Speed (mph)'],
//     'Distance (mi)': workout['Distance (mi)'],
//     'Calories Burned': workout['Calories Burned'],
//     'Avg. Heartrate': workout['Avg. Heartrate'],
//     'Length (minutes)': workout['Length (minutes)']
//   });


