
/* eslint-disable @typescript-eslint/no-unused-vars */

// import { Camera } from './camera';
import { GeoPoint, Box2D, Box3D, Pose, Vector3r, Quaternionr, MathConverter, Pose3 } from './math';
import { DistanceSensorData, LidarData } from './sensor';
import { Session } from './session';

// TODO: convert to three.math
export type DetectionInfo = {
  name: string,
  geoPoint: GeoPoint,
  box2D: Box2D,
  box3D: Box3D,
  relativePose: Pose
}

// TODO: convert to three.math
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

// TODO: convert to three.math
export type KinematicsState = {
  position: Vector3r,
  orientation: Quaternionr,
  linear_velocity: Vector3r,
  angular_velocity: Vector3r,
  linear_acceleration: Vector3r,
  angular_acceleration: Vector3r
}

export class Vehicle  {
  // implements CameraManager {

  _session: Session;

  // private _cameraManager: CameraManagerImpl;

  /**
   * Create vehicle
   * @param name - Name of the vehicle being created
   * @param type - Type of vehicle, e.g. "simpleflight"
   * @param pawnPath - Vehicle blueprint path, default empty wbich uses the
   *                    default blueprint for the vehicle type
   * @returns Whether vehicle was created
   */
  // eslint-disable-next-line no-useless-constructor
  constructor(readonly name, readonly type = '', readonly pawnPath = '') {
  }

  /**
   * Arms or disarms vehicle
   * @param arm - True to arm, False to disarm the vehicle
   * @param vehicleName - Name of the vehicle to send this command to
   * @returns Success
   */
  arm(): Promise<boolean> {
    return this._session.armDisarm(true, this.name);
  }

  /**
   * Arms or disarms vehicle
   * @param arm - True to arm, False to disarm the vehicle
   * @param vehicleName - Name of the vehicle to send this command to
   * @returns Success
   */
  disarm(): Promise<boolean> {
    return this._session.armDisarm(false, this.name);
  }

  /**
   * Enables API control for vehicle corresponding to vehicle_name
   * @returns A void promise to await on.
   */
  enableApiControl(): Promise<void> {
    return this._session.enableApiControl(true, this.name);
  }

  /**
   * Disables API control for vehicle
   * @returns A void promise to await on.
   */
  disableApiControl(): Promise<void> {
    return this._session.enableApiControl(false, this.name);
  }

  /**
   * Returns true if API control is established.
   * @param vehicleName - Name of the vehicle
   * @returns If API control is enabled
   */
  isApiControlEnabled(): Promise<boolean> {
    return this._session.isApiControlEnabled(this.name);
  }

  /**
   * 
   * @param vehicleName 
   * @returns 
   */
  async getPose(): Promise<Pose3> {
    const pose = await this._session.simGetVehiclePose(this.name);
    return MathConverter.toPose3(pose);
  }

  /**
   * 
   * @param pose 
   * @param ignorecollision 
   * @returns 
   */
  setPose(pose: Pose3, ignorecollision = true): Promise<unknown> {
    return this._session.simSetVehiclePose(
            MathConverter.toPose(pose),
            ignorecollision,
            this.name);
  }

  /**
   * 
   * @param vehicleName 
   * @returns 
   */
  getHome() : Promise<GeoPoint> {
    return this._session.getHomeGeoPoint(this.name);
  }

  /**
   * 
   * @param point 
   * @param vehicleName 
   * @returns 
   */
  testLineOfSightToPoint(point: GeoPoint): Promise<boolean> {
    return this._session.simTestLineOfSightToPoint(point, this.name);
  }

  /**
   * 
   * @param vehicleName 
   * @returns 
   */
  getCollisionInfo(): Promise<CollisionInfo> {
    return this._session.simGetCollisionInfo(this.name);
  }

    /**
   * Control the pose of a selected camera
   * @param cameraName - Name of the camera to be controlled
   * @param pose - Pose representing the desired position and orientation of the camera
   * @param vehicleName - Name of vehicle which the camera corresponds to
   * @param external - Whether the camera is an External Camera
   * @returns A void promise to await on.
   */
  setCameraPose(cameraName: string, pose3: Pose3): Promise<void> {
    return this._session
              .simSetCameraPose(
                  cameraName,
                  MathConverter.toPose(pose3),
                  this.name,
                  false);
  }
  
  /**
   * Get a single image
   * @param cameraName - Name of the camera, for backwards compatibility, ID numbers such as 0,1,etc. can also be used
   * @param imageType - Type of image required
   * @param vehicleName - Name of the vehicle with the camera
   * @param external - Whether the camera is an External Camera
   * @returns Binary string literal of compressed png image
   */
  getImage(cameraName: string, imageType = 0): Promise<unknown> {
    return this._session.simGetImage(cameraName, imageType, this.name, false);
  }
  
  /**
   * Get multiple images
   * See https://microsoft.github.io/AirSim/image_apis/ for details and examples
   * @param requests (list[ImageRequest]): Images required
   * @param vehicleName - Name of vehicle associated with the camera
   * @param external - Whether the camera is an External Camera
   * @returns list[ImageResponse]
   */
  // simGetImages(requests: ArrayLike<ImageRequest>, vehicleName = '', external = false): Promise<unknown> {
  //   const responsesRaw = this.client.call('simGetImages', requests, vehicleName, external);
  //   return [ImageResponse(response_raw) for response_raw in responses_raw]
  // }

  /**
   * Access distance sensor data.
   * @param distanceSensorName - Name of Distance Sensor to get data from, specified in settings.json
   * @param vehicleName - Name of vehicle to which the sensor corresponds to
   * @returns The distance data
   */
  getDistanceSensorData(distanceSensorName = ''): Promise<DistanceSensorData> {
    return this._session.getDistanceSensorData(distanceSensorName, this.name);
  }
  
  /**
   * 
   * @param lidarName 
   * @param vehicleName 
   * @returns 
   */
  getLidarData(lidarName = ''): Promise<LidarData> {
    return this._session.getLidarData(lidarName, this.name) as Promise<LidarData>;
  }

}