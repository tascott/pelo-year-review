import { supabase } from '../../lib/supabase';

interface Workout {
	id: string;
	fitness_discipline: string;
	title: string;
	peloton: {
		ride?: {
			id: string;
		};
	};
}

async function fetchSongsInBatches(workoutIds: string[], batchSize = 100) {
	let allSongs = [];

	console.log('All workout IDs received:', {
		count: workoutIds.length,
		sample: workoutIds.slice(0, 5)
	});

	for (let i = 0; i < workoutIds.length; i += batchSize) {
		const batch = workoutIds.slice(i, i + batchSize);
		const query = `workout_id.in.(${batch.join(',')})`;

		console.log(`Batch ${Math.floor(i/batchSize) + 1} query:`, {
			batchSize: batch.length,
			sampleIds: batch.slice(0, 3),
			fullQuery: query
		});

		const { data, error } = await supabase
			.from('songs')
			.select('title, artist_names, workout_id')
			.filter('workout_id', 'in', `(${batch.join(',')})`);

		console.log(`Batch ${Math.floor(i/batchSize) + 1} results:`, {
			success: !error,
			songsFound: data?.length || 0,
			sampleSong: data?.[0],
			error: error?.message,
			errorDetails: error?.details
		});

		if (error) {
			console.error('Batch query error:', {
				message: error.message,
				details: error.details,
				batch: i / batchSize + 1
			});
			throw error;
		}

		if (data) {
			allSongs = allSongs.concat(data);
		}
	}

	return allSongs;
}

async function testWithKnownIds() {
	console.log('Testing with known workout IDs...');

	// Test first ID
	const testId1 = '5c3a131318b14165808002d4b051927d';
	console.log(`Testing ID 1: ${testId1}`);
	const { data: data1, error: error1 } = await supabase
		.from('songs')
		.select('*')  // Get all fields to see the structure
		.eq('workout_id', testId1);

	console.log('Test 1 results:', {
		success: !error1,
		songsFound: data1?.length || 0,
		songs: data1,
		error: error1?.message
	});

	// Test with the ID we got back
	const testId2 = '2defbf2344d14531ba1befee48359224';  // Your original test ID
	console.log(`Testing ID 2: ${testId2}`);
	const { data: data2, error: error2 } = await supabase
		.from('songs')
		.select('*')
		.eq('workout_id', testId2);

	console.log('Test 2 results:', {
		success: !error2,
		songsFound: data2?.length || 0,
		songs: data2,
		error: error2?.message
	});

	// Test a simple count query
	const { count, error: countError } = await supabase
		.from('songs')
		.select('*', { count: 'exact' });

	console.log('Total count:', {
		count,
		error: countError?.message
	});

	return data1 || data2;
}

export async function processUserMusic(workouts: Workout[]) {
	console.log('Starting processUserMusic with workouts:', {
		workoutCount: workouts?.length
	});

	try {
		// First fetch complete workout data with ride info
		const response = await fetch(
			`/api/user/${workouts[0].user_id}/workouts?limit=100&joins=peloton.ride`,
			{
				credentials: 'include',
				headers: {
					Accept: 'application/json',
					Origin: 'https://members.onepeloton.com',
					Referer: 'https://members.onepeloton.com/',
					'Peloton-Platform': 'web',
				}
			}
		);

		const data = await response.json();
		const workoutsWithRides = data.data || [];

		console.log('Fetched workouts with rides:', {
			total: workoutsWithRides.length,
			sample: workoutsWithRides.slice(0, 2).map(w => ({
				id: w.id,
				discipline: w.fitness_discipline,
				rideId: w.peloton?.ride?.id
			}))
		});

		// Then process cycling workouts
		const cyclingRides = workoutsWithRides
			.filter(workout => workout.fitness_discipline === 'cycling')
			.map(workout => ({
				workoutId: workout.id,
				rideId: workout.peloton?.ride?.id,
				title: workout.title,
				hasRide: !!workout.peloton?.ride
			}));

		const workoutIds = cyclingRides
			.filter(ride => ride.rideId)
			.map(ride => ride.rideId);

		// Add test query at the start
		const testResult = await testWithKnownIds();
		console.log('Known ID test complete:', {
			hasResults: !!testResult,
			songCount: testResult?.length
		});

		console.log('Filtered cycling workout IDs:', {
			totalWorkouts: workouts.length,
			cyclingWorkouts: workoutIds.length,
			sampleIds: workoutIds.slice(0, 3),
			sampleWorkout: workouts.find(w => w.fitness_discipline === 'cycling')?.peloton?.ride  // Log a sample cycling workout's ride data
		});

		if (workoutIds.length === 0) {
			console.log('No workout IDs found, returning null');
			return null;
		}

		console.log('Checking songs table...');

		// First check if we have any songs at all
		const { data: songCount, error: countError } = await supabase
			.from('songs')
			.select('count');  // Changed from select('*', { count: 'exact', head: true })

		console.log('Total songs in database:', {
			count: songCount,
			error: countError?.message,  // Added error message
			details: countError?.details  // Added error details
		});

		// Then check for specific workout IDs
		if (workoutIds.length > 0) {
			const { data: sampleSongs, error: sampleError } = await supabase
				.from('songs')
				.select('workout_id, title, artist_names')
				.in('workout_id', workoutIds);  // Check all workout IDs

			console.log('Sample workout songs:', {
				workoutIds,  // Log all workout IDs
				songsFound: sampleSongs?.length || 0,
				sampleSongs: sampleSongs?.slice(0, 5),  // Just limit the logging
				error: sampleError?.message,
				details: sampleError?.details
			});
		}

		// Main query - in batches
		const songs = await fetchSongsInBatches(workoutIds);

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
			sampleSongCount: Array.from(songCounts.entries()).slice(0, 3),
			sampleArtistData: Array.from(artistData.entries()).slice(0, 3)
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
			.slice(0, 10);

		const topArtists = Array.from(artistData.entries())
			.map(([name, data]) => ({
				name,
				playCount: data.playCount,
				uniqueSongs: data.songs.size,
			}))
			.sort((a, b) => b.playCount - a.playCount)
			.slice(0, 10);

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
