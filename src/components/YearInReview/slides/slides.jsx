import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../YearInReview.css';
import instructorIds from '../../../data/instructorIDs.json';

const slides = [
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
		id: 'time',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => {
			console.log('statsddddddddddd', stats);
			return (
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
									<span className="show-count">{Math.floor(((stats?.timeStats?.hours || 0) * 60 + (stats?.timeStats?.minutes || 0)) / 20.5) || 0}</span>
									<span className="show-name">Episodes of The Office, or</span>
								</div>

								<div className="show-item">
									<span className="show-count">{Math.floor(((stats?.timeStats?.hours || 0) * 60 + (stats?.timeStats?.minutes || 0)) / 81) || 0}</span>
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
			);
		},
	},
	{
		id: 'time-specific',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => {
			console.log('statsddddddddddd', stats);
			return (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide time-slide">
			
				</motion.div>
			);
		},
	},
	{
		id: 'favorite-instructor',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => {
			console.log('Stats2222222:', stats);
			// Find instructor by ID
			const instructorGif = stats?.favoriteInstructor?.id ? instructorIds[stats.favoriteInstructor.id]?.gif_url : null;

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
		id: 'favorite-instructor-specific',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => {
			// Find instructor by ID
			const instructorGif = stats?.favoriteInstructor?.id ? instructorIds[stats.favoriteInstructor.id]?.gif_url : null;

			return (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="slide instructor-slide">

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
		id: 'cycling-averages',
		component: ({ stats, onNext, onPrevious, handleStartAgain, slideIndex }) => {
	
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

export default slides;
