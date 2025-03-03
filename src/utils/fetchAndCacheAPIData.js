// Constants for localStorage
const CACHE_KEY = 'pelotonCachedData';
const CHUNK_SIZE = 100;
const getChunkKey = (userId, chunkIndex) => `pelo_workouts_${userId}_${chunkIndex}`;
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Clean and minimize workout data to only keep necessary fields
 * @param {Object} workout - Workout data
 * @returns {Object} Minimized workout data
 */
const minimizeWorkoutData = (workout) => {
  return {
    id: workout?.peloton?.ride?.id || workout.id, // Use ride.id with fallback to workout.id
    start_time: workout.start_time,
    end_time: workout.end_time,
    fitness_discipline: workout.fitness_discipline,
    difficulty_estimate: workout?.peloton?.ride?.difficulty_estimate,
    duration: workout?.peloton?.ride?.duration,
    instructor_id: workout?.peloton?.ride?.instructor_id,
    ride_title: workout?.peloton?.ride?.title,
    effort_zones: workout.effort_zones,
  };
};

/**
 * Fetch all workouts for a user, with pagination
 * @param {Object} options - Options for fetching workouts
 * @param {string} options.userId - User ID
 * @param {Function} options.onProgress - Callback for progress updates
 * @param {boolean} options.debug - Debug mode
 * @returns {Promise<Array<Object>>} Fetched workouts
 */
async function fetchAllWorkouts({ userId, onProgress, debug = false }) {
  const fetchedWorkouts = [];
  let page = 0;
  let hasMore = true;
  const limit = 100;
  const seenPages = new Set();

  while (hasMore) {
    if (seenPages.has(page)) {
      page++;
      continue;
    }
    seenPages.add(page);

    try {
      const response = await fetch(
        `/api/user/${userId}/workouts?limit=${limit}&page=${page}&joins=peloton.ride`,
        {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            Origin: 'https://members.onepeloton.com',
            Referer: 'https://members.onepeloton.com/',
            'Peloton-Platform': 'web',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch workouts: ${response.status}`);
      }

      const responseText = await response.text();

      if (debug) {
        console.log('Raw API Response:', {
          status: response.status,
          responseText: responseText.slice(0, 1000),
        });
      }

      const data = JSON.parse(responseText);
      const workouts = data.data || [];

      fetchedWorkouts.push(...workouts);

      if (onProgress) {
        onProgress(fetchedWorkouts);
      }

      hasMore = workouts.length === limit;
      page++;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
  }

  return fetchedWorkouts;
}

/**
 * Fetch user data from Peloton API
 * @returns {Promise<Object>} User data
 */
async function fetchUserData() {
  const response = await fetch('/api/me', {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      Origin: 'https://members.onepeloton.com',
      Referer: 'https://members.onepeloton.com/',
      'Peloton-Platform': 'web',
    },
  });

  if (!response.ok) throw new Error('Failed to fetch user data');
  return response.json();
}

/**
 * Function to fetch and process workout data
 * @param {Object} options - Options for fetching and processing workouts
 * @param {string} options.userId - User ID
 * @param {boolean} options.forceFetch - Force fetch workouts
 * @param {Function} options.onProgress - Callback for progress updates
 * @param {boolean} options.debug - Debug mode
 * @returns {Promise<Array<Object>>} Processed workouts
 */
export async function fetchAndProcessWorkouts({
  userId,
  forceFetch = false,
  onProgress,
  debug = false
}) {
  // Try to load from cache first
  const cachedData = [];
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
      cachedData.push(...parsedChunk);
      chunkIndex++;
    } catch (e) {
      console.warn('Failed to parse chunk:', e);
      hasMoreChunks = false;
    }
  }

  // First check if we have workout chunks
  if (cachedData.length) {
    // Then check metadata timestamp
    const cachedMeta = localStorage.getItem(CACHE_KEY);
    if (!cachedMeta) {
      // No metadata but we have chunks - save new metadata
      const cacheData = {
        timestamp: Date.now(),
        userData: { id: userId }
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log(
        '%c[Cache] Using workout chunks with new timestamp',
        'color: #4CAF50; font-weight: bold;'
      );
      return cachedData;
    }

    try {
      const parsed = JSON.parse(cachedMeta);
      const isExpired = !parsed.timestamp || parsed.timestamp <= Date.now() - CACHE_EXPIRY;
      
      // Use cache if it's not expired or we're not forcing a fetch
      if (!isExpired || !forceFetch) {
        const cacheAge = Math.round((Date.now() - parsed.timestamp) / (60 * 1000));
        console.log(
          '%c[Cache] Using API workout data from cache: ' +
          `${cacheAge} minutes old, ${cachedData.length} workouts`,
          'color: #4CAF50; font-weight: bold;'
        );
        return cachedData;
      }
    } catch (e) {
      console.warn('Failed to parse cache metadata:', e);
    }
  }

  // Fetch fresh data
  const rawWorkouts = await fetchAllWorkouts({
    userId,
    onProgress: (workouts) => {
      onProgress?.(workouts);
    },
    debug
  });

  // Process and minimize the data
  const processedWorkouts = rawWorkouts.map(minimizeWorkoutData);

  if (debug) {
    console.log('Processed workouts:', processedWorkouts.length);
  }

  // Save workouts in chunks
  const chunks = [];
  for (let i = 0; i < processedWorkouts.length; i += CHUNK_SIZE) {
    chunks.push(processedWorkouts.slice(i, i + CHUNK_SIZE));
  }

  // Clear existing chunks first
  let clearIndex = 0;
  let hasMoreToDelete = true;
  while (hasMoreToDelete) {
    const chunkKey = getChunkKey(userId, clearIndex);
    const existingChunk = localStorage.getItem(chunkKey);
    if (!existingChunk) {
      hasMoreToDelete = false;
    } else {
      localStorage.removeItem(chunkKey);
      clearIndex++;
    }
  }

  // Save new chunks
  chunks.forEach((chunk, index) => {
    const chunkKey = getChunkKey(userId, index);
    localStorage.setItem(chunkKey, JSON.stringify(chunk));
  });

  if (debug) console.log(`Saved ${chunks.length} chunks of workouts to cache`);

  return processedWorkouts;
}

/**
 * Main function to fetch all required data and manage caching
 * @param {Object} options - Options for fetching data
 * @param {boolean} options.forceFetch - Force fetch data
 * @param {Function} options.onProgress - Callback for progress updates
 * @param {boolean} options.debug - Debug mode
 * @returns {Promise<Object>} Fetched data
 */
export async function fetchAllPelotonData({
  forceFetch = false,
  onProgress,
  debug = false
}) {
  // Always try to load from cache first
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      const oneDayAgo = Date.now() - CACHE_EXPIRY;
      const isExpired = !parsed.timestamp || parsed.timestamp <= oneDayAgo;

      // Use cache if it's not expired or if we're not forcing a fetch
      if (!isExpired || !forceFetch) {
        const cacheAge = Math.round((Date.now() - parsed.timestamp) / (60 * 1000));
        console.log(
          '%c[Cache] Using API data from cache: ' +
          `${cacheAge} minutes old, user: ${parsed.userData.id}`,
          'color: #4CAF50; font-weight: bold;'
        );

        // Load workouts from chunks
        const workouts = await fetchAndProcessWorkouts({
          userId: parsed.userData.id,
          forceFetch: false,
          debug
        });

        onProgress?.({
          workouts,
          userData: parsed.userData
        });

        return {
          workouts,
          userData: parsed.userData
        };
      }
    } catch (e) {
      console.warn('Failed to parse cached data:', e);
    }
  }

  console.log(
    '%c[Fetch] Getting fresh API data...',
    'color: #2196F3; font-weight: bold;'
  );

  // Fetch user data first
  const userData = await fetchUserData();
  if (!userData?.id) throw new Error('Failed to get user ID');

  // Then fetch workouts
  const workouts = await fetchAndProcessWorkouts({
    userId: userData.id,
    forceFetch,
    onProgress: (workouts) => {
      onProgress?.({
        workouts,
        userData
      });
    },
    debug
  });

  // Cache only user data and metadata
  const cacheData = {
    userData,
    timestamp: Date.now()
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

  return {
    workouts,
    userData
  };
}

/**
 * Export utility functions that might be needed elsewhere
 */
export const clearAllCache = () => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('peloton') || key.startsWith('yearReview') || key.startsWith('song')) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (e) {
    console.warn('Cache clearing failed:', e);
    return false;
  }
};
