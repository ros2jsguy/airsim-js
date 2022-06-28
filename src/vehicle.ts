/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-cycle */
/* eslint-disable no-useless-constructor */
/* eslint-disable @typescript-eslint/no-unused-vars */


import { ImageRequest, ImageResponse, ImageType } from './image';
import { CameraInfo, CollisionInfo, RGBA } from './internal-types';
import { GeoPoint, MathConverter, Pose3 } from './math';
import { BarometerData, DistanceSensorData, ImuData, LidarData, MagnetometerData } from './sensor';
import { Session } from './session';

export class Vehicle  {

  _session: Session;

  /**
   * Create vehicle
   * @param name - Name of the vehicle being created
   * @param flightController - Type of vehicle, e.g. "simpleflight"
   * @param pawnPath - Vehicle blueprint path, default empty wbich uses the
   *                    default blueprint for the vehicle type
   * @returns Whether vehicle was created
   */
  constructor(readonly name, readonly controller = '', readonly pawnPath = '') {
  }

  getDefaultCameraNames(): Array<string> {
    return [];
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
   * Modify the color and thickness of the line when tracing is enabled.
   * Tracing can be enabled by pressing T in the Editor or
   * setting `EnableTrace` to `True` in the Vehicle Settings
   * @param color - the RGBA color
   * @param thickness - 
   */
  setTraceLine(color: RGBA, thickness = 1.0): Promise<void> {
    return this._session.simSetTraceLine(color, thickness, this.name);
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
   * Get details about the vehicle camera.
   * 
   * Note if the cameraName is unknown to airsim, the server may crash.
   * @param cameraName - Name of the camera, for backwards compatibility,
   *                     ID numbers such as 0,1,etc. can also be used
   * @returns A CameraInfo promise
   */
   getCameraInfo(cameraName: string | number): Promise<CameraInfo> {
    return this._session.simGetCameraInfo(cameraName, this.name, true);
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
  getImage(cameraName: string, imageType = ImageType.Scene): Promise<unknown> {
    return this._session.simGetImage(cameraName, imageType, this.name, false);
  }
  
  /**
   * Get multiple images
   * See https://microsoft.github.io/AirSim/image_apis/ for details and examples
   * @param requests - Images required
   * @returns The ImageResponse(s)
   */
  getImages(requests: Array<ImageRequest>): Promise<Array<ImageResponse>> {
    return this._session.simGetImages(requests, this.name, false);
  }

  /**
   * Access distance sensor data.
   * @param distanceSensorName - Name of distance sensor to get data from, specified in settings.json
   * @returns The distance data
   */
  getDistanceSensorData(distanceSensorName = ''): Promise<DistanceSensorData> {
    return this._session.getDistanceSensorData(distanceSensorName, this.name);
  }
  
  /**
   * Access the data from a LIDAR sensor.
   * @param lidarName - Name of IMU to get data from, specified in settings.json
   * @returns The LIDAR sensor data
   */
  getLidarData(lidarName = ''): Promise<LidarData> {
    return this._session.getLidarData(lidarName, this.name) as Promise<LidarData>;
  }

  /**
   * Access the data from an IMU sensor.
   * @param imuName - Name of IMU to get data from, specified in settings.json
   * @returns The IMU sensor data
   */
  getImuData(imuName = ''): Promise<ImuData> {
    return this._session.getImuData(imuName, this.name) as Promise<ImuData>;
  }

  /**
   * Access the data from an magnetometer sensor.
   * @param magnetometerName - Name of Magnetometer to get data from, specified in settings.json
   * @returns The magnetometer sensor data
   */
  getMagnetometerData(magnetometerName = ''): Promise<MagnetometerData> {
    return this._session.getMagnetometerData(magnetometerName, this.name);
  }

  /**
   * Access the data from an barometer sensor.
   * @param barometerName - Name of barometer to get data from, specified in settings.json
   * @returns The barometer sensor data
   */
  getBarometerData(barometerName = ''): Promise<BarometerData> {
    return this._session.getBarometerData(barometerName, this.name);
  }

}

// todo impl
// getGpsData