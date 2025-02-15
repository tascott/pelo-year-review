import React from 'react';
import { motion } from 'framer-motion';
import '../YearInReview.css';

const FinalSlide = ({ stats, onPrevious, handleStartAgain, slideIndex }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide final-slide"
    >
      <h1>Congratulations!</h1>
      <p>You've had an amazing year with Peloton.</p>
      <p>Keep pushing yourself and achieving new goals!</p>

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
          onClick={handleStartAgain}
          className="start-again-button"
        >
          Start Again
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FinalSlide;
