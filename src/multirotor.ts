/* eslint-disable import/prefer-default-export */

import { Vector3 } from '@ros2jsguy/three-math-ts';
import { DEFAULT_YAW_MODE, DrivetrainType, MultirotorState, RotorStates } from './internal-types';
import { Vehicle } from './vehicle';

export const DEFAULT_CONTROLLER = 'SimpleFlight';

const DEFAULT_CAMERAS = [
  'front_center',
  'front_right',
  'front_left',
  'bottom_center',
  'back_center',
];

export class Multirotor extends Vehicle {

  constructor(readonly name, controller = DEFAULT_CONTROLLER, pawnPath = '') {
    super(name, controller, pawnPath);
  }

  /**
   * The position inside the returned MultirotorState is in the frame of the vehicle's starting point
   * @returns The drone state
   */
  getState(): Promise<MultirotorState> {
    return this._session.getMultirotorState(this.name);
  }

  /**
   * Obtain the current state of all a multirotor's rotors. The state includes the speeds,
        thrusts and torques for all rotors.
   * @param vehicleName - Vehicle to get the rotor state of
   * @returns RotorStates containing a timestamp, the speed, thrust and torque of all rotors
   */
  getRotorStates(): Promise<RotorStates> {
    return this._session.getRotorStates(this.name);
  }

   /**
   * Get details about the vehicle camera.
   * 
   * Note if the cameraName is unknown to airsim, the server may crash.
   * @param cameraName - Name of the camera, for backwards compatibility,
   *                     ID numbers such as 0,1,etc. can also be used
   * @returns A CameraInfo promise
   */
  getDefaultCameraNames(): Array<string> {
    return DEFAULT_CAMERAS;
  }

  /**
   * Takeoff vehicle to 3m above ground. Vehicle should not be moving when this API is used
   * @param timeoutSec - Timeout for the vehicle to reach desired altitude
   * @returns A boolean Promise
   */
  takeoff(timeoutSec = 20): Promise<boolean> {
    return this._session.takeoff(timeoutSec, this.name) as Promise<boolean>;
  }

  /**
   * Hover vehicle now.
   * @returns A void promise to await on.
   */
  hover(): Promise<void> {
    return this._session.hover(this.name);
  }

  /**
   * Land the vehicle.
   * @param timeoutSec - Timeout for the vehicle to land
   * @param vehicleName - Name of the vehicle to send this command to
   * @returnsA boolean Promise
   */
  land(timeoutSec = 60): Promise<boolean> {
    return this._session.land(timeoutSec, this.name);
  }

  /**
   * Return vehicle to Home i.e. Launch location
   * @param timeoutSec - Timeout for the vehicle to return home
   * @param vehicleName - Name of the vehicle to send this command to
   * @returns Promise
   */
  goHome(timeoutSec = 3e+38): Promise<boolean> {
    return this._session.goHome(timeoutSec, this.name) as Promise<boolean>;
  }

  /**
   * Move vehile to position.
   * @param position - The target position.
   * @param velocity - The velocity by which to relocate.
   * @param timeoutSec - The maximum time to complete this relocation.
   * @param drivetrain - Limits not to exceed on the drivetrain 
   * @param yawMode - The rate of yaw maneuvering
   * @param lookahead - not sure atm - todo
   * @param adaptiveLookahead - not sure at - todo
   * @returns A void promise to await on
   */
  moveToPosition(position: Vector3, velocity: number, 
    timeoutSec = 3e+38,
    drivetrain = DrivetrainType.MaxDegreeOfFreedom, 
    yawMode = DEFAULT_YAW_MODE, 
    lookahead = -1,
    adaptiveLookahead = 1): Promise<void> {
      return this._session.moveToPosition(
        position.x, position.y, position.z,
        velocity,
        timeoutSec,
        drivetrain,
        yawMode,
        lookahead,
        adaptiveLookahead,
        this.name);
  }

  /**
   * Move vehile to position.
   * @param z - The target Z position.
   * @param velocity - The velocity by which to relocate.
   * @param timeoutSec - The maximum time to complete this relocation.
   * @param yawMode - The rate of yaw maneuvering
   * @param lookahead - not sure atm - todo
   * @param adaptiveLookahead - not sure at - todo
   * @returns A void promise to await on
   */
   moveToZ(z: number, velocity: number, 
    timeoutSec = 3e+38, 
    yawMode = DEFAULT_YAW_MODE, 
    lookahead = -1,
    adaptiveLookahead = 1): Promise<void> {
      return this._session.moveToZ(
        z,
        velocity,
        timeoutSec,
        yawMode,
        lookahead,
        adaptiveLookahead,
        this.name);
  }
}


// todo impl
// moveByVelocityBodyFrame
// moveByVelocityZBodyFrame
// moveByAngleZ - deprecated
// moveByAngleThrottle - deprecated
// moveByVelocity
// moveByVelocityZ
// moveOnPath
// moveToGPS
// moveByManual
// rotateToYaw
// rotateByYawRate
// moveByRC
//
// --- low level api ---
// moveByMotorPWMsAsync
//  moveByRollPitchYawZAsync
// moveByRollPitchYawThrottleAsync
// moveByRollPitchYawrateThrottleAsync
// moveByRollPitchYawrateZAsync
// moveByAngleRatesZAsync
//  moveByAngleRatesThrottleAsync
// setAngleRateControllerGains
// setAngleLevelControllerGains
// setVelocityControllerGains
// setPositionControllerGains
