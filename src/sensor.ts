import { Pose, Quaternionr, Vector3r } from './math';

export type BarometerData = {
  timeStamp: number;
  altitude: Quaternionr;
  pressure: Vector3r;
  qnh: Vector3r;
}

export type DistanceSensorData = {
  timeStamp: number;
  distance: number;
  minDistance: number;
  maxDistance: number;
  relativePose: Pose;
}

export type ImuData = {
  timeStamp: number;
  orientation: Quaternionr;
  angularVelocity: Vector3r;
  linearAcceleration: Vector3r;
}

export type LidarData = {
  point_cloud: Array<number>;
  timeStamp: number;
  pose: Pose;
  segmentation: Array<number>;
}

export type MagnetometerData = {
  timeStamp: number;
  magneticFieldBody: Vector3r;
  magneticFieldCovariance: number;
}
