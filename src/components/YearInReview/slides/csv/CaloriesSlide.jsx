import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const CaloriesSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { totalCalories, caloriesPerWorkout } = stats;

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
        <h1>{totalCalories?.toLocaleString() || 0}</h1>
        <p>Total Calories</p>
      </motion.div>

      <motion.div className="calories-stats">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Average {caloriesPerWorkout || 0} calories per workout
        </motion.p>
      </motion.div>

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

export default CaloriesSlide;
