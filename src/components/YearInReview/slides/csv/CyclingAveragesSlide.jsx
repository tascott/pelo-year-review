import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const CyclingAveragesSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { cyclingAverages } = stats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Cycling Averages</h2>

      <div className="cycling-averages-grid">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="cycling-avg-card"
        >
          <h3>Average Cadence</h3>
          <p>{cyclingAverages?.avgCadence?.toFixed(1) || 0} RPM</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="cycling-avg-card"
        >
          <h3>Average Resistance</h3>
          <p>{cyclingAverages?.avgResistance?.toFixed(1) || 0}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="cycling-avg-card"
        >
          <h3>Average Speed</h3>
          <p>{cyclingAverages?.avgSpeed?.toFixed(1) || 0} mph</p>
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

export default CyclingAveragesSlide;
