import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const ActiveDaysSlide = ({ stats }) => {
	const { totalActiveDays, longestStreak, currentStreak } = stats || {};

	console.log('Active Days Slide Stats:', {
		totalActiveDays,
		longestStreak,
		currentStreak,
		fullStats: stats,
	});

	return (
		<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="slide stats-slide">
			<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="stat-circle">
				<h1>{totalActiveDays || 0}</h1>
				<p>Active Days</p>
			</motion.div>

			<motion.div className="streak-stats">
				<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
					Longest Streak: {longestStreak || 0} days
				</motion.p>
				<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
					Current Streak: {currentStreak || 0} days
				</motion.p>
			</motion.div>
		</motion.div>
	);
};

export default ActiveDaysSlide;
