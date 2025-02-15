import React from 'react';
import { motion } from 'framer-motion';
import '../../YearInReview.css';

const TopArtistsSlide = ({ stats, onNext, onPrevious, slideIndex, isLoadingMusic }) => {
  const { topArtists } = stats;

  if (isLoadingMusic) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="slide loading-slide"
      >
        <h2>Loading your music stats...</h2>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="slide stats-slide"
    >
      <h2>Your Top Artists</h2>

      <div className="music-list">
        {topArtists?.map((artist, index) => (
          <motion.div
            key={artist.name}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="music-item"
          >
            <span className="rank">{index + 1}</span>
            <div className="artist-info">
              <h3>{artist.name}</h3>
              <p>{artist.songs} songs played</p>
            </div>
            <span className="play-count">{artist.playCount}x</span>
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

export default TopArtistsSlide;
