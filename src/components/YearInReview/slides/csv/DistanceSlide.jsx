import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const DistanceSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { totalDistance } = stats.cyclingStats;
  const { distancePerWorkout } = stats.cyclingStats;

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
        <h1>{totalDistance}</h1>
        <p>Total Miles</p>
      </motion.div>

      <motion.div className="distance-stats">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Average {distancePerWorkout} miles per workout
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="distance-comparisons"
        >
          <p>
            That's equivalent to:
          </p>
          <ul>
            <li>
              {(totalDistance / 6.1).toFixed(1)} loops around Central Park
            </li>
            <li>
              {(totalDistance / 119).toFixed(1)} trips between London and Birmingham
            </li>
          </ul>
        </motion.div>
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

export default DistanceSlide;
