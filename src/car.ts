/* eslint-disable import/prefer-default-export */

import { CarControls, CarState  } from './internal-types';
import { Vehicle } from './vehicle';

const DEFAULT_CAMERAS = [
  'front_center',
  'front_right',
  'front_left',
  'fpv',
  'back_center',
];

/**
 * The AirSim Car vehicle.
 * Provides access to car state and control api.
 */
export class Car extends Vehicle {

  /**
   * Create a new car instance.
   * @param name - Unique vehicle name
   * @param controller - Type of vehicle, default = PhysXCar
   * @param pawnPath - Vehicle blueprint path, when undefined
   *                   uses the default blueprint for cars, PhysXCar
   */
  constructor(readonly name: string, controller = Car.DEFAULT_CONTROLLER, pawnPath = '') {
    super(name, controller, pawnPath);
  }

  /**
   * Access the default controller (e.g., flight controller) of the vehicle.
   */
  static get DEFAULT_CONTROLLER(): string | undefined {
      return 'PhysXCar';
  }

  /**
   * Get the car's state
   * @returns Promise<CarState>
   */
  getState(): Promise<CarState> {
    return this._session.getCarState(this.name);
  }

  /**
   * Get the current car control settings.
   * @returns Promise<CarControls>
   */
  getControls(): Promise<CarControls> {
    return this._session.getCarControls(this.name);
  }

  /**
   * Command the car with a new set of control settings.
   * @param controls - The new settings.
   * @returns A Promise<void> to await on.
   */
  setControls(controls: CarControls): Promise<void> {
    return this._session.setCarControls(controls, this.name) as Promise<void>;
  }

  /**
   * Get the names of the default cameras.
   * @returns A Promise<string[]> of camera names.
   */
  getDefaultCameraNames(): Array<string> {
    return DEFAULT_CAMERAS;
  }
}
