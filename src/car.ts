
import { CarControls, CarState  } from './internal-types';
import { Vehicle } from './vehicle';

export const DEFAULT_CONTROLLER = 'PhysXCar';

const DEFAULT_CAMERAS = [
  'front_center',
  'front_right',
  'front_left',
  'fpv',
  'back_center',
];

export class Car extends Vehicle {

  constructor(readonly name, controller = DEFAULT_CONTROLLER, pawnPath = '') {
    super(name, controller, pawnPath);
  }

  getState(): Promise<CarState> {
    return this._session.getCarState(this.name);
  }

  getControls(): Promise<CarControls> {
    return this._session.getCarControls(this.name);
  }

  setControls(controls: CarControls): Promise<void> {
    return this._session.setCarControls(controls, this.name) as Promise<void>;
  }

  getDefaultCameraNames(): Array<string> {
    return DEFAULT_CAMERAS;
  }
}
