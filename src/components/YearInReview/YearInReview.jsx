import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './YearInReview.css';

import { processWorkoutData } from './yearInReviewUtils';

const DEV_MODE = true; // Toggle this manually for production

const slides = [
	{
		id: 'intro',
		component: ({ onNext, handleStartAgain }) => (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide intro-slide">
				<h1>Your Pelo Wrapped</h1>
				<p>Let's look back at your amazing year of fitness</p>
				<div className="slide-buttons">
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNext} className="next-button">
						Let's Go!
					</motion.button>
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartAgain} className="start-again-button">
						Start Again
					</motion.button>
				</div>
			</motion.div>
		),
	},
	{
		id: 'total-workouts',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => (
			<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="slide stats-slide">
				<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="stat-circle">
					<h1>{stats?.totalWorkouts || 0}</h1>
					<p>Total Workouts</p>
				</motion.div>
				<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
					That's {stats?.workoutsPerWeek || 0} workouts per week!
				</motion.p>
				<div className="slide-buttons">
					{slideIndex > 0 && (
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onPrevious} className="back-button">
							Back
						</motion.button>
					)}
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNext} className="next-button">
						Next
					</motion.button>
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartAgain} className="start-again-button">
						Start Again
					</motion.button>
				</div>
			</motion.div>
		),
	},
	{
		id: 'favorite-instructor',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide instructor-slide">
				<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
					<h2>Your Favorite Instructor</h2>
					<h1>{stats?.favoriteInstructor?.name || 'Loading...'}</h1>
					<div className="instructor-stats">
						<div className="stat-item">
							<h3>{stats?.favoriteInstructor?.workouts || 0}</h3>
							<p>Workouts Together</p>
						</div>
						<div className="stat-item">
							<h3>{Math.round((stats?.favoriteInstructor?.totalMinutes || 0) / 60)}</h3>
							<p>Hours Together</p>
						</div>
					</div>
					<p className="instructor-details">Most Common Class Type: {stats?.favoriteInstructor?.topClassType || 'N/A'}</p>
				</motion.div>
				<div className="slide-buttons">
					{slideIndex > 0 && (
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onPrevious} className="back-button">
							Back
						</motion.button>
					)}
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNext} className="next-button">
						Next
					</motion.button>
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartAgain} className="start-again-button">
						Start Again
					</motion.button>
				</div>
			</motion.div>
		),
	},
	{
		id: 'workout-types',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide types-slide">
				<h2>Your Favorite Workout Types</h2>
				<div className="type-bars">
					{stats?.workoutTypes?.map((type, index) => (
						<motion.div
							key={type.name}
							className="type-bar"
							initial={{ width: 0 }}
							animate={{ width: `${type.percentage}%` }}
							transition={{ delay: index * 0.2 }}
						>
							<span className="type-name">{type.name}</span>
							<span className="type-count">{type.count}</span>
						</motion.div>
					))}
				</div>
				<div className="slide-buttons">
					{slideIndex > 0 && (
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onPrevious} className="back-button">
							Back
						</motion.button>
					)}
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNext} className="next-button">
						Next
					</motion.button>
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartAgain} className="start-again-button">
						Start Again
					</motion.button>
				</div>
			</motion.div>
		),
	},
	{
		id: 'time',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => {
			const [showGif, setShowGif] = useState(false);
			const [showComparisons, setShowComparisons] = useState(false);

			useEffect(() => {
				// Show gif after 3 seconds (reduced from 5)
				const gifTimer = setTimeout(() => setShowGif(true), 3000);
				// Show comparisons after 6 seconds (reduced from 8)
				const comparisonTimer = setTimeout(() => setShowComparisons(true), 6000);

				return () => {
					clearTimeout(gifTimer);
					clearTimeout(comparisonTimer);
				};
			}, []);

			return (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide time-slide">
					<div className="time-content-wrapper">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: 'spring' }}
							className="time-display"
						>
							<h2>{stats?.timeStats?.displayText}</h2>
							<p>of Exercise</p>
						</motion.div>

						{showGif && (
							<motion.div
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5 }}
								className="celebration-gif"
							>
								<img
									src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZngzaG9peTdxdXAzY3UzbGNubWpldnVpZDNpOTR3ZWE3MHA1cWY5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5wWf7H89PisM6An8UAU/giphy.gif"
									alt="Celebration"
								/>
							</motion.div>
						)}

						{showComparisons && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.8 }}
								className="time-comparison"
							>
								<p>In that time, you could have watched:</p>
								<div className="show-comparisons">
									<motion.div
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 1.0 }}
										className="show-item"
									>
										<span className="show-count">
											{Math.floor((stats?.timeStats?.hours * 60 + stats?.timeStats?.minutes) / 20.5)}
										</span>
										<span className="show-name">Episodes of The Office</span>
									</motion.div>

									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 1.1 }}
										className="comparison-divider"
									>
										<span>or</span>
									</motion.div>

									<motion.div
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 1.2 }}
										className="show-item"
									>
										<span className="show-count">
											{Math.floor((stats?.timeStats?.hours * 60 + stats?.timeStats?.minutes) / 81)}
										</span>
										<span className="show-name">films back to back</span>
									</motion.div>
								</div>
							</motion.div>
						)}

						{stats?.timeStats?.workingDays && showComparisons && (
							<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="working-days-note">
								That's {stats.timeStats.workingDays} working days!
							</motion.p>
						)}
					</div>

					<div className="slide-buttons">
						{slideIndex > 0 && (
							<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onPrevious} className="back-button">
								Back
							</motion.button>
						)}
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNext} className="next-button">
							Next
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleStartAgain}
							className="start-again-button"
						>
							Start Again
						</motion.button>
					</div>
				</motion.div>
			);
		},
	},
	{
		id: 'calories',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => {
			const [showNumbers, setShowNumbers] = useState(false);

			useEffect(() => {
				// Delay showing the numbers
				const timer = setTimeout(() => setShowNumbers(true), 1500);
				return () => clearTimeout(timer);
			}, []);

			const calorieEquivalents = {
				prosecco: Math.round(stats?.totalCalories / 80), // glasses
				beer: Math.round(stats?.totalCalories / 208), // pints
				jaffaCakes: Math.round(stats?.totalCalories / 41), // cakes
			};

			return (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide stats-slide">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: 'spring' }}
						className="stat-box calories-stat"
					>
						<div className="stat-content">
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: showNumbers ? 1 : 0 }} transition={{ duration: 0.8 }}>
								<h2>You burned</h2>
								<motion.div className="stat-number">{(stats?.totalCalories || 0).toLocaleString()}</motion.div>
								<h2>calories</h2>
							</motion.div>
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="calorie-equivalents">
								<p>That's equivalent to:</p>
								{showNumbers && (
									<>
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 1, delay: 0.5 }}
											className="equivalent-item"
										>
											<span className="equivalent-number">{calorieEquivalents.prosecco}</span>
											<span className="equivalent-label">glasses of prosecco</span>
										</motion.div>
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 1, delay: 1.5 }}
											className="equivalent-item"
										>
											<span className="equivalent-number">{calorieEquivalents.beer}</span>
											<span className="equivalent-label">pints of beer</span>
										</motion.div>
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 1, delay: 2.5 }}
											className="equivalent-item"
										>
											<span className="equivalent-number">{calorieEquivalents.jaffaCakes}</span>
											<span className="equivalent-label">Jaffa Cakes</span>
										</motion.div>
									</>
								)}
							</motion.div>
							<motion.img
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 4 }}
								src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExM25jdHMxM2swZzB0eGNvYnkxdnZkNG94ejJvdjd6NWFld2hscTg5YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZfF7a6BmccZKq4rDap/giphy.gif"
								alt="Calories burned celebration"
								className="calories-gif"
							/>
						</div>
					</motion.div>
					<div className="slide-buttons">
						{slideIndex > 0 && (
							<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onPrevious} className="back-button">
								Back
							</motion.button>
						)}
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNext} className="next-button">
							Next
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleStartAgain}
							className="start-again-button"
						>
							Start Again
						</motion.button>
					</div>
				</motion.div>
			);
		},
	},
	{
		id: 'distance',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => {
			const [showNumbers, setShowNumbers] = useState(false);

			useEffect(() => {
				const timer = setTimeout(() => setShowNumbers(true), 1500);
				return () => clearTimeout(timer);
			}, []);

			const distanceEquivalents = {
				londonToParis: Math.round(stats?.totalDistance / 213), // London to Paris is ~213 miles
				laps: Math.round(stats?.totalDistance * 4), // 1 mile = ~4 laps of a track
				marathons: Math.round(stats?.totalDistance / 26.2), // Marathon is 26.2 miles
			};

			return (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide stats-slide">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: 'spring' }}
						className="stat-box distance-stat"
					>
						<div className="stat-content">
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: showNumbers ? 1 : 0 }} transition={{ duration: 0.8 }}>
								<h2>You covered</h2>
								<motion.div className="stat-number">{(stats?.totalDistance || 0).toLocaleString()}</motion.div>
								<h2>miles</h2>
							</motion.div>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 2.5 }}
								className="distance-equivalents"
							>
								<p>That's equivalent to:</p>
								{showNumbers && (
									<>
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 1, delay: 0.5 }}
											className="equivalent-item"
										>
											<span className="equivalent-number">{distanceEquivalents.londonToParis}</span>
											<span className="equivalent-label">trips from London to Paris</span>
										</motion.div>
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 1, delay: 1.5 }}
											className="equivalent-item"
										>
											<span className="equivalent-number">{distanceEquivalents.laps}</span>
											<span className="equivalent-label">laps of a running track</span>
										</motion.div>
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 1, delay: 2.5 }}
											className="equivalent-item"
										>
											<span className="equivalent-number">{distanceEquivalents.marathons}</span>
											<span className="equivalent-label">marathons</span>
										</motion.div>
									</>
								)}
							</motion.div>
							{/* <motion.img
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 4 }}
								src="https://media.giphy.com/media/26BRKRABuRCtFVre8/giphy.gif"
								alt="Distance celebration"
								className="distance-gif"
							/> */}
						</div>
					</motion.div>
					<div className="slide-buttons">
						{slideIndex > 0 && (
							<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onPrevious} className="back-button">
								Back
							</motion.button>
						)}
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNext} className="next-button">
							Next
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleStartAgain}
							className="start-again-button"
						>
							Start Again
						</motion.button>
					</div>
				</motion.div>
			);
		},
	},
	{
		id: 'achievements',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide achievements-slide">
				<h2>Your Achievements</h2>
				<div className="achievements-overview">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: 'spring' }}
						className="achievement-box total"
					>
						<h2>{stats?.achievements || 0}</h2>
						<p>Total Achievements</p>
					</motion.div>
				</div>

				<div className="achievements-categories">
					{stats?.achievementCategories
						?.filter((cat) => cat.earnedCount > 0)
						?.slice(0, 6)
						?.map((category, index) => (
							<motion.div
								key={category.slug}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.2 + index * 0.1 }}
								className="category-item"
							>
								<span className="category-name">{category.name}</span>
								<span className="category-count">{category.earnedCount}</span>
							</motion.div>
						))}
				</div>

				<div className="achievements-footer">
					<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }} className="achievement-box">
						<h2>{stats?.personalRecords || 0}</h2>
						<p>Personal Records</p>
					</motion.div>
				</div>

				<div className="slide-buttons">
					{slideIndex > 0 && (
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onPrevious} className="back-button">
							Back
						</motion.button>
					)}
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onNext} className="next-button">
						Next
					</motion.button>
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartAgain} className="start-again-button">
						Start Again
					</motion.button>
				</div>
			</motion.div>
		),
	},
	{
		id: 'final',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide final-slide">
				<h1>What a Year!</h1>
				<p>Keep up the amazing work in {new Date().getFullYear()}!</p>
				<div className="final-stats">
					<motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
						{stats?.totalWorkouts} workouts
					</motion.p>
					<motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
						{stats?.timeStats?.displayText} of exercise
					</motion.p>
					<motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
						{stats?.personalRecords} personal records
					</motion.p>
				</div>
				<div className="slide-buttons">
					{slideIndex > 0 && (
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onPrevious} className="back-button">
							Back
						</motion.button>
					)}
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartAgain} className="start-again-button">
						Start Again
					</motion.button>
				</div>
			</motion.div>
		),
	},
];

const YearInReview = ({ csvData }) => {
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

	// Generate year options (current year and last 3 years)
	const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i); // Show current year and last 3 years

	const startYearInReview = async () => {
		if (!sessionData?.user?.id) {
			console.log('No session data:', { sessionData });
			setError('No session data available');
			return;
		}
		if (!workoutCSVData) {
			console.log('Missing CSV data:', {
				csvData,
				workoutCSVData,
				sessionData: !!sessionData,
			});
			setError('Still loading workout data...');
			return;
		}
		setIsLoading(true);
		setError(null);

		try {
			console.log('Processing with data:', {
				workouts: workouts.length,
				csvData: workoutCSVData.slice(0, 100), // Show first 100 chars
				selectedYear,
			});
			const processedStats = processWorkoutData(workouts, workoutCSVData, selectedYear);
			if (!processedStats) {
				throw new Error(`No workout data found for ${selectedYear}`);
			}
			setStats(processedStats);
			setCurrentSlide(1);
			setHasStarted(true);
		} catch (err) {
			console.error('Error processing year in review:', err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Modify the fetchAllData function to get both data sources
	const fetchAllData = async () => {
		if (DEV_MODE) {
			const cachedData = localStorage.getItem('pelotonCachedData');
			if (cachedData) {
				const { workouts: cachedWorkouts, userData: cachedUserData } = JSON.parse(cachedData);
				setWorkouts(cachedWorkouts);
				setUserData(cachedUserData);
				setSessionData({ user: cachedUserData });
				setIsInitialLoading(false);
				return;
			}
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

				const workoutsResponse = await fetch(`/api/user/${userData.id}/workouts?limit=${limit}&page=${page}`, {
					credentials: 'include',
					headers: {
						Accept: 'application/json',
						Origin: 'https://members.onepeloton.com',
						Referer: 'https://members.onepeloton.com/',
						'Peloton-Platform': 'web',
					},
				});

				if (!workoutsResponse.ok) throw new Error('Failed to fetch workouts');
				const data = await workoutsResponse.json();
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

	// Welcome animation sequence
	useEffect(() => {
		if (isInitialLoading) {
			const timer = setInterval(() => {
				setWelcomeStep((prev) => (prev < 3 ? prev + 1 : prev));
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [isInitialLoading]);

	const renderWelcomeAnimation = () => (
		<motion.div className="welcome-animation">
			<AnimatePresence mode="wait">
				{welcomeStep === 0 && (
					<motion.div key="welcome1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="welcome-text">
						Welcome to Pelo Wrapped
					</motion.div>
				)}
				{welcomeStep === 1 && (
					<motion.div key="welcome2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="welcome-text">
						Loading your fitness journey...
					</motion.div>
				)}
				{welcomeStep === 2 && (
					<motion.div key="welcome3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="welcome-text">
						Analyzing your achievements...
					</motion.div>
				)}
			</AnimatePresence>
			<motion.div className="loading-spinner" />
		</motion.div>
	);

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

	// Update findEarliestBikeDate function
	const findEarliestBikeDate = () => {
		const bikeWorkouts = workouts.filter((workout) => workout.total_output > 0);
		if (bikeWorkouts.length === 0) return new Date().getFullYear();

		const validDates = bikeWorkouts.map(getWorkoutDate).filter((date) => date !== null);

		if (validDates.length === 0) return new Date().getFullYear();

		const earliestDate = new Date(Math.min(...validDates));
		return earliestDate.getFullYear();
	};

	// Update renderYearSelector function
	const renderYearSelector = () => {
		const currentYear = new Date().getFullYear();
		console.log('Current workouts array:', workouts); // Debug workouts array

		// Debug earliest bike date
		const earliestBikeYear = findEarliestBikeDate();
		console.log('Earliest bike year:', earliestBikeYear);

		// Find earliest workout year from all workouts
		let earliestYear = currentYear;
		if (workouts && workouts.length > 0) {
			try {
				// Get all valid dates
				const validDates = workouts.map(getWorkoutDate).filter((date) => date !== null);

				if (validDates.length > 0) {
					const earliestWorkoutDate = new Date(Math.min(...validDates));
					console.log('Earliest workout date:', earliestWorkoutDate);
					earliestYear = earliestWorkoutDate.getFullYear();
				} else {
					console.log('No valid dates found in workouts');
				}

				// Log a sample workout to see the structure
				console.log('Sample workout:', workouts[0]);
			} catch (err) {
				console.error('Error processing dates:', err);
			}
		} else {
			console.log('No workouts available yet');
		}

		const years = [];
		for (let year = currentYear; year >= earliestYear; year--) {
			years.push(year);
		}

		console.log('Years to display:', years);

		return (
			<div className="year-selector">
				<button className={`pill-button ${selectedYear === 'all' ? 'active' : ''}`} onClick={() => setSelectedYear('all')}>
					All Time
				</button>
				<button
					className={`pill-button ${selectedYear === earliestBikeYear ? 'active' : ''}`}
					onClick={() => setSelectedYear(earliestBikeYear)}
				>
					Peloton Bike Onwards
				</button>
				{years.length > 0 ? (
					years.map((year) => (
						<button key={year} className={`pill-button ${selectedYear === year ? 'active' : ''}`} onClick={() => setSelectedYear(year)}>
							{year}
						</button>
					))
				) : (
					<div>Loading years...</div>
				)}
			</div>
		);
	};

	// Update the filteredWorkouts memo
	const filteredWorkouts = useMemo(() => {
		if (selectedYear === 'all') return workouts;

		return workouts.filter((workout) => {
			const date = getWorkoutDate(workout);
			return date ? date.getFullYear() === selectedYear : false;
		});
	}, [workouts, selectedYear]);

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

	useEffect(() => {
		fetchAllData();
	}, []); // Run once when component mounts

	const handleStartAgain = () => {
		setHasStarted(false);
		setCurrentSlide(0);
	};

	return (
		<div className="year-in-review">
			{isInitialLoading ? (
				renderWelcomeAnimation()
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
						/>
					)}
				</AnimatePresence>
			) : (
				<div className="start-screen">
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

								<button className="start-button" onClick={startYearInReview} disabled={isLoading}>
									{isLoading ? (
										<>
											<div className="loading-spinner" />
											Loading...
										</>
									) : (
										'Start Your Review'
									)}
								</button>
							</motion.div>
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default YearInReview;
