/* eslint-disable import/no-cycle */

import { Box2, Box3, ColorName as ColorName3, Quaternion, Vector3 } from 'threejs-math';
import { Pose, Vector3r, Quaternionr, ProjectionMatrix, RawBox2, RawBox3, RawPose, RawProjectionMatrix } from './math';

export type RGBA = [number, number, number, number];

export type Color = RGBA | ColorName3;

export type CameraName = string | number;

export type RawCameraInfo = {
  pose: RawPose;
  fov: number;
  proj_mat: RawProjectionMatrix;
}

export type CameraInfo = {
  pose: Pose;
  fov: number;
  proj_mat: ProjectionMatrix;
}

export enum ImageType {
  Scene = 0,
  DepthPlanar = 1,
  DepthPerspective = 2,
  DepthVis = 3,
  DisparityNormalized = 4,
  Segmentation = 5,
  SurfaceNormals = 6,
  Infrared = 7,
  OpticalFlow = 8,
  OpticalFlowVis = 9,
};

export type ImageRequest = {
  camera_name?: CameraName;
  image_type: ImageType;
  pixels_as_float: boolean;
  compress: boolean;
}

export type ImageResponse = {
  image_data_uint8: Uint8Array;
  image_data_float: number;
  camera_position: Vector3r;
  camera_orientation: Quaternionr;
  time_stamp: number;
  message: string;
  pixel_as_floatloat: number;
  compress: boolean;
  width: number
  height: number;
  imagType: ImageType;
}

export type GeoPoint = {
  latitude: number;
  longitude: number;
  altitude: number;
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

/**
 * Defines the object detection criteria 
 */
export type DetectionSearch =  {
  /**
   * Name of the camera, for backwards compatibility, 
   * ID numbers such as 0,1,etc. can also be used
   */
  cameraName: string;

  /**
   * The type of camera image to search for the meshName.
   */
  imageType: ImageType;

  /**
   * A regex pattern identifying the target object mesh to search. 
   */
  meshName: string;

  /**
   * The maximum radius from the camera to the target mesh object in centimeters 
   */
  radius?: number;
}

export type RawDetectionInfo = {
  name: string;
  geo_point: GeoPoint;
  box2D: RawBox2;
  box3D: RawBox3;
  relative_pose: RawPose;
}

/**
 * An object detection result.
 */
export type DetectionInfo = {
  name: string; /** The name of the target object */
  geo_point: GeoPoint; /** The global point of the detection. */
  box2D: Box2; /** 2D bounding box */
  box3D: Box3; /** 3D bounding box */
  relative_pose: Pose; /** The detection relative to the camera pose */
}

export type RawCollisionInfo = {
  has_collided: boolean;
  normal: Vector3r;
  impact_point: Vector3r;
  position: Vector3r;
  penetration_depth: number;
  time_stamp: number;
  object_name: string;
  object_id: number;
}

export type CollisionInfo = {
  has_collided: boolean;
  normal: Vector3;
  impact_point: Vector3;
  position: Vector3;
  penetration_depth: number;
  time_stamp: number;
  object_name: string;
  object_id: number;
}

export type RawKinematicsState = {
  position: Vector3r;
  orientation: Quaternionr;
  linear_velocity: Vector3r;
  angular_velocity: Vector3r;
  linear_acceleration: Vector3r;
  angular_acceleration: Vector3r;
}

export type KinematicsState = {
  position: Vector3;
  orientation: Quaternion;
  linear_velocity: Vector3;
  angular_velocity: Vector3;
  linear_acceleration: Vector3;
  angular_acceleration: Vector3;
}

export type RawEnvironmentState = {
  position: Vector3r;
  geo_point: GeoPoint;
  gravity: Vector3r;
  air_pressure: number;
  temperature: number;
  air_density: number;
}

export type EnvironmentState = {
  position: Vector3;
  geo_point: GeoPoint;
  gravity: Vector3;
  air_pressure: number;
  temperature: number;
  air_density: number;
}

/**
 * 
 */
export type CarState = {
  speed: number;
  gear: number;
  rpm: number;
  maxrpm: number;
  handbrake: boolean;
  collision: CollisionInfo;
  kinematics_estimated: KinematicsState;
  timestamp: number;
}

/**
 * Car control settings
 */
export type CarControls = {
  throttle: number; /** 0.0 - 1.0 */ // TODO: what does -0.5 mean wrt to 
  steering: number; /** -1.0 to 1.0, left to right */
  brake: number; /** 0.0 - 1.0 */
  handbrake: boolean; /** true = apply handbrake */
  is_manual_gear: boolean; /** true imples use manual_gear property */
  manual_gear: number; /** -1 to 5, 0 = neutral */
  gear_immediate: boolean;
}

export const DEFAULT_CAR_CONTROLS: CarControls = {
  throttle: 0.0,
  steering: 0.0,
  brake: 0.0,
  handbrake: false,
  is_manual_gear: false,
  manual_gear: 0,
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
  is_rate: boolean;

  /** The yaw rate (deg/s) or yaw position in degrees */
  yaw_or_rate: number;
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
  timestamp: number;
  pitch: number;
  roll: number;
  throttle: number;
  yaw: number;
  switch1: number;
  switch2: number;
  switch3: number;
  switch4: number;
  switch5: number;
  switch6: number;
  switch7: number;
  switch8: number;
  is_initialized: boolean;
  is_valid: boolean;
}

export type RotorStates = {
    timestamp: number;
    rotors: Array<unknown>;
}

export type MultirotorState = {
  collision: CollisionInfo;
  kinematics_estimated: KinematicsState;
  gps_location: GeoPoint;
  timestamp: number;
  landed_state: LandedState;
  rc_data: RCData;
  ready: boolean;
  ready_message: string;
  can_arm: boolean;
}
