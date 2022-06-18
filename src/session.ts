
import { Client, TcpClient } from 'msgpack-rpc-node';
import { ImageType } from './image';
import { CarControls, CarState, CollisionInfo, WeatherParameter } from './internal-session-types';
import { GeoPoint, Pose, Vector3r } from './math';
import { DistanceSensorData, LidarData } from './sensor';

type MsgpackrpcClient = Client<TcpClient>;

// eslint-disable-next-line import/prefer-default-export
export class Session {
  
  private _client: MsgpackrpcClient;

  constructor(readonly port, readonly ip) {
    this._client = new Client(TcpClient, port, ip);
  }

  private get client(): MsgpackrpcClient {
    return this._client;
  }

  connect(): Promise<boolean> {
    return this.client.connect() as Promise<boolean>;
  }

  _call(method: string, ...params: unknown[]): Promise<unknown> {
    return this.client.call(method, ...params) as Promise<unknown>;
  }

  ping(): Promise<boolean> {
    return this._call('ping') as Promise<boolean>;
  }

  close(): void {
    this.client.close();
  }

  getServerVersion(): Promise<number> {
    return this._call('getServerVersion') as Promise<number>;
  }

  getMinRequiredClientVersion(): Promise<number> {
    return this._call('getMinRequiredClientVersion') as Promise<number>;
  }

  /**
   * Reset the vehicle to its original starting state
   * Note that you must call `enableApiControl` and `armDisarm` again after the call to reset
   * @returns A void promise to await on.
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
   * @returns A void promise to await on.
   */
   simPrintLogMessage(message: string, messageParam = '', severity = 1): Promise<void> {
    return this._call('simPrintLogMessage', message, messageParam, severity) as Promise<void>;
  }

  /**
   * Pauses simulation
   * @param shouldPause - True (default) to pause the simulation, False to release
   * @returns A void promise to await on.
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
   * @returns An empty promise to await on.
   */
  simContinueForTime(seconds: number): Promise<void> {
    return this._call('simContinueForTime', seconds) as Promise<void>;
  }

  /**
   * Continue (or resume if paused) the simulation for the specified number
   * of frames, after which the simulation will be paused.
   * @param frames - Frames to run the simulation for
   * @returns An empty promise to await on.
   */
  simContinueForFrames(frames: number): Promise<void> {
    return this._call('simContinueForFrames', frames) as Promise<void>;
  }

  /**
   * 
   * @returns 
   */
   getSettingsString(): Promise<string> {
    return this._call('getSettingsString') as Promise<string>;
  }

  /**
   * Enable Weather effects. Needs to be called before using `setWeatherParameter` API
   * @returns A void promise to await on.
   */
   simEnableWeather(enable: boolean): Promise<void> {
    return this._call('simEnableWeather', enable) as Promise<void>;
  }

  /**
   * Set simulated wind, in World frame, NED direction, m/s
   * @param wind - Wind, in World frame, NED direction, in m/s
   * @returns A void promise to await on.
   */
   simSetWind(wind: Vector3r): Promise<void> {
    return this._call('simSetWind', wind) as Promise<void>;
  }

  /**
   * Enable various weather effects
   * @param param - Weather effect to be enabled
   * @param val - Intensity of the effect, Range 0-1
   * @returns A void promise to await on.
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
   * @returns A void promise to await on.
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
   * @returns True if successful, otherwise False
   */
   simSetLightIntensity(lightName: string, intensity: number): Promise<boolean> {
    return this._call('simSetLightIntensity', lightName, intensity) as Promise<boolean>;
  }

  /**
   * Control the pose of a selected camera
   * @param cameraName - Name of the camera to be controlled
   * @param pose - Pose representing the desired position and orientation of the camera
   * @param vehicleName - Name of vehicle which the camera corresponds to
   * @param external - Whether the camera is an External Camera
   * @returns A void promise to await on.
   */
  simSetCameraPose(cameraName: string, pose: Pose, vehicleName = '', external = false): Promise<void> {
    return this._call('simSetCameraPose', cameraName, pose,
                       vehicleName, external) as Promise<void>;
  }

  /**
   * 
   * @param regEx 
   * @returns 
   */
  simListSceneObjects(regEx = '.*'): Promise<Array<string>> {
    return this._call('simListSceneObjects', regEx) as Promise<Array<string>>;
  }

  /**
   * 
   * @returns 
   */
  simListAssets(): Promise<unknown> {
    return this._call('simListAssets') as Promise<unknown>;
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
   simSpawnObject(objectName: string, assetName: string, pose: Pose, 
    scale: Vector3r, physicsEnabled=false, isBlueprint=false): Promise<string> {
      return this._call('simSpawnObject', objectName, assetName,
                        pose, scale, physicsEnabled, isBlueprint) as Promise<string>;
  }

  /**
   * 
   * @param objectName 
   * @returns 
   */
   simDestroyObject(objectName: string): Promise<boolean> {
    return this._call('simDestroyObject', objectName) as Promise<boolean>;
  }

  /**
   * The position inside the returned Pose is in the world frame
   * @param objectName 
   * @returns The pose
   */
   simGetObjectPose(objectName: string): Promise<Pose | undefined> {
    return this._call('simGetObjectPose', objectName) as Promise<Pose | undefined>;
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
   * @returns If the move was successful
   */
  simSetObjectPose(objectName: string, pose: Pose, teleport = true): Promise<boolean> {
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
   * @returns True if scale change was successful
   */
   simSetObjectScale(objectName: string, scaleVector: Vector3r): Promise<boolean> {
    return this._call('simSetObjectScale', objectName, scaleVector) as Promise<boolean>;
  }

  /**
 * Lists the names of current vehicles
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
   * @returns Whether vehicle was created
   */
  simAddVehicle(name: string, type: string, pose: Pose,
                 pawnPath: string): Promise<boolean> {
    return this._call('simAddVehicle', name, type,
            pose, pawnPath) as Promise<boolean>;
  }

  /**
   * Clear any persistent markers - those plotted with setting 
   * `isPersistent=true` in the APIs below
   * @returns A void promise to await on.
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
   * @returns A void promise to await on.
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
   * @returns A void promise to await on.
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
   * @returns A void promise to await on.
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
   * @returns A void promise to await on.
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
   * @returns A void promise to await on. 
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
   * @returns 
   */
   simPlotTransforms(poses: Array<Pose>, scale = 5.0, thickness = 5.0, 
    duration = -1.0, isPersistent = false): Promise<void> {

    return this._call('simPlotTransforms', poses, scale, thickness, 
        duration, isPersistent) as Promise<void>;
  }

  // Vehicle ---------------

  /**
   * Arms or disarms vehicle
   * @param arm - True to arm, False to disarm the vehicle
   * @param vehicleName - Name of the vehicle to send this command to
   * @returns Success
   */
  armDisarm(arm: boolean, vehicleName = ''): Promise<boolean> {
    return this._call('armDisarm', arm, vehicleName) as Promise<boolean>;
  }

  /**
   * Enables or disables API control for vehicle corresponding to vehicle_name
   * @returns A void promise to await on.
   */
  enableApiControl(enablement: boolean, vehicleName: string): Promise<void> {
    return this._call('enableApiControl', enablement, vehicleName) as Promise<void>;
  }

  /**
   * Returns true if API control is established.
   * @param vehicleName - Name of the vehicle
   * @returns If API control is enabled
   */
  isApiControlEnabled(vehicleName: string): Promise<boolean> {
    return this._call('isApiControlEnabled', vehicleName) as Promise<boolean>;
  }

  /**
   * 
   * @param vehicleName 
   * @returns 
   */
   simGetVehiclePose(vehicleName: string): Promise<Pose> {
    return this._call('simGetVehiclePose', vehicleName) as Promise<Pose>;
  }

  /**
   * 
   * @param pose 
   * @param ignorecollision 
   * @returns 
   */
   simSetVehiclePose(pose: Pose, ignoreCollision=true, vehicleName=''): Promise<unknown> {
    return this._call('simSetVehiclePose', pose, ignoreCollision, vehicleName) as Promise<unknown>;
  }

  /**
   * 
   * @param vehicleName 
   * @returns 
   */
  getHomeGeoPoint(vehicleName='') : Promise<GeoPoint> {
    return this._call('getHomeGeoPoint', vehicleName) as Promise<GeoPoint>;
  }

  /**
   * 
   * @param point 
   * @param vehicleName 
   * @returns 
   */
  simTestLineOfSightToPoint(point: GeoPoint, vehicleName=''): Promise<boolean> {
    return this._call('simTestLineOfSightToPoint', point, vehicleName) as Promise<boolean>;
  }

  /**
   * Returns whether the target point is visible from the perspective of the source point
   * @param point1 - source point
   * @param point2 - target point
   * @returns True if success; false otherwise
   */
  simTestLineOfSightBetweenPoints(point1: GeoPoint, point2: GeoPoint): Promise<boolean> {
    return this._call('simTestLineOfSightBetweenPoints', point1, point2) as Promise<boolean>;
  }

  /**
   * 
   * @param vehicleName 
   * @returns 
   */
  simGetCollisionInfo(vehicleName=''): Promise<CollisionInfo> {
    return this._call('simGetCollisionInfo', vehicleName) as Promise<CollisionInfo>;
  }

  /**
   * Get a single image
   * @param cameraName - Name of the camera, for backwards compatibility, ID numbers such as 0,1,etc. can also be used
   * @param imageType - Type of image required
   * @param vehicleName - Name of the vehicle with the camera
   * @param external - Whether the camera is an External Camera
   * @returns Binary string literal of compressed png image
   */
   simGetImage(cameraName: string, imageType: ImageType, vehicleName = '', isExternal = false): Promise<unknown> {
      return this._call('simGetImage', cameraName, imageType, vehicleName, isExternal) as Promise<unknown>;
    }

  // Sensor Data

  /**
   * Access distance sensor data.
   * @param distanceSensorName - Name of Distance Sensor to get data from, specified in settings.json
   * @param vehicleName - Name of vehicle to which the sensor corresponds to
   * @returns The distance data
   */
  getDistanceSensorData(distanceSensorName = '', vehicleName = ''): Promise<DistanceSensorData> {
    return this._call('getDistanceSensorData', distanceSensorName, vehicleName) as Promise<DistanceSensorData>;
  }

  /**
   * 
   * @param lidarName 
   * @param vehicleName 
   * @returns 
   */
  getLidarData(lidarName = '', vehicleName = ''): Promise<LidarData> {
    return this._call('getLidarData', lidarName, vehicleName) as Promise<LidarData>;
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

}


