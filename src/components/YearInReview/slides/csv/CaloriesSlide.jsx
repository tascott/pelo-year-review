import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const CaloriesSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
	const { totalCalories, caloriesPerWorkout } = stats;

	// Calculate equivalents directly in the component
	const jaffaCakes = Math.round(totalCalories / 46); // 46 calories per Jaffa Cake
	const pintsOfBeer = Math.round(totalCalories / 180); // 180 calories per pint
	const prosecco = Math.round(totalCalories / 80); // 80 calories per glass

	return (
		<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="slide stats-slide">
			<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="stat-circle">
				<h1>{totalCalories?.toLocaleString() || 0}</h1>
				<p>Total Calories</p>
			</motion.div>

			<motion.div className="calorie-equivalents">
				<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
					That's equivalent to:
				</motion.p>
				<div className="equivalent-item">
					<span className="equivalent-number">{jaffaCakes}</span>
					<span className="equivalent-label">Jaffa Cakes</span>
				</div>
				<div className="equivalent-item">
					<span className="equivalent-number">{pintsOfBeer}</span>
					<span className="equivalent-label">Pints of Beer</span>
				</div>
				<div className="equivalent-item">
					<span className="equivalent-number">{prosecco}</span>
					<span className="equivalent-label">Glasses of Prosecco</span>
				</div>
			</motion.div>

			<motion.div className="calories-stats">
				<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
					Average {caloriesPerWorkout || 0} calories per workout
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
			</div>
		</motion.div>
	);
};

export default CaloriesSlide;
