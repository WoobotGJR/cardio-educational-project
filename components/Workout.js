export default class Workout {
  date = new Date();
  // id for test
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setWorkoutDescripton() {
    const intlDate = new Intl.DateTimeFormat('ru-RU').format(this.date);

    this.type === 'running'
      ? (this.descripton = `Пробежка ${intlDate}`)
      : (this.descripton = `Велотренировка ${intlDate}`);
  }
}
