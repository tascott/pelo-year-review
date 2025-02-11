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
const processInstructorData = (yearWorkouts,workoutMap,selectedYear) => {
  const instructorStats = {};

  // Get earliest bike date once
  const earliestBikeDate = findEarliestBikeDate(workoutMap);
  const bikeStartTimestamp = earliestBikeDate.getTime() / 1000;

  console.log('Processing instructor data:',{
    selectedYear,
    earliestBikeDate: earliestBikeDate.toLocaleDateString(),
    bikeStartTimestamp,
    totalWorkouts: yearWorkouts.length
  });

  // Get all unique workouts for the selected period
  const uniqueWorkouts = new Map();
  Array.from(workoutMap.values()).forEach(workout => {
    if(selectedYear === 'bike') {
      // For bike selection, only include workouts after bike start date
      if(workout.timestamp >= bikeStartTimestamp) {
        uniqueWorkouts.set(workout.timestamp,workout);
      }
    } else if(selectedYear === 'all') {
      uniqueWorkouts.set(workout.timestamp,workout);
    } else {
      const year = new Date(workout.timestamp * 1000).getFullYear();
      if(year === selectedYear) {
        uniqueWorkouts.set(workout.timestamp,workout);
      }
    }
  });

  const workoutsInYear = Array.from(uniqueWorkouts.values());

  console.log('Filtered workouts:',{
    selectedYear,
    totalWorkouts: workoutsInYear.length,
    dateRange: {
      start: new Date(Math.min(...workoutsInYear.map(w => w.timestamp * 1000))).toLocaleDateString(),
      end: new Date(Math.max(...workoutsInYear.map(w => w.timestamp * 1000))).toLocaleDateString()
    }
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

  // Get bike start date once if needed
  const bikeStartTimestamp = selectedYear === 'bike' ?
    findEarliestBikeDate(csvData).getTime() / 1000 :
    null;

  // Filter workouts based on selection
  let yearWorkouts;
  if(selectedYear === 'bike') {
    yearWorkouts = workouts.filter(workout => workout.created_at >= bikeStartTimestamp);
  } else if(selectedYear === 'all') {
    yearWorkouts = workouts;
  } else {
    yearWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.created_at * 1000);
      return workoutDate.getFullYear() === selectedYear;
    });
  }

  // Process instructor data with the selected year context
  const favoriteInstructor = processInstructorData(yearWorkouts,workoutMap,selectedYear);

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
      if(selectedYear === 'bike') {
        return workout.timestamp >= bikeStartTimestamp;
      } else if(selectedYear === 'all') {
        return true;
      } else {
        const workoutYear = new Date(workout.timestamp * 1000).getFullYear();
        return workoutYear === selectedYear;
      }
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

  // Calculate total calories
  const totalCalories = rows.slice(1) // Skip header row
    .reduce((sum,row) => {
      if(!row[timestampIndex]) return sum;

      const timestamp = new Date(row[timestampIndex].split(' ')[0]).getTime() / 1000;

      if(selectedYear === 'bike') {
        if(timestamp >= bikeStartTimestamp) {
          const calories = parseInt(row[caloriesIndex]) || 0;
          return sum + calories;
        }
      } else if(selectedYear === 'all') {
        const calories = parseInt(row[caloriesIndex]) || 0;
        return sum + calories;
      } else {
        const year = parseInt(row[timestampIndex].split('-')[0]);
        if(year === selectedYear) {
          const calories = parseInt(row[caloriesIndex]) || 0;
          return sum + calories;
        }
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

  // Calculate total distance
  const totalDistance = rows.slice(1)
    .reduce((sum,row) => {
      if(!row[timestampIndex]) return sum;

      const timestamp = new Date(row[timestampIndex].split(' ')[0]).getTime() / 1000;

      if(selectedYear === 'bike') {
        if(timestamp >= bikeStartTimestamp) {
          const distance = parseFloat(row[distanceIndex]) || 0;
          return sum + distance;
        }
      } else if(selectedYear === 'all') {
        const distance = parseFloat(row[distanceIndex]) || 0;
        return sum + distance;
      } else {
        const year = parseInt(row[timestampIndex].split('-')[0]);
        if(year === selectedYear) {
          const distance = parseFloat(row[distanceIndex]) || 0;
          return sum + distance;
        }
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
    selectedYear,
    bikeStartTimestamp,
    sampleRows: rows.slice(1,5).map(row => ({
      discipline: row[disciplineIndex],
      rawSpeed: row[avgSpeedIndex],
      parsedSpeed: parseFloat(row[avgSpeedIndex]),
      timestamp: row[timestampIndex],
      year: parseInt(row[timestampIndex].split('-')[0])
    }))
  });

  rows.slice(1).forEach(row => {
    if(!row[timestampIndex]) return;

    const timestamp = new Date(row[timestampIndex].split(' ')[0]).getTime() / 1000;
    const discipline = row[disciplineIndex]?.toLowerCase();
    const speed = parseFloat(row[avgSpeedIndex]) || 0;

    let shouldInclude = false;
    if(selectedYear === 'bike') {
      shouldInclude = timestamp >= bikeStartTimestamp;
    } else if(selectedYear === 'all') {
      shouldInclude = true;
    } else {
      const year = parseInt(row[timestampIndex].split('-')[0]);
      shouldInclude = year === selectedYear;
    }

    if(shouldInclude && discipline === 'cycling' && speed > 0) {
      console.log('Including speed data:',{
        timestamp: row[timestampIndex],
        speed,
        rawSpeed: row[avgSpeedIndex]
      });
      totalSpeed += speed;
      maxAverageSpeed = Math.max(maxAverageSpeed,speed);
      cyclingWorkoutCount++;
    }
  });

  // Calculate average speed
  const averageSpeed = cyclingWorkoutCount > 0 ?
    Math.round((totalSpeed / cyclingWorkoutCount) * 10) / 10 : 0;

  console.log('Speed calculation results:',{
    selectedYear,
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

// Export findEarliestBikeDate
export const findEarliestBikeDate = (data) => {
  if(!data) return new Date();

  let rows;
  let headers;

  // Check if data is already a Map (workoutMap)
  if(data instanceof Map) {
    // Convert workoutMap to array of rows
    rows = Array.from(data.values()).map(workout => ({
      'Total Output': workout['Total Output'],
      'Workout Timestamp': workout['Workout Timestamp']
    }));
    headers = ['Total Output','Workout Timestamp'];
  } else {
    // Assume it's CSV data
    rows = data.split('\n').map(row => row.split(','));
    headers = rows[0];
    rows = rows.slice(1); // Remove header row since we defined it above
  }

  const outputIndex = headers.findIndex(h => h.toLowerCase().includes('total output'));
  const timestampIndex = headers.findIndex(h => h.includes('Workout Timestamp'));

  console.log('Finding earliest bike date:',{
    totalRows: rows.length,
    headers,
    outputIndex,
    timestampIndex,
    outputHeader: headers[outputIndex],
    timestampHeader: headers[timestampIndex]
  });

  // Find first row with valid output data
  const firstBikeWorkout = rows.find(row => {
    const output = parseFloat(row[outputIndex] || row['Total Output']);
    const hasValidOutput = !isNaN(output) && output > 0 && (row[outputIndex]?.trim() !== '' || row['Total Output']?.trim() !== '');

    // Log each row's output data until we find a valid one
    if(hasValidOutput) {
      console.log('Found valid bike workout:',{
        timestamp: row[timestampIndex] || row['Workout Timestamp'],
        output,
        rawOutputValue: row[outputIndex] || row['Total Output']
      });
    }

    return hasValidOutput;
  });

  if(!firstBikeWorkout) {
    console.log('No valid bike workout found');
    return new Date();
  }

  // Parse the full date from timestamp (format: "2023-11-24 12:34 (GMT)")
  const timestamp = firstBikeWorkout[timestampIndex] || firstBikeWorkout['Workout Timestamp'];
  const [datePart] = timestamp.split(' ');
  const [year,month,day] = datePart.split('-').map(Number);

  const date = new Date(year,month - 1,day);
  console.log('Earliest bike date found:',{
    timestamp,
    datePart,
    year,
    month,
    day,
    resultDate: date.toLocaleDateString()
  });

  return date;
};
