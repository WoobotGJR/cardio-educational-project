import Workout from './Workout';

export default class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, temp) {
    super(coords, distance, duration);
    this.temp = temp;
    this.calculatePace();
    this._setWorkoutDescripton();
  }

  calculatePace() {
    this.pace = this.duration / this.distance; // min/km
  }
}
