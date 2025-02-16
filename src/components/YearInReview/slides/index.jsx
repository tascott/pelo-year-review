import { apiSlides } from './api';
import { csvSlides } from './csv';
import { calendarSlides } from './calendar';

// Import the final slide component
import FinalSlide from './FinalSlide';

/*
Slide Order and Data Sources:
1. total-workouts (CSV)
2. workout-types (API)
3. time (API)
4. time-specific (API)
5. favorite-instructor (API)
6. favorite-instructor-specific (API)
7. calories (CSV)
8. distance (CSV)
9. cycling-stats (CSV)
10. cycling-averages (CSV)
11. heart-data (CSV)
12. in-the-zone (API)
13. favorites (API)
14. workout-times (API)
15. total-output (CSV)
16. top-songs (API - Rides Only)
17. top-artists (API - Rides Only)
18. active-days (Calendar)
19. final
*/

// Define exact slide order to match specification
const slides = [
  // Start with total workouts from CSV
  ...csvSlides.filter(slide => slide.id === 'total-workouts'),

  // Workout types from API
  ...apiSlides.filter(slide => slide.id === 'workout-types'),

  // Time related slides from API
  ...apiSlides.filter(slide => ['time', 'time-specific'].includes(slide.id)),

  // Instructor slides from API
  ...apiSlides.filter(slide => ['favorite-instructor', 'favorite-instructor-specific'].includes(slide.id)),

  // Calories from CSV
  ...csvSlides.filter(slide => slide.id === 'calories'),

  // Distance from CSV
  ...csvSlides.filter(slide => slide.id === 'distance'),

  // Cycling stats and averages from CSV
  ...csvSlides.filter(slide => ['cycling-stats', 'cycling-averages'].includes(slide.id)),

  // Heart data from CSV
  ...csvSlides.filter(slide => slide.id === 'heart-data'),

  // In the zone from API
  ...apiSlides.filter(slide => slide.id === 'in-the-zone'),

  // Favorites from API
  ...apiSlides.filter(slide => slide.id === 'favorites'),

  // Workout times from API
  ...apiSlides.filter(slide => slide.id === 'workout-times'),

  // Total output from CSV
  ...csvSlides.filter(slide => slide.id === 'total-output'),

  // Music slides from API
  ...apiSlides.filter(slide => ['top-songs', 'top-artists'].includes(slide.id)),

  // Calendar slides
  ...calendarSlides,

  // Final summary slide
  {
    id: 'final',
    component: FinalSlide
  }
];

export default slides;
