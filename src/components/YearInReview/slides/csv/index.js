import TotalWorkoutsSlide from './TotalWorkoutsSlide';
import CaloriesSlide from './CaloriesSlide';
import CyclingStatsSlide from './CyclingStatsSlide';
import CyclingAveragesSlide from './CyclingAveragesSlide';
import HeartDataSlide from './HeartDataSlide';
import DistanceSlide from './DistanceSlide';

export const csvSlides = [
  {
    id: 'total-workouts',
    component: TotalWorkoutsSlide
  },
  {
    id: 'calories',
    component: CaloriesSlide
  },
  {
    id: 'cycling-stats',
    component: CyclingStatsSlide
  },
  {
    id: 'cycling-averages',
    component: CyclingAveragesSlide
  },
  {
    id: 'heart-data',
    component: HeartDataSlide
  },
  {
    id: 'distance',
    component: DistanceSlide
  }
];

export default csvSlides;
