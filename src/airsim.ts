/* eslint-disable new-cap */
/* eslint-disable no-console */

import { Vector3 } from '@ros2jsguy/three-math-ts';
import { DEFAULT_HOST_IP, DEFAULT_PORT } from './constants';
import {  ImageRequest, ImageResponse, ImageType } from './image';
import { WeatherParameter, CameraInfo } from './internal-types';
import { GeoPoint, MathConverter, Pose3 } from './math';
import { Session } from './session';
import { Vehicle } from './vehicle';

export enum LogSeverity {
  DEBUG,
  INFO,
  WARN,
  ERROR
}

type Constructor<T> = new (name: string) => T;

/**
 * https://microsoft.github.io/AirSim/apis/
 * https://github.com/microsoft/AirSim/blob/master/PythonClient/airsim/client.py
 */
// eslint-disable-next-line import/prefer-default-export
export class AirSim<T extends Vehicle>  {

  private _session: Session | undefined;

  private _vehicles: Map<string,T>;

  /**
   * Create an AirSim client.
   * AirSim serves as a factory for Vehicles, (e.g., Car, Multirotor)
   * hosted in an AirSim environment. When constructing a new AirSim
   * client instance you must provide the class of Vehicle hosted by AirSim.
   * @param vehicleClass - The type of vehicle hosted by the AirSim server
   * @param port - The AirSim server port number
   * @param ip - The AirSim server IP address
   */
  constructor(
      private vehicleClass: Constructor<T>,
      public port: string | number = DEFAULT_PORT,
      public readonly ip = DEFAULT_HOST_IP) {
    this._vehicles = new Map<string, T>();
  }

  /**
   * 
   * @returns 
   */
  async connect(): Promise<boolean> {
    // eslint-disable-next-line no-use-before-define
    const newSession = new Session(this.port, this.ip);
    const result = await newSession.connect();
    if (result) {
      this._session = newSession;
      await this.init();
    }
    return result;
  }

  /**
   * 
   */
  protected async init(): Promise<void> {
    // load vehicles
    const vehicleNames = await this.session.listVehicles();
    vehicleNames.forEach( name => {
      const vehicle = new this.vehicleClass(name);
      vehicle._session = this.session;
      this._vehicles.set(name, vehicle);
    });
  }

  /**
   * 
   * @returns 
   */
  hasSession(): boolean {
    return !!this._session;
  }

  /**
   * 
   */
  get session(): Session {
    if (this._session) return this._session;
    throw(new Error('No session available. Use connect() to create a session.'));
  }

  /**
   * 
   * @returns 
   */
  ping(): Promise<boolean> {
    return this.session.ping();
  }

  /**
   * 
   */
  close(): void {
    this.session.close();
    this._session = undefined;
  }

  /**
   * 
   * @returns 
   */
  getClientVersion(): number {
    return 1; // sync with C++ client
  }

  /**
   * 
   * @returns 
   */
  getServerVersion(): Promise<number> {
    return this.session.getServerVersion();
  }

  /**
   * 
   * @returns 
   */
  getMinRequiredServerVersion(): number {
    return 1; // sync with C++ client
  }

  /**
   * 
   * @returns 
   */
  getMinRequiredClientVersion(): Promise<number> {
    return this.session.getMinRequiredClientVersion();
  }

  /**
   * Checks state of connection and report in Console
   * so user can see the progress for connection.
   */
  async confirmConnection(): Promise<void> {
    if (await this.ping()) {
      console.log('Connected!');
    } else {
      console.log('Ping returned false!');
    }

    const clientVer = this.getClientVersion();
    const clientMinVer = await this.getMinRequiredClientVersion();
    const serverVer = await this.getServerVersion();
    const serverMinVer = await this.getMinRequiredServerVersion();

    const verInfo = 
    `Client Ver: ${clientVer} (Min Req: ${clientMinVer})
Server Ver: ${serverVer} (Min Req: ${serverMinVer})`; 

    console.log(verInfo);

    if (serverVer < serverMinVer) {
        console.log('AirSim server is of older version and not supported by this client. Please upgrade!');
    } else if (clientVer < clientMinVer) {
        console.log('AirSim client is of older version and not supported by this server. Please upgrade!');
    }

    console.log();
  }

  /**
   * Reset the vehicle to its original starting state
   * Note that you must call `enableApiControl` and `armDisarm` again after the call to reset
   * @returns A void promise to await on.
   */
  reset(): Promise<void> {
    return this.session.reset();
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
  printLogMessage(message: string, messageParam = '', severity = LogSeverity.INFO): Promise<void> {
    return this.session.simPrintLogMessage(message, messageParam, severity);
  }

  /**
   * Pauses simulation
   * @returns A void promise to await on.
   */
  pause(): Promise<void> {
    return this.session.simPause(true);
  }

  /**
   * Resume simulation
   * @returns A void promise to await on.
   */
   resume(): Promise<void> {
    return this.session.simPause(false);
  }

  /**
   * Returns true if the simulation is paused
   * @returns Promise<true> if the simulation is paused
   */
  isPaused(): Promise<boolean> {
    return this.session.simIsPaused();
  }

  /**
   * Continue the simulation for the specified number of seconds
   * @param seconds - Time to run the simulation for (float)
   * @returns An empty promise to await on.
   */
  continueForTime(seconds: number): Promise<void> {
    return this.session.simContinueForTime(seconds);
  }

  /**
   * Continue (or resume if paused) the simulation for the specified number
   * of frames, after which the simulation will be paused.
   * @param frames - Frames to run the simulation for
   * @returns An empty promise to await on.
   */
  continueForFrames(frames: number): Promise<void> {
    return this.session.simContinueForFrames(frames);
  }

  /**
   * 
   * @returns 
   */
  getSettingsString(): Promise<string> {
    return this.session.getSettingsString();
  }

  /**
   * Enable Weather effects. Needs to be called before using `setWeatherParameter` API
   * @returns A void promise to await on.
   */
  enableWeather(): Promise<void> {
    return this.session.simEnableWeather(true);
  }

  /**
   * Disable Weather effects. Needs to be called before using `setWeatherParameter` API
   * @returns A void promise to await on.
   */
  disableWeather(): Promise<void> {
    return this.session.simEnableWeather(false);
  }

  /**
   * Set simulated wind, in World frame, NED direction, m/s
   * @param wind - Wind, in World frame, NED direction, in m/s
   * @returns A void promise to await on.
   */
  setWind(wind: Vector3): Promise<void> {
    return this.session.simSetWind(MathConverter.toVector3r(wind));
  }

  /**
   * Enable various weather effects
   * @param param - Weather effect to be enabled
   * @param val - Intensity of the effect, Range 0-1
   * @returns A void promise to await on.
   */
  setWeatherParameter(param: WeatherParameter, val: number): Promise<void> {
    return this.session.simSetWeatherParameter(param, val);
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
  setTimeOfDay(
      isEnabled: boolean,
      startDatetime = '',
      isStartDatetimeDst = false,
      celestialClockSpeed = 1,
      updateIntervalSecs = 60,
      moveSun = true): Promise<void> {

    return this.session.simSetTimeOfDay(
      isEnabled,
      startDatetime,
      isStartDatetimeDst,
      celestialClockSpeed,
      updateIntervalSecs,
      moveSun);
  }

  /**
   * Returns GeoPoints representing the minimum and maximum extents of the world
   * @returns Tuple of GeoPoints [min,max]
   */
  async getWorldExtents(): Promise<[Vector3,Vector3]> {
    const extent = await this.session.simGetWorldExtents();
    return [
      MathConverter.toVector3(extent[0]),
      MathConverter.toVector3(extent[1])
    ];
  }

  /**
   * Change intensity of named light
   * @param lightName - Name of light to change
   * @param intensity - New intensity value [0-1]
   * @returns True if successful, otherwise False
   */
  setLightIntensity(lightName: string, intensity: number): Promise<boolean> {
    return this.session.simSetLightIntensity(lightName, intensity);
  }
  
  /**
   * Get details about the external camera.
   * 
   * Note if the cameraName is unknown to airsim, the server may crash.
   * @param cameraName - Name of the camera, for backwards compatibility,
   *                     ID numbers such as 0,1,etc. can also be used
   * @returns A CameraInfo promise
   */
  getCameraInfo(cameraName: string | number): Promise<CameraInfo> {
    return this.session.simGetCameraInfo(cameraName, undefined, true);
  }

  /**
   * Control the pose of a selected camera
   * @param cameraName - Name of the camera to be controlled
   * @param pose - Pose representing the desired position and orientation of the camera
   * @param vehicleName - Name of vehicle which the camera corresponds to
   * @param external - Whether the camera is an External Camera
   * @returns A void promise to await on.
   */
  setCameraPose(cameraName: string, pose: Pose3, vehicleName = '', external = false): void {
    this.session.simSetCameraPose(cameraName, MathConverter.toPose(pose), vehicleName, external);
  }

  /**
   * 
   * @param regEx 
   * @returns 
   */
  getSceneObjectNames(regEx = '.*'): Promise<Array<string>> {
    return this.session.simListSceneObjects(regEx);
  }

  /**
   * 
   * @returns 
   */
  getAssets(): Promise<unknown> {
    return this.session.simListAssets();
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
  spawnObject(objectName: string, assetName: string, pose: Pose3, 
    scale: Vector3, physicsEnabled=false, isBlueprint=false): Promise<string> {
    return this.session.simSpawnObject(
                objectName,
                assetName,
                MathConverter.toPose(pose), 
                MathConverter.toVector3r(scale),
                physicsEnabled,
                isBlueprint);
  }

  /**
   * 
   * @param objectName 
   * @returns 
   */
  destroyObject(objectName: string): Promise<boolean> {
    return this.session.simDestroyObject(objectName);
  }

  /**
   * The position inside the returned Pose is in the world frame
   * @param objectName 
   * @returns The pose
   */
  async getObjectPose(objectName: string): Promise<Pose3 | undefined> {
    const pose = await this.session.simGetObjectPose(objectName);
    return pose ? MathConverter.toPose3(pose) : undefined;
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
  setObjectPose(objectName: string, pose: Pose3, teleport = true): Promise<boolean> {
    return this.session.simSetObjectPose(objectName, MathConverter.toPose(pose), teleport);
  }

  /**
   * Gets scale of an object in the world
   * @param objectName - Object to get the scale of
   * @returns The object scale
   */
  async getObjectScale(objectName: string): Promise<Vector3> {
    const scale = await this.session.simGetObjectScale(objectName);
    return MathConverter.toVector3(scale);
  }

  /**
   * Sets scale of an object in the world
   * @param objectName - Object to set the scale of
   * @param scaleVector - Desired scale of object
   * @returns True if scale change was successful
   */
  setObjectScale(objectName: string, scaleVector: Vector3): Promise<boolean> {
    return this.session
              .simSetObjectScale(
                objectName,
                MathConverter.toVector3r(scaleVector));
  }

  /**
   * Lists the names of current vehicles
   * @returns List containing names of all vehicles
   */
  async getVehicles() : Promise<Array<T>> {
    return Array.from(this._vehicles.values());
  }

  async getVehicle(name: string): Promise<T | undefined> {
    await this.getVehicles();
    return this._vehicles.get(name);
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
   async addVehicle(vehicle: T, pose: Pose3): Promise<boolean> {
    const result = 
      await this.session.simAddVehicle(vehicle.name, vehicle.controller,
            MathConverter.toPose(pose), vehicle.pawnPath) as boolean;
    if (result) this._vehicles.set(vehicle.name, vehicle);
    return result;
  }

  /**
   * Clear any persistent markers - those plotted with setting 
   * `isPersistent=true` in the APIs below
   * @returns A void promise to await on.
   */
  clearPersistentMarkers(): Promise<void> {
    return this.session.simFlushPersistentMarkers();
  }

  /**
   * Plot a list of 3D points in World NED frame
   * @param points - List of Vector3 objects
   * @param colorRGBA - desired RGBA values from 0.0 to 1.0
   * @param size - Size of plotted point
   * @param duration -Duration (seconds) to plot for
   * @param isPersistent - If set to True, the desired object will be plotted for infinite time.
   * @returns A void promise to await on.
   */
  plotPoints(points: Array<Vector3>, colorRGBA=[1.0, 0.0, 0.0, 1.0],
             size = 10.0, duration = -1.0, isPersistent = false): Promise<void> {
    const newPoints = points.map(point => MathConverter.toVector3r(point));
    return this.session
            .simPlotPoints(
              newPoints,
              colorRGBA,
              size,
              duration,
              isPersistent);
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
  plotLineStrip(points: Array<Vector3>, colorRGBA=[1.0, 0.0, 0.0, 1.0], thickness = 5.0, duration = -1.0, 
                  isPersistent = false): Promise<void> {
    const newPoints = points.map(point => MathConverter.toVector3r(point));
    return this.session
            .simPlotLineStrip(
                newPoints,
                colorRGBA,
                thickness,
                duration,
                isPersistent);
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
  plotLineList(points: Array<Vector3>, colorRGBA=[1.0, 0.0, 0.0, 1.0], thickness = 5.0,
       duration = -1.0, isPersistent = false): Promise<void> {
    const newPoints = points.map(point => MathConverter.toVector3r(point));
    return this.session
            .simPlotLineList(
                newPoints,
                colorRGBA,
                thickness,
                duration,
                isPersistent);
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
  plotArrows(pointsStart: Array<Vector3>, pointsEnd: Array<Vector3>, 
                colorRGBA=[1.0, 0.0, 0.0, 1.0],
                thickness = 5.0, arrowSize = 2.0, duration = -1.0,
                isPersistent = false): Promise<void> {
    const newPointsStart = pointsStart.map(point => MathConverter.toVector3r(point));
    const newPointsEnd = pointsEnd.map(point => MathConverter.toVector3r(point));
    return this.session.simPlotArrows(newPointsStart, newPointsEnd, colorRGBA,
                     thickness, arrowSize, duration, isPersistent);
  }

  /**
   * Plots a list of strings at desired positions in World NED frame.
   * @param strings - List of strings to plot
   * @param positions - List of positions where the strings should be
   *                    plotted. Should be in one-to-one correspondence
   *                    with the strings' list
   * @param scale - Font scale of transform name
   * @param colorRGBA - RGBA values from 0.0 to 1.0
   * @param duration - Duration (seconds) to plot for
   * @returns A void promise to await on. 
   */
  plotStrings(strings: Array<string>, positions: Array<Vector3>,
                 scale = 5, colorRGBA=[1.0, 0.0, 0.0, 1.0], duration = -1.0): Promise<void> {
    const newPositions = positions.map(position => MathConverter.toVector3r(position));              
    return this.session.simPlotStrings(strings, newPositions, scale, colorRGBA, duration) as Promise<void>;
  }

  /**
   * Plots a list of transforms in World NED frame.
   * @param poses - Pose objects representing the transforms to plot
   * @param scale - Length of transforms' axes
   * @param thickness -Thickness of transforms' axes
   * @param duration - Duration (seconds) to plot for
   * @param isPersistent - WHen true, the desired object will be plotted for infinite time.
   * @returns  A void promise to await on.
   */
  plotTransforms(poses: Array<Pose3>, scale = 5.0, thickness = 5.0, 
        duration = -1.0, isPersistent = false): Promise<void> {
    const newPoses = poses.map(pose3 => MathConverter.toPose(pose3));
    return this.session.simPlotTransforms(newPoses, scale, thickness,
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
   plotTransformsWithNames(poses: Array<Pose3>, names: Array<string>, scale = 5.0,
        thickness = 5.0, textScale = 10.0, textColor = [1.0, 0.0, 0.0, 1.0],
        duration = -1.0): Promise<void> {
    const newPoses = poses.map(pose3 => MathConverter.toPose(pose3));
    return this.session.simPlotTransformsWithNames(newPoses, names, scale, thickness,
            textScale, textColor, duration) as Promise<void>;
  }

  /**
   * Returns whether the target point is visible from the perspective of the source point
   * @param point1 - source point
   * @param point2 - target point
   * @returns True if success; false otherwise
   */
  testLineOfSightBetweenPoints(point1: GeoPoint, point2: GeoPoint): Promise<boolean> {
    return this._session.simTestLineOfSightBetweenPoints(point1, point2);
  }

  /**
   * Get a single image
   * @param cameraName - Name of the camera, for backwards compatibility, ID numbers such as 0,1,etc. can also be used
   * @param imageType - Type of image required
   * @param vehicleName - Name of the vehicle with the camera
   * @param external - Whether the camera is an External Camera
   * @returns Binary string literal of compressed png image
   */
  getImage(cameraName: string, imageType: ImageType): Promise<unknown> {
    return this.session.simGetImage(cameraName, imageType, undefined, true) as Promise<unknown>;
  }

  /**
   * Get multiple external images
   * See https://microsoft.github.io/AirSim/image_apis/ for details and examples
   * @param requests - Images required
   * @returns The ImageResponse(s)
   */
  getImages(requests: Array<ImageRequest>): Promise<Array<ImageResponse>> {
    return this._session.simGetImages(requests, undefined, true);
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
  runConsoleCommand(cmd: string): Promise<boolean> {
    return this._session.simRunConsoleCommand(cmd);
  }
}

// TODO implement the following:
// cancelLastTask
// simSetObjectMaterialFromTexture

