import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './YearInReview.css';
import slides from './slides';
import demoData from '../../data/demoData.json';

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
				if (prev < messages.length - 1) {
					return prev + 1;
				}
				clearInterval(timer);
				return prev;
			});
		}, 1500); // Slightly faster than real version
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

const YearInReview = () => {
	const navigate = useNavigate();
	const [currentSlide, setCurrentSlide] = useState(0);
	const [stats, setStats] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [userData, setUserData] = useState(null);
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [hasStarted, setHasStarted] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [welcomeStep, setWelcomeStep] = useState(0);
	const [selectedYear, setSelectedYear] = useState(null);
	const handleLogout = async () => {
		try {
			// Navigate back to home and force a page reload
			window.location.href = '/';
		} catch (err) {
			console.error('Logout failed:', err);
			// Still try to redirect even if something fails
			window.location.href = '/';
		}
	};

	// Simulate initial loading
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsInitialLoading(false);
		}, messages.length * 1500 + 500); // Total loading time plus a small buffer
		return () => clearTimeout(timer);
	}, []);

	// Update the start sequence
	useEffect(() => {
		setIsLoading(true);
		// Demo data
		setStats({
			// API stats
			totalWorkouts: demoData.totalWorkouts,
			workoutsPerWeek: demoData.workoutsPerWeek,
			periodStartDate: demoData.periodStartDate,
			timeStats: demoData.timeStats,
			workoutTypes: demoData.workoutTypes,
			favoriteInstructor: demoData.favoriteInstructor,
			workoutTimeProfile: demoData.workoutTimeProfile,
			topInstructorsByDiscipline: demoData.topInstructorsByDiscipline,
			favoriteWorkouts: demoData.favoriteWorkouts,

			// CSV stats
			cyclingStats: demoData.cyclingStats,
			heartRateData: demoData.heartRateData,
			earliestBikeDate: demoData.earliestBikeDate,
			totalCalories: demoData.totalCalories,
			caloriesPerWorkout: demoData.caloriesPerWorkout,

			// Calendar stats
			currentStreak: demoData.calendarStats.currentStreak,
			longestStreak: demoData.calendarStats.longestStreak,
			totalActiveDays: demoData.calendarStats.totalActiveDays,

			// Other
			musicStats: demoData.musicStats,
			timestamp: Date.now(),
		});

		setHasStarted(true);
		setCurrentSlide(0);
	}, []);

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

	// Update renderYearSelector function
	const renderYearSelector = () => {
		return (
			<>
				<h4>Demo mode only has data for 1 year. Select 2024 and click start.</h4>

				<div className="year-selector">
					<div className="year-buttons">
						<button key="2024" className={`pill-button ${selectedYear === 2024 ? 'active' : ''}`} onClick={() => setSelectedYear(2024)}>
							2024
						</button>
					</div>
				</div>
			</>
		);
	};

	const handleStartAgain = () => {
		// Navigate back to the main route
		navigate('/');
	};

	// Add this function to handle the start sequence
	const handleStart = () => {
		setIsTransitioning(true);
		setTimeout(() => {
			setHasStarted(true);
			setIsTransitioning(false);
		}, 3500);
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
