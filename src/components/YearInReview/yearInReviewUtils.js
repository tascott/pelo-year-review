import Papa from 'papaparse';

const safeGetValue = (obj,path,defaultValue = 0) => {
  try {
    const value = path.split('.').reduce((acc,part) => acc?.[part],obj);
    return value !== undefined && value !== null ? value : defaultValue;
  } catch(e) {
    return defaultValue;
  }
};

// Create a map of workouts by timestamp, with some tolerance for time differences
const createWorkoutMap = (csvData) => {
  const workoutMap = new Map();
  const parsedCSV = Papa.parse(csvData,{header: true}).data;

  console.log('Creating workout map from CSV data:',{
    totalRows: parsedCSV.length,
    sampleRow: parsedCSV[0]
  });

  parsedCSV.forEach(csvWorkout => {
    if(!csvWorkout['Workout Timestamp']) return;

    // Parse the CSV timestamp format: "2021-11-22 12:14 (GMT)"
    const [datePart,timePart] = csvWorkout['Workout Timestamp'].split(' (GMT)')[0].split(' ');
    const [year,month,day] = datePart.split('-').map(Number);
    const [hours,minutes] = timePart.split(':').map(Number);

    // Create Date object in GMT/UTC
    const gmtDate = Date.UTC(year,month - 1,day,hours,minutes,0);
    const timestamp = Math.floor(gmtDate / 1000);

    // Store the workout with its timestamp for lookup
    workoutMap.set(timestamp,{
      ...csvWorkout,
      instructor: csvWorkout['Instructor Name'],
      timestamp,
      originalTimestamp: csvWorkout['Workout Timestamp']
    });
  });

  return workoutMap;
};

const findNearestWorkout = (targetTimestamp,workoutMap,windowMinutes = 3) => {
  const windowSeconds = windowMinutes * 60;
  // Check timestamps within the window
  for(let i = -windowSeconds;i <= windowSeconds;i++) {
    const workout = workoutMap.get(targetTimestamp + i);
    if(workout) return workout;
  }
  return null;
};

// Process instructor data
const processInstructorData = (yearWorkouts,workoutMap) => {
  const instructorStats = {};
  const selectedYear = new Date(yearWorkouts[0].created_at * 1000).getFullYear();

  // Get all unique workouts for the year from the workoutMap
  const uniqueWorkouts = new Map();
  Array.from(workoutMap.values()).forEach(workout => {
    const year = new Date(workout.timestamp * 1000).getFullYear();
    if(year === selectedYear) {
      // Use timestamp as key to ensure uniqueness
      uniqueWorkouts.set(workout.timestamp,workout);
    }
  });

  const workoutsInYear = Array.from(uniqueWorkouts.values());

  console.log('Workout Analysis:',{
    year: selectedYear,
    totalUniqueWorkouts: workoutsInYear.length,
    hannahWorkouts: workoutsInYear.filter(w =>
      w.instructor === 'Hannah Corbin'
    ).length,
    hannahTypes: workoutsInYear.reduce((acc,w) => {
      if(w.instructor === 'Hannah Corbin') {
        const type = w['Fitness Discipline'];
        acc[type] = (acc[type] || 0) + 1;
      }
      return acc;
    },{})
  });

  // Process workouts from CSV data only
  workoutsInYear.forEach(workout => {
    const instructorName = workout.instructor;
    if(!instructorStats[instructorName]) {
      instructorStats[instructorName] = {
        name: instructorName,
        workouts: 0,
        totalMinutes: 0,
        workoutTypes: {}
      };
    }

    instructorStats[instructorName].workouts += 1;
    const duration = parseInt(workout['Length (minutes)']) || 0;
    instructorStats[instructorName].totalMinutes += duration;

    const workoutType = workout['Fitness Discipline'] || 'Unknown';
    instructorStats[instructorName].workoutTypes[workoutType] =
      (instructorStats[instructorName].workoutTypes[workoutType] || 0) + 1;
  });

  // Log instructor stats before sorting
  console.log('Instructor stats before sorting:',
    Object.entries(instructorStats).map(([name,stats]) => ({
      name,
      workouts: stats.workouts,
      minutes: stats.totalMinutes,
      types: stats.workoutTypes
    }))
  );

  // Find favorite instructor (excluding 'Unknown Instructor')
  const validInstructors = Object.entries(instructorStats)
    .filter(([name]) => name !== 'Unknown Instructor')
    .sort(([,a],[,b]) => {
      // First sort by number of workouts
      if(b.workouts !== a.workouts) {
        return b.workouts - a.workouts;
      }
      // If workouts are equal, sort by total minutes
      return b.totalMinutes - a.totalMinutes;
    });

  if(validInstructors.length === 0) {
    return {
      name: 'Unknown Instructor',
      workouts: 0,
      totalMinutes: 0,
      workoutTypes: {}
    };
  }

  const favoriteInstructor = validInstructors[0][1];

  // Add top class type by counting occurrences
  const topType = Object.entries(favoriteInstructor.workoutTypes)
    .sort((a,b) => b[1] - a[1])[0];
  favoriteInstructor.topClassType = topType ? topType[0] : 'N/A';

  return favoriteInstructor;
};

// Add this helper function at the top with the other helpers
const formatTimeStats = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const workingDays = Math.floor(hours / 8);

  return {
    hours,
    minutes,
    workingDays: hours >= 8 ? workingDays : null, // Show if total hours >= 8 (one working day)
    displayText: minutes > 0 ?
      `${hours} hrs ${minutes} mins` :
      `${hours} hrs`
  };
};

export const processWorkoutData = (workouts,csvData,selectedYear) => {
  if(!Array.isArray(workouts) || workouts.length === 0) return null;
  if(!csvData) {
    console.error('No CSV data available');
    return null;
  }

  // Create workout map with time window matching
  const workoutMap = createWorkoutMap(csvData);

  console.log('Processing workouts for year:',selectedYear,typeof selectedYear);
  console.log('Total workouts to process:',workouts.length);

  // Filter workouts for the selected year
  const yearWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.created_at * 1000);
    const workoutYear = workoutDate.getFullYear();

    // Debug log each workout's year
    // console.log('Workout date check:',{
    //   timestamp: workout.created_at,
    //   date: workoutDate.toISOString(),
    //   year: workoutYear,
    //   matches: workoutYear === year,
    //   instructor: workout.instructor?.name
    // });

    return workoutYear === selectedYear;
  });

  console.log(`Found ${yearWorkouts.length} workouts for year ${selectedYear}`);

  // Debug log the first few workouts after filtering
  console.log('Sample of filtered workouts:',yearWorkouts.slice(0,5).map(w => ({
    date: new Date(w.created_at * 1000).toISOString(),
    instructor: w.instructor?.name,
    title: w.ride?.title
  })));

  // Process instructor data with more logging
  const favoriteInstructor = processInstructorData(yearWorkouts,workoutMap);

  // Group workouts by month
  const workoutsByMonth = yearWorkouts.reduce((acc,workout) => {
    const workoutDate = new Date(workout.created_at * 1000);
    const month = workoutDate.getMonth();
    if(!acc[month]) acc[month] = [];
    acc[month].push(workout);
    return acc;
  },{});

  // Total workouts
  const totalWorkouts = yearWorkouts.length;

  // Workouts per week (average)
  const weeksInYear = 52;
  const workoutsPerWeek = Math.round((totalWorkouts / weeksInYear) * 10) / 10;

  // Process workout types
  const typeCounts = {};
  yearWorkouts.forEach(workout => {
    const type = workout.fitness_discipline;
    if(type) {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }
  });

  // Convert to array and calculate percentages
  const workoutTypes = Object.entries(typeCounts)
    .map(([name,count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      percentage: Math.round((count / totalWorkouts) * 100)
    }))
    .sort((a,b) => b.count - a.count)
    .slice(0,5); // Top 5 workout types

  // Calculate total minutes from CSV data
  const totalMinutes = Array.from(workoutMap.values())
    .filter(workout => {
      const workoutYear = new Date(workout.timestamp * 1000).getFullYear();
      return workoutYear === selectedYear;
    })
    .reduce((total,workout) => {
      const minutes = parseInt(workout['Length (minutes)']) || 0;
      return total + minutes;
    },0);

  // Debug log
  console.log('Minutes calculation:',{
    year: selectedYear,
    totalMinutes,
    sampleWorkouts: Array.from(workoutMap.values())
      .filter(w => new Date(w.timestamp * 1000).getFullYear() === selectedYear)
      .slice(0,5)
      .map(w => ({
        length: w['Length (minutes)'],
        instructor: w.instructor,
        type: w['Fitness Discipline']
      }))
  });

  // Debug logs for calories calculation
  console.log('Processing calories from CSV data:',{
    csvDataExists: !!csvData,
    csvLength: csvData?.length,
    sampleRows: csvData?.split('\n').slice(0,3) // Show first 3 rows
  });

  // Parse CSV data
  const rows = csvData.split('\n').map(row => row.split(','));
  const headers = rows[0];
  const caloriesIndex = headers.findIndex(h => h.includes('Calories'));
  const timestampIndex = headers.findIndex(h => h.includes('Workout Timestamp'));
  const distanceIndex = headers.findIndex(h => h.includes('Distance (mi)'));

  console.log('CSV parsing:',{
    totalRows: rows.length,
    headers,
    caloriesIndex,
    timestampIndex,
    distanceIndex,
    yearToFilter: selectedYear
  });

  const totalCalories = rows.slice(1) // Skip header row
    .reduce((sum,row) => {
      // Skip invalid rows
      if(!row[timestampIndex]) return sum;

      // Get year from timestamp
      const year = parseInt(row[timestampIndex].split('-')[0]);

      // Only add calories if year matches
      if(year === selectedYear) {
        const calories = parseInt(row[caloriesIndex]) || 0;
        if(calories > 1000) {
          console.log('High calorie workout:',{
            date: row[timestampIndex],
            calories
          });
        }
        return sum + calories;
      }

      return sum;
    },0);

  console.log('Calories calculation:',{
    selectedYear,
    totalCalories,
    sampleWorkouts: rows.slice(1,5)
      .map(row => ({
        year: parseInt(row[timestampIndex].split('-')[0]),
        timestamp: row[timestampIndex],
        calories: parseInt(row[caloriesIndex]) || 0,
        included: parseInt(row[timestampIndex].split('-')[0]) === selectedYear
      }))
  });

  // Add more detailed logging
  console.log('Distance calculation setup:',{
    headers,
    distanceIndex,
    sampleRows: rows.slice(1,5).map(row => ({
      fullRow: row,
      timestamp: row[timestampIndex],
      distance: row[distanceIndex],
      year: parseInt(row[timestampIndex]?.split('-')[0])
    }))
  });

  // Calculate total distance with debug logging
  const totalDistance = rows.slice(1) // Skip header row
    .reduce((sum,row) => {
      // Skip invalid rows
      if(!row[timestampIndex]) return sum;

      // Get year from timestamp
      const year = parseInt(row[timestampIndex].split('-')[0]);
      const distance = parseFloat(row[distanceIndex]) || 0;

      // Debug log each row's contribution
      if(distance > 0) {
        console.log('Found distance:',{
          date: row[timestampIndex],
          year,
          distance,
          included: year === selectedYear,
          runningTotal: sum + (year === selectedYear ? distance : 0)
        });
      }

      // Only add distance if year matches
      if(year === selectedYear) {
        return sum + distance;
      }

      return sum;
    },0);

  console.log('Final distance calculation:',{
    selectedYear,
    totalDistance,
    distanceColumnFound: distanceIndex !== -1,
    sampleDistances: rows.slice(1,5).map(row => parseFloat(row[distanceIndex]) || 0)
  });

  // Get personal records
  const prs = yearWorkouts.reduce((total,workout) =>
    total + (workout.is_personal_record ? 1 : 0),0);

  return {
    totalWorkouts,
    workoutsPerWeek,
    favoriteInstructor,
    workoutTypes,
    timeStats: formatTimeStats(Math.round(totalMinutes)),
    totalCalories,
    totalDistance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal place
    personalRecords: prs,
    achievements: 0,
    selectedYear: selectedYear
  };
};
