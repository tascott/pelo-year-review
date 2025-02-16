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

      <div className="time-stat-grid">
        {workoutTypes?.map((workoutType, index) => (
          <motion.div
            key={workoutType.name}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.2 + index * 0.1,
              type: "spring",
              stiffness: 100
            }}
            className="time-stat-card"
            whileHover={{ scale: 1.02 }}
          >
            <div className="workout-icon">
              {getWorkoutIcon(workoutType.name)}
            </div>
            <h3>{capitalize(workoutType.name)}</h3>
            <p>{minutesToHours(workoutType.totalMinutes)}</p>

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
