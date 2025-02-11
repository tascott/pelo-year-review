import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './YearInReview.css';

import { processWorkoutData, findEarliestBikeDate } from './yearInReviewUtils';
import { instructorGifs } from './instructorGifs';

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
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => {
			const instructorGif = stats?.favoriteInstructor?.name ? instructorGifs.instructors[stats.favoriteInstructor.name] : null;

			return (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide instructor-slide">
					<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
						<h2>Your Favorite Instructor</h2>
						<h1>{stats?.favoriteInstructor?.name || 'Loading...'}</h1>
						{instructorGif && (
							<motion.img
								src={instructorGif}
								alt={`${stats?.favoriteInstructor?.name} GIF`}
								className="instructor-gif"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.7 }}
							/>
						)}
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
		id: 'workout-types',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide types-slide">
				<h2>Your Workout Mix</h2>
				<div className="workout-types-bubbles">
					{stats?.workoutTypes?.map((type, index) => {
						// Calculate size based on percentage, with min and max constraints
						const minSize = 80;
						const maxSize = 200;
						const size = Math.max(minSize, Math.min(maxSize, type.percentage * 4));

						// Get gradient based on workout type
						const gradientClass = `type-bubble-${type.name.toLowerCase().replace(/\s+/g, '')}`;

						return (
							<motion.div
								key={type.name}
								className={`type-bubble ${gradientClass}`}
								initial={{ scale: 0, opacity: 0 }}
								animate={{
									scale: 1,
									opacity: 1,
									width: `${size}px`,
									height: `${size}px`,
								}}
								transition={{
									delay: index * 0.2,
									duration: 0.5,
									type: 'spring',
									stiffness: 100,
								}}
							>
								<div className="bubble-content">
									<div className="type-name">{type.name}</div>
									<div className="type-count">{type.count}</div>
									<div className="type-percent">{type.percentage}%</div>
								</div>
							</motion.div>
						);
					})}
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
			const [showStats, setShowStats] = useState(false);

			useEffect(() => {
				// Show stats first
				const statsTimer = setTimeout(() => setShowStats(true), 500);
				// Then show gif
				const gifTimer = setTimeout(() => setShowGif(true), 1000);
				// Finally show comparisons
				const comparisonTimer = setTimeout(() => setShowComparisons(true), 3000);

				return () => {
					clearTimeout(statsTimer);
					clearTimeout(gifTimer);
					clearTimeout(comparisonTimer);
				};
			}, []);

			return (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide time-slide">
					<div className="time-content-wrapper">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: showStats ? 1 : 0 }}
							transition={{ duration: 0.5 }}
							className="time-display"
						>
							<div className="stat-content">
								<h2>{stats?.timeStats?.displayText}</h2>
								<p>of Exercise</p>
							</div>
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
						initial={{ opacity: 0 }}
						animate={{ opacity: showNumbers ? 1 : 0 }}
						transition={{ duration: 0.5 }}
						className="stat-box calories-stat"
					>
						<div className="stat-content">
							<div>
								<h2>You burned</h2>
								<div className="stat-number">{(stats?.totalCalories || 0).toLocaleString()}</div>
								<h2>calories</h2>
							</div>
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
				londonToParis: Math.round(stats?.totalDistance / 300), // London to Paris is ~300 miles by road
				laps: Math.round(stats?.totalDistance * 4), // 1 mile = ~4 laps of a track
				marathons: Math.round(stats?.totalDistance / 26.2), // Marathon is 26.2 miles
			};

			return (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide stats-slide">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: showNumbers ? 1 : 0 }}
						transition={{ duration: 0.5 }}
						className="stat-box distance-stat"
					>
						<div className="stat-content">
							<div>
								<h2>You covered</h2>
								<div className="stat-number">{(stats?.totalDistance || 0).toLocaleString()}</div>
								<h2>miles</h2>
							</div>
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
		id: 'cycling-stats',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => {
			const [showNumbers, setShowNumbers] = useState(false);

			useEffect(() => {
				const timer = setTimeout(() => setShowNumbers(true), 1500);
				return () => clearTimeout(timer);
			}, []);

			return (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide stats-slide">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: showNumbers ? 1 : 0 }}
						transition={{ duration: 0.5 }}
						className="stat-box cycling-stat"
					>
						<div className="stat-content">
							<div>
								<h2>Fastest Ride</h2>
								<div className="speed-section">
									<div className="speed-value">
										{stats?.maxSpeed || 0} MPH <span className="avg-label">(avg)</span>
									</div>
									<img
										src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDZsbGRvcjUxY2N6bzEzendqaTluemI3aTVoc3YyeDBnY2s3cnA0ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lzrynM5EzFcy512hc1/giphy.gif"
										alt="Speed animation"
										className="speed-gif"
									/>
								</div>
								<p className="speed-details">
									Average speed: {stats?.averageSpeed || 0} mph
									<br />
									<span className="workout-count">Across {stats?.cyclingWorkoutCount} cycling workouts</span>
								</p>
							</div>
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
		id: 'favorites',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide favorites-slide">
				<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="favorites-content">
					<h2>You were obsessed with...</h2>
					{stats?.topWorkouts?.map((workout, index) => (
						<motion.div
							key={workout.title}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 + index * 0.2 }}
							className="favorite-workout"
						>
							<div className="rank-badge">{index + 1}</div>
							<h1>{workout.title}</h1>
							<div className="repeat-count">
								Completed {workout.count} {workout.count === 1 ? 'time' : 'times'}
							</div>
						</motion.div>
					))}
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
		id: 'final',
		component: ({ stats, onPrevious, handleStartAgain, slideIndex }) => (
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
				</div>
				<motion.img
					src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjZ0ZXBscnFmZmtiNm10azJoa2Qzc3MxODNzZW1haTAxY3g1aDg3YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7bXAhOi1oyodzRV5kO/giphy.gif"
					alt="Goodbye"
					className="goodbye-gif"
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 1.3 }}
				/>
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
										'Lets Ride 🚴‍♂️'
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
