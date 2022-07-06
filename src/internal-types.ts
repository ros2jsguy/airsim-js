/* eslint-disable import/no-cycle */

import { GeoPoint, Box2D, Box3D, Pose, Vector3r, Quaternionr, ProjectionMatrix } from './math';

export type RGBA = [number, number, number, number];

export type EnvironmentState = {
  position: Vector3r,
  geoPoint: GeoPoint,
  gravity: Vector3r,
  airPressure: number,
  temperature: number
  air_density: number
}

export enum WeatherParameter {
  Rain = 0,
  Roadwetness = 1,
  Snow = 2,
  RoadSnow = 3,
  MapleLeaf = 4,
  RoadLeaf = 5,
  Dust = 6,
  Fog = 7,
  Enabled = 8,
}

// TODO: convert to three.math
export type DetectionInfo = {
  name: string,
  geoPoint: GeoPoint,
  box2D: Box2D,
  box3D: Box3D,
  relativePose: Pose
}

export type CollisionInfo = {
  has_collided: boolean,
  normal: Vector3r,
  impact_point: Vector3r,
  position: Vector3r,
  penetration_depth: number,
  time_stamp: number
  object_name: string
  object_id: number
}

export type KinematicsState = {
  position: Vector3r,
  orientation: Quaternionr,
  linear_velocity: Vector3r,
  angular_velocity: Vector3r,
  linear_acceleration: Vector3r,
  angular_acceleration: Vector3r
}

export type CameraInfo = {
  pose: Pose,
  fov: number,
  proj_mat: ProjectionMatrix
  }

/**
 * 
 */
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

/**
 * Car control settings
 */
export type CarControls = {
  throttle: number,
  steering: number,
  brake: number,
  handbrake: boolean,
  is_manual_gear: boolean,
  manual_gear: number,
  gear_immediate: boolean
}

export const DEFAULT_CAR_CONTROLS: CarControls = {
  throttle: 0.0,
  steering: 0.0,
  brake: 0.0,
  handbrake: false,
  is_manual_gear: false,
  manual_gear: 0.0,
  gear_immediate: true
};

/**
 * Represents a multirotor landed/flying state
 */
export enum LandedState {
  Landed = 0,
  Flying = 1
}

/**
 * Defines 2 modes for Yaw setting, a rate (deg/s) or an angle (deg).
 */
export type YawMode = {
  /** A selector for specifying if yaw_or_rate is a angle (deg) or a rate (deg/s) */
  is_rate: boolean,

  /** The yaw rate (deg/s) or yaw position in degrees */
  yaw_or_rate: number
}

/** The default yaw mode is a rate of 0 deg/s */
export const DEFAULT_YAW_MODE: YawMode = {
  is_rate: true,
  yaw_or_rate: 0
};

/**
 * Specifies how a multirotor drivetrain can be used.
 */
export enum DrivetrainType {
  /** Enables yaw to be independent of direction of flight */
  MaxDegreeOfFreedom = 0,

  /** Locks yaw to the same direction as flight path. */
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

export type RotorStates = {
    timestamp: number,
    rotors: Array<unknown>
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
