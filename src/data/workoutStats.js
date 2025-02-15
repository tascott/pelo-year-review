import instructors from "./instructorIDs";

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
        const instructorId = workout.peloton?.ride?.instructor_id;
        if (!instructorId) return acc;

        // Initialize instructor entry if it doesn't exist
        if (!acc[instructorId]) {
            acc[instructorId] = {
                id: instructorId,
                name: instructors[instructorId]?.name || 'Unknown Instructor',
                imageUrl: instructors[instructorId]?.image_url,
                totalHours: 0,
                totalWorkouts: 0,
                workoutsByType: {}
            };
        }

        if (!instructors[instructorId]) {
            console.log('ride: ', workout.peloton?.ride?.id);
            console.log('instructor not found: ', instructorId);
        }

        // Add duration in hours
        const durationInSeconds = workout.peloton?.ride?.duration || 0;
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

        return acc;
    }, {});

    // Convert to array and sort by total hours
    return Object.values(statsObject)
        .sort((a, b) => b.totalHours - a.totalHours);
}

export {
    countRidesByDiscipline,
    calculateTotalHours,
    getTopRepeatedWorkout,
    getTopRepeatedCyclingRides,
    getTopWorkoutNames,
    getWorkoutsByInstructor
};

// Chloe top class is 74192e86571141939dd90fb9a62a7410 (5 min stretch)
// songs in there are Sundream (Classixx Remix) by RÜFÜS DU SOL,The Spirit (Extended Mix), Mighty Mouse, Til the Sun Rise Up (feat. Akon) (feat. Akon), Bob Sinclar,Akon

// Chloe top ride is 63e9aabe98554569a138238236d3e5b6 (20min mood ride) - 6 times, and songs in it are
// IDGAF-Dua Lipa
// In the End-Linkin Park
// Shut Up-The Black Eyed Peas
// Ironic-Alanis Morissette
// Breathe-The Prodigy
// Shake It Out-Florence + The Machine

// then 85d27c3d0d77493092163c3ca8b4c2ba (5 min cooldown, sam yo) - 4 times, with songs
// Wish You Were Here- Pink Floyd
// Love -Def Leppard,The Royal Philharmonic Orchestra


// Must use CSV for calories


// we can get effort_zones.heart_rate_zone_durations": { and sum/log this

// avrage heart rate? rides over 20min, medittions

// top meditation instructor

// top yoga instructor

// top cycling instructor

// top strength instructor




// sum/log by time of day as well - make a set of the 4 time blocks, add a related set of what the day of the week was, to find the most active day+time

// also weekends vs weekdays


// mph and kph check

