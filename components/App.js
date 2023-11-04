import Cycling from './Cycling.js';
import Running from './Running.js';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--temp');
const inputElevation = document.querySelector('.form__input--climb');

export default class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    // we need to bind this to this._getPosition method because this linked to
    // form of addEventListener
    form.addEventListener('submit', this._newWorkout.bind(this));

    // here we add eventListener for change input. We dont need to bind
    // this because it not used in method
    inputType.addEventListener('change', this._toggleClimbField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));

    this._getPosition();

    this._hideForm();

    // load data from local storage
    this._getWorkoutsFromLocalStorage();
  }

  _getPosition() {
    // we need to bind this to this._loadMap method because this looses context
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
      alert('Could not get your position');
    });
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    // L is a point of enter into the leafletJS library
    this.#map = L.map('map').setView(coords, 13);

    // here we using opensource map openstreetmap
    // we can change style for map using other link
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // here we add eventListener for click on map. We need to bind this, because
    // on is analog of addEventListener in leafletJS, this points to this.#map
    this.#map.on('click', this._showForm.bind(this));

    // here we load data from local storage
    this.#workouts.forEach(workout => {
      this._displayWorkout(workout);
    });
  }

  _showForm(event) {
    this.#mapEvent = event;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    // clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.classList.add('hidden');
  }

  _toggleClimbField() {
    // change visible input upon changing list item by parent's classList toggle
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(event) {
    event.preventDefault();

    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    // validity check functions
    const areNumbers = (...args) => args.every(arg => Number.isFinite(arg));
    const isPositive = (...args) => args.every(arg => arg => 0);

    // check data validity
    // if workout is running -> create running object
    if (type === 'running') {
      const temp = +inputCadence.value;

      if (
        !areNumbers(distance, duration, temp) ||
        !isPositive(distance, duration, temp)
      )
        return alert('Data is not valid');

      workout = new Running([lat, lng], distance, duration, temp);
    }

    // if workout is cycling -> create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      console.log(inputCadence.value);

      if (
        !areNumbers(distance, duration, elevation) ||
        !isPositive(distance, duration)
      )
        return alert('Data is not valid');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // add new object to workout array
    this.#workouts.push(workout);
    console.log(this.#workouts);

    // show workout on map as marker
    this._displayWorkout(workout);
    this._displayWorkoutOnSideBar(workout);

    // here we clean input values for next marker
    this._hideForm();

    // set local storage to all workouts
    this._setWorkoutsToLocalStorage();
  }

  _displayWorkout(workout) {
    // add marker upon click
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        // customizing popup window
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          // make className depends on type of workout
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃' : '🚵‍♂️'} ${workout.descripton}`
      )
      .openPopup();
  }

  _displayWorkoutOnSideBar(workout) {
    const workoutData =
      workout.type === 'running'
        ? `
        <div class="workout__details">
          <span class="workout__icon">📏⏱</span>
          <span class="workout__value">${workout.pace.toFixed(2)}</span>
          <span class="workout__unit">мин/км</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">👟⏱</span>
          <span class="workout__value">${workout.temp}</span>
          <span class="workout__unit">шаг/мин</span>
        </div>
      `
        : `
        <div class="workout__details">
            <span class="workout__icon">📏⏱</span>
            <span class="workout__value">${workout.speed.toFixed(2)}</span>
            <span class="workout__unit">км/ч</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🏔</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">м</span>
          </div>
      `;

    const itemForRender = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.descripton}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃' : '🚵‍♂️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">км</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">мин</span>
          </div>
          ${workoutData}
        </li>
      `;

    form.insertAdjacentHTML('afterend', itemForRender);
  }

  _moveToPopup(event) {
    const workoutEl = event.target.closest('.workout');

    if (!workoutEl) return;

    // find workout in array by id
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    // here we add translation to marker with animation
    this.#map.setView(workout.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  // set workouts to localStorage
  _setWorkoutsToLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getWorkoutsFromLocalStorage() {
    const savedWorkouts = JSON.parse(localStorage.getItem('workouts'));
    if (!savedWorkouts) return;

    this.#workouts = savedWorkouts;

    this.#workouts.forEach(workout => {
      this._displayWorkoutOnSideBar(workout);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}
