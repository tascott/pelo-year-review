import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './YearInReview.css';

import { processWorkoutData, findEarliestBikeDate } from './yearInReviewUtils';
import { processUserMusic } from './processUserMusic';
import slides from './slides/slides';

const DEV_MODE = true; // Toggle this manually for production

// Storage management functions
const manageLocalStorage = () => {
	try {
		// Clear old caches
		Object.keys(localStorage).forEach(key => {
			if (key.startsWith('pelotonCache') || key.startsWith('yearReviewCache') || key.startsWith('songCache')) {
				localStorage.removeItem(key);
			}
		});
		return true;
	} catch (e) {
		console.warn('Storage management failed:', e);
		return false;
	}
};

// Add this before the slides definition
const MusicLoadingState = () => (
	<motion.div className="music-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
		<h2>Loading your music stats...</h2>
		<div className="loading-spinner" />
	</motion.div>
);

/**
 * @typedef {Object} CachedYearData
 * @property {number} timestamp
 * @property {Object} stats
 * @property {Object} stats.workoutStats
 * @property {Object} stats.musicStats
 */

const YearInReview = ({ csvData }) => {
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			console.log('Logging out...');
			const response = await fetch('/auth/logout', {
				method: 'POST',
				credentials: 'include',
				headers: {
					Accept: 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error('Logout failed');
			}

			// Clear local storage
			localStorage.removeItem('pelotonCSVData');

			// Navigate back to home
			navigate('/');
		} catch (err) {
			console.error('Logout failed:', err);
		}
	};
	const [currentSlide, setCurrentSlide] = useState(0);
	const [stats, setStats] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [error, setError] = useState(null);
	const [sessionData, setSessionData] = useState(null);
	const currentYear = new Date().getFullYear();
	const [selectedYear, setSelectedYear] = useState(currentYear - 1); // Start with last year by default
	const [userData, setUserData] = useState(null);
	const [workouts, setWorkouts] = useState([]);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [welcomeStep, setWelcomeStep] = useState(0);
	const [hasStarted, setHasStarted] = useState(false);
	const [workoutCSVData, setWorkoutCSVData] = useState(csvData);
	const [isStarting, setIsStarting] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [isLoadingMusic, setIsLoadingMusic] = useState(false);

	// Generate year options (current year and last 3 years)
	const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i); // Show current year and last 3 years

	// Separate the music loading from the start sequence
	const loadMusicInBackground = async () => {
		if (!workouts || !workoutCSVData) {
			console.log('Music data will load when workout data is available');
			return;
		}

		setIsLoadingMusic(true);
		try {
			const bikeStartDate = findEarliestBikeDate(workoutCSVData);
			const musicData = await processUserMusic(workouts, selectedYear, bikeStartDate);
			if (musicData) {
				setStats((prev) => ({
					...prev,
					musicStats: musicData,
				}));
			}
		} catch (err) {
			console.error('Error loading music data:', err);
		} finally {
			setIsLoadingMusic(false);
		}
	};

	// Update the start sequence
	const startYearInReview = async () => {
		setIsLoading(true);
		try {
			const workoutStats = processWorkoutData(workouts, workoutCSVData, selectedYear);
			if (!workoutStats) {
				throw new Error('Failed to process workout data');
			}

			// Get calendar data
			const calendarData = await fetchCalendarData(userData.id, selectedYear);

			setStats({
				...workoutStats,
				calendarData,
				musicStats: null,
			});

			setHasStarted(true);
			setCurrentSlide(0);
			loadMusicInBackground();
		} catch (err) {
			console.error('Error starting year in review:', err);
			setError('Failed to process workout data');
		} finally {
			setIsLoading(false);
		}
	};

	// Welcome animation sequence
	useEffect(() => {
		if (isInitialLoading) {
			const timer = setInterval(() => {
				setWelcomeStep((prev) => (prev < 3 ? prev + 1 : prev));
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [isInitialLoading]);

	// Create a separate component for the welcome animation
	const WelcomeAnimation = () => {
		const [loadingStep, setLoadingStep] = useState(0);
		const loadingSteps = [
			'Analyzing your achievements...',
			'Fetching your workout history...',
			'Finding your favorite instructors...',
			'Discovering your music taste...',
			'Crunching the numbers...',
			'Almost there...',
		];

		// Update step every 2 seconds
		useEffect(() => {
			if (loadingStep < loadingSteps.length - 1) {
				const timer = setTimeout(() => {
					setLoadingStep((prev) => prev + 1);
				}, 2000);
				return () => clearTimeout(timer);
			}
		}, [loadingStep]);

		return (
			<motion.div className="welcome-animation">
				<motion.div
					className="loading-message"
					key={loadingStep}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
				>
					<h2>{loadingSteps[loadingStep]}</h2>
					<div className="loading-spinner" />
					<div className="loading-progress">
						<div className="progress-bar" style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }} />
					</div>
				</motion.div>
			</motion.div>
		);
	};

	const CurrentSlideComponent = slides[currentSlide]?.component;

	const handleNext = () => {
		if (currentSlide < slides.length - 1) {
			setCurrentSlide(currentSlide + 1);
		}
	};

	const handlePrevious = () => {
		if (currentSlide > 0) {
			setCurrentSlide(currentSlide - 1);
		}
	};

	// Update getWorkoutDate function
	const getWorkoutDate = (workout) => {
		try {
			// Use only created_at as it's the reliable field
			if (!workout.created_at) {
				console.log('Workout missing created_at:', workout);
				return null;
			}
			// created_at is in milliseconds, so we need to multiply by 1000
			const date = new Date(workout.created_at * 1000);
			return isNaN(date.getTime()) ? null : date;
		} catch (err) {
			console.error('Error parsing date:', err);
			return null;
		}
	};

	// Update renderYearSelector function
	const renderYearSelector = () => {
		const currentYear = new Date().getFullYear();
		const earliestBikeDate = findEarliestBikeDate(workoutCSVData);
		const earliestYear = Math.min(
			...workouts.map((workout) => {
				const date = getWorkoutDate(workout);
				return date ? date.getFullYear() : currentYear;
			})
		);

		const years = [];
		for (let year = currentYear; year >= earliestYear; year--) {
			years.push(year);
		}

		return (
			<div className="year-selector">
				<button className={`pill-button ${selectedYear === 'all' ? 'active' : ''}`} onClick={() => setSelectedYear('all')}>
					All Time
				</button>
				<button className={`pill-button ${selectedYear === 'bike' ? 'active' : ''}`} onClick={() => setSelectedYear('bike')}>
					Peloton Bike Onwards
					<div className="tooltip">Started {earliestBikeDate.toLocaleDateString()}</div>
				</button>
				{years.map((year) => (
					<button key={year} className={`pill-button ${selectedYear === year ? 'active' : ''}`} onClick={() => setSelectedYear(year)}>
						{year}
					</button>
				))}
			</div>
		);
	};

	// Update the filteredWorkouts memo
	const filteredWorkouts = useMemo(() => {
		if (selectedYear === 'all') return workouts;
		if (selectedYear === 'bike') {
			const earliestBikeYear = findEarliestBikeDate(workoutCSVData);
			return workouts.filter((workout) => {
				const date = getWorkoutDate(workout);
				return date ? date.getFullYear() >= earliestBikeYear : false;
			});
		}
		return workouts.filter((workout) => {
			const date = getWorkoutDate(workout);
			return date ? date.getFullYear() === selectedYear : false;
		});
	}, [workouts, selectedYear, workoutCSVData]);

	// Add function to fetch CSV data
	const fetchCSVData = async (userId) => {
		try {
			console.log('YearInReview fetching CSV data for user:', userId);
			const response = await fetch(`/api/user/${userId}/workout_history_csv?timezone=Europe%2FLondon`, {
				credentials: 'include',
				headers: {
					Accept: 'text/csv',
					'Peloton-Platform': 'web',
				},
			});

			if (!response.ok) {
				throw new Error('Failed to fetch CSV data');
			}

			const data = await response.text();
			console.log('YearInReview got CSV data:', {
				length: data.length,
				preview: data.slice(0, 100),
			});
			setWorkoutCSVData(data);
		} catch (err) {
			console.error('Error fetching CSV:', err);
			setError('Failed to load workout data');
		}
	};

	// Fetch CSV data if we don't have it
	useEffect(() => {
		if (!workoutCSVData && sessionData?.user?.id) {
			console.log('No CSV data, fetching...');
			fetchCSVData(sessionData.user.id);
		}
	}, [workoutCSVData, sessionData]);

	// Update workoutCSVData when prop changes
	useEffect(() => {
		console.log('CSV prop changed:', {
			isPresent: csvData !== null,
			length: csvData?.length,
		});
		if (csvData) {
			setWorkoutCSVData(csvData);
		}
	}, [csvData]);

	// Add back fetchAllData function
	const fetchAllData = async () => {
		if (DEV_MODE) {
			const cachedData = localStorage.getItem('pelotonCachedData');
			if (cachedData) {
				try {
					const parsed = JSON.parse(cachedData);
					const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

					// Only use cache if it's less than a day old
					if (parsed.timestamp && parsed.timestamp > oneDayAgo) {
						setWorkouts(parsed.workouts);
						setUserData(parsed.userData);
						setSessionData({ user: parsed.userData });
						setIsInitialLoading(false);
						return;
					}
				} catch (e) {
					console.warn('Failed to parse cached data:', e);
				}
			}

			// Clear expired cache
			manageLocalStorage();
		}

		try {
			// Fetch user data
			const userResponse = await fetch('/api/me', {
				credentials: 'include',
				headers: {
					Accept: 'application/json',
					Origin: 'https://members.onepeloton.com',
					Referer: 'https://members.onepeloton.com/',
					'Peloton-Platform': 'web',
				},
			});

			if (!userResponse.ok) throw new Error('Failed to fetch user data');
			const userData = await userResponse.json();
			setUserData(userData);
			setSessionData({ user: userData });

			// Fetch all workout data with pagination
			const limit = 100;
			let allWorkouts = [];
			let page = 0;
			let hasMore = true;
			const seenPages = new Set();

			while (hasMore) {
				if (seenPages.has(page)) {
					page++;
					continue;
				}
				seenPages.add(page);

				const workoutsResponse = await fetch(`/api/user/${userData.id}/workouts?limit=${limit}&page=${page}&joins=peloton.ride`, {
					credentials: 'include',
					headers: {
						Accept: 'application/json',
						Origin: 'https://members.onepeloton.com',
						Referer: 'https://members.onepeloton.com/',
						'Peloton-Platform': 'web',
					},
				});

				if (!workoutsResponse.ok) throw new Error('Failed to fetch workouts');
				const responseText = await workoutsResponse.text();
				console.log('Raw API Response:', {
					status: workoutsResponse.status,
					responseText: responseText.slice(0, 1000), // First 1000 chars
				});
				const data = JSON.parse(responseText);
				const workouts = data.data || [];

				allWorkouts = [...allWorkouts, ...workouts];
				hasMore = workouts.length === limit;
				page++;
			}

			setWorkouts(allWorkouts);

			if (DEV_MODE) {
				localStorage.setItem(
					'pelotonCachedData',
					JSON.stringify({
						workouts: allWorkouts,
						userData: userData,
					})
				);
			}
		} catch (err) {
			console.error('Error fetching data:', err);
			setError(err.message);
		} finally {
			setIsInitialLoading(false);
		}
	};

	useEffect(() => {
		fetchAllData();
	}, []); // Run once when component mounts

	const handleStartAgain = () => {
		setHasStarted(false);
		setCurrentSlide(0);
	};

	const processData = async (workouts, csvData, selectedYear) => {
		console.log('Starting processData with workouts:', {
			workoutCount: workouts?.length,
			sampleWorkout: workouts?.[0],
			selectedYear,
		});

		try {
			// Check cache first with specific year
			const cacheKey = `yearReviewCache_${selectedYear}`;
			const cachedData = localStorage.getItem(cacheKey);

			if (cachedData) {
				try {
					const parsed = JSON.parse(cachedData);
					const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

					if (parsed.timestamp > oneDayAgo) {
						console.log('Using cached year review data from:', new Date(parsed.timestamp), 'for year:', selectedYear);
						return parsed.stats;
					}
				} catch (e) {
					console.warn('Failed to parse cached data:', e);
				}
			}

			// If no cache or expired, process everything
			const bikeStartDate = findEarliestBikeDate(csvData);
			const workoutStats = processWorkoutData(workouts, csvData, selectedYear);

			let stats = null;
			if (workoutStats) {
				const musicStats = await processUserMusic(workouts, selectedYear, bikeStartDate);
				stats = {
					...workoutStats,
					musicStats,
				};

				// Only cache the most recent year to save space
				if (selectedYear === new Date().getFullYear().toString()) {
					const cacheData = {
						timestamp: Date.now(),
						stats: {
							...stats,
							// Only keep essential music stats
							musicStats: stats.musicStats ? {
								topArtists: stats.musicStats.topArtists?.slice(0, 5),
								topSongs: stats.musicStats.topSongs?.slice(0, 5)
							} : null
						},
						year: selectedYear,
					};

					try {
						// Clear any old caches first
						Object.keys(localStorage).forEach(key => {
							if (key.startsWith('yearReviewCache_')) {
								localStorage.removeItem(key);
							}
						});

						localStorage.setItem(cacheKey, JSON.stringify(cacheData));
						console.log('Successfully cached current year review data');
					} catch (e) {
						console.warn('Failed to cache year review data:', e);
					}
				}
			}

			return stats;
		} catch (err) {
			console.error('Error processing data:', err);
			return null;
		}
	};

	// Add this function to handle the start sequence
	const handleStart = () => {
		setIsTransitioning(true);

		// Start the review and end transition after animation completes
		setTimeout(() => {
			startYearInReview();
			setIsTransitioning(false);
		}, 3500); // Wait for full animation (2.5s bike + 0.5s delay + buffer)
	};

	// Add this component for the transition animation
	const TransitionScreen = () => (
		<motion.div
			className="transition-screen"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
		>
			<motion.div
				className="transition-bicycle"
				initial={{ x: '-100vw', rotateY: 180 }}
				animate={{ x: '100vw' }}
				transition={{
					duration: 2.5, // Slower bike animation
					ease: 'easeInOut',
					delay: 0.5,
				}}
			>
				🚴‍♂️
			</motion.div>
		</motion.div>
	);

	// Add this near your other data fetching functions
	const fetchCalendarData = async (userId, year) => {
		try {
			const response = await fetch(`/api/user/${userId}/calendar`, {
				credentials: 'include',
				headers: {
					Accept: 'application/json',
					'Peloton-Platform': 'web',
				},
			});

			if (!response.ok) {
				throw new Error('Failed to fetch calendar data');
			}

			const responseData = await response.json();
			console.log('Calendar API Response:', {
				status: response.status,
				data: responseData,
			});

			// Filter for selected year from the months array
			const yearData = responseData.months.filter((entry) => {
				return entry.year === year;
			});

			console.log('Filtered calendar data:', {
				year,
				totalEntries: responseData.months.length,
				yearEntries: yearData.length,
				sampleEntries: yearData.slice(0, 3),
			});

			return yearData;
		} catch (err) {
			console.error('Error fetching calendar data:', err);
			throw err;
		}
	};

	return (
		<div className="year-in-review">
			<AnimatePresence mode="wait">
				{isTransitioning ? (
					<TransitionScreen key="transition" />
				) : isInitialLoading ? (
					<WelcomeAnimation key="welcome" />
				) : hasStarted ? (
					<AnimatePresence mode="wait">
						{CurrentSlideComponent && (
							<CurrentSlideComponent
								key={currentSlide}
								stats={stats}
								onNext={handleNext}
								onPrevious={handlePrevious}
								handleStartAgain={handleStartAgain}
								slideIndex={currentSlide}
								isLoadingMusic={isLoadingMusic}
							/>
						)}
					</AnimatePresence>
				) : (
					<div className="start-screen">
						<motion.button 
							whileHover={{ scale: 1.05 }} 
							whileTap={{ scale: 0.95 }} 
							onClick={handleLogout} 
							className="logout-button"
							style={{ position: 'absolute', top: '20px', right: '20px' }}
						>
							Log Out
						</motion.button>
						{error ? (
							<div className="error-message">{error}</div>
						) : (
							<>
								{userData && (
									<motion.div
										className="user-profile"
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ duration: 0.5 }}
									>
										<motion.img
											src={userData.image_url}
											alt={userData.username}
											className="user-avatar"
											initial={{ y: -50, opacity: 0 }}
											animate={{ y: 0, opacity: 1 }}
											transition={{ delay: 0.3, duration: 0.5 }}
										/>
										<motion.h2
											initial={{ y: 50, opacity: 0 }}
											animate={{ y: 0, opacity: 1 }}
											transition={{ delay: 0.5, duration: 0.5 }}
										>
											Welcome, {userData.username}!
										</motion.h2>
									</motion.div>
								)}

								<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
									<h1>Your Year in Review</h1>
									{renderYearSelector()}

									<div className="start-button-container">
										<motion.button
											className="start-button"
											onClick={handleStart}
											disabled={isLoading}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											{isLoading ? (
												<>
													<div className="loading-spinner" />
													Loading...
												</>
											) : (
												'Start'
											)}
										</motion.button>
									</div>
								</motion.div>
							</>
						)}
					</div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default YearInReview;
