import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const TimeSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { totalTime, timePerWorkout } = stats;

  // Convert minutes to hours and minutes
  const totalHours = Math.floor(totalTime / 60);
  const remainingMinutes = totalTime % 60;

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
        <h1>{totalHours}</h1>
        <p>Total Hours</p>
      </motion.div>

      <motion.div className="time-stats">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {remainingMinutes > 0 && `and ${remainingMinutes} minutes`}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Average workout time: {timePerWorkout || 0} minutes
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

export default TimeSlide;
