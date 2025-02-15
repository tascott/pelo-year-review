import WorkoutTypesSlide from './WorkoutTypesSlide';
import TimeSlide from './TimeSlide';
import TimeSpecificSlide from './TimeSpecificSlide';
import FavoriteInstructorSlide from './FavoriteInstructorSlide';
import FavoriteInstructorSpecificSlide from './FavoriteInstructorSpecificSlide';
import DistanceSlide from './DistanceSlide';
import InTheZoneSlide from './InTheZoneSlide';
import FavoritesSlide from './FavoritesSlide';
import WorkoutTimesSlide from './WorkoutTimesSlide';
import TopSongsSlide from './TopSongsSlide';
import TopArtistsSlide from './TopArtistsSlide';

export const apiSlides = [
  {
    id: 'workout-types',
    component: WorkoutTypesSlide
  },
  {
    id: 'time',
    component: TimeSlide
  },
  {
    id: 'time-specific',
    component: TimeSpecificSlide
  },
  {
    id: 'favorite-instructor',
    component: FavoriteInstructorSlide
  },
  {
    id: 'favorite-instructor-specific',
    component: FavoriteInstructorSpecificSlide
  },
  {
    id: 'distance',
    component: DistanceSlide
  },
  {
    id: 'in-the-zone',
    component: InTheZoneSlide
  },
  {
    id: 'favorites',
    component: FavoritesSlide
  },
  {
    id: 'workout-times',
    component: WorkoutTimesSlide
  },
  {
    id: 'top-songs',
    component: TopSongsSlide
  },
  {
    id: 'top-artists',
    component: TopArtistsSlide
  }
];

export default apiSlides;
