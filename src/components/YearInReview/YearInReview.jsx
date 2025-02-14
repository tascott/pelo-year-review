import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './YearInReview.css';

import { processWorkoutData, findEarliestBikeDate } from './yearInReviewUtils';
import { instructorGifs } from './instructorGifs';
import { processUserMusic } from './processUserMusic';

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

const slides = [
	{
		id: 'time',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide time-slide">
				<h2>Time Spent Working Out</h2>
				<div className="time-content-wrapper">
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="time-display">
						<div className="stat-content">
							<h2>{stats?.timeStats?.displayText}</h2>
						</div>
					</motion.div>

					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="celebration-gif">
						<img
							src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZngzaG9peTdxdXAzY3UzbGNubWpldnVpZDNpOTR3ZWE3MHA1cWY5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5wWf7H89PisM6An8UAU/giphy.gif"
							alt="Celebration"
						/>
					</motion.div>

					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="time-comparison">
						<p>In that time, you could have watched:</p>
						<div className="show-comparisons">
							<div className="show-item">
								<span className="show-count">{Math.floor((stats?.timeStats?.hours * 60 + stats?.timeStats?.minutes) / 20.5)}</span>
								<span className="show-name">Episodes of The Office, or</span>
							</div>

							<div className="show-item">
								<span className="show-count">{Math.floor((stats?.timeStats?.hours * 60 + stats?.timeStats?.minutes) / 81)}</span>
								<span className="show-name">films back to back</span>
							</div>
						</div>

						{stats?.timeStats?.workingDays && (
							<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="working-days-note">
								That's {stats.timeStats.workingDays} working days!
							</motion.p>
						)}
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
		id: 'total-workouts',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => (
			<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="slide stats-slide">
				<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="stat-circle">
					<h1>{stats?.totalWorkouts || 0}</h1>
					<p>Total Workouts</p>
				</motion.div>
				<motion.div className="workout-stats">
					<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
						That's {stats?.workoutsPerWeek || 0} workouts per week!
					</motion.p>
					<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="first-workout">
						First workout: {stats?.periodStartDate}
					</motion.p>
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
						const maxSize = 150;
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
				londonToParis: (stats?.totalDistance / 300).toFixed(1), // Always show one decimal place
				centralParkLoops: Math.round(stats?.totalDistance / 6.1), // The main loop of Central Park is 6.1 miles
				marathons: Math.round(stats?.totalDistance / 26.2),
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
											<span className="equivalent-number">{distanceEquivalents.centralParkLoops}</span>
											<span className="equivalent-label">loops around Central Park</span>
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
							<h2>Fastest Ride</h2>
							<div className="fastest-speed">
								{stats?.maxSpeed || 0} MPH <span className="avg-label">(avg)</span>
							</div>

							{/* Add ride details here */}
							<div className="ride-details">
								<div className="ride-name">{stats?.fastestRide?.name || 'Unknown Ride'}</div>
								<div className="instructor-name">with {stats?.fastestRide?.instructor || 'Unknown Instructor'}</div>
							</div>

							<img
								src={stats?.fastestRide?.previewImage || 'https://media3.giphy.com/media/lzrynM5EzFcy512hc1/giphy.gif'}
								alt="Ride preview"
								className="instructor-preview"
							/>

							<div className="stats-footer">
								<div className="average-speed">Average speed: {stats?.averageSpeed || 0} mph</div>
								<div className="workout-count">Across {stats?.cyclingWorkoutCount} cycling workouts</div>
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
				<h2>Your Favorite Workouts</h2>
				<motion.div className="top-workouts">
					{stats?.topWorkouts?.map((workout, i) => (
						<motion.div
							key={workout.title}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: i * 0.2 }}
							className="workout-item"
						>
							<div className="rank-icon">{i + 1}</div>
							<div className="workout-details">
								<span className="workout-name">{workout.title}</span>
								<span className="workout-count">Completed {workout.count} times</span>
							</div>
						</motion.div>
					))}
				</motion.div>

				{stats?.topCyclingWorkout && !stats?.topWorkouts?.some((w) => w.discipline === 'cycling') && (
					<>
						<h3 className="cycling-title">Top Cycling Workout</h3>
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.8 }}
							className="workout-item cycling"
						>
							<div className="rank-icon">👑</div>
							<div className="workout-details">
								<span className="workout-name">{stats.topCyclingWorkout.title}</span>
								<span className="workout-count">Completed {stats.topCyclingWorkout.count} times</span>
							</div>
						</motion.div>
					</>
				)}

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
		id: 'workout-times',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide time-profile-slide">
				<h2>Your Workout Schedule</h2>
				{/* {stats?.workoutTimeProfile?.[0]?.isTop && (
					<motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="persona-title">
						You're a {stats.workoutTimeProfile[0].name}!
					</motion.h3>
				)} */}
				<div className="time-slots">
					{stats?.workoutTimeProfile?.map((slot, index) => (
						<motion.div
							key={slot.name}
							className={`time-slot ${slot.isTop ? 'top-slot' : ''}`}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 * index }}
						>
							<div className="time-rank">{slot.rank}</div>
							<div className="time-details">
								<div className="time-name">{slot.name}</div>
								<div className="time-range">{slot.timeRange}</div>
								<div className="workout-count">{slot.count} workouts</div>
							</div>
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
		id: 'total-output',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide output-slide">
				<h2>Total Output</h2>
				<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="output-circle">
					<h1>{Math.round(stats?.totalOutput || 0).toLocaleString()}</h1>
					<p>Total kJ</p>
				</motion.div>

				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="phone-charges">
					<div className="phone-icon">📱</div>
					<p>That's enough energy to charge a smartphone</p>
					<h2>{stats?.phoneCharges || 0} times!</h2>
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
		id: 'top-songs',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex, isLoadingMusic }) => (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide music-slide">
				<h2>Your Top Riding Songs</h2>
				{!stats.musicStats || isLoadingMusic ? (
					<MusicLoadingState />
				) : (
					<motion.div className="music-stats">
						{stats?.musicStats?.topSongs?.map((song, i) => (
							<motion.div
								key={song.title}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.5, delay: i * 0.2 }}
								className="music-item"
							>
								<div className="rank-icon">{i + 1}</div>
								<div className="music-details">
									<span className="song-title">{song.title}</span>
									<span className="artist-name">{song.artist}</span>
									<span className="play-count">Played {song.playCount} times</span>
								</div>
							</motion.div>
						))}
						<div className="total-stats">
							<p>You listened to {stats?.musicStats?.totalUniqueSongs} different songs</p>
							<p>Total plays: {stats?.musicStats?.totalPlays}</p>
						</div>
					</motion.div>
				)}
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
		id: 'top-artists',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex, isLoadingMusic }) => (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide music-slide">
				<h2>Your Top Riding Artists</h2>
				{!stats.musicStats || isLoadingMusic ? (
					<MusicLoadingState />
				) : (
					<motion.div className="music-stats">
						{stats?.musicStats?.topArtists?.map((artist, i) => (
							<motion.div
								key={artist.name}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.5, delay: i * 0.2 }}
								className="music-item"
							>
								<div className="rank-icon">{i + 1}</div>
								<div className="music-details">
									<span className="artist-name">{artist.name}</span>
									<span className="play-count">Played {artist.playCount} times</span>
									<span className="song-count">{artist.uniqueSongs} unique songs</span>
								</div>
							</motion.div>
						))}
						<div className="total-stats">
							<p>You listened to {stats?.musicStats?.totalUniqueArtists} different artists</p>
						</div>
					</motion.div>
				)}
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
		id: 'active-days',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => {
			const activeDays = stats.totalActiveDays || 0;

			// Find the most active month
			const mostActiveMonth = stats.calendarData ? stats.calendarData.reduce((max, month) => {
				return month.active_days.length > (max?.active_days.length || 0) ? month : max;
			}, null) : null;

			const monthNames = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			];

			return (
				<motion.div className="slide active-days-slide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
					<h1>Your Active Days</h1>
					<div className="stats-container">
						<motion.div className="stat-item" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
							<h3>{activeDays}</h3>
							<p>Total Active Days</p>
						</motion.div>

						<motion.div className="stat-item" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}>
							<h3>{mostActiveMonth?.active_days.length || 0}</h3>
							<p>Most Active Month</p>
							<span className="subtitle">{monthNames[mostActiveMonth?.month - 1] || ''}</span>
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
		id: 'final',
		component: ({ stats, onPrevious, handleStartAgain, slideIndex }) => {
			// Determine message based on selected period
			let finalMessage;
			if (stats?.selectedYear === 'all') {
				finalMessage = 'What a Journey!';
			} else if (stats?.selectedYear === 'bike') {
				finalMessage = 'What a Ride!';
			} else {
				finalMessage = 'What a Year!';
			}

			return (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide final-slide">
					<h1>{finalMessage}</h1>
					<motion.img
						src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjZ0ZXBscnFmZmtiNm10azJoa2Qzc3MxODNzZW1haTAxY3g1aDg3YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7bXAhOi1oyodzRV5kO/giphy.gif"
						alt="Celebration"
						className="final-gif"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.5 }}
					/>
					<div className="slide-buttons">
						{slideIndex > 0 && (
							<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onPrevious} className="back-button">
								Back
							</motion.button>
						)}
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
];

/**
 * @typedef {Object} CachedYearData
 * @property {number} timestamp
 * @property {Object} stats
 * @property {Object} stats.workoutStats
 * @property {Object} stats.musicStats
 */

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
				calendarData, // Add calendar data alongside existing stats
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
