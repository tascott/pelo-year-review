import { supabase } from '../../lib/supabase';

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

// Interface removed - no longer caching

interface SongData {
	title: string;
	artist_names: string;
	workout_id: string;
}

async function fetchSongsInBatches(workoutIds: string[], batchSize = 3, selectedYear: string | number) {
	console.log('Fetching songs for year:', selectedYear);
	const fetchedSongs: SongData[] = [];
	const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

	// Only fetch the first 30 workouts worth of songs
	const limitedWorkoutIds = workoutIds.slice(0, 30);

	// Fetch data in smaller batches
	for (let i = 0; i < limitedWorkoutIds.length; i += batchSize) {
		const batch = limitedWorkoutIds.slice(i, i + batchSize);
		try {
			const { data, error } = await supabase
				.from('songs')
				.select('title, artist_names, workout_id')
				.in('workout_id', batch)
				.limit(50);

			if (error) {
				console.error('Batch query error:', error);
				break; // Stop if we hit an error
			}

			if (data) {
				fetchedSongs.push(...data);
			}

			// Add a small delay between batches
			await delay(1000);
		} catch (e) {
			console.error('Error fetching songs batch:', e);
			break; // Stop if we hit an error
		}
	}

	// Cache disabled temporarily

	return fetchedSongs;
}

async function getAllWorkouts(userId: string): Promise<Workout[]> {
	const fetchedWorkouts: Workout[] = [];
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

		fetchedWorkouts.push(...workouts);
		page++;
	}

	return fetchedWorkouts;
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

		// Limit to most recent 30 workouts
		const workoutIds = cyclingRides
			.filter((ride): ride is { rideId: string } & typeof ride => typeof ride.rideId === 'string')
			.map((ride) => ride.rideId)
			.slice(0, 30);

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
