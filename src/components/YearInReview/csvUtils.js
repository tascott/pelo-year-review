/**
 * CSV Data Processing
 * These functions process data that was originally loaded from a CSV API call and stored in localStorage
 */

/**
 * Creates a map of workouts by timestamp from CSV data
 * @param {Array} csvData - Array of workout data from CSV
 */
const createWorkoutMap = (csvData) => {
  const workoutMap = new Map();

  csvData.forEach(csvWorkout => {
    if(!csvWorkout['Workout Timestamp']) return;

    // Parse the CSV timestamp format: "2021-11-22 12:14 (UTC)"
    const [datePart,timePart] = csvWorkout['Workout Timestamp'].split(' (UTC)')[0].split(' ');
    const [year,month,day] = datePart.split('-').map(Number);
    const [hours,minutes] = timePart.split(':').map(Number);

    // Create Date object in UTC
    const utcDate = Date.UTC(year,month - 1,day,hours,minutes,0);
    const timestamp = Math.floor(utcDate / 1000);

    // Store the workout with its timestamp for lookup
    const mappedWorkout = {
      ...csvWorkout,
      timestamp,
      originalTimestamp: csvWorkout['Workout Timestamp']
    };

    workoutMap.set(timestamp,mappedWorkout);
  });
  return workoutMap;
};

/**
 * Process CSV workout data
 */
const processCSVWorkoutData = (csvData,selectedYear) => {
  if(!csvData || !Array.isArray(csvData)) {
    console.error('Invalid CSV data:',csvData);
    return null;
  }

  const workoutMap = createWorkoutMap(csvData);
  const earliestBikeDate = findEarliestBikeDate(csvData);

  // Filter workouts for selected year
  const yearWorkouts = Array.from(workoutMap.values()).filter(workout => {
    const workoutDate = new Date(workout.originalTimestamp);
    if(selectedYear === 'all') {
      return true;
    } else if(selectedYear === 'bike') {
      const bikeDate = new Date(earliestBikeDate);
      return workoutDate >= bikeDate;
    } else {
      return workoutDate.getFullYear() === selectedYear;
    }
  });

  // Calculate workouts per week
  let startDate;
  if(selectedYear === new Date(earliestBikeDate).getFullYear()) {
    // If we're looking at the first year, use the earliest bike date
    startDate = new Date(earliestBikeDate);
  } else {
    // Otherwise use January 1st of the selected year
    startDate = new Date(Date.UTC(selectedYear,0,1));
  }

  // End date is either December 31st of selected year or today if it's the current year
  const currentYear = new Date().getFullYear();
  let endDate;
  if(selectedYear === currentYear) {
    endDate = new Date();
  } else {
    endDate = new Date(Date.UTC(selectedYear,11,31,23,59,59));
  }

  // Calculate number of weeks
  const totalWeeks = Math.max(1,Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000)));
  const workoutsPerWeek = (yearWorkouts.length / totalWeeks).toFixed(1);

  // Process cycling stats
  const cyclingStats = processCyclingStats(yearWorkouts);

  // Process heart rate data
  const heartRateData = processHeartRateData(yearWorkouts);

  // Calculate calories stats
  const caloriesStats = yearWorkouts.reduce((stats,workout) => {
    const calories = parseFloat(workout['Calories Burned']) || 0;
    stats.total += calories;
    if(calories > 0) stats.workoutsWithCalories++;
    return stats;
  },{total: 0,workoutsWithCalories: 0});

  const totalCalories = Math.round(caloriesStats.total);
  const caloriesPerWorkout = caloriesStats.workoutsWithCalories > 0 ?
    Math.round(caloriesStats.total / caloriesStats.workoutsWithCalories) : 0;

  // Calculate distance stats
  const distanceStats = yearWorkouts.reduce((stats,workout) => {
    const distance = parseFloat(workout['Distance (mi)']) || 0;
    stats.total += distance;
    if(distance > 0) stats.workoutsWithDistance++;
    return stats;
  },{total: 0,workoutsWithDistance: 0});

  const totalDistance = Math.round(distanceStats.total * 10) / 10; // Round to 1 decimal place
  const distancePerWorkout = distanceStats.workoutsWithDistance > 0 ?
    Math.round((distanceStats.total / distanceStats.workoutsWithDistance) * 10) / 10 : 0;

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
  if(!workouts || workouts.length === 0) return null;

  // Determine unit system from column headers of first workout
  const firstWorkout = workouts[0];
  const isMetric = Object.keys(firstWorkout).some(key => key.includes('(kph)') || key.includes('(km)'));
  const speedKey = isMetric ? 'Avg. Speed (kph)' : 'Avg. Speed (mph)';
  const distanceKey = isMetric ? 'Distance (km)' : 'Distance (mi)';

  const cyclingWorkouts = workouts.filter(w => w['Fitness Discipline'] === 'Cycling');

  // Function to calculate stats for a subset of workouts
  const calculateStats = (filteredWorkouts) => {
    let totalOutput = 0;
    let totalResistance = 0;
    let totalCadence = 0;
    let totalSpeed = 0;
    let speedCount = 0;
    let totalDistance = 0;
    let workoutCount = 0;
    let fastestRide = null;
    let highestOutput = 0;
    let validResistanceCount = 0;
    let validCadenceCount = 0;

    filteredWorkouts.forEach(workout => {
      const output = parseFloat(workout['Total Output']) || 0;
      const resistance = parseFloat(workout['Avg. Resistance']);
      const cadence = parseFloat(workout['Avg. Cadence (RPM)']);

      // Get speed and distance using determined keys
      let speed = parseFloat(workout[speedKey]) || 0;
      let distance = parseFloat(workout[distanceKey]) || 0;

      // Handle resistance and cadence only when they are valid numbers
      if(!isNaN(resistance) && resistance > 0) {
        totalResistance += resistance;
        validResistanceCount++;
      }
      if(!isNaN(cadence) && cadence > 0) {
        totalCadence += cadence;
        validCadenceCount++;
      }

      // Keep all other calculations exactly the same
      totalOutput += output;
      if(speed > 0) {
        totalSpeed += speed;
        speedCount++;
      }
      totalDistance += distance;
      workoutCount++;

      if(output > highestOutput) {
        highestOutput = output;
        fastestRide = workout;
      }
    });

    return {
      avgResistance: validResistanceCount ? totalResistance / validResistanceCount : 0,
      avgCadence: validCadenceCount ? totalCadence / validCadenceCount : 0,
      avgSpeed: speedCount ? totalSpeed / speedCount : 0,
      totalOutput,
      highestOutput,
      fastestRide,
      totalDistance,
      workoutCount
    };
  };

  // Calculate stats for all rides
  const allStats = calculateStats(cyclingWorkouts);

  // Calculate stats for rides under 20 minutes
  const shortStats = calculateStats(
    cyclingWorkouts.filter(w => parseFloat(w['Length (minutes)']) < 20)
  );

  // Calculate stats for rides 20 minutes and over
  const longStats = calculateStats(
    cyclingWorkouts.filter(w => parseFloat(w['Length (minutes)']) >= 20)
  );

  // Calculate phone charges (assuming average phone battery is 12.4 Wh or 44.64 kJ)
  const PHONE_BATTERY_KJ = 44.64;
  const phoneCharges = Math.floor(allStats.totalOutput / PHONE_BATTERY_KJ);

  return {
    totalOutput: allStats.totalOutput.toFixed(1),
    bestOutput: allStats.highestOutput.toFixed(1),
    bestRideTitle: allStats.fastestRide?.Title || 'Unknown',
    bestRideInstructor: allStats.fastestRide?.['Instructor Name'] || 'No Instructor',
    phoneCharges,
    totalDistance: allStats.totalDistance.toFixed(1),
    distancePerWorkout: allStats.workoutCount ? (allStats.totalDistance / allStats.workoutCount).toFixed(1) : 0,
    averages: {
      all: {
        resistance: allStats.avgResistance.toFixed(1),
        cadence: allStats.avgCadence.toFixed(1),
        speed: allStats.avgSpeed.toFixed(1),
        count: allStats.workoutCount
      },
      short: {
        resistance: shortStats.avgResistance.toFixed(1),
        cadence: shortStats.avgCadence.toFixed(1),
        speed: shortStats.avgSpeed.toFixed(1),
        count: shortStats.workoutCount
      },
      long: {
        resistance: longStats.avgResistance.toFixed(1),
        cadence: longStats.avgCadence.toFixed(1),
        speed: longStats.avgSpeed.toFixed(1),
        count: longStats.workoutCount
      }
    }
  };
};

/**
 * Process heart rate data from CSV data
 */
const processHeartRateData = (workouts) => {
  // Only include workouts with heart rate data (non-zero Avg. Heartrate)
  const workoutsWithHR = workouts.filter(w => {
    const avgHR = parseFloat(w['Avg. Heartrate']) || 0;
    return avgHR > 0;
  });

  // Find workout with highest heart rate
  const highestHRWorkout = workoutsWithHR.reduce((highest,current) => {
    const currentHR = parseFloat(current['Avg. Heartrate']) || 0;
    const highestHR = parseFloat(highest['Avg. Heartrate']) || 0;
    return currentHR > highestHR ? current : highest;
  },workoutsWithHR[0]);

  const highestHeartRateWorkout = highestHRWorkout ? {
    heartRate: parseFloat(highestHRWorkout['Avg. Heartrate']).toFixed(1),
    title: highestHRWorkout['Title'],
    instructor: highestHRWorkout['Instructor Name'],
    length: highestHRWorkout['Length (minutes)'],
  } : null;

  // Helper function to calculate average heart rate for a set of workouts
  const calculateAvgHR = (filteredWorkouts) => {
    if(filteredWorkouts.length === 0) return 0;
    const total = filteredWorkouts.reduce((sum,w) => sum + (parseFloat(w['Avg. Heartrate']) || 0),0);
    return (total / filteredWorkouts.length).toFixed(1);
  };

  // Calculate HR by duration
  const longWorkouts = workoutsWithHR.filter(w => parseFloat(w['Length (minutes)']) >= 20);
  const shortWorkouts = workoutsWithHR.filter(w => parseFloat(w['Length (minutes)']) < 20);

  // Calculate HR by discipline
  const disciplineHR = {};
  workoutsWithHR.forEach(workout => {
    const discipline = workout['Fitness Discipline'];
    if(!disciplineHR[discipline]) {
      disciplineHR[discipline] = [];
    }
    disciplineHR[discipline].push(workout);
  });

  // Convert discipline arrays to averages
  const disciplineAverages = {};
  Object.entries(disciplineHR).forEach(([discipline,workouts]) => {
    disciplineAverages[discipline] = {
      avgHeartRate: calculateAvgHR(workouts),
      count: workouts.length
    };
  });

  return {
    byDuration: {
      long: {
        avgHeartRate: calculateAvgHR(longWorkouts),
        count: longWorkouts.length
      },
      short: {
        avgHeartRate: calculateAvgHR(shortWorkouts),
        count: shortWorkouts.length
      }
    },
    byDiscipline: disciplineAverages,
    totalWorkouts: workoutsWithHR.length,
    workoutsWithHR: workoutsWithHR.length,
    highestHeartRateWorkout
  };
};

/**
 * Find earliest bike date from CSV data
 */
const findEarliestBikeDate = (data) => {
  let earliestDate = new Date();

  data.forEach(workout => {
    let workoutDate;

    // Handle API data format (unix timestamp)
    if(workout.start_time) {
      workoutDate = new Date(workout.start_time * 1000);
    }
    // Handle CSV data format ("2021-11-22 12:14 (UTC)")
    else if(workout['Workout Timestamp']) {
      const [datePart] = workout['Workout Timestamp'].split(' (UTC)');
      workoutDate = new Date(datePart);
    }

    if(!isNaN(workoutDate?.getTime()) && workoutDate < earliestDate) {
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