import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const WorkoutTimesSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { workoutTimeDistribution } = stats;

  const timeSlots = [
    'Early Morning (5-8am)',
    'Morning (8-11am)',
    'Midday (11am-2pm)',
    'Afternoon (2-5pm)',
    'Evening (5-8pm)',
    'Night (8-11pm)',
    'Late Night (11pm-5am)'
  ];

  // Find the max value for scaling
  const maxValue = Math.max(...Object.values(workoutTimeDistribution || {}));

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Favorite Workout Times</h2>

      <div className="workout-times">
        {timeSlots.map((slot, index) => {
          const value = workoutTimeDistribution?.[slot] || 0;
          const percentage = (value / maxValue) * 100;

          return (
            <motion.div
              key={slot}
              className="time-slot"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <span className="time-label">{slot}</span>
              <span className="workout-count">{value}</span>
            </motion.div>
          );
        })}
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

export default WorkoutTimesSlide;
