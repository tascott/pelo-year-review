import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const TimeSpecificSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { workoutTypes } = stats;

  const minutesToHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getWorkoutIcon = (type) => {
    const icons = {
      cycling: '🚴',
      running: '🏃',
      strength: '💪',
      yoga: '🧘',
      meditation: '🧘‍♂️',
      walking: '🚶',
      bootcamp: '🏋️',
      cardio: '❤️',
      stretching: '🤸',
      default: '🏃‍♂️'
    };
    return icons[type.toLowerCase()] || icons.default;
  };

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
		<motion.div
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -50 }}
			className="slide stats-specific-slide"
		>
			<h2>Your Workout Times</h2>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(2, 120px)',
					gap: '0.5rem',
					padding: '0.5rem',
					justifyContent: 'center',
					margin: '0 auto',
				}}
			>
				{workoutTypes?.map((workoutType, index) => (
					<motion.div
						key={workoutType.name}
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							delay: 0.2 + index * 0.1,
							type: 'spring',
							stiffness: 100,
						}}
						style={{
							width: '90px',
							height: '90px',
							borderRadius: '50%',
							background: `radial-gradient(circle at center, rgba(255, 107, 107, 0.1), rgba(255, 142, 83, 0.1))`,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '0.5rem',
							margin: '0 auto',
							textAlign: 'center',
						}}
						whileHover={{ scale: 1.02 }}
					>
						<div
							style={{
								fontSize: '1.2rem',
								marginBottom: '0.25rem',
							}}
						>
							{getWorkoutIcon(workoutType.name)}
						</div>
						<h3
							style={{
								margin: '0 0 0.25rem 0',
								fontSize: '0.8rem',
								color: 'white',
							}}
						>
							{capitalize(workoutType.name)}
						</h3>
						<p
							style={{
								margin: '0',
								fontSize: '0.8rem',
								opacity: 0.8,
							}}
						>
							{minutesToHours(workoutType.totalMinutes)}
						</p>
					</motion.div>
				))}
			</div>

			<div className="slide-buttons">
				{slideIndex > 0 && (
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={onPrevious}
						className="back-button"
					>
						Back
					</motion.button>
				)}
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={onNext}
					className="next-button"
				>
					Next
				</motion.button>
			</div>
		</motion.div>
  );
};

export default TimeSpecificSlide;
