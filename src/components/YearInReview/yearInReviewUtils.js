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

  // Add this logging to see all unique instructors
  const uniqueInstructors = [...new Set(workoutsInYear.map(w => w.instructor))].filter(Boolean).sort();
  console.log('All instructors:',uniqueInstructors);

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

    return workoutYear === selectedYear;
  });


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

  // Log all headers to find exact column name
  console.log('All CSV headers:',headers);

  const caloriesIndex = headers.findIndex(h => h.includes('Calories'));
  const timestampIndex = headers.findIndex(h => h.includes('Workout Timestamp'));
  const distanceIndex = headers.findIndex(h => h.includes('Distance (mi)'));
  const avgSpeedIndex = headers.findIndex(h => h.toLowerCase().includes('avg') && h.toLowerCase().includes('speed'));
  const disciplineIndex = headers.findIndex(h => h.toLowerCase().includes('discipline'));

  // Add more detailed logging
  console.log('Column indices:',{
    avgSpeedIndex,
    disciplineIndex,
    timestampIndex,
    caloriesIndex,
    distanceIndex,
    avgSpeedHeader: headers[avgSpeedIndex],
    disciplineHeader: headers[disciplineIndex],
    caloriesHeader: headers[caloriesIndex],
    distanceHeader: headers[distanceIndex],
    sampleWorkouts: rows.slice(1,5).map(row => ({
      discipline: row[disciplineIndex],
      speed: row[avgSpeedIndex],
      calories: row[caloriesIndex],
      distance: row[distanceIndex],
      timestamp: row[timestampIndex],
      allFields: row
    }))
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

  // Keep the original distance calculation as it was...
  const totalDistance = rows.slice(1)
    .reduce((sum,row) => {
      if(!row[timestampIndex]) return sum;
      const year = parseInt(row[timestampIndex].split('-')[0]);
      if(year === selectedYear) {
        const distance = parseFloat(row[distanceIndex]) || 0;
        return sum + distance;
      }
      return sum;
    },0);

  // Add new speed calculations
  let maxAverageSpeed = 0;
  let totalSpeed = 0;
  let cyclingWorkoutCount = 0;

  console.log('Starting speed calculations:',{
    avgSpeedIndex,
    disciplineIndex,
    sampleRows: rows.slice(1,5).map(row => ({
      discipline: row[disciplineIndex],
      rawSpeed: row[avgSpeedIndex],
      parsedSpeed: parseFloat(row[avgSpeedIndex]),
      timestamp: row[timestampIndex],
      year: parseInt(row[timestampIndex].split('-')[0])
    }))
  });

  rows.slice(1)
    .forEach(row => {
      if(!row[timestampIndex]) return;
      const year = parseInt(row[timestampIndex].split('-')[0]);
      const discipline = row[disciplineIndex]?.toLowerCase();
      const speed = parseFloat(row[avgSpeedIndex]) || 0;

      if(year === selectedYear && discipline === 'cycling') {
        if(speed > 0) {
          totalSpeed += speed;
          maxAverageSpeed = Math.max(maxAverageSpeed,speed);
          cyclingWorkoutCount++;
        }
      }
    });

  // Calculate average speed
  const averageSpeed = cyclingWorkoutCount > 0 ?
    Math.round((totalSpeed / cyclingWorkoutCount) * 10) / 10 : 0;

  console.log('Speed calculation results:',{
    totalSpeed,
    cyclingWorkoutCount,
    maxAverageSpeed,
    averageSpeed
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
    totalDistance: Math.round(totalDistance * 10) / 10,
    personalRecords: prs,
    achievements: 0,
    selectedYear: selectedYear,
    averageSpeed,
    maxSpeed: Math.round(maxAverageSpeed * 10) / 10,
    cyclingWorkoutCount,
  };
};

export const generateSlides = (data) => {
  const slides = [
    {
      type: 'averageSpeed',
      content: {
        gif: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDZsbGRvcjUxY2N6bzEzendqaTluemI3aTVoc3YyeDBnY2s3cnA0ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lzrynM5EzFcy512hc1/giphy.gif",
        averageSpeed: data.averageSpeed,
        maxSpeed: data.maxSpeed,
        workoutCount: data.cyclingWorkoutCount
      }
    },
    // ... other slides ...
  ];

  // Add goodbye slide at the end
  slides.push({
    type: 'goodbye',
    content: {
      gif: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjZ0ZXBscnFmZmtiNm10azJoa2Qzc3MxODNzZW1haTAxY3g1aDg3YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7bXAhOi1oyodzRV5kO/giphy.gif",
      message: "Thanks for an amazing year!"
    }
  });

  return slides;
};
