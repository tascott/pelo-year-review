import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const CyclingStatsSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { cyclingStats } = stats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Cycling Stats</h2>

      <div className="cycling-stats-grid">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="cycling-stat-card"
        >
          <h3>Total Output</h3>
          <p>{cyclingStats?.totalOutput?.toLocaleString() || 0} kJ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="cycling-stat-card"
        >
          <h3>Average Output</h3>
          <p>{cyclingStats?.avgOutput?.toFixed(1) || 0} kJ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="cycling-stat-card"
        >
          <h3>Best Output</h3>
          <p>{cyclingStats?.bestOutput || 0} kJ</p>
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

export default CyclingStatsSlide;
