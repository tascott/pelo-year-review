import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const WorkoutTypesSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { workoutTypes } = stats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Favorite Workout Types</h2>
      <div className="workout-types-grid">
        {workoutTypes?.map((type, index) => (
          <motion.div
            key={type.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2 }}
            className="workout-type-card"
          >
            <h3>{type.name}</h3>
            <p>{type.count} workouts</p>
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

export default WorkoutTypesSlide;
