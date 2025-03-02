import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const InTheZoneSlide = ({ stats }) => {
  const { heartRateZones } = stats;

  const zones = [
    { name: 'Zone 1', color: '#55efc4' },
    { name: 'Zone 2', color: '#74b9ff' },
    { name: 'Zone 3', color: '#a29bfe' },
    { name: 'Zone 4', color: '#fd79a8' },
    { name: 'Zone 5', color: '#ff7675' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Time in Heart Rate Zones</h2>

      <div className="heart-rate-zones">
        {zones.map((zone, index) => (
          <motion.div
            key={zone.name}
            initial={{ width: 0 }}
            animate={{ width: `${(heartRateZones?.[index] || 0) * 100}%` }}
            transition={{ delay: index * 0.2, duration: 1 }}
            className="zone-bar"
            style={{ backgroundColor: zone.color }}
          >
            <span className="zone-label">{zone.name}</span>
            <span className="zone-percentage">
              {((heartRateZones?.[index] || 0) * 100).toFixed(1)}%
            </span>
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

export default InTheZoneSlide;
