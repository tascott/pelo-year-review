import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './YearInReview.css';
import { processAPIWorkoutData } from './apiUtils';
import SlideNavigation from './SlideNavigation';
import { processCSVWorkoutData } from './csvUtils';
import { processCalendarData } from './calendarUtils';
import { fetchAllPelotonData } from '../../utils/fetchAndCacheAPIData';
import { fetchAndCacheCSVData } from '../../utils/fetchAndCacheCSVData';
import { processUserMusic } from './processUserMusic';
import slides from './slides';
import { findEarliestBikeDate } from './csvUtils';

// Create a separate component for the welcome animation
const messages = [
	'Analyzing your achievements...',
	'Fetching your workout history...',
	'Finding your favorite instructors...',
	'Discovering your music taste...',
	'Crunching the numbers...',
	'Almost there...',
];

const WelcomeAnimation = React.memo(() => {
	const [messageIndex, setMessageIndex] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setMessageIndex((prev) => {
				// Only increment if we haven't reached the last message
				if (prev < messages.length - 1) {
					return prev + 1;
				}
				// Clear the interval when we reach the last message
				clearInterval(timer);
				return prev;
			});
		}, 2000);
		return () => clearInterval(timer);
	}, []);

	return (
		<div className="welcome-animation">
			<AnimatePresence mode="wait">
				<motion.div
					key={messages[messageIndex]}
					className="loading-message"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.3 }}
				>
					<h2>{messages[messageIndex]}</h2>
					<div className="loading-spinner" />
					<div className="loading-progress">
						<div className="progress-bar" style={{ width: `${(messageIndex / (messages.length - 1)) * 100}%` }} />
					</div>
				</motion.div>
			</AnimatePresence>
		</div>
	);
});

const DEV_MODE = true; // Toggle for production

const YearInReview = () => {
	const navigate = useNavigate();
	const [currentSlide, setCurrentSlide] = useState(0);
	const [stats, setStats] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [sessionData, setSessionData] = useState(null);
	const currentYear = new Date().getFullYear();
	const [selectedYear, setSelectedYear] = useState(currentYear - 1); // Start with last year by default
	const [userData, setUserData] = useState(null);
	const [workouts, setWorkouts] = useState([]);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [welcomeStep, setWelcomeStep] = useState(0);
	const [hasStarted, setHasStarted] = useState(false);
	const [workoutCSVData, setWorkoutCSVData] = useState(null);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [isLoadingMusic, setIsLoadingMusic] = useState(false);
	const handleLogout = async () => {
		try {
			console.log('Logging out...');

			// Clear all local storage data
			Object.keys(localStorage).forEach((key) => {
				if (key.startsWith('pelo_')) {
					localStorage.removeItem(key);
				}
			});

			// Clear session data
			setSessionData(null);
			setUserData(null);
			setWorkouts([]);
			setWorkoutCSVData(null);
			setStats(null);

			// Clear cookies by setting them to expire
			document.cookie.split(';').forEach((cookie) => {
				const name = cookie.split('=')[0].trim();
				document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
			});

			// Try to call the logout endpoint
			try {
				await fetch('/auth/logout', {
					method: 'POST',
					credentials: 'include',
					headers: {
						Accept: 'application/json',
					},
				});
			} catch (e) {
				console.warn('Logout endpoint failed, but continuing with local cleanup:', e);
			}

			// Navigate back to home and force a page reload
			window.location.href = '/';
		} catch (err) {
			console.error('Logout failed:', err);
			// Still try to redirect even if something fails
			window.location.href = '/';
		}
	};

	// Generate year options (current year and last 3 years)

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
			// Process API workout data
			const apiStats = processAPIWorkoutData(workouts, selectedYear);
			if (!apiStats) {
				throw new Error('Failed to process API workout data');
			}

			// Process CSV workout data
			const csvStats = processCSVWorkoutData(workoutCSVData, selectedYear);
			if (!csvStats) {
				throw new Error('Failed to process CSV workout data');
			}

			// Get calendar data
			const calendarData = await fetchCalendarData(userData.id, selectedYear);

			// If we're in bike mode, we need to pass the earliest bike date
			let yearParam = selectedYear;
			if (selectedYear === 'bike') {
				const earliestBikeDate = findEarliestBikeDate(workouts);
				yearParam = { mode: 'bike', earliestBikeDate };
			}

			const calendarStats = processCalendarData(calendarData, yearParam);
			if (!calendarStats) {
				throw new Error('Failed to process calendar data');
			}

			// Combine stats with proper structure
			setStats({
				// API stats
				totalWorkouts: apiStats.totalWorkouts,
				workoutsPerWeek: apiStats.workoutsPerWeek,
				periodStartDate: csvStats.periodStartDate,
				periodEndDate: csvStats.periodEndDate,
				timeStats: apiStats.timeStats,
				workoutTypes: apiStats.workoutTypes,
				favoriteInstructor: apiStats.favoriteInstructor,
				workoutTimeProfile: apiStats.workoutTimeProfile,
				topInstructorsByDiscipline: apiStats.topInstructorsByDiscipline,
				favoriteWorkouts: apiStats.favoriteWorkouts,

				// CSV stats
				cyclingStats: csvStats.cyclingStats,
				heartRateData: csvStats.heartRateData,
				earliestBikeDate: csvStats.earliestBikeDate,
				totalCalories: csvStats.totalCalories,
				caloriesPerWorkout: csvStats.caloriesPerWorkout,

				// Calendar stats
				...calendarStats,

				// Other
				musicStats: null,
				timestamp: Date.now(),
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
		if (!isInitialLoading) {
			// Reset welcome step when loading is done
			setWelcomeStep(0);
		}
	}, [isInitialLoading]);

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
			if (!workout.start_time) {
				console.log('Workout missing start_time:', workout);
				return null;
			}
			// start_time is in milliseconds, so we need to multiply by 1000
			const date = new Date(workout.start_time * 1000);
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

	// Fetch all required data
	const fetchAllData = async () => {
		console.log('Fetching all data..6');
		try {
			// Fetch Peloton API data
			const apiData = await fetchAllPelotonData({
				forceFetch: false,
				debug: DEV_MODE,
				// Only use onProgress for intermediate updates
				onProgress: ({ workouts }) => {
					setWorkouts(workouts); // Update workouts as they come in
				},
			});

			// Set final API data state once
			setWorkouts(apiData.workouts);
			setUserData(apiData.userData);
			setSessionData({ user: apiData.userData });

			// Fetch CSV data
			const csvData = await fetchAndCacheCSVData({
				userId: apiData.userData.id,
				forceFetch: false,
				debug: DEV_MODE,
			});
			setWorkoutCSVData(csvData);

			console.log('Data fetching complete');
		} catch (error) {
			console.error('Error fetching data:', error);
			setError(error.message);
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

	const fetchCalendarData = async (userId, year) => {
		// For 'all', we need to fetch multiple years
		const currentYear = new Date().getFullYear();
		const startYear = currentYear - 5; // Get last 5 years of data
		try {
			console.log('Fetching calendar data for:', { userId, year });

			// For 'all', try to load from cache first
			if (year === 'all') {
				// Get all cached years
				const allMonths = [];
				Object.keys(localStorage).forEach((key) => {
					if (key.startsWith(`calendar_data_${userId}_`) && !key.includes('all')) {
						try {
							const yearData = JSON.parse(localStorage.getItem(key));
							if (Array.isArray(yearData)) {
								allMonths.push(...yearData);
							}
						} catch (e) {}
					}
				});

				if (allMonths.length > 0) {
					return allMonths;
				}
			} else {
				// For specific year, check cache
				const cachedData = localStorage.getItem(`calendar_data_${userId}_${year}`);
				if (cachedData) {
					const parsed = JSON.parse(cachedData);
					return parsed;
				}
			}

			// For 'all', fetch multiple years
			const yearsToFetch = year === 'all' ? Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i) : [year];

			// Fetch calendar data for each year
			const responses = await Promise.all(
				yearsToFetch.map((y) => {
					return fetch(`/api/user/${userId}/calendar?year=${y}`, {
						credentials: 'include',
						headers: {
							Accept: 'application/json',
							'Peloton-Platform': 'web',
						},
					});
				})
			);

			// Check if any responses failed
			if (responses.some((response) => !response.ok)) {
				throw new Error('Failed to fetch calendar data');
			}

			// Process all responses
			const allData = await Promise.all(responses.map((r) => r.json()));

			// Combine all months data
			const monthsData = allData.reduce((acc, data) => {
				if (data.months && Array.isArray(data.months)) {
					acc.push(...data.months);
				}
				return acc;
			}, []);

			// For 'all', combine with existing cached data
			if (year === 'all') {
				const allMonths = [...monthsData];
				Object.keys(localStorage).forEach((key) => {
					if (key.startsWith(`calendar_data_${userId}_`) && !key.includes('all')) {
						try {
							const yearData = JSON.parse(localStorage.getItem(key));
							if (Array.isArray(yearData)) {
								allMonths.push(...yearData);
							}
						} catch (e) {}
					}
				});

				// Cache the combined data
				localStorage.setItem(`calendar_data_${userId}_${year}`, JSON.stringify(allMonths));
				return allMonths;
			} else {
				// Cache the year data
				localStorage.setItem(`calendar_data_${userId}_${year}`, JSON.stringify(monthsData));
				return monthsData;
			}
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
					<>
						<AnimatePresence mode="wait">
							{CurrentSlideComponent && (
								<CurrentSlideComponent
									key={currentSlide}
									stats={stats}
									slideIndex={currentSlide}
									isLoadingMusic={isLoadingMusic}
								/>
							)}
						</AnimatePresence>
						<SlideNavigation
							onNext={handleNext}
							onPrevious={handlePrevious}
							onStartAgain={handleStartAgain}
							currentSlide={currentSlide}
							totalSlides={slides.length}
						/>
					</>
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
