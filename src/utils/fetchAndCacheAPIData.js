// Constants for localStorage
const CACHE_KEY = 'pelotonCachedData';
const CHUNK_SIZE = 100;
const getChunkKey = (userId, chunkIndex) => `pelo_workouts_${userId}_${chunkIndex}`;
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Clean and minimize workout data to only keep necessary fields
 */
const minimizeWorkoutData = (workout) => {
  // Log warning if ride id is missing
  // if (!workout?.peloton?.ride?.id) {
  //   console.warn('Missing peloton.ride.id for workout:', workout.id);
  // }

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
                `/api/user/${userId}/workouts?limit=${limit}&page=${page}&joins=peloton.ride`, // For full workout data
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

// Fetch user data from Peloton API
async function fetchUserData() {
  const response = await fetch('/api/me', { // For name, etc
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      Origin: 'https://members.onepeloton.com',
      Referer: 'https://members.onepeloton.com/',
      'Peloton-Platform': 'web',
    },
  });

  console.log('Fetching user /me response...', response);

  if (!response.ok) throw new Error('Failed to fetch user data');
  return response.json();
}

/**
 * Main function to fetch all required data and manage caching
 */
export async function fetchAllPelotonData({
  forceFetch = false,
  onProgress,
  debug = false
}) {
  if (!forceFetch) {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const oneDayAgo = Date.now() - CACHE_EXPIRY;

        // Only use cache if it's less than a day old
        if (parsed.timestamp && parsed.timestamp > oneDayAgo) {
          if (debug) console.log('Using cached data from:', new Date(parsed.timestamp));

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
  }

  if (debug) console.log('Fetching fresh data from API');

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
    userData,
  };
}

/**
 * Function to fetch and process workout data
 */
export async function fetchAndProcessWorkouts({
  userId,
  forceFetch = false,
  onProgress,
  debug = false
}) {
  // Try to load from cache first unless forceFetch is true
  if (!forceFetch) {
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

    if (cachedData.length) {
      if (debug) console.log('Loaded from cache:', cachedData.length, 'workouts');
      return cachedData;
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
  chunks.forEach((chunk, index) => {
    const chunkKey = getChunkKey(userId, index);
    localStorage.setItem(chunkKey, JSON.stringify(chunk));
  });

  if (debug) console.log(`Saved ${chunks.length} chunks of workouts to cache`);

  return processedWorkouts;
}

// Export utility functions that might be needed elsewhere
// Export cache management function
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
