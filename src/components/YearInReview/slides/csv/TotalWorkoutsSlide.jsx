import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const TotalWorkoutsSlide = ({ stats }) => {
  const { totalWorkouts, workoutsPerWeek, periodStartDate, periodEndDate } = stats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="stat-circle"
      >
        <h1>{totalWorkouts || 0}</h1>
        <p>Total Workouts</p>
      </motion.div>

      <motion.div className="workout-stats">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          That's {workoutsPerWeek || 0} workouts per week!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="first-workout"
        >
          First workout: {periodStartDate}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="last-workout"
        >
          Last workout: {periodEndDate}
        </motion.p>
      </motion.div>

    </motion.div>
  );
};

export default TotalWorkoutsSlide;
