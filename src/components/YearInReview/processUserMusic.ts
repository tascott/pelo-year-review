import { supabase } from '../../lib/supabase';

interface Workout {
	id: string;
	user_id?: string;
	start_time: number;
	fitness_discipline: string;
	title: string;
}

interface CachedSongs {
	timestamp: number;
	songs: SongData[];
}

interface SongData {
	title: string;
	artist_names: string;
	workout_id: string;
}

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
	const fetchedSongs: SongData[] = [];

	// Fetch data in batches
	for (let i = 0; i < workoutIds.length; i += batchSize) {
		const batch = workoutIds.slice(i, i + batchSize);
		const { data, error } = await supabase.from('songs').select('title, artist_names, workout_id').in('workout_id', batch).limit(1000);

		if (error) {
			console.error('Batch query error:', error);
			throw error;
		}

		if (data) {
			fetchedSongs.push(...data);
		}
	}

	// Cache the results
	const cacheData: CachedSongs = {
		timestamp: Date.now(),
		songs: fetchedSongs,
	};

	try {
		localStorage.setItem(cacheKey, JSON.stringify(cacheData));
		console.log('Successfully cached song data:', {
			key: cacheKey,
			timestamp: new Date(cacheData.timestamp),
			songCount: fetchedSongs.length,
			year: selectedYear,
		});
	} catch (e) {
		console.warn('Failed to cache song data:', e);
	}

	return fetchedSongs;
}

export async function processUserMusic(workouts: Workout[], selectedYear: string, bikeStartDate: Date) {
	console.log('Starting processUserMusic with workouts:', {
		workoutCount: workouts?.length,
	});

	try {
		// Use the workouts passed in directly
		const workoutsWithRides = workouts;

		console.log('Fetching all workouts:', {
			total: workoutsWithRides.length,
			sample: workoutsWithRides.slice(0, 2).map((w) => ({
				id: w.id,
				discipline: w.fitness_discipline,
				title: w.title,
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
				id: workout.id,
				title: workout.title,
				date: new Date(workout.start_time * 1000).toISOString(),
			}));

		const workoutIds = cyclingRides
			.filter((ride) => typeof ride.id === 'string')
			.map((ride) => ride.id);

		if (workoutIds.length === 0) {
			console.log('No workout IDs found, returning null');
			return null;
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
			.slice(0, 20);

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
