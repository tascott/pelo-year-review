import { supabase } from '../../lib/supabase';

interface Song {
	id: string;
	name: string;
	artist: string;
	// Add other properties as needed
}

interface Workout {
	id: string;
	user_id?: string;
	created_at: number;
	start_time: number;
	fitness_discipline: string;
	title: string;
	peloton?: {
		ride?: {
			id: string;
		};
	};
	// Add other properties as needed
}

interface CachedSongs {
	timestamp: number;
	songs: Array<{
		title: string;
		artist_names: string;
		workout_id: string;
	}>;
}

interface SongData {
	title: string;
	artist_names: string;
	workout_id: string;
}

let allSongs: SongData[] = [];
let allWorkouts: Workout[] = [];

async function fetchSongsInBatches(workoutIds: string[], batchSize = 7, selectedYear: string | number) {
	// Handle special cases for cache key
	const cacheKey = `songCache_${selectedYear}`;

	console.log('Checking cache for key:', cacheKey);
	const cachedData = localStorage.getItem(cacheKey);
	console.log('Found cached data:', !!cachedData);

	if (cachedData) {
		try {
			const parsed: CachedSongs = JSON.parse(cachedData);
			const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

			console.log('Cache timestamp:', new Date(parsed.timestamp));
			console.log('Cache age:', Date.now() - parsed.timestamp, 'ms');
			console.log('Is cache valid?', parsed.timestamp > oneDayAgo);

			if (parsed.timestamp > oneDayAgo) {
				console.log('Using cached song data from:', new Date(parsed.timestamp), 'for year:', selectedYear);
				return parsed.songs;
			}
		} catch (e) {
			console.warn('Failed to parse cached data:', e);
		}
	}

	// If we get here, we need to fetch fresh data
	console.log('Cache miss or expired, fetching fresh data for year:', selectedYear);
	let allSongs = [];

	// Fetch data in batches
	for (let i = 0; i < workoutIds.length; i += batchSize) {
		const batch = workoutIds.slice(i, i + batchSize);
		const { data, error } = await supabase.from('songs').select('title, artist_names, workout_id').in('workout_id', batch).limit(1000);

		if (error) {
			console.error('Batch query error:', error);
			throw error;
		}

		if (data) {
			allSongs = allSongs.concat(data);
		}
	}

	// Cache the results
	const cacheData: CachedSongs = {
		timestamp: Date.now(),
		songs: allSongs,
	};

	try {
		localStorage.setItem(cacheKey, JSON.stringify(cacheData));
		console.log('Successfully cached song data:', {
			key: cacheKey,
			timestamp: new Date(cacheData.timestamp),
			songCount: allSongs.length,
			year: selectedYear,
		});
	} catch (e) {
		console.warn('Failed to cache song data:', e);
	}

	return allSongs;
}

async function getAllWorkouts(userId: string) {
	let allWorkouts = [];
	let page = 0;
	let hasMore = true;
	const limit = 100;

	while (hasMore) {
		const response = await fetch(`/api/user/${userId}/workouts?limit=${limit}&page=${page}&joins=peloton.ride`, {
			credentials: 'include',
			headers: {
				Accept: 'application/json',
				Origin: 'https://members.onepeloton.com',
				Referer: 'https://members.onepeloton.com/',
				'Peloton-Platform': 'web',
			},
		});

		const data = await response.json();
		const workouts = data.data || [];

		if (workouts.length < limit) {
			hasMore = false;
		}

		allWorkouts = allWorkouts.concat(workouts);
		page++;
	}

	return allWorkouts;
}

export async function processUserMusic(workouts: Workout[], selectedYear: string, bikeStartDate: Date) {
	console.log('Starting processUserMusic with workouts:', {
		workoutCount: workouts?.length,
	});

	try {
		// Get all workouts with ride info
		const workoutsWithRides = workouts[0]?.user_id ? await getAllWorkouts(workouts[0].user_id) : [];

		console.log('Fetched all workouts with rides:', {
			total: workoutsWithRides.length,
			sample: workoutsWithRides.slice(0, 2).map((w) => ({
				id: w.id,
				discipline: w.fitness_discipline,
				rideId: w.peloton?.ride?.id,
			})),
		});

		// Filter cycling rides by year first
		const cyclingRides = workoutsWithRides
			.filter((workout) => {
				const workoutDate = new Date(workout.start_time * 1000);
				if (selectedYear === 'all') return workout.fitness_discipline === 'cycling';
				if (selectedYear === 'bike') {
					return workout.fitness_discipline === 'cycling' && workoutDate >= bikeStartDate;
				}
				if (typeof selectedYear === 'string') {
					const yearNum = parseInt(selectedYear, 10);
					return workout.fitness_discipline === 'cycling' && workoutDate.getFullYear() === yearNum;
				}
				return workout.fitness_discipline === 'cycling' && workoutDate.getFullYear() === selectedYear;
			})
			.map((workout) => ({
				workoutId: workout.id,
				rideId: workout.peloton?.ride?.id,
				title: workout.title,
				hasRide: !!workout.peloton?.ride,
				date: new Date(workout.start_time * 1000).toISOString(),
			}));

		// Add detailed logging before getting workoutIds
		console.log('Filtered cycling rides:', {
			selectedYear,
			totalRides: cyclingRides.length,
			rides: cyclingRides.map((ride) => ({
				rideId: ride.rideId,
				date: ride.date,
				title: ride.title,
			})),
		});

		const workoutIds = cyclingRides.filter((ride) => ride.rideId).map((ride) => ride.rideId);

		console.log('Filtered cycling workout IDs:', {
			totalWorkouts: workouts.length,
			cyclingWorkouts: workoutIds.length,
			sampleIds: workoutIds.slice(0, 3),
			sampleWorkout: workouts.find((w) => w.fitness_discipline === 'cycling')?.peloton?.ride, // Log a sample cycling workout's ride data
		});

		if (workoutIds.length === 0) {
			console.log('No workout IDs found, returning null');
			return null;
		}

		console.log('Checking songs table...');

		// First check if we have any songs at all
		const { data: songCount, error: countError } = await supabase.from('songs').select('count'); // Changed from select('*', { count: 'exact', head: true })

		console.log('Total songs in database:', {
			count: songCount,
			error: countError?.message, // Added error message
			details: countError?.details, // Added error details
		});

		// Then check for specific workout IDs
		if (workoutIds.length > 0) {
			const { data: sampleSongs, error: sampleError } = await supabase
				.from('songs')
				.select('workout_id, title, artist_names')
				.in('workout_id', workoutIds);

			console.log('All workout songs:', {
				workoutIds,
				songsFound: sampleSongs?.length || 0,
				allSongs: sampleSongs,
				error: sampleError?.message,
				details: sampleError?.details,
			});
		}

		// Main query - in batches
		const songs = await fetchSongsInBatches(workoutIds, 7, selectedYear);

		if (!songs || songs.length === 0) {
			console.log('No songs found for any workouts');
			return null;
		}

		// Process song data
		const songCounts = new Map();
		const artistData = new Map();

		songs.forEach((song) => {
			// Process song counts
			const songKey = `${song.title}|||${song.artist_names}`;
			const existing = songCounts.get(songKey) || {
				count: 0,
				artist: song.artist_names,
			};
			songCounts.set(songKey, { ...existing, count: existing.count + 1 });

			// Process artist data
			const artistExisting = artistData.get(song.artist_names) || {
				playCount: 0,
				songs: new Set(),
			};
			artistData.set(song.artist_names, {
				playCount: artistExisting.playCount + 1,
				songs: artistExisting.songs.add(song.title),
			});
		});

		console.log('Processed song data:', {
			uniqueSongs: songCounts.size,
			uniqueArtists: artistData.size,
			sampleSongCount: Array.from(songCounts.entries()),
			sampleArtistData: Array.from(artistData.entries()),
		});

		// Format results
		const topSongs = Array.from(songCounts.entries())
			.map(([key, data]) => {
				const [title, artist] = key.split('|||');
				return {
					title,
					artist,
					playCount: data.count,
				};
			})
			.sort((a, b) => b.playCount - a.playCount)
			.slice(0, 3);

		const topArtists = Array.from(artistData.entries())
			.map(([name, data]) => ({
				name,
				playCount: data.playCount,
				uniqueSongs: data.songs.size,
			}))
			.sort((a, b) => b.playCount - a.playCount)
			.slice(0, 3);

		const result = {
			topSongs,
			topArtists,
			totalUniqueSongs: songCounts.size,
			totalUniqueArtists: artistData.size,
			totalPlays: songs.length,
		};

		console.log('Final music stats:', result);
		return result;
	} catch (error) {
		console.error('Error processing user music:', error);
		return null;
	}
}
