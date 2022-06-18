import { GeoPoint } from '../src/math';
import { CollisionInfo, KinematicsState, Vehicle } from '../src/vehicle';


export enum LandedState {
  Landed = 0,
  Flying = 1
}

export type YawMode = {
is_rate: boolean,
yaw_or_rate: number
}

export enum DrivetrainType {
  MaxDegreeOfFreedom = 0,
  ForwardOnly = 1
}

export type RCData = {
  timestamp: number,
  pitch: number,
  roll: number,
  throttle: number,
  yaw: number, 
  switch1: number,
  switch2: number,
  switch3: number,
  switch4: number,
  switch5: number,
  switch6: number,
  switch7: number,
  switch8: number,
  is_initialized: boolean,
  is_valid: boolean
}

export type MultirotorState = {
  collision: CollisionInfo,
  kinematics_estimated: KinematicsState,
  gps_location: GeoPoint
  timestamp: number, 
  landed_state: LandedState,
  rc_data: RCData,
  ready: boolean,
  ready_message: string,
  can_arm: boolean
}

export type RotorStates = {
    timestamp: number,
    rotors: Array<unknown>
}



// eslint-disable-next-line import/prefer-default-export
export class Multirotor extends Vehicle {

  /**
   * The position inside the returned MultirotorState is in the frame of the vehicle's starting point
   * @param vehicleName - Vehicle to get the state of
   * @returns The drone state
   */
  getState(): Promise<MultirotorState> {
    return this._session.call('getMultirotorState', this.name) as Promise<MultirotorState>;
  }

  /**
   * Obtain the current state of all a multirotor's rotors. The state includes the speeds,
        thrusts and torques for all rotors.
   * @param vehicleName - Vehicle to get the rotor state of
   * @returns RotorStates containing a timestamp and the speed, thrust and torque of all rotors
   */
  getRotorStates(): Promise<RotorStates> {
    return this._session.call('getRotorStates', this.name) as Promise<RotorStates>;
  }

  /**
   * Takeoff vehicle to 3m above ground. Vehicle should not be moving when this API is used
   * @param timeoutSec - Timeout for the vehicle to reach desired altitude
   * @param vehicleName - Name of the vehicle to send this command to
   * @returns Promise
   */
  takeoff(timeoutSec = 20): Promise<boolean> {
    return this._session.call('takeoff', timeoutSec, this.name) as Promise<boolean>;
  }

  /**
   * Land the vehicle.
   * @param timeoutSec - Timeout for the vehicle to land
   * @param vehicleName - Name of the vehicle to send this command to
   * @returns Promise
   */
  land(timeoutSec = 60): Promise<boolean> {
    return this._session.call('land', timeoutSec, this.name) as Promise<boolean>;
  }

  /**
   * Return vehicle to Home i.e. Launch location
   * @param timeoutSec - Timeout for the vehicle to return home
   * @param vehicleName - Name of the vehicle to send this command to
   * @returns Promise
   */
  goHome(timeoutSec = 3e+38): Promise<boolean> {
    return this._session.call('goHome', timeoutSec, this.name) as Promise<boolean>;
  }

  moveToPosition(x: number, y: number, z: number, velocity: number, 
    timeoutSec = 3e+38, drivetrain = DrivetrainType.MaxDegreeOfFreedom, 
    yawMode: YawMode = { is_rate: true, yaw_or_rate: 0 }, 
    lookahead = -1,
    adaptiveLookahead = 1): Promise<boolean> {
// TODO simplify args -> convert to options
      return this._session.call(
        'moveToPosition', 
        x, y, z,
        velocity,
        timeoutSec,
        drivetrain,
        yawMode,
        lookahead,
        adaptiveLookahead,
        this.name) as Promise<boolean>;

    }
  
}
