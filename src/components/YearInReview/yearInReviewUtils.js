const safeGetValue = (obj, path, defaultValue = 0) => {
  try {
    const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
    return value !== undefined && value !== null ? value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const processWorkoutData = (workouts, year) => {
  if (!Array.isArray(workouts) || workouts.length === 0) return null;

  console.log('Processing workouts for year:', year, typeof year);
  console.log('Total workouts to process:', workouts.length);
  console.log('Sample workout data:', workouts[0]);
  
  // Filter workouts for the selected year
  const yearWorkouts = workouts.filter(workout => {
    // Debug the actual workout data
    ('Checking workout:', {
      id: workout.id,
      created: workout.created,
      start_time: workout.start_time,
      workout_time: workout.workout_time
    });
    
    // Try different date fields
    const workoutDate = new Date(workout.start_time * 1000); // Convert seconds to milliseconds
    const workoutYear = workoutDate.getFullYear();
    const matches = workoutYear === year;
    return matches;
  });
  
  console.log(`Found ${yearWorkouts.length} workouts for year ${year}`);

  if (yearWorkouts.length === 0) return null;

  // Group workouts by month
  const workoutsByMonth = yearWorkouts.reduce((acc, workout) => {
    const workoutDate = new Date(workout.start_time * 1000);
    const month = workoutDate.getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(workout);
    return acc;
  }, {});

  // Total workouts
  const totalWorkouts = yearWorkouts.length;
  
  // Workouts per week (average)
  const weeksInYear = 52;
  const workoutsPerWeek = Math.round((totalWorkouts / weeksInYear) * 10) / 10;

  // Process instructor data
  const instructorCounts = {};
  yearWorkouts.forEach(workout => {
    const instructor = workout.instructor;
    if (instructor?.name) {
      instructorCounts[instructor.name] = instructorCounts[instructor.name] || {
        count: 0,
        image: instructor.image_url || '',
        name: instructor.name
      };
      instructorCounts[instructor.name].count += 1;
    }
  });

  // Find favorite instructor
  const favoriteInstructor = Object.values(instructorCounts)
    .sort((a, b) => b.count - a.count)[0];

  // Process workout types
  const typeCounts = {};
  yearWorkouts.forEach(workout => {
    const type = workout.fitness_discipline;
    if (type) {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }
  });

  // Convert to array and calculate percentages
  const workoutTypes = Object.entries(typeCounts)
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      percentage: Math.round((count / totalWorkouts) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 workout types

  // Calculate total minutes and calories directly from workouts
  const totalMinutes = yearWorkouts.reduce((total, workout) => 
    total + (workout.ride?.duration || 0) / 60, 0); // Convert seconds to minutes
  
  const totalCalories = yearWorkouts.reduce((total, workout) => 
    total + (workout.ride?.total_calories || 0), 0);

  // Get personal records
  const prs = yearWorkouts.reduce((total, workout) => 
    total + (workout.is_personal_record ? 1 : 0), 0);

  return {
    totalWorkouts,
    workoutsPerWeek,
    favoriteInstructor,
    workoutTypes,
    totalMinutes: Math.round(totalMinutes), // Already in minutes
    totalCalories: Math.round(totalCalories),
    personalRecords: prs,
    achievements: 0,
    selectedYear: year
  };
};
