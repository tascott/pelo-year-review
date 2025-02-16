import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const TimeSlide = ({ stats, onNext, onPrevious, slideIndex }) => {
  const { timeStats } = stats;

  // Convert minutes to hours and minutes
  const totalTime = timeStats?.totalMinutes || 0;
  const totalHours = Math.floor(totalTime / 60);
  const remainingMinutes = totalTime % 60;
 
  // Fun time conversions
  const officeEpisodes = Math.floor(totalTime / 22); // Average episode length
  const movies = Math.floor(totalTime / 120); // Average movie length
  const workDays = (totalTime / (60 * 8)).toFixed(1); // 8-hour workday

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide time-slide"
    >
      <h2>Time Spent Working Out</h2>

      {/* Main time display */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="time-display"
      >
        <motion.p>
          {totalHours} hrs {remainingMinutes} mins
        </motion.p>
      </motion.div>

      {/* Fun comparisons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="time-comparisons"
      >
        <p>In that time, you could have watched:</p>

        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZngzaG9peTdxdXAzY3UzbGNubWpldnVpZDNpOTR3ZWE3MHA1cWY5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5wWf7H89PisM6An8UAU/giphy.gif" 
          alt="The Office Michael Scott" 
          className="time-gif"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="comparison-stats"
        >
          <div className="comparison-box">
            <span className="comparison-number">{officeEpisodes}</span>
            <span>Episodes of The Office, or</span>
          </div>

          <div className="comparison-box">
            <span className="comparison-number">{movies}</span>
            <span>films back to back</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          className="working-days"
        >
          That's {workDays} working days!
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

export default TimeSlide;
