import Workout from './Workout';

export default class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calculateSpeed();
    this._setWorkoutDescripton();
  }

  calculateSpeed() {
    this.speed = this.distance / (this.duration / 60); // km/h
  }
}
