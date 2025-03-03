// Constants for localStorage
const CHUNK_SIZE = 100;
const getChunkKey = (userId, chunkIndex) => `pelo_csv_${userId}_${chunkIndex}`;
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_TIMESTAMP_KEY = (userId) => `pelo_csv_timestamp_${userId}`;

/**
 * Parse CSV data into structured format
 */
import Papa from 'papaparse';

/**
 * Minimize CSV workout data to only keep necessary fields
 */
const minimizeWorkoutData = (workout) => {
  // Check which speed measurement is present and use that
  let speed = 0;
  if (workout['Avg. Speed (mph)']) {
    speed = parseFloat(workout['Avg. Speed (mph)']) || 0;
  } else if (workout['Avg. Speed (kph)']) {
    const speedKph = parseFloat(workout['Avg. Speed (kph)']) || 0;
    speed = speedKph * 0.621371;
  }

  const minimized = {
    'Workout Timestamp': workout['Workout Timestamp'],
    'Instructor Name': workout['Instructor Name'],
    'Fitness Discipline': workout['Fitness Discipline'],
    'Type': workout['Type'],
    'Title': workout['Title'],
    'Total Output': workout['Total Output'],
    'Avg. Resistance': workout['Avg. Resistance'],
    'Avg. Cadence (RPM)': workout['Avg. Cadence (RPM)'],
    'Avg. Speed (mph)': speed,
    'Distance (mi)': workout['Distance (mi)'] ? parseFloat(workout['Distance (mi)']) :
                      workout['Distance (km)'] ? parseFloat(workout['Distance (km)']) * 0.621371 : 0, // Handle both mi and km
    'Calories Burned': workout['Calories Burned'],
    'Avg. Heartrate': workout['Avg. Heartrate'],
    'Length (minutes)': workout['Length (minutes)']
  };


  return minimized;
}

const parseCSVData = (csvText) => {
  const parsedData = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transform: (value, field) => {
      // Only handle % in Avg. Resistance field
      if (field === 'Avg. Resistance' && typeof value === 'string' && value.includes('%')) {
        return parseFloat(value.replace('%', ''));
      }
      return value;
    }
  });

  return parsedData.data
    .filter(row => row['Workout Timestamp'])
    .map(minimizeWorkoutData);
};

/**
 * Save CSV data in chunks to localStorage
 */
const saveToChunks = (userId, workouts, debug = false) => {
  // Clear existing chunks first
  let chunkIndex = 0;
  let hasMoreChunks = true;
  while (hasMoreChunks) {
    const chunkKey = getChunkKey(userId, chunkIndex);
    const existingChunk = localStorage.getItem(chunkKey);
    if (!existingChunk) {
      hasMoreChunks = false;
    } else {
      localStorage.removeItem(chunkKey);
      chunkIndex++;
    }
  }

  // Save new chunks
  const chunks = [];
  for (let i = 0; i < workouts.length; i += CHUNK_SIZE) {
    chunks.push(workouts.slice(i, i + CHUNK_SIZE));
  }

  chunks.forEach((chunk, index) => {
    const chunkKey = getChunkKey(userId, index);
    localStorage.setItem(chunkKey, JSON.stringify(chunk));
  });

  // Save timestamp
  localStorage.setItem(CACHE_TIMESTAMP_KEY(userId), Date.now().toString());

  if (debug) console.log(`[Cache] Saved ${chunks.length} CSV chunks and timestamp`);
};

/**
 * Load CSV data from chunks in localStorage
 */
const loadFromChunks = (userId, debug = false) => {
  const workouts = [];
  let chunkIndex = 0;
  let hasMoreChunks = true;

  while (hasMoreChunks) {
    const chunkKey = getChunkKey(userId, chunkIndex);
    const chunk = localStorage.getItem(chunkKey);

    if (!chunk) {
      hasMoreChunks = false;
      continue;
    }

    try {
      const parsedChunk = JSON.parse(chunk);
      workouts.push(...parsedChunk);
      chunkIndex++;
    } catch (e) {
      console.warn('Failed to parse chunk:', e);
      hasMoreChunks = false;
    }
  }

  if (debug) console.log(`[Cache] Loaded ${workouts.length} workouts from CSV cache`);
  return workouts;
};

/**
 * Main function to fetch and organize CSV data
 */
export async function fetchAndCacheCSVData({
  userId,
  forceFetch = false,
  debug = false
}) {
  // First check if we have cached chunks
  const cachedData = loadFromChunks(userId, debug);
  
  // Use cache if chunks exist
  if (cachedData?.length) {
    // Then check timestamp
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY(userId));
    if (!timestamp) {
      // No timestamp but we have chunks - save new timestamp
      const newTimestamp = Date.now().toString();
      localStorage.setItem(CACHE_TIMESTAMP_KEY(userId), newTimestamp);
      console.log(
        '%c[Cache] Using CSV chunks with new timestamp',
        'color: #4CAF50; font-weight: bold;'
      );
      return cachedData;
    }

    const oneDayAgo = Date.now() - CACHE_EXPIRY;
    const isExpired = Number(timestamp) <= oneDayAgo;
    
    if (!isExpired || !forceFetch) {
      // Sort workouts to find most recent
      const sortedWorkouts = [...cachedData].sort((a, b) => {
        const parseDate = (timestamp) => {
          const cleanTimestamp = timestamp.replace(/ \((UTC|GMT)\)$/, '');
          const [datePart, timePart] = cleanTimestamp.split(' ');
          const [year,month,day] = datePart.split('-').map(Number);
          const [hours,minutes] = timePart.split(':').map(Number);
          return Date.UTC(year,month - 1,day,hours,minutes,0);
        };
        return parseDate(b['Workout Timestamp']) - parseDate(a['Workout Timestamp']);
      });
      
      const mostRecentWorkout = sortedWorkouts[0];
      const cacheAge = Math.round((Date.now() - Number(timestamp)) / (60 * 1000));
      console.log(
        '%c[Cache] Using CSV data from cache: ' +
        `${cacheAge} minutes old, ${cachedData.length} workouts, ` +
        `most recent: ${mostRecentWorkout['Workout Timestamp']}`,
        'color: #4CAF50; font-weight: bold;'
      );
      return cachedData;
    }
  } else if (debug) {
    console.log(
      '%c[Cache] CSV data expired or missing',
      'color: #FFA726; font-style: italic;'
    );
  }

  // Fetch fresh data
  try {
    console.log(
      '%c[Fetch] Getting fresh CSV data...',
      'color: #2196F3; font-weight: bold;'
    );

    const response = await fetch(
      `/api/user/${userId}/workout_history_csv?timezone=Europe%2FLondon`,
      {
        credentials: 'include',
        headers: {
          Accept: 'text/csv',
          'Peloton-Platform': 'web',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch CSV data');
    }

    const csvText = await response.text();
    if (debug) {
      console.log('[Fetch] Got CSV data:', {
        length: csvText.length,
        preview: csvText.slice(0, 100),
      });
    }

    // Parse CSV into structured data
    const workouts = parseCSVData(csvText);

    // Sort workouts to find most recent
    const sortedWorkouts = [...workouts].sort((a, b) => {
      const parseDate = (timestamp) => {
        const cleanTimestamp = timestamp.replace(/ \((UTC|GMT)\)$/, '');
        const [datePart, timePart] = cleanTimestamp.split(' ');
        const [year,month,day] = datePart.split('-').map(Number);
        const [hours,minutes] = timePart.split(':').map(Number);
        return Date.UTC(year,month - 1,day,hours,minutes,0);
      };
      return parseDate(b['Workout Timestamp']) - parseDate(a['Workout Timestamp']);
    });

    const mostRecentWorkout = sortedWorkouts[0];
    console.log(
      '%c[Fetch] Got fresh CSV data: ' +
      `${workouts.length} workouts, ` +
      `most recent: ${mostRecentWorkout['Workout Timestamp']}`,
      'color: #2196F3; font-weight: bold;'
    );

    // Save to chunks
    saveToChunks(userId, workouts, debug);

    return workouts;
  } catch (err) {
    console.error('[Fetch] Error fetching CSV:', err);
    throw err;
  }
}
