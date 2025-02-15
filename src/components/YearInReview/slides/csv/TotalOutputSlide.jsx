import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const TotalOutputSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { totalOutput, outputPerWorkout } = stats;

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
        <h1>{totalOutput?.toLocaleString() || 0}</h1>
        <p>Total Output (kJ)</p>
      </motion.div>

      <motion.div className="output-stats">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Average {outputPerWorkout?.toFixed(1) || 0} kJ per workout
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

export default TotalOutputSlide;
