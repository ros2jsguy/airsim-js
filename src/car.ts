
import { CollisionInfo, KinematicsState, Vehicle } from './vehicle';

export type CarState = {
  speed: number,
  gear: number,
  rpm: number,
  maxrpm: number,
  handbrake: boolean,
  collision: CollisionInfo,
  kinematics_estimated: KinematicsState,
  timestamp: number
}

export type CarControls = {
  throttle: number,
  steering: number,
  brake: number,
  handbrake: boolean,
  is_manual_gear: boolean,
  manual_gear: number,
  gear_immediate: boolean
}

export const DEFAULT_CAR_TYPE = 'PhysXCar';
export const DEFAULT_CAR = 'Car1';

// eslint-disable-next-line import/prefer-default-export
export class Car extends Vehicle {

  constructor(readonly name, type = DEFAULT_CAR_TYPE, pawnPath = '') {
    super(name, type, pawnPath);
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
}
