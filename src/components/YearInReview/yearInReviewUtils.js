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

  parsedCSV.forEach(csvWorkout => {
    if(!csvWorkout['Workout Timestamp']) return;

    // Convert GMT string to Unix timestamp (seconds)
    const gmtDate = new Date(csvWorkout['Workout Timestamp'].split(' (GMT)')[0]);
    // Round to nearest minute to handle slight differences
    const timestamp = Math.floor(gmtDate.getTime() / 60000) * 60;

    // Store with a 5-minute window to handle timing differences
    for(let i = -300;i <= 300;i++) {
      workoutMap.set(timestamp + i,{
        ...csvWorkout,
        instructor: csvWorkout['Instructor Name'],
        timestamp
      });
    }
  });

  return workoutMap;
};

// Process instructor data
const processInstructorData = (yearWorkouts,workoutMap) => {
  const instructorStats = {};
  let matchCount = 0;
  let totalWorkouts = 0;

  // Add instructor workout count debugging
  const instructorWorkoutCounts = new Map();

  yearWorkouts.forEach(workout => {
    totalWorkouts++;
    // Round API timestamp to nearest minute
    const apiTimestamp = Math.floor(workout.created_at / 60) * 60;
    const csvWorkout = workoutMap.get(apiTimestamp);

    if(csvWorkout) {
      matchCount++;
      const instructor = csvWorkout.instructor;
      instructorWorkoutCounts.set(
        instructor,
        (instructorWorkoutCounts.get(instructor) || 0) + 1
      );
      // console.log('Workout match found:',{
      //   apiTime: new Date(workout.created_at * 1000).toISOString(),
      //   csvTime: csvWorkout['Workout Timestamp'],
      //   instructor: csvWorkout.instructor,
      //   apiTimestamp,
      //   csvTimestamp: csvWorkout.timestamp
      // });
    } else {
      console.log('No match found for workout:',{
        apiTime: new Date(workout.created_at * 1000).toISOString(),
        apiTimestamp
      });
    }

    const instructorName = csvWorkout?.instructor || 'Unknown Instructor';

    if(!instructorStats[instructorName]) {
      instructorStats[instructorName] = {
        name: instructorName,
        workouts: 0,
        totalMinutes: 0,
        workoutTypes: {}
      };
    }

    instructorStats[instructorName].workouts += 1;
    const duration = workout.end_time && workout.start_time
      ? Math.round((workout.end_time - workout.start_time) / 60)
      : 0;
    instructorStats[instructorName].totalMinutes += duration;

    const workoutType = workout.fitness_discipline || 'Unknown';
    instructorStats[instructorName].workoutTypes[workoutType] =
      (instructorStats[instructorName].workoutTypes[workoutType] || 0) + 1;
  });

  // Log raw instructor counts before any filtering
  console.log('Raw instructor workout counts:',
    Array.from(instructorWorkoutCounts.entries())
      .sort((a,b) => b[1] - a[1])
      .map(([name,count]) => ({name,count}))
  );

  console.log('Instructor matching stats:',{
    totalWorkouts,
    matchedWorkouts: matchCount,
    matchRate: `${Math.round((matchCount / totalWorkouts) * 100)}%`
  });

  // Find favorite instructor (excluding 'Unknown Instructor')
  const validInstructors = Object.entries(instructorStats)
    .filter(([name]) => name !== 'Unknown Instructor');

  console.log('Valid instructors:',validInstructors.map(([name,stats]) => ({
    name,
    workouts: stats.workouts
  })));

  if(validInstructors.length === 0) {
    return {
      name: 'Unknown Instructor',
      workouts: 0,
      totalMinutes: 0,
      workoutTypes: {}
    };
  }

  const favoriteInstructor = validInstructors
    .sort(([,a],[,b]) => b.workouts - a.workouts)[0][1];

  // Add top class type
  const topType = Object.entries(favoriteInstructor.workoutTypes)
    .sort((a,b) => b[1] - a[1])[0];
  favoriteInstructor.topClassType = topType ? topType[0] : 'N/A';

  return favoriteInstructor;
};

export const processWorkoutData = (workouts,csvData,year) => {
  if(!Array.isArray(workouts) || workouts.length === 0) return null;
  if(!csvData) {
    console.error('No CSV data available');
    return null;
  }

  // Create workout map with time window matching
  const workoutMap = createWorkoutMap(csvData);

  console.log('Processing workouts for year:',year,typeof year);
  console.log('Total workouts to process:',workouts.length);

  // Debug matching
  const sampleWorkout = workouts[0];
  const matchingCSV = workoutMap.get(sampleWorkout.created_at);
  console.log('Sample workout match:',{
    apiTimestamp: sampleWorkout.created_at,
    apiWorkout: sampleWorkout,
    csvMatch: matchingCSV
  });

  // Filter workouts for the selected year
  const yearWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.created_at * 1000);
    const workoutYear = workoutDate.getFullYear();
    return workoutYear === year;
  });

  console.log(`Found ${yearWorkouts.length} workouts for year ${year}`);

  if(yearWorkouts.length === 0) return null;

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

  // Process instructor data
  const favoriteInstructor = processInstructorData(yearWorkouts,workoutMap);

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

  // Calculate total minutes and calories directly from workouts
  const totalMinutes = yearWorkouts.reduce((total,workout) =>
    total + (workout.ride?.duration || 0) / 60,0); // Convert seconds to minutes

  const totalCalories = yearWorkouts.reduce((total,workout) =>
    total + (workout.ride?.total_calories || 0),0);

  // Get personal records
  const prs = yearWorkouts.reduce((total,workout) =>
    total + (workout.is_personal_record ? 1 : 0),0);

  return {
    totalWorkouts,
    workoutsPerWeek,
    favoriteInstructor,
    workoutTypes,
    totalMinutes: Math.round(totalMinutes),
    totalCalories: Math.round(totalCalories),
    personalRecords: prs,
    achievements: 0,
    selectedYear: year
  };
};
