import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const HeartDataSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { heartData } = stats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Heart Rate Data</h2>

      <div className="heart-data-grid">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="heart-data-card"
        >
          <h3>Average Heart Rate</h3>
          <p>{heartData?.avgHeartRate?.toFixed(0) || 0} BPM</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="heart-data-card"
        >
          <h3>Max Heart Rate</h3>
          <p>{heartData?.maxHeartRate || 0} BPM</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="heart-data-card highlight"
        >
          <h3>Heart Rate Range</h3>
          <p>{heartData?.minHeartRate || 0} - {heartData?.maxHeartRate || 0} BPM</p>
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

export default HeartDataSlide;
