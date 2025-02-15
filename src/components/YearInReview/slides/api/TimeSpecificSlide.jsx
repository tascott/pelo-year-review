import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const TimeSpecificSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { longestWorkout, shortestWorkout } = stats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Workout Times</h2>

      <div className="time-specific-stats">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="time-stat-card"
        >
          <h3>Longest Workout</h3>
          <p>{longestWorkout?.duration || 0} minutes</p>
          <p className="workout-detail">{longestWorkout?.title || 'Unknown'}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="time-stat-card"
        >
          <h3>Shortest Workout</h3>
          <p>{shortestWorkout?.duration || 0} minutes</p>
          <p className="workout-detail">{shortestWorkout?.title || 'Unknown'}</p>
        </motion.div>
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
