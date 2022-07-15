/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-cycle */
/* eslint-disable no-useless-constructor */
/* eslint-disable @typescript-eslint/no-unused-vars */


import { ImageRequest, ImageResponse, ImageType } from './image';
import { CameraInfo, CollisionInfo, DetectionInfo, DetectionSearch, EnvironmentState, GeoPoint, KinematicsState, RawKinematicsState, RGBA } from './internal-types';
import { MathConverter, Pose } from './math';
import { BarometerData, DistanceSensorData, ImuData, LidarData, MagnetometerData } from './sensor';
import { Session } from './session';

/**
 * The base class for AirSim vehicles providing access to a vehicle's
 * state, position, orientation, sensor data, cameras and images, collision
 * info and visibility to points test. 
 */
export class Vehicle  {

  /** The low-level AirSim api and network connection. */
  _session: Session;

  /**
   * Create vehicle
   * @param name - Name of the vehicle being created
   * @param flightController - Type of vehicle, e.g. "simpleflight"
   * @param pawnPath - Vehicle blueprint path, default empty wbich uses the
   *                    default blueprint for the vehicle type
   */
  constructor(readonly name: string, readonly controller = '', readonly pawnPath = '') {
  }

  /**
   * Access the names of the default cameras.
   * @see {@link https://microsoft.github.io/AirSim/image_apis/#available_cameras|default cameras}
   * @returns The camera names for this type of vehicle.
   */
  getDefaultCameraNames(): Array<string> {
    return [];
  }

  /**
   * Enables API control.
   * @returns A Promise<void> to await on.
   */
  enableApiControl(): Promise<void> {
    return this._session.enableApiControl(true, this.name);
  }

  /**
   * Disables API control.
   * @returns A Promise<void> to await on.
   */
  disableApiControl(): Promise<void> {
    return this._session.enableApiControl(false, this.name);
  }

  /**
   * Returns true if API control is established.
   * @returns Promise<true> if API is enabled.
   */
  isApiControlEnabled(): Promise<boolean> {
    return this._session.isApiControlEnabled(this.name);
  }

  /**
   * Access the vehicle's Pose
   * @returns The vehicle pose.
   */
  async getPose(): Promise<Pose> {
    const rawPose = await this._session.simGetVehiclePose(this.name);
    return MathConverter.toPose(rawPose);
  }

  /**
   * Set the pose of the vehicle.
   * @param pose - The new pose.
   * @param ignorecollision - Whether to ignore any collision or not
   * @returns A Promise<void> to await on.
   */
  setPose(pose: Pose, ignorecollision = true): Promise<void> {
    return this._session.simSetVehiclePose(
            MathConverter.toRawPose(pose),
            ignorecollision,
            this.name);
  }

  /**
   * Set the kinematics state of the vehicle
   * If you don't want to change position (or orientation) then just set components of position (or orientation) to floating point nan values
   * @param state -  Desired Pose pf the vehicle
   * @param ignoreCollision - Whether to ignore any collision or not
   */
   setKinematics(state: KinematicsState, ignoreCollision: boolean): Promise<void> {
    const rawState: RawKinematicsState =  {
      position: MathConverter.toVector3r(state.position),
      orientation: MathConverter.toQuaternionr(state.orientation),
      linear_velocity: MathConverter.toVector3r(state.angular_velocity),
      angular_velocity: MathConverter.toVector3r(state.angular_velocity),
      linear_acceleration: MathConverter.toVector3r(state.linear_acceleration),
      angular_acceleration: MathConverter.toVector3r(state.angular_acceleration)
    };
    return this._session.simSetKinematics(rawState, ignoreCollision, this.name);
  }

  /**
   * Get ground-truth kinematics of the vehicle
   * The position inside the returned KinematicsState is in the frame of the vehicle's starting point
   * @returns  Ground truth of the vehicle
   */
  async getGroundTruthKinematics(): Promise<KinematicsState> {
    const rawState = await this._session.simGetGroundTruthKinematics(this.name);
    return {
      position: MathConverter.toVector3(rawState.position),
      orientation: MathConverter.toQuaternion(rawState.orientation),
      linear_velocity: MathConverter.toVector3(rawState.angular_velocity),
      angular_velocity: MathConverter.toVector3(rawState.angular_velocity),
      linear_acceleration: MathConverter.toVector3(rawState.linear_acceleration),
      angular_acceleration: MathConverter.toVector3(rawState.angular_acceleration)
    };
  }

  /**
   * Get ground truth environment state
   * The position inside the returned EnvironmentState is in the frame of the vehicle's starting point
   * @returns  Ground truth environment state
   */
  async getGroundTruthEnvironment(): Promise<EnvironmentState> {
    const groundTruth = await this._session.simGetGroundTruthEnvironment(this.name);
    return {
      ...groundTruth,
      position: MathConverter.toVector3(groundTruth.position),
      gravity: MathConverter.toVector3(groundTruth.gravity),
    };
  }
  
  /**
   *Get the Home NED-frame location (north, east, down) of the vehicle.
   * @returns The Home location of the vehicle
   */
  getHome() : Promise<GeoPoint> {
    return this._session.getHomeGeoPoint(this.name);
  }

  /**
   * Returns whether the target point is visible from the perspective of the vehicle
   * @param point - Target point
   * @returns Promise<true> if target point is visible.
   */
  testLineOfSightToPoint(point: GeoPoint): Promise<boolean> {
    return this._session.simTestLineOfSightToPoint(point, this.name);
  }

  /**
   * Modify the color and thickness of the line when tracing is enabled.
   * Tracing can be enabled by pressing T in the Editor or
   * setting `EnableTrace` to `True` in the Vehicle Settings
   * @param color - the RGBA color
   * @param thickness - Thickness of the line
   * @returns A Promise<void> to await on.
   */
  setTraceLine(color: RGBA, thickness = 1.0): Promise<void> {
    return this._session.simSetTraceLine(color, thickness, this.name);
  }

  /**
   * Get the vehicle's collision state.
   * @returns The collision state info.
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
    return this._session.simGetCameraInfo(cameraName, this.name, false);
  }

  /**
   * Control the pose of a selected camera
   * @param cameraName - Name of the camera to be controlled
   * @param pose - Pose representing the desired position and orientation of the camera
   * @param vehicleName - Name of vehicle which the camera corresponds to
   * @param external - Whether the camera is an External Camera
   * @returns A void promise to await on.
   */
  setCameraPose(cameraName: string, pose: Pose): Promise<void> {
    return this._session
              .simSetCameraPose(
                  cameraName,
                  MathConverter.toRawPose(pose),
                  this.name,
                  false);
  }
  
  /**
   * Get a single image in compressed PNG format.
   * @param cameraName - Name of the camera, for backwards compatibility, ID numbers such as 0,1,etc. can also be used
   * @param imageType - Type of image
   * @param vehicleName - Name of the vehicle with the camera
   * @returns Promise<Uint8Array> of compressed png image data
   */
  getImage(cameraName: string, imageType = ImageType.Scene): Promise<Uint8Array> {
    return this._session.simGetImage(
      cameraName,
      imageType,
      this.name,
      false) as Promise<Uint8Array>;
  }
  
  /**
   * Get multiple images
   * @see @link {https://microsoft.github.io/AirSim/image_apis|image discussion} for details and examples
   * @param requests - Images required
   * @returns The ImageResponse(s)
   */
  getImages(requests: Array<ImageRequest>): Promise<Array<ImageResponse>> {
    return this._session.simGetImages(requests, this.name, false);
  }

  /**
   * Configure a camera to perform a computer vision search and detection of 
   * specific mesh object(s). 
   * @param search - The search details
   * @returns A Promise<void> to await on
   * 
   * @example
   * Example for detecting all instances named "Car_*"
   * ```
   * startDetectionSearch(
   *   {
   *     camera: 'front_center',
   *     image_type: ImageType.Scene,
   *     meshName: 'Car_*'
   *   }
   * );
   * ```
   */
  async startDetectionSearch(search: DetectionSearch): Promise<void> {
    return this._session.simAddDetectionFilterMeshName(
              search.cameraName,
              search.imageType,
              search.meshName,
              this.name,
              false)
            .then( () => {
              if (search.radius) {
                this._session.simSetDetectionFilterRadius(
                  search.cameraName,
                  search.imageType,
                  search.radius,
                  this.name,
                  false);
              }
            });
  }

  /**
   * Find the detections in the camera field of view defined by the search details
   * @returns Array of object detections
   */
  async findDetections(search: DetectionSearch): Promise<Array<DetectionInfo>> {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detections: Array<any> =
      await this._session.simGetDetections(
        search.cameraName,
        search.imageType,
        this.name,
        false);

    detections.forEach( detection => {
      // eslint-disable-next-line no-param-reassign
      detection.box2D =  MathConverter.toBox2(detection.box2D);
      // eslint-disable-next-line no-param-reassign
      detection.box3D =  MathConverter.toBox3(detection.box3D);
      // eslint-disable-next-line no-param-reassign
      detection.relative_pose = MathConverter.toPose(detection.relative_pose);
    });

    return detections as Array<DetectionInfo>;
  }

  /**
   * Clear a detection search
   * @returns A Promise<void> to await on
   */
  clearDetectionSearch(search: DetectionSearch): Promise<void> {
    return this._session.simClearDetectionMeshNames(
        search.cameraName,
        search.imageType,
        this.name,
        false) as Promise<void>;
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

  /**
   * Terminate the current task execution.
   * @returns  Promise<true> when the current task is terminated
   */
   cancelLastTask(): Promise<unknown> {
    return this._session.cancelLastTask(this.name);
  }

  /**
   * Wait on the current task being executed.
   * @param timeoutSec - seconds to wait for task completion.
   * @param vehicleName - The vehicle to apply the command to
   * @returns Promise<true> if the task completed without cancellation or timeout
   */
  waitOnLastTask(timeoutSec = 3e+38): Promise<unknown> {
    return this._session.waitOnLastTask(timeoutSec, this.name);
  }

}

// todo impl
// getGpsData