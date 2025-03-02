import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const SlideNavigation = ({ onNext, onPrevious, onStartAgain, currentSlide, totalSlides }) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') {
        if (currentSlide < totalSlides - 1) onNext();
      } else if (e.key === 'ArrowLeft') {
        if (currentSlide > 0) onPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, totalSlides, onNext, onPrevious]);

  const isLastSlide = currentSlide === totalSlides - 1;

  return (
    <div className="slide-buttons">
      {currentSlide > 0 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrevious}
          className="back-button"
        >
          Back
        </motion.button>
      )}
      {!isLastSlide ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="next-button"
        >
          Next
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartAgain}
          className="start-again-button"
        >
          Start Again
        </motion.button>
      )}
    </div>
  );
};

export default SlideNavigation;
