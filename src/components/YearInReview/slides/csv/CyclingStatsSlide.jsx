import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const CyclingStatsSlide = ({ stats }) => {
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
          <p className='best'>{cyclingStats?.totalOutput?.toLocaleString() || 0} kJ</p>
          <p className="fun-fact">That's enough energy to charge your phone {cyclingStats?.phoneCharges || 0} times! 📱</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="cycling-stat-card"
        >
          <h3>Best Output</h3>
          <p className='best'>{cyclingStats?.bestOutput || 0} kJ</p>
          <p className="fun-fact">Your most powerful ride was "{cyclingStats?.bestRideTitle}" with {cyclingStats?.bestRideInstructor} 💪</p>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default CyclingStatsSlide;
