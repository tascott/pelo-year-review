'use client';
import { useState, ChangeEvent, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Workout from './workout';
import RideTimeRow from './rideTimeRow';
import InstructorRow from './instructorRow';
import styles from './search.module.css';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import AuthButton from './auth';
import { usePlaylistContext } from './PlaylistContext';

type Song = {
	id: number;
	title: string;
	artist_names: string;
	workout_id: string;
	image_url: string;
	workout_details: {
		id: string;
		title: string;
		duration?: number;
		image_url?: string;
		instructor_id: string;
		description?: string;
		fitness_discipline?: string;
		scheduled_time?: string;
		difficulty_rating_avg?: number;
	};
};

type Playlist = {
	id: string;
	name: string;
};

const rideTimes = {
	300: '5 minutes',
	600: '10 minutes',
	900: '15 minutes',
	1200: '20 minutes',
	1800: '30 minutes',
	2700: '45 minutes',
	3600: '60 minutes',
	4500: '75 minutes',
	5400: '90 minutes',
	7200: '120 minutes',
};

export default function Search() {
	const { refreshPlaylists } = usePlaylistContext();
	const [songs, setSongs] = useState<Song[]>([]);
	const [songSearchTerm, setSongSearchTerm] = useState(''); // From the songs input
	const [artistSearchTerm, setArtistSearchTerm] = useState(''); // From the artists input
	const [selectedTimes, setSelectedTimes] = useState<number[]>([]); // From RideTimeRow
	const [selectedInstructors, setSelectedInstructors] = useState<string[]>(
		[]
	);
	const [activeInstructors, setActiveInstructors] = useState<string[]>([]);
	const [isInstructorsExpanded, setIsInstructorsExpanded] = useState(false);
	const [isTimesExpanded, setIsTimesExpanded] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const limit = 100;
	const [activeTimes, setActiveTimes] = useState<number[]>([]);
	const [minDifficulty, setMinDifficulty] = useState(0);
	const [maxDifficulty, setMaxDifficulty] = useState(10);
	const [selectedDifficultyRange, setSelectedDifficultyRange] = useState<
		[number, number]
	>([0, 10]);
	const [playlists, setPlaylists] = useState<Playlist[]>([]);

	const handleTimeSelection = (times: number[]) => {
		setSelectedTimes(times);
	};

	const handleInstructorSelection = (instructors: string[]) => {
		setSelectedInstructors(instructors);
	};

	const toggleInstructors = () => {
		setIsInstructorsExpanded(!isInstructorsExpanded);
		if (isTimesExpanded) {
			setIsTimesExpanded(false);
		}
	};

	const toggleTimes = () => {
		setIsTimesExpanded(!isTimesExpanded);
		if (isInstructorsExpanded) {
			setIsInstructorsExpanded(false);
		}
	};

	const fetchSongList = async () => {
		try {
			let query = supabase.from('songs').select(`
                id,
                title,
                artist_names,
                workout_id,
                image_url,
                workout_details: web_workouts!inner (
                    id,
                    title,
                    duration,
                    image_url,
                    instructor_id,
                    description,
                    fitness_discipline,
                    scheduled_time,
                    difficulty_rating_avg
                )
            `);

			// Note above, had to change the primary key in supabase console to so it knows it can join the tables. Here I am also renaming the column web_workouts to workout_details

			if (songSearchTerm) {
				query = query.ilike('title', `%${songSearchTerm}%`);
			}
			if (artistSearchTerm) {
				const terms = artistSearchTerm
					.toLowerCase()
					.split(' ')
					.filter(Boolean);
				terms.forEach((term) => {
					// Use word boundaries to match complete words only
					query = query.or(
						`artist_names.ilike.*% ${term} %*,artist_names.ilike.${term} %*,artist_names.ilike.*% ${term},artist_names.eq.${term}`
					);
				});
			}

			const { data, error } = await query.limit(limit);
			if (error) throw error;

			setHasSearched(true);
			const typedData = data as unknown as Song[];

			// Instructor calculations
			const uniqueInstructors = [
				...new Set(
					typedData.map((song) => song.workout_details.instructor_id)
				),
			];
			setActiveInstructors(uniqueInstructors.filter(Boolean));

			// Time calculations
			const uniqueTimes = [
				...new Set(
					typedData.map((song) => song.workout_details.duration)
				),
			].filter(Boolean) as number[];
			setActiveTimes(uniqueTimes);
			setSongs(typedData);

			// Difficulty range calculations
			const difficulties = typedData
				.map((song) => song.workout_details.difficulty_rating_avg)
				.filter((d): d is number => d !== undefined);
			const minDiff = Math.floor(Math.min(...difficulties));
			const maxDiff = Math.ceil(Math.max(...difficulties));
			setMinDifficulty(minDiff);
			setMaxDifficulty(maxDiff);
			setSelectedDifficultyRange([minDiff, maxDiff]);
		} catch (error) {
			console.error(error);
		}
	};

	// useEffect(() => {
	// }, [minDifficulty, maxDifficulty]);

	const handleAddToSearch = (e: ChangeEvent<HTMLInputElement>) => {
		const type = e.target.getAttribute('param-type');
		if (type === 'artist') {
			setArtistSearchTerm(e.target.value);
		} else {
			setSongSearchTerm(e.target.value);
		}
	};

	const shouldShowIfInstructorPresent = (song: Song) => {
		if (
			selectedInstructors.length > 0 &&
			song.workout_details?.instructor_id
		) {
			return selectedInstructors.includes(
				song.workout_details.instructor_id
			);
		}
		return true;
	};

	const shouldShowIfTimePresent = (song: Song) => {
		if (selectedTimes.length > 0 && song.workout_details?.duration) {
			return selectedTimes.includes(song.workout_details.duration);
		}
		return true;
	};

	const shouldShowIfDifficultyInRange = (song: Song) => {
		const difficulty = song.workout_details?.difficulty_rating_avg;
		if (!difficulty) return true;
		return (
			difficulty >= selectedDifficultyRange[0] &&
			difficulty <= selectedDifficultyRange[1]
		);
	};

	const shouldShowIfTimeAndInstructorPresent = (song: Song) => {
		return (
			shouldShowIfInstructorPresent(song) &&
			shouldShowIfTimePresent(song) &&
			shouldShowIfDifficultyInRange(song)
		);
	};

	const filteredSongs = songs.filter(
		(song) =>
			shouldShowIfInstructorPresent(song) &&
			shouldShowIfTimePresent(song) &&
			shouldShowIfDifficultyInRange(song)
	);

	const totalFoundMessage = useMemo(() => {
		if (filteredSongs.length === 0) {
			return '';
		}
		return `Showing ${filteredSongs.length} songs`;
	}, [filteredSongs.length]);

	// Add this useEffect to fetch playlists when component mounts
	useEffect(() => {
		const fetchPlaylists = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) return;

			const { data, error } = await supabase
				.from('user_lists')
				.select('*')
				.eq('user_id', session.user.id);

			if (error) {
				console.error('Error fetching playlists:', error);
				return;
			}
			setPlaylists(data);
		};

		fetchPlaylists();
	}, []);

	// Add function to handle adding workout to playlist
	const handleAddToPlaylist = async (
		playlistId: string,
		workoutId: string
	) => {
		// Check if workout already exists in playlist
		const { data: existingItems, error: checkError } = await supabase
			.from('list_items')
			.select('id')
			.match({ list_id: playlistId, workout_id: workoutId });

		if (checkError) {
			console.error('Error checking for existing workout:', checkError);
			return false;
		}

		if (existingItems && existingItems.length > 0) {
			// console.log('Workout already exists in playlist');
			return false;
		}

		const { error: insertError } = await supabase
			.from('list_items')
			.insert({
				list_id: playlistId,
				workout_id: workoutId,
			});

		if (insertError) {
			console.error('Error adding to playlist:', insertError);
			return false;
		}

		await refreshPlaylists();
		return true;
	};

	return (
		<div className={styles.searchContainer}>
			<AuthButton />
			<h1 className={styles.title}>Peloton Music Search</h1>
			<p className={styles.description}>
				Search for Peloton workouts by song or artist, filter by
				instructor, duration, and difficulty level, and save your
				favorite workouts to custom playlists.
			</p>
			<div className={styles.searchInputWrapper}>
				<input
					type="text"
					placeholder="SONG e.g. Not Like Us"
					param-type="song"
					onChange={handleAddToSearch}
					className={styles.searchInput}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							fetchSongList();
						}
					}}
				/>
				<input
					type="text"
					placeholder="ARTIST e.g. Kendrick Lamar"
					param-type="artist"
					onChange={handleAddToSearch}
					className={styles.searchInput}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							fetchSongList();
						}
					}}
				/>
				<button onClick={fetchSongList} className={styles.fetchButton}>
					Search
				</button>
			</div>
			<div className="">{totalFoundMessage}</div>
			{hasSearched && songs.length > 0 && (
				<>
					<div className={styles.filterButtonsContainer}>
						<button
							className={`${styles.toggleButton} ${
								isTimesExpanded ? styles.expanded : ''
							} ${selectedTimes.length > 0 ? styles.active : ''}`}
							onClick={toggleTimes}
						>
							Duration{' '}
							{selectedTimes.length > 0 &&
								`(${selectedTimes.length})`}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M6 9l6 6 6-6" />
							</svg>
						</button>

						<button
							className={`${styles.toggleButton} ${
								isInstructorsExpanded ? styles.expanded : ''
							} ${
								selectedInstructors.length > 0
									? styles.active
									: ''
							}`}
							onClick={toggleInstructors}
						>
							Instructors{' '}
							{selectedInstructors.length > 0 &&
								`(${selectedInstructors.length})`}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M6 9l6 6 6-6" />
							</svg>
						</button>
					</div>
					<div className={styles.difficultyContainer}>
						<div className={styles.difficultyLabels}>
							<span>
								Difficulty:{' '}
								{selectedDifficultyRange[0].toFixed(1)}
							</span>
							<span>{selectedDifficultyRange[1].toFixed(1)}</span>
						</div>
						<RangeSlider
							min={minDifficulty}
							max={maxDifficulty}
							value={selectedDifficultyRange}
							onInput={(value: [number, number]) => {
								setSelectedDifficultyRange(value);
							}}
							step={0.1}
						/>
					</div>
				</>
			)}

			<div
				className={`${styles.timeContainer} ${
					isTimesExpanded ? styles.expanded : ''
				}`}
			>
				<RideTimeRow
					rideTimes={rideTimes}
					selectedTimes={selectedTimes}
					onTimeSelect={handleTimeSelection}
					activeTimes={activeTimes}
				/>
			</div>

			<div
				className={`${styles.instructorContainer} ${
					isInstructorsExpanded ? styles.expanded : ''
				}`}
			>
				<InstructorRow
					key={selectedInstructors.join(',')}
					selectedInstructors={selectedInstructors}
					onInstructorsSelect={handleInstructorSelection}
					activeInstructors={activeInstructors}
				/>
			</div>

			<div className={styles.songList}>
				{songs.map(
					(song) =>
						shouldShowIfTimeAndInstructorPresent(song) && (
							<Workout
								key={song.id + song.workout_id}
								workout_details={song.workout_details}
								songData={{
									title: song.title,
									artist: song.artist_names,
									image_url: song.image_url,
								}}
								playlists={playlists}
								onAddToPlaylist={handleAddToPlaylist}
							/>
						)
				)}
			</div>
			{filteredSongs.length === 0 && hasSearched && (
				<div className={styles.noResults}>
					<p>No results found</p>
				</div>
			)}
		</div>
	);
}
