/* eslint-disable import/prefer-default-export */

import { Vector3 } from '@ros2jsguy/three-math-ts';
import { DEFAULT_YAW_MODE, DrivetrainType, MultirotorState, RotorStates, YawMode } from './internal-types';
import { Vector3r } from './math';
import { Vehicle } from './vehicle';

export const DEFAULT_CONTROLLER = 'SimpleFlight';

const DEFAULT_CAMERAS = [
  'front_center',
  'front_right',
  'front_left',
  'bottom_center',
  'back_center',
];

/*
 * The AirSim Multirotor (a.k.a. drone) vehicle.
 * Provides access to state and control api including high-level asynchronous task
 * such as:
 * @see takeOff()
 * @see hover()
 * @see land()
 * @see moveOnPath()
 * @see moveToZ()
 * @see moveToPosition()  and more. 
 */
export class Multirotor extends Vehicle {

  /**
   * Create a new instance.
   * @param name - The name of the vehicle.
   * @param controller - The vehicle controller, default = SimpleFlight
   * @param pawnPath - Vehicle blueprint path, when undefined
   *                   uses the default blueprint.
   */
  constructor(readonly name: string, controller = DEFAULT_CONTROLLER, pawnPath = '') {
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
   * The drone must be armed before it will fly.
   * Set arm to true to arm the drone. On some drones
   * arming may cause the motors to spin on low throttle,
   * this is normal.
   * @returns Promise<true> if successful.
   */
   arm(): Promise<boolean> {
    return this._session.armDisarm(true, this.name);
  }

  /**
   * This will disable the motors, so don't do that unless
   * the drone is on the ground! Arming the drone also sets
   * the "home position" This home position is local position
   * x=0,y=0,z=0. You can query what GPS location that is
   * via getHomeGeo().
   * @returns Promise<true> if successful.
   */
  disarm(): Promise<boolean> {
    return this._session.armDisarm(false, this.name);
  }

  /**
   * When armed you can tell the drone to takeoff. This will fly to a 
   * preset altitude of 3 metters above the home position. Once the
   * drone is safely in the air you can use other commands to fly from
   * there. If the drone is already flying takeoff will be ignored.
   * Pass non-zer max_wait_seconds if you want the method to also
   * wait until the takeoff altitude is achieved. 
   * @param timeoutSec - Timeout (seconds) for the vehicle to reach desired altitude.
   *                     A value of 0 implies no timeout.
   * @returns A boolean Promise
   */
  takeoff(timeoutSec = 20): Promise<boolean> {
    return this._session.takeoff(timeoutSec, '') as Promise<boolean>;
  }

  /**
   * Hover at the current x, y, and z. If the drone is moving when this is called,
   * it will try and move back to the location it was at when this command was
   * received and hover there.
   * @returns A void promise to await on.
   */
  hover(): Promise<void> {
    return this._session.hover(this.name);
  }

  /**
   * At any point this command will disable offboard
   * control and land the drone at the current GPS location
   * How quickly the drone descends is up to the drone. Some
   * models will descend slowly if they have no lidar telling
   * them how far it is to the ground, while others that can
   * see the ground will descend more quickly until they get
   * near the ground. None of that behavior is defined in this
   * API because it is depends on what kind of hardware the
   * drone has onboard. Pass non-zero timeoutSec if you
   * want the method to wait until the drone reports it
   * has landed, the timeout here is a bit tricky, depends on
   * how high you are and what the drone's configured descent
   * velocity is. If you don't want to wait pass zero. You
   * can also periodically check getLandedState() to see if it
   * has landed.
   * @param timeoutSec - Timeout (seconds) for the vehicle to land
   * @returns Promise<true> when successful
   */
  land(timeoutSec = 60): Promise<boolean> {
    return this._session.land(timeoutSec, this.name);
  }

  /**
   * Initiate a return-to-home, i.e. Launch location, task which must be
   * completed within timeoutSec. 
   * @param timeoutSec - Timeout (seconds) to complete task.
   * @returns Promise<true> if success
   */
  goHome(timeoutSec = 3e+38): Promise<boolean> {
    return this._session.goHome(timeoutSec, this.name) as Promise<boolean>;
  }

  /**
   * Initiate a task to follow a path consisting of waypoints.
   * @param waypoints - The 3d points for the path trajectory
   * @param velocity - The target speed (m/s)
   * @param timeoutSec - The maximum time (seconds) for this task to complete
   * @param drivetrain - The drivetrain mode to use
   * @param yawMode - The yaw configuration 
   * @param lookahead - How far to look ahead on the path (default -1 means auto)
   * @param adaptiveLookahead - Whether to apply adaptive lookahead (1=yes, 0=no)
   * @returns Promise<true> if successful completion
   */
  moveOnPath(waypoints: Array<Vector3>, velocity: number, timeoutSec = 3e+38,
            drivetrain = DrivetrainType.MaxDegreeOfFreedom, yawMode = DEFAULT_YAW_MODE,
            lookahead = -1, adaptiveLookahead = 1): Promise<unknown> {
      const waypoints3r: Vector3r[] = waypoints.map(pos => ( { x_val: pos.x, y_val: pos.y, z_val: pos.z } )); 
      return this._session.moveOnPath(
        waypoints3r, 
        velocity, 
        timeoutSec, 
        drivetrain, 
        yawMode, 
        lookahead,
        adaptiveLookahead,
        this.name);
  }

  /**
   * Initiate task to relocate vehile to a new 3D position
   * within timeoutSec.
   * @param position - The target position.
   * @param velocity - The velocity (m/s) by which to relocate.
   * @param timeoutSec - The maximum time (seconds) to complete this relocation.
   * @param drivetrain - The drivetrain mode to use 
   * @param yawMode - The rate of yaw maneuvering
   * @param lookahead - How far to look ahead on the path (default -1 means auto)
   * @param adaptiveLookahead - Whether to apply adaptive lookahead (1=yes, 0=no)
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
   * Initiate task to relocate vehile to a XY position with fixed Z (height) within
   * timeoutSec.
   * @param z - The target NED Z position (negative is up) in meters,.
   * @param velocity - The velocity m/s by which to relocate.
   * @param timeoutSec - The maximum time (seconds) to complete this relocation.
   * @param yawMode - The rate of yaw maneuvering
   * @param lookahead - How far to look ahead on the path (default -1 means auto)
   * @param adaptiveLookahead - Whether to apply adaptive lookahead (1=yes, 0=no)
   * @returns A Promise<void> to await on
   */
   moveToZ(
    z: number,
    velocity: number, 
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

  /**
   * Initiate task to relocate vehile to a XY position with fixed Z (height) within
   * timeoutSec.
   * @param latitude - Target latitude (North, South) coordinate.
   * @param longitude - Target longitude (East, West) coordinate.
   * @param altitude - Altitude in meters
   * @param velocity - The velocity m/s by which to relocate.
   * @param timeoutSec - The maximum time (seconds) to complete this relocation.
   * @param yawMode - The rate of yaw maneuvering
   * @param lookahead - How far (m) to look ahead on the path (default -1 means auto)
   * @param adaptiveLookahead - Whether to apply adaptive lookahead (1=yes, 0=no)
   * @returns A Promise<true> on successful completion.
   */
   moveToGPS(latitude: number, longitude: number, altitude: number,
      velocity, timeoutSec = 3e+38, drivetrain = DrivetrainType.MaxDegreeOfFreedom,
      yaw_mode = DEFAULT_YAW_MODE, lookahead = -1, adaptive_lookahead = 1,): Promise<boolean> {

    return this._session.moveToGPS(
              latitude,
              longitude,
              altitude,
              velocity,
              timeoutSec,
              drivetrain,
              yaw_mode,
              lookahead,
              adaptive_lookahead,
              this.name) as Promise<boolean>;
  }

  /**
   * Move by velocity to the world (NED) XYZ axes.
   * @param vx - Desired velocity in world (NED) X axis.
   * @param vy - Desired velocity in world (NED) Y axis.
   * @param vz - Desired velocityvin world (NED) Z axis.
   * @param duration -  Amount of time (seconds), to send this command.
   * @param drivetrain - The drivetrain mode to use.
   * @param yawMode - The rate (deg/sec) or angle (deg) of yaw maneuvering
   * @returns Promise<true> on success.
   */
  moveByVelocity(vx: number, vy: number, vz: number, duration: number,
      drivetrain = DrivetrainType.MaxDegreeOfFreedom, yawMode = DEFAULT_YAW_MODE): Promise<boolean> {

    return this._session.moveByVelocity(
      vx,
      vy,
      vz,
      duration,
      drivetrain,
      yawMode,
      this.name) as Promise<boolean>;
  }

  /**
   * Move by velocity to the world (NED) XY axes with fixed Z (NED) position.
   * @param vx - Desired velocity in world (NED) X axis.
   * @param vy - Desired velocity in world (NED) Y axis.
   * @param z - Desired Z position in world (NED) Z axis.
   * @param duration -  Amount of time (seconds), to send this command.
   * @param drivetrain - The drivetrain mode to use.
   * @param yawMode - The rate (deg/sec) or angle (deg) of yaw maneuvering
   * @returns Promise<true> on success.
  */
  moveByVelocityZ(vx: number, vy: number, z: number, duration: number,
        drivetrain = DrivetrainType.MaxDegreeOfFreedom, yawMode = DEFAULT_YAW_MODE): Promise<boolean> {

    return this._session.moveByVelocityZ(
      vx,
      vy,
      z,
      duration,
      drivetrain,
      yawMode,
      this.name) as Promise<boolean>;
  }

  /**
   * Move by velocity relative to the vehicle's XYZ axies.
   * @param vx - Desired velocity in the X axis of the vehicle's local NED frame.
   * @param vy - Desired velocity in the Y axis of the vehicle's local NED frame.
   * @param vz - Desired velocity in the Z axis of the vehicle's local NED frame.
   * @param duration -  Desired amount of time (seconds), to send this command.
   * @param drivetrain - The drivetrain mode to use.
   * @param yawMode - The rate (deg/sec) or angle (deg) of yaw maneuvering
   */
  moveByVelocityBodyFrame(vx: number, vy: number, vz: number, duration: number,
        drivetrain = DrivetrainType.MaxDegreeOfFreedom, yawMode = DEFAULT_YAW_MODE): Promise<boolean> {

    return this._session.moveByVelocityBodyFrame(
              vx,
              vy,
              vz,
              duration,
              drivetrain,
              yawMode,
              this.name);
  }

  /**
   * Move by velocity relative to the vehicle's XY axies at Z altitude.
   * @param vx - Desired velocity (m/s) in the X axis of the vehicle's local NED frame.
   * @param vy - Desired velocity (m/s) in the Y axis of the vehicle's local NED frame.
   * @param z - Desired Z position (m) in vehicle's local NED frame.
   * @param duration -  Desired amount of time (seconds), to send this command.
   * @param drivetrain - The drivetrain mode to use.
   * @param yawMode - The rate (deg/sec) or angle (deg) of yaw maneuvering
   */
   moveByVelocityZBodyFrame(vx: number, vy: number, z: number, duration: number,
       drivetrain = DrivetrainType.MaxDegreeOfFreedom, yawMode = DEFAULT_YAW_MODE): Promise<boolean> {

    return this._session.moveByVelocityZBodyFrame(
          vx,
          vy,
          z,
          duration,
          drivetrain,
          yawMode,
          this.name);
  }

  /**
   * Initiate rotation task to absolute yaw angle (deg) of home position in degrees.
   * @param yaw - angle in degrees 
   * @param timeoutSec - maximum time in seconds to complete manuever
   * @param margin - +/- allowable error in degrees
   * @returns Promise<true> on success
   */
  rotateToYaw(yaw: number, timeoutSec = 3e+38, margin = 5): Promise<unknown> {
    return this._session.rotateToYaw(yaw, timeoutSec, margin, this.name);
  }

  /**
   * Rotate the drone to the specified yaw rate while remaining
   * stationery at the current x, y, and z.
   * @param yawRate - rate in degrees/second
   * @param duration - length of time to apply this command
   * @returns Promise<true> on success
   */
  rotateByYawRate(yawRate: YawMode, duration: number ): Promise<boolean> {
        return this._session.rotateByYawRate(
                  yawRate, 
                  duration) as Promise<boolean>;
  }
}


// todo impl
// moveByManual
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
