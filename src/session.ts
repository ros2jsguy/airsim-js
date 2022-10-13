/* eslint-disable import/prefer-default-export */


import { Client, TcpClient } from '@ros2jsguy/msgpack-rpc-node';
import { 
  CameraName,
  CarControls,
  CarState,
  CollisionInfo, 
  DEFAULT_YAW_MODE, 
  DrivetrainType, 
  GeoPoint, 
  ImageRequest, 
  ImageResponse, 
  ImageType, 
  MultirotorState,
  RawCameraInfo,
  RawDetectionInfo,
  RawEnvironmentState,
  RawKinematicsState,
  RCData,
  RGBA,
  RotorStates,
  WeatherParameter
} from './internal-types';
import { RawPose, Vector3r } from './math';
import { 
  BarometerData,
  DistanceSensorData,
  ImuData,
  LidarData,MagnetometerData
} from './sensor';

type MsgpackrpcClient = Client<TcpClient>;

/**
 * Provides the low-level AirSim api and network connectivity.
 * This class was strongly influenced by the AirSim Python Client.
 * @see {@link https://github.com/microsoft/AirSim/tree/main/PythonClient|PythonClient}
 */
export class Session {
  
  private _client: MsgpackrpcClient;

  /**
   * Open a TCP socket connection to an AirSim simulation environment.
   * @param port - The network port of the server, default = 41451
   * @param ip - The IP address of the server, defaulit = localhost
   */
  constructor(readonly port: string | number, readonly ip: string) {
    this._client = 
      new Client(TcpClient,
      typeof port === 'string' ? parseInt(port, 10) : port,
      ip);
  }

  private get client(): MsgpackrpcClient {
    return this._client;
  }

  /**
   * Create a network connection to an AirSim server.
   * @returns Promise<true> if successful.
   */
  connect(): Promise<boolean> {
    return this.client.connect() as Promise<boolean>;
  }

  /**
   * RPC call to AirSim server
   * @param method - Name of the operation to perform
   * @param params - A list of 0 or more parameters to send to the server.
   * @returns A Promise<unknown> wrapping the result.
   */
  _call(method: string, ...params: unknown[]): Promise<unknown> {
    return this.client.call(method, ...params) as Promise<unknown>;
  }

  /**
   * Ensure the AirSim server is reachable and active to respond to
   * api requests.
   * @returns Promise<true> on success.
   */
  ping(): Promise<boolean> {
    return this._call('ping') as Promise<boolean>;
  }

  /**
   * Close and shutdown the AirSim session.  
   */
  close(): void {
    this.client.close();
  }

  /**
   * Get the AirSim server version number, an increaing sequence 1, 2, 3, ...
   * @returns The server version number.
   */
  getServerVersion(): Promise<number> {
    return this._call('getServerVersion') as Promise<number>;
  }

  /**
   * Get the lowest compatible server version.
   * @returns The minimum compatible server version.
   */
  getMinRequiredClientVersion(): Promise<number> {
    return this._call('getMinRequiredClientVersion') as Promise<number>;
  }

  /**
   * Reset the vehicle to its original starting state
   * Note that you must call `enableApiControl()` and `arm()` again after the call to reset
   * @returns A Promise<void> to await on.
   */
  reset(): Promise<void> {
    return this._call('reset') as Promise<void>;
  }

  /**
   * Prints the specified message in the simulator's window.
   * If messageParam is supplied, then it's printed next to the message
   * and in that case if this API is called with same message value
   * but different messageParam again then previous line is overwritten
   * with new line (instead of API creating new line on display).
   * For example, `simPrintLogMessage("Iteration: ", i.toString())`
   * keeps updating same line on display when API is called with different
   * values of i. The valid values of severity parameter corresponds
   * to different colors.
   * @param message - Message to be printed
   * @param messageParam - Parameter to be printed next to the message
   * @param severity - The severity level of the message
   * @returns A Promise<void> to await on.
   */
   simPrintLogMessage(message: string, messageParam = '', severity = 1): Promise<void> {
    return this._call('simPrintLogMessage', message, messageParam, severity) as Promise<void>;
  }

  /**
   * Pauses and resumes the simulation
   * @param shouldPause - True (default) to pause the simulation, False to resume
   * @returns A Promise<void> to await on.
   */
  simPause(shouldPause = true): Promise<void> {
    return this._call('simPause', shouldPause) as Promise<void>;
  }

  /**
   * Returns true if the simulation is paused
   * @returns Promise<true> if the simulation is paused
   */
  simIsPaused(): Promise<boolean> {
    return this._call('simIsPaused') as Promise<boolean>;
  }

  /**
   * Continue the simulation for the specified number of seconds
   * @param seconds - Time to run the simulation for (float)
   * @returns A Promise<void> to await on.
   */
  simContinueForTime(seconds: number): Promise<void> {
    return this._call('simContinueForTime', seconds) as Promise<void>;
  }

  /**
   * Continue (or resume if paused) the simulation for the specified number
   * of frames, after which the simulation will be paused.
   * @param frames - Frames to run the simulation for
   * @returns A Promise<void> to await on.
   */
  simContinueForFrames(frames: number): Promise<void> {
    return this._call('simContinueForFrames', frames) as Promise<void>;
  }

  /**
   * Get a JSON string of the AirSim server settings.
   * @see @Link{https://microsoft.github.io/AirSim/settings|AirSim setting discussion }
   * @returns A Promise-wrapped JSON string.
   */
   getSettingsString(): Promise<string> {
    return this._call('getSettingsString') as Promise<string>;
  }

  /**
   * Enable Weather effects. Needs to be called before using `setWeatherParameter()` API
   * @returns A Promise<void> to await on.
   */
   simEnableWeather(enable: boolean): Promise<void> {
    return this._call('simEnableWeather', enable) as Promise<void>;
  }

  /**
   * Set simulated wind, in World frame, NED direction, m/s
   * @param wind - Wind, in World frame, NED direction, in m/s
   * @returns A Promise<void> to await on.
   */
   simSetWind(wind: Vector3r): Promise<void> {
    return this._call('simSetWind', wind) as Promise<void>;
  }

  /**
   * Enable various weather effects
   * @param param - Weather effect to be enabled
   * @param val - Intensity of the effect, Range 0-1
   * @returns A Promise<void> to await on.
   */
  simSetWeatherParameter(param: WeatherParameter, val: number): Promise<void> {
    return this._call('simSetWeatherParameter', param, val) as Promise<void>;
  }

  /**
   * 
   * Control the position of Sun in the environment Sun's position is
   * computed using the coordinates specified in `OriginGeopoint`
   * in settings for the date-time specified in the argument,
   * else if the string is empty, current date & time is used
   * @param isEnabled - True to enable time-of-day effect, False to reset the position to original
   * @param startDatetime - Date & Time in %Y-%m-%d %H:%M:%S format, e.g. `2018-02-12 15:20:00`
   * @param isStartDatetimeDst - True to adjust for Daylight Savings Time
   * @param celestialClockSpeed - Run celestial clock faster or slower than simulation clock
                                                     E.g. Value 100 means for every 1 second of simulation clock, Sun's position is advanced by 100 seconds
                                                     so Sun will move in sky much faster
   * @param updateIntervalSecs - Interval to update the Sun's position
   * @param moveSun - Whether or not to move the Sun
   * @returns A Promise<void> to await on.
   */
  simSetTimeOfDay(
    isEnabled: boolean,
    startDatetime = '',
    isStartDatetimeDst = false,
    celestialClockSpeed = 1,
    updateIntervalSecs = 60,
    moveSun = true): Promise<void> {

    return this._call(
      'simSetTimeOfDay',
      isEnabled,
      startDatetime,
      isStartDatetimeDst,
      celestialClockSpeed,
      updateIntervalSecs,
      moveSun) as Promise<void>;
  }

  /**
   * Returns GeoPoints representing the minimum and maximum extents of the world
   * @returns Tuple of GeoPoints [min,max]
   */
   simGetWorldExtents(): Promise<[Vector3r,Vector3r]> {
    return this._call('simGetWorldExtents') as Promise<[Vector3r,Vector3r]>;
  }

  /**
   * Change intensity of named light
   * @param lightName - Name of light to change
   * @param intensity - New intensity value [0-1]
   * @returns Promise<void> if successful
   */
   simSetLightIntensity(lightName: string, intensity: number): Promise<boolean> {
    return this._call('simSetLightIntensity', lightName, intensity) as Promise<boolean>;
  }

  /**
   * Get details about the camera
   * @param cameraName - Name of the camera, for backwards compatibility, ID numbers such as 0,1,etc. can also be used
   * @param vehicleName - Vehicle which the camera is associated with
   * @param isExternal - Whether the camera is an external camera
   * @returns A CameraInfo promise
   */
  simGetCameraInfo(cameraName: CameraName, vehicleName = '', isExternal = false): Promise<RawCameraInfo> {
    return this._call(
      'simGetCameraInfo',
      cameraName.toString(),
      vehicleName,
      isExternal) as Promise<RawCameraInfo>;
  }

  /**
   * Control the pose of a selected camera
   * @param cameraName - Name of the camera to be controlled
   * @param pose - Pose representing the desired position and orientation of the camera
   * @param vehicleName - Name of vehicle which the camera corresponds to
   * @param external - Whether the camera is an External Camera
   * @returns A Promise<void> to await on.
   */
  simSetCameraPose(cameraName: CameraName, pose: RawPose, vehicleName = '', external = false): Promise<void> {
    return this._call('simSetCameraPose', cameraName.toString(), pose,
                       vehicleName, external) as Promise<void>;
  }

  /**
   * Get a listing of the names of all objects that makeup the AirSim seem.
   * @param regEx - A regex for filtering the names.
   * @returns An array of object names.
   */
  simListSceneObjects(regEx = '.*'): Promise<Array<string>> {
    return this._call('simListSceneObjects', regEx) as Promise<Array<string>>;
  }

  /**
   * The name of the assets that make up the scene.
   * @returns An array of asset names.
   */
  simListAssets(): Promise<Array<string>> {
    return this._call('simListAssets') as Promise<Array<string>>;
  }

  /**
   * Spawned selected object in the world
   * @param objectName -  Desired name of new object
   * @param assetName - Name of asset(mesh) in the project database
   * @param pose - Desired pose of object
   * @param scale - Desired scale of object
   * @param physicsEnabled - Whether to enable physics for the object
   * @param isBlueprint - Whether to spawn a blueprint or an actor
   * @returns Name of spawned object, in case it had to be modified
   */
   simSpawnObject(objectName: string, assetName: string, pose: RawPose, 
    scale: Vector3r, physicsEnabled=false, isBlueprint=false): Promise<string> {
      return this._call('simSpawnObject', objectName, assetName,
                        pose, scale, physicsEnabled, isBlueprint) as Promise<string>;
  }

  /**
   * Delete an object from the AirSim server environment.
   * @param objectName - Name of object to delete
   * @returns Promise<true> if success
   */
   simDestroyObject(objectName: string): Promise<boolean> {
    return this._call('simDestroyObject', objectName) as Promise<boolean>;
  }

  /**
   * Get the pose of a simulation object in the world frame.
   * @param objectName - The name of the object who's pose is being requested.
   * @returns The pose
   */
   simGetObjectPose(objectName: string): Promise<RawPose | undefined> {
    return this._call('simGetObjectPose', objectName) as Promise<RawPose | undefined>;
  }

  /**
   * Set the pose of the object(actor) in the environment
   * The specified actor must have Mobility set to movable,
   * otherwise there will be undefined behaviour.
   * See https://www.unrealengine.com/en-US/blog/moving-physical-objects for
   * details on how to set Mobility and the effect of Teleport parameter
   * @param objectName - Name of the object(actor) to move
   * @param pose - Desired Pose of the object
   * @param teleport - Whether to move the object immediately without affecting their velocity
   * @returns Promise<true> when the move was successful
   */
  simSetObjectPose(objectName: string, pose: RawPose, teleport = true): Promise<boolean> {
    return this._call('simSetObjectPose', objectName, pose, teleport) as Promise<boolean>;
  }

  /**
   * Gets scale of an object in the world
   * @param objectName - Object to get the scale of
   * @returns The object scale
   */
   simGetObjectScale(objectName: string): Promise<Vector3r> {
    return this._call('simGetObjectScale', objectName) as Promise<Vector3r>;
  }

  /**
   * Sets scale of an object in the world
   * @param objectName - Object to set the scale of
   * @param scaleVector - Desired scale of object
   * @returns Promise<true> when scale change was successful
   */
   simSetObjectScale(objectName: string, scaleVector: Vector3r): Promise<boolean> {
    return this._call('simSetObjectScale', objectName, scaleVector) as Promise<boolean>;
  }

  /**
   * Add mesh name to detect in wild card format.
   * 
   * @example
   * Example for detecting all instances named "Car_*"
   * ```
   * simAddDetectionFilterMeshName("Car_*")
   * ```
   * @param cameraName - Name of the camera, for backwards compatibility,
   *                     ID numbers such as 0,1,etc. can also be used
   * @param imageType - Type of image
   * @param meshName - mesh name in wild card format
   * @param vehicleName - Vehicle which the camera is associated with
   * @param external -  Whether the camera is an External Camera
   * @returns A Promise<void> to await on
   */
  simAddDetectionFilterMeshName(
      cameraName: CameraName, 
      imageType: ImageType,
      meshName: string,
      vehicleName = '',
      external = false): Promise<void> {

    return this._call(
      'simAddDetectionFilterMeshName',
      cameraName.toString(),
      imageType,
      meshName,
      vehicleName,
      external) as Promise<void>;
  }

  /**
   * Set detection radius in centimeters for a camera
   * @param cameraName - Name of the camera, for backwards compatibility, ID numbers such as 0,1,etc. can also be used
   * @param imageType - Type of image
   * @param radiusCm - Radius in [cm]
   * @param vehicleName - Vehicle which the camera is associated with
   * @param external - Whether the camera is an external  amera
   * @returns A Promise<void> to await on
   */
  simSetDetectionFilterRadius(
      cameraName: CameraName,
      imageType: ImageType,
      radiusCm: number,
      vehicleName = '',
      external = false): Promise<void> {
       
    return this._call(
      'simSetDetectionFilterRadius',
      cameraName.toString(),
      imageType,
      radiusCm,
      vehicleName,
      external) as Promise<void>;
  }

  /**
   * Get current object detections in camera view
   * @param cameraName - Name of the camera, for backwards compatibility, ID numbers such as 0,1,etc. can also be used
   * @param imageType - Type of image
   * @param vehicleName - Vehicle which the camera is associated with
   * @param external - Whether the camera is an External Camera
   * @returns Array of detections
   */
  simGetDetections(
      cameraName: CameraName,
      imageType: ImageType,
      vehicleName = '',
      external = false): Promise<Array<RawDetectionInfo>> {

    return this._call(
      'simGetDetections',
      cameraName.toString(),
      imageType,
      vehicleName,
      external) as Promise<Array<RawDetectionInfo>>;
  }

  /**
   * Clear all mesh names from detection filter
   * @param cameraName -  Name of the camera, for backwards compatibility, ID numbers such as 0,1,etc. can also be used
   * @param imageType - Type of image
   * @param vehicleName - Vehicle which the camera is associated with
   * @param external - Whether the camera is an External Camera
   * @returns A Promise<void> to await on
   */
  simClearDetectionMeshNames(
      cameraName: CameraName,
      imageType: ImageType,
      vehicleName = '',
      external = false): Promise<void> {
      
    return this._call(
      'simClearDetectionMeshNames',
      cameraName.toString(),
      imageType,
      vehicleName,
      external) as Promise<void>;
  }

  /**
 * Lists the names of the vehicles in the simulation.
 * @returns List containing names of all vehicles
 */
  listVehicles() : Promise<Array<string>> {
    return this._call('listVehicles') as Promise<Array<string>>;
  }

  /**
   * Create vehicle at runtime
   * @param vehicleName - Name of the vehicle being created
   * @param vehicleType - Type of vehicle, e.g. "simpleflight"
   * @param pose - Initial pose of the vehicle
   * @param pawnPath - Vehicle blueprint path, default empty wbich uses the
   *                    default blueprint for the vehicle type
   * @returns Promise<true> when vehicle was created
   */
  simAddVehicle(name: string, type: string, pose: RawPose,
                 pawnPath: string): Promise<boolean> {
    return this._call('simAddVehicle', name, type,
            pose, pawnPath) as Promise<boolean>;
  }

  /**
   * Clear any persistent markers - those plotted with parameter 
   * `isPersistent=true`
   * @returns A Promise<void> to await on.
   */
   simFlushPersistentMarkers(): Promise<void> {
    return this._call('simFlushPersistentMarkers') as Promise<void>;
  }

  /**
   * Plot a list of 3D points in World NED frame
   * @param points - List of Vector3r objects
   * @param colorRGBA - desired RGBA values from 0.0 to 1.0
   * @param size - Size of plotted point
   * @param duration -Duration (seconds) to plot for
   * @param isPersistent - If set to True, the desired object will be plotted for infinite time.
   * @returns A Promise<void> to await on.
   */
  simPlotPoints(points: Array<Vector3r>, colorRGBA=[1.0, 0.0, 0.0, 1.0],
             size = 10.0, duration = -1.0, isPersistent = false): Promise<void> {
    return this._call('simPlotPoints', points, colorRGBA, size, duration, isPersistent) as Promise<void>;
  }

  /**
   * Plots a line strip in World NED frame, defined from points[0] to
   * points[1], points[1] to points[2], ... , points[n-2] to points[n-1]
   * @param points - Array of 3D locations of line start and end points, specified as Vector3r objects
   * @param colorRGBA - Array of desired RGBA values from 0.0 to 1.0
   * @param thickness - Thickness of line
   * @param duration - Duration (seconds) to plot for
   * @param isPersistent - If set to True, the desired object will be plotted for infinite time.
   * @returns A Promise<void> to await on.
   */
   simPlotLineStrip(points: Array<Vector3r>, colorRGBA=[1.0, 0.0, 0.0, 1.0], thickness = 5.0, duration = -1.0, 
                isPersistent = false): Promise<void> {
    return this._call('simPlotLineStrip', points, colorRGBA,
            thickness, duration, isPersistent) as Promise<void>;
  }

  /**
   * Plots a line strip in World NED frame, defined from points[0] to
   * points[1], points[2] to points[3], ... , points[n-2] to points[n-1]
   * @param points - List of 3D locations of line start and end points, specified as Vector3r objects. Must be even
   * @param colorRGBA - desired RGBA values from 0.0 to 1.0
   * @param thickness - Thickness of line
   * @param duration - Duration (seconds) to plot for
   * @param isPersistent - If set to True, the desired object will
   *                       be plotted for infinite time.
   * @returns A Promise<void> to await on.
   */
  simPlotLineList(points: Array<Vector3r>, colorRGBA=[1.0, 0.0, 0.0, 1.0],
    thickness = 5.0, duration = -1.0, isPersistent = false): Promise<void> {
                    
    return this._call('simPlotLineList', points, colorRGBA,
                     thickness, duration, isPersistent) as Promise<void>;
  }

  /**
   * Plots a list of arrows in World NED frame, defined from points_start[0]
   * to points_end[0], points_start[1] to points_end[1], ... , 
   * points_start[n-1] to points_end[n-1]
   * @param pointsStart - Array of 3D start positions of arrow start positions, specified as Vector3r objects
   * @param pointsEnd - Array of 3D end positions of arrow start positions, specified as Vector3r objects
   * @param colorRGBA - desired RGBA values from 0.0 to 1.0
   * @param thickness - Thickness of line
   * @param arrowSize - Size of arrow head
   * @param duration - Duration (seconds) to plot for
   * @param isPersistent - If set to true, the desired object will be plotted for infinite time.
   * @returns A Promise<void> to await on.
   */
   simPlotArrows(pointsStart: Array<Vector3r>,
      pointsEnd: Array<Vector3r>, 
      colorRGBA=[1.0, 0.0, 0.0, 1.0],
      thickness = 5.0, arrowSize = 2.0, duration = -1.0,
      isPersistent = false): Promise<void> {

    return this._call('simPlotArrows', pointsStart, pointsEnd, colorRGBA,
              thickness, arrowSize, duration, isPersistent) as Promise<void>;
  }

  /**
   * Plots a list of strings at desired positions in World NED frame.
   * @param strings - List of strings to plot
   * @param positions - List of positions where the strings should be
   *                    plotted. Should be in one-to-one correspondence
   *                    with the strings' list
   * @param scale - Font scale of transform name
   * @param colorRGBA - desired RGBA values from 0.0 to 1.0
   * @param duration - Duration (seconds) to plot for
   * @returns A Promise<void> to await on. 
   */
  simPlotStrings(strings: Array<string>, positions: Array<Vector3r>,
      scale = 5, colorRGBA=[1.0, 0.0, 0.0, 1.0], duration = -1.0): Promise<void> {
    return this._call('simPlotStrings', strings, positions, scale, colorRGBA, duration) as Promise<void>;
  }

  /**
   * Plots a list of transforms in World NED frame.
   * @param poses - array of Pose objects representing the transforms to plot
   * @param scale - Length of transforms' axes
   * @param thickness -Thickness of transforms' axes
   * @param duration - Duration (seconds) to plot for
   * @param isPersistent - If set to True, the desired object will be plotted for infinite time.
   * @returns A Promise<void> to await on.
   */
  simPlotTransforms(poses: Array<RawPose>, scale = 5.0, thickness = 5.0, 
    duration = -1.0, isPersistent = false): Promise<void> {

    return this._call('simPlotTransforms', poses, scale, thickness, 
        duration, isPersistent) as Promise<void>;
  }

  /**
   * Plots a list of transforms with their names in World NED frame.
   * @param poses - Pose objects representing the transforms to plot
   * @param names - Strings with one-to-one correspondence to list of poses 
   * @param scale - Length of transforms' axes
   * @param thickness -Thickness of transforms' axes
   * @param textScale - Font scale of transform name
   * @param textColor - RGBA values from 0.0 to 1.0 for the transform name
   * @param duration - Duration (seconds) to plot for
   * @returns  A void promise to await on.
   */
  simPlotTransformsWithNames(poses: Array<RawPose>, names: Array<string>, scale = 5.0,
      thickness = 5.0, textScale = 10.0, textColor = [1.0, 0.0, 0.0, 1.0],
      duration = -1.0): Promise<void> {
    return this._call(
        'simPlotTransformsWithNames',
        poses,
        names,
        scale,
        thickness,
        textScale,
        textColor,
        duration) as Promise<void>;
  }

  /**
   * Allows the client to execute a command in Unreal's native console, via an API.
   * Affords access to the countless built-in commands such as "stat unit", "stat fps",
   * "open [map]", adjust any config settings, etc. 
   * Allows the user to create bespoke APIs very easily, by adding a custom event to
   * the level blueprint, and then calling the console command "ce MyEventName [args]".
   * No recompilation of AirSim needed!
   * @param cmd - Unreal Engine Console command to run
   * @returns Promise<true> if successful. 
   */
  simRunConsoleCommand(cmd: string): Promise<boolean> {
    return this._call('simRunConsoleCommand', cmd) as  Promise<boolean>;
  }

  // Vehicle ---------------

  /**
   * Arms or disarms vehicle
   * @param arm - True to arm, False to disarm the vehicle
   * @param vehicleName - Name of the vehicle to send this command to
   * @returns Promise<true> upon success.
   */
  armDisarm(arm: boolean, vehicleName = ''): Promise<boolean> {
    return this._call('armDisarm', arm, vehicleName) as Promise<boolean>;
  }

  /**
   * Enables or disables API control for vehicle corresponding to vehicle_name
   * @returns A Promise<void> to await on.
   */
  enableApiControl(enablement: boolean, vehicleName: string): Promise<void> {
    return this._call('enableApiControl', enablement, vehicleName) as Promise<void>;
  }

  /**
   * Returns true if API control is established.
   * @param vehicleName - Name of the vehicle
   * @returns Promise<true> if API control is enabled
   */
  isApiControlEnabled(vehicleName: string): Promise<boolean> {
    return this._call('isApiControlEnabled', vehicleName) as Promise<boolean>;
  }

  /**
   * Access a vehicle's Pose
   * @param vehicleName 
   * @returns The vehicle pose.
   */
   simGetVehiclePose(vehicleName: string): Promise<RawPose> {
    return this._call('simGetVehiclePose', vehicleName) as Promise<RawPose>;
  }

  /**
   * Set the pose of a vehicle.
   * @param pose - The new pose.
   * @param ignoreCollision - Whether to ignore any collision or not
   * @param vehicleName - The name of the vehicle.
   * @returns A Promise<void> to await on. 
   */
   simSetVehiclePose(pose: RawPose, ignoreCollision=true, vehicleName=''): Promise<void> {
    return this._call('simSetVehiclePose', pose, ignoreCollision, vehicleName) as Promise<void>;
  }

  /**
   * Get Ground truth kinematics of the vehicle
   * The position inside the returned KinematicsState is in the frame of the vehicle's starting point   
   * @param vehicleName -  Name of the vehicle
   * @returns Ground truth of the vehicle
   */
  simGetGroundTruthKinematics(vehicleName = ''): Promise<RawKinematicsState> {
    return this._call('simGetGroundTruthKinematics', vehicleName) as Promise<RawKinematicsState>;
  }

  /**
   * Set the kinematics state of the vehicle
   * If you don't want to change position (or orientation) then just set components of position (or orientation) to floating point nan values
   * @param state -  Desired Pose pf the vehicle
   * @param ignoreCollision - Whether to ignore any collision or not
   * @param vehicleName - Name of the vehicle to move
   */
  simSetKinematics(state: RawKinematicsState, ignoreCollision: boolean, vehicleName = ''): Promise<void> {
    return this._call('simSetKinematics', state, ignoreCollision, vehicleName) as Promise<void>;
  }

  /**
   *  Get ground truth environment state
  The position inside the returned EnvironmentState is in the frame of the vehicle's starting point
   * @param vehicleName - Name of the vehicle
   * @returns  Ground truth environment state
   */
  simGetGroundTruthEnvironment(vehicleName = ''): Promise<RawEnvironmentState> {
    return this._call('simGetGroundTruthEnvironment', vehicleName) as Promise<RawEnvironmentState>;
  }

  /**
   * Get the Home NED-frame location (north, east, down) of a vehicle.
   * @param vehicleName - The target vehicle
   * @returns The Home location (NED) of the vehicle
   */
  getHomeGeoPoint(vehicleName='') : Promise<GeoPoint> {
    return this._call('getHomeGeoPoint', vehicleName) as Promise<GeoPoint>;
  }

  /**
   * Test whether the target point is visible from the perspective of a target vehicle.
   * @param point - Target point
   * @param vehicleName - The name of the target vehicle.
   * @returns Promise<true> if target point is visible.
   */
  simTestLineOfSightToPoint(point: GeoPoint, vehicleName=''): Promise<boolean> {
    return this._call('simTestLineOfSightToPoint', point, vehicleName) as Promise<boolean>;
  }

  /**
   * Test whether the target point is visible from the perspective of the source point
   * @param point1 - Source point
   * @param point2 - Target point
   * @returns Promise<true> if success
   */
  simTestLineOfSightBetweenPoints(point1: GeoPoint, point2: GeoPoint): Promise<boolean> {
    return this._call('simTestLineOfSightBetweenPoints', point1, point2) as Promise<boolean>;
  }

  /**
   * Modify the color and thickness of the line when tracing is enabled.
   * Tracing can be enabled by pressing T in the Editor or
   * setting `EnableTrace` to `True` in the Vehicle Settings
   * @param color - the RGBA color
   * @param thickness - thickness of the trace line
   * @returns A Promise<void> to await on. 
   */
   simSetTraceLine(color: RGBA, thickness = 1.0, vehicleName = ''): Promise<void> {
    return this._call('simSetTraceLine', color, thickness, vehicleName) as Promise<void>;
  }

  /**
   * Get a vehicle's collision state.
   * @param vehicleName - Target vehicle name.
   * @returns The collision state info. 
   */
  simGetCollisionInfo(vehicleName=''): Promise<CollisionInfo> {
    return this._call('simGetCollisionInfo', vehicleName) as Promise<CollisionInfo>;
  }

  /**
   * Get a single image in compressed PNG format.
   * @param cameraName - Name of the camera, for backwards compatibility, ID numbers such as 0,1,etc. can also be used
   * @param imageType - Type of image
   * @param vehicleName - Name of the vehicle with the camera
   * @param external - Whether the camera is an External Camera
   * @returns  Promise<Uint8Array> of compressed png image data
   */
  simGetImage(cameraName: CameraName, imageType: ImageType, vehicleName = '', isExternal = false): Promise<unknown> {
    return this._call(
        'simGetImage',
        cameraName.toString(),
        imageType,
        vehicleName,
        isExternal) as Promise<unknown>;
  }

  /**
   * Get multiple images
   * See https://microsoft.github.io/AirSim/image_apis/ for details and examples
   * @param requests (list[ImageRequest]): Images required
   * @param vehicleName - Name of vehicle associated with the camera
   * @param external - Whether the camera is an External Camera
   * @returns list[ImageResponse]
   */
  simGetImages(requests: Array<ImageRequest>, vehicleName = '', external = false): Promise<Array<ImageResponse>> {
    return this._call(
        'simGetImages',
        requests,
        vehicleName,
        external) as Promise<Array<ImageResponse>>;
  }

  /**
   * Terminate the current task execution.
   * @param vehicleName - The vehicle to apply the command to
   * @returns  Promise<true> if the current task was terminated
   */
   cancelLastTask(vehicleName = ''): Promise<unknown> {
    return this._call('cancelLastTask', vehicleName);
  }

  /**
   * Wait on the current task being executed.
   * @param timeoutSec - seconds to wait for task completion.
   * @param vehicleName - The vehicle to apply the command to
   * @returns Promise<true> if the task completed without cancellation or timeout
   */
  waitOnLastTask(timeoutSec = 100, vehicleName = ''): Promise<unknown> {
    return this._call('waitOnLastTask', timeoutSec, vehicleName);
  }

  // Sensor Data

  /**
   * Access distance sensor data.
   * @param distanceSensorName - Name of Distance Sensor to get data from, specified in settings.json
   * @param vehicleName - Name of vehicle to which the sensor corresponds to
   * @returns The distance data
   */
  getDistanceSensorData(distanceSensorName = '', vehicleName = ''): Promise<DistanceSensorData> {
    return this._call(
        'getDistanceSensorData',
        distanceSensorName,
        vehicleName) as Promise<DistanceSensorData>;
  }

  /**
   * Access the data from a LIDAR sensor
   * @param lidarName - Name of IMU to get data from, specified in settings.json
   * @param vehicleName -Name of vehicle to which the sensor corresponds to
   * @returns The LIDAR sensor data
   */
  getLidarData(lidarName = '', vehicleName = ''): Promise<LidarData> {
    return this._call('getLidarData', lidarName, vehicleName) as Promise<LidarData>;
  }

  /**
   * Access the data from an IMU sensor.
   * @param imuName - Name of IMU to get data from, specified in settings.json
   * @param vehicleName - Name of vehicle to which the sensor corresponds to
   * @returns The IMU sensor data
   */
   getImuData(imuName = '', vehicleName = ''): Promise<ImuData> {
    return this._call('getImuData', imuName, vehicleName) as Promise<ImuData>;
  }

  /**
   *  Access the data from an magnetometer sensor.
   * @param magnetometerName - Name of Magnetometer to get data from, specified in settings.json
   * @param vehicleName - Name of vehicle to which the sensor corresponds to
   * @returns The magnetometer sensor data
   */
    getMagnetometerData(magnetometerName = '', vehicleName = ''): Promise<MagnetometerData> {
      return this._call(
          'getMagnetometerData',
          magnetometerName,
          vehicleName) as Promise<MagnetometerData>;
    }

  /**
   * Access the data from an barometer sensor.
   * @param barometerName - Name of barometer to get data from, specified in settings.json
   * @returns The barometer sensor data
   */
   getBarometerData(barometerName = '', vehicleName = ''): Promise<BarometerData> {
    return this._call(
        'getBarometerData',
        barometerName,
        vehicleName) as Promise<BarometerData>;
  }

  // CAR

  getCarState(vehcileName = ''): Promise<CarState> {
    return this._call('getCarState', vehcileName) as Promise<CarState>;
  }

  getCarControls(vehicleName = ''): Promise<CarControls> {
    return this._call('getCarControls', vehicleName) as Promise<CarControls>;
  }

  setCarControls(controls: CarControls, vehicleName = ''): Promise<void> {
    return this._call('setCarControls', controls, vehicleName) as Promise<void>;
  }

  // Multirotor
  /**
   * The position inside the returned MultirotorState is in the frame of the vehicle's starting point
   * @param vehicleName - Vehicle to get the state of
   * @returns The drone state
   */
   getMultirotorState(vehicleName = ''): Promise<MultirotorState> {
    return this._call('getMultirotorState', vehicleName) as Promise<MultirotorState>;
  }

  /**
   * Obtain the current state of all a multirotor's rotors. The state includes the speeds,
        thrusts and torques for all rotors.
   * @param vehicleName - Vehicle to get the rotor state of
   * @returns RotorStates containing a timestamp and the speed, thrust and torque of all rotors
   */
  getRotorStates(vehicleName = ''): Promise<RotorStates> {
    return this._call('getRotorStates', vehicleName) as Promise<RotorStates>;
  }

  /**
   * Takeoff vehicle to 3m above ground. Vehicle should not be moving when this API is used
   * @param timeoutSec - Timeout for the vehicle to reach desired altitude
   * @param vehicleName - Name of the vehicle to send this command to
   * @returns Promise<true> when completed successfully.
   */
   takeoff(timeoutSec = 20, vehicleName = ''): Promise<boolean> {
    return this._call('takeoff', timeoutSec, vehicleName) as Promise<boolean>;
  }

  /**
   * Hover vehicle now.
   * @returns A Promise<void> to await on.
   */
   hover(vehicleName = ''): Promise<void> {
    return this._call('hover', vehicleName) as Promise<void>;
  }

  /**
   * Land the vehicle.
   * @param timeoutSec - Timeout for the vehicle to land
   * @param vehicleName - Name of the vehicle to send this command to
   * @returns Promise<true> when completed
   */
   land(timeoutSec = 60, vehicleName = ''): Promise<boolean> {
    return this._call('land', timeoutSec, vehicleName) as Promise<boolean>;
  }

  /**
   * Return vehicle to Home i.e. Launch location
   * @param timeoutSec - Timeout for the vehicle to return home
   * @param vehicleName - Name of the vehicle to send this command to
   * @returns Promise<true> when completed
   */
   goHome(timeoutSec = 3e+38, vehicleName = ''): Promise<boolean> {
    return this._call('goHome', timeoutSec, vehicleName) as Promise<boolean>;
  }

  /**
   * Follow a path consisting of waypoints.
   * @param waypoints - The 3d points for the path trajectory
   * @param velocity - The speed to 
   * @param timeoutSec - The maximum time for this task to complete
   * @param drivetrain - The drivetrain configuration/constraints
   * @param yawMode - The yaw configuration
   * @param vehicleName - The vehicle to apply this command to
   * @returns Promise<true> if successful completion
   */
  moveOnPath(waypoints: Array<Vector3r>, velocity: number, timeoutSec = 3e+38,
             drivetrain = DrivetrainType.MaxDegreeOfFreedom, yawMode = DEFAULT_YAW_MODE,
             lookahead = -1, adaptiveLookahead = 1, vehicleName = ''): Promise<unknown> {
  return this._call(
    'moveOnPath',
    waypoints,
     velocity,
     timeoutSec,
     drivetrain,
     yawMode,
     lookahead,
     adaptiveLookahead,
     vehicleName
    ) as Promise<unknown>;
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
   * @param vehicleName - Name of the vehicle to send this command to
   * @returns A Promise<void> to await on
   */
  moveToPosition(x: number, y: number, z: number, velocity: number, 
    timeoutSec = 3e+38,
    drivetrain = DrivetrainType.MaxDegreeOfFreedom, 
    yawMode = DEFAULT_YAW_MODE, 
    lookahead = -1,
    adaptiveLookahead = 1,
    vehicleName = ''): Promise<void> {
      return this._call(
        'moveToPosition', 
        x, y, z,
        velocity,
        timeoutSec,
        drivetrain,
        yawMode,
        lookahead,
        adaptiveLookahead,
        vehicleName) as Promise<void>;
  }

  /**
   * Move vehile to Z position.
   * @param z - The target Z position.
   * @param velocity - The velocity by which to relocate.
   * @param timeoutSec - The maximum time to complete this relocation.
   * @param yawMode - The rate of yaw maneuvering
   * @param lookahead - not sure atm - todo
   * @param adaptiveLookahead - not sure at - todo
   * @param vehicleName - Name of the vehicle to send this command to
   * @returns A Promise<void> to await on
   */
  moveToZ(z: number, velocity: number, 
    timeoutSec = 3e+38, 
    yawMode = DEFAULT_YAW_MODE, 
    lookahead = -1,
    adaptiveLookahead = 1,
    vehicleName = ''): Promise<void> {
      return this._call(
        'moveToZ',
        z,
        velocity,
        timeoutSec,
        yawMode,
        lookahead,
        adaptiveLookahead,
        vehicleName) as Promise<void>;
  }

  /**
   * Initiate rotation task to absolute yaw angle (deg) of home position in degrees.
   * @param yaw - Angle in degrees 
   * @param timeoutSec - Maximum time in seconds to complete manuever
   * @param margin - +/- Allowable error in degrees
   * @returns Promise<true> on success
   */
   rotateToYaw(yaw: number, timeoutSec = 3e+38, margin = 5, vehicleName = ''): Promise<boolean> {
    return this._call('rotateToYaw', yaw, timeoutSec, margin, vehicleName) as Promise<boolean>;
  }

  /**
   * Rotate the drone to the specified yaw rate while remaining
   * stationery at the current x, y, and z.
   * @param yawRate - Rate in degrees/second
   * @param duration - Length of time to apply this command
   * @param vehicleName - The vehicle to apply this command.
   * @returns Promise<true> on success
   */
  rotateByYawRate(yawRate, duration, vehicleName = ''): Promise<boolean> {
    return this._call(
            'rotateByYawRate',
            yawRate,
            vehicleName,
            duration) as Promise<boolean>;
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
   * @param vehicleName - Name of vehicle to move.
   * @returns Promise<true> on success.
   */
  moveToGPS(latitude: number, longitude: number, altitude: number,
        velocity, timeoutSec = 3e+38, drivetrain = DrivetrainType.MaxDegreeOfFreedom,
        yaw_mode = DEFAULT_YAW_MODE, lookahead = -1, adaptive_lookahead = 1,
        vehicleName = ''): Promise<boolean> {
        
    return this._call(
          'moveToGPS',
          latitude,
          longitude,
          altitude,
          velocity,
          timeoutSec,
          drivetrain,
          yaw_mode,
          lookahead,
          adaptive_lookahead,
          vehicleName) as Promise<boolean>;
  }

  /**
   * Move by velocity to the world (NED) XYZ axes.
   * @param vx - Desired velocity in world (NED) X axis.
   * @param vy - Desired velocity in world (NED) Y axis.
   * @param vz - Desired velocityvin world (NED) Z axis.
   * @param duration -  Amount of time (seconds), to send this command.
   * @param drivetrain - The drivetrain mode to use.
   * @param yawMode - The rate (deg/sec) or angle (deg) of yaw maneuvering
   * @param vehicleName - The name of the vehicle to apply this command
   * @returns Promise<true> on success.
   */
  moveByVelocity(vx: number, vy: number, vz: number, duration: number,
      drivetrain = DrivetrainType.MaxDegreeOfFreedom, yawMode = DEFAULT_YAW_MODE,
      vehicleName = ''): Promise<boolean> {

    return this._call(
        'moveByVelocity',
        vx,
        vy,
        vz,
        duration,
        drivetrain,
        yawMode,
        vehicleName) as Promise<boolean>;
  }

  /**
   * Move by velocity to the world (NED) XY axes with fixed Z (NED) position.
   * @param vx - Desired velocity in world (NED) X axis.
   * @param vy - Desired velocity in world (NED) Y axis.
   * @param z - Desired Z position in world (NED) Z axis.
   * @param duration -  Amount of time (seconds), to send this command.
   * @param drivetrain - The drivetrain mode to use.
   * @param yawMode - The rate (deg/sec) or angle (deg) of yaw maneuvering
   * @param vehicleName - The name of the vehicle to apply this command
   * @returns Promise<true> on success.
   */
   moveByVelocityZ(vx: number, vy: number, z: number, duration: number,
    drivetrain = DrivetrainType.MaxDegreeOfFreedom, yawMode = DEFAULT_YAW_MODE,
    vehicleName = ''): Promise<boolean> {

  return this._call(
      'moveByVelocityZ',
      vx,
      vy,
      z,
      duration,
      drivetrain,
      yawMode,
      vehicleName) as Promise<boolean>;
  }

  /**
   * Move by velocity relative to the vehicle's XYZ axies.
   * @param vx - Desired velocity in the X axis of the vehicle's local NED frame.
   * @param vy - Desired velocity in the Y axis of the vehicle's local NED frame.
   * @param vz - Desired velocity in the Z axis of the vehicle's local NED frame.
   * @param duration -  Desired amount of time (seconds), to send this command.
   * @param drivetrain - The drivetrain mode to use.
   * @param yawMode - The rate (deg/sec) or angle (deg) of yaw maneuvering
   * @param vehicleName - The name of the vehicle to apply this command
   * @returns Promise<true> on success.
   */
   moveByVelocityBodyFrame(vx: number, vy: number, vz: number, duration: number,
      drivetrain = DrivetrainType.MaxDegreeOfFreedom, yawMode = DEFAULT_YAW_MODE,
      vehicleName = ''): Promise<boolean> {

    return this._call(
          'moveByVelocityBodyFrame',
          vx,
          vy,
          vz,
          duration,
          drivetrain,
          yawMode,
          vehicleName) as Promise<boolean>;
  }

  /**
   * Move by velocity relative to the vehicle's XY axies at Z altitude.
   * @param vx - Desired velocity (m/s) in the X axis of the vehicle's local NED frame.
   * @param vy - Desired velocity (m/s) in the Y axis of the vehicle's local NED frame.
   * @param z - Desired Z position (m) in vehicle's local NED frame.
   * @param duration -  Desired amount of time (seconds), to send this command.
   * @param drivetrain - The drivetrain mode to use.
   * @param yawMode - The rate (deg/sec) or angle (deg) of yaw maneuvering
   * @param vehicleName - The name of the vehicle to apply this command
   * @returns Promise<true> on success.
   * 
   */
  moveByVelocityZBodyFrame(vx: number, vy: number, z: number, duration: number,
      drivetrain = DrivetrainType.MaxDegreeOfFreedom, yawMode = DEFAULT_YAW_MODE,
      vehicleName = ''): Promise<boolean> {

    return this._call(
      'moveByVelocityZBodyFrame',
       vx,
       vy,
       z,
       duration,
       drivetrain,
       yawMode,
       vehicleName) as Promise<boolean>;
  }

  /**
   * Control a multirotor (drone) with radio controller data commands and settings.
   * @param rcdata - The radio controller settings to apply.
   * @param vehicleName - The name of the multirotor to apply rcdata to.
   * @returns A Promise<void> to await on.
   */
  moveByRC(rcdata: RCData, vehicleName = ''): Promise<void> {
    return this._call('moveByRC', rcdata, vehicleName) as Promise<void>;
  }
}


