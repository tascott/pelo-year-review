// Constants for localStorage
const CHUNK_SIZE = 100;
const getChunkKey = (userId, chunkIndex) => `pelo_csv_${userId}_${chunkIndex}`;
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Parse CSV data into structured format
 */
import Papa from 'papaparse';

const parseCSVData = (csvText) => {
  const parsedData = Papa.parse(csvText, { header: true });
  return parsedData.data.filter(row => row['Workout Timestamp']);
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

  if (debug) console.log(`Saved ${chunks.length} CSV chunks to cache`);
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

  if (debug) console.log(`Loaded ${workouts.length} workouts from CSV cache`);
  return workouts;
};

/**
 * Main function to fetch and organize CSV data
 */
export async function fetchAndOrganiseCSVData({ 
  userId, 
  forceFetch = false, 
  debug = false 
}) {
  // Try to load from cache first unless forceFetch is true
  if (!forceFetch) {
    const cachedData = loadFromChunks(userId, debug);
    if (cachedData?.length) {
      if (debug) console.log('Using cached CSV data');
      return cachedData;
    }
  }

  try {
    if (debug) console.log('Fetching CSV data for user:', userId);
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
      console.log('Got CSV data:', {
        length: csvText.length,
        preview: csvText.slice(0, 100),
      });
    }

    // Parse CSV into structured data
    const workouts = parseCSVData(csvText);

    // Save to chunks
    saveToChunks(userId, workouts, debug);

    return workouts;
  } catch (err) {
    console.error('Error fetching CSV:', err);
    throw err;
  }
}
