/* eslint-disable new-cap */
/* eslint-disable no-console */

import { Vector3 } from 'threejs-math';
import { DEFAULT_HOST_IP, DEFAULT_PORT } from './constants';
import {
  CameraInfo, CameraName, Color,
  DetectionInfo, DetectionSearch,
  GeoPoint, ImageRequest, ImageResponse, ImageType, WeatherParameter
  } from './internal-types';
import { MathConverter, Pose } from './math';
import { Session } from './session';
import { Vehicle } from './vehicle';

const PLOT_MAX_TIME = 10000;

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

  private _port: number;

  private _ip: string;

  private _session: Session | undefined;

  private _vehicles: Map<string,T>;

  /**
   * Create an AirSim client to a server on localhost.
   * AirSim serves as a factory for Vehicles, (e.g., Car, Multirotor)
   * hosted in an AirSim environment. When constructing a new AirSim
   * client instance you must provide the class of Vehicle hosted by AirSim.
   * @example
   * ```
   * new AirSim(Vehicle);
   * new AirSim(Car, 80);
   * ```
   * @param vehicleClass - The type of vehicle hosted by the AirSim server
   * @param port - The AirSim server port number, default = 41451
   */
  constructor(
    vehicleClass: Constructor<T>,
    port?: number);

  /**
   * Create an AirSim client to a server on host at ipAddress with
   * default port, 41451.
   * AirSim serves as a factory for Vehicles, (e.g., Car, Multirotor)
   * hosted in an AirSim environment. When constructing a new AirSim
   * client instance you must provide the class of Vehicle hosted by AirSim.
   * @example
   * ```
   * new AirSim(Vehicle);
   * new AirSim(Multirotor, '127.0.0.1');
   * new AirSim(Car, 'localhost');
   * ```
   * @param vehicleClass - The type of vehicle hosted by the AirSim server
   * @param ip - The AirSim server IP address, default = localhost
   */
  constructor(
    vehicleClass: Constructor<T>,
    ipAddress?: string);

  /**
   * Create an AirSim client to a server on host ip:port.
   * AirSim serves as a factory for Vehicles, (e.g., Car, Multirotor)
   * hosted in an AirSim environment. When constructing a new AirSim
   * client instance you must provide the class of Vehicle hosted by AirSim.
   * ```
   * new AirSim(Vehicle);
   * new AirSim(Multirotor, 80);
   * new AirSim(Car, 80, '127.0.0.1');
   * ```
   * @param vehicleClass - The type of vehicle hosted by the AirSim server
   * @param port - The AirSim server port number, default = 41451
   * @param ip - The AirSim server IP address, default = localhost
   */
  constructor(
    vehicleClass: Constructor<T>,
    port?: number,
    ipAddress?: string);

  /**
   * Create an AirSim client.
   * AirSim serves as a factory for Vehicles, (e.g., Car, Multirotor)
   * hosted in an AirSim environment. When constructing a new AirSim
   * client instance you must provide the class of Vehicle hosted by AirSim.
   * @param vehicleClass - The type of vehicle hosted by the AirSim server
   * @param portOrIp - The AirSim server port number, default = localhost
   * @param ip - The AirSim server IP address, default = 41451
   */
  constructor(
      private vehicleClass: Constructor<T>,
      portOrIp: string | number = DEFAULT_PORT,
      ip = DEFAULT_HOST_IP) {

    this._vehicles = new Map<string, T>();

    if (typeof portOrIp  === 'string') {
      this._ip = portOrIp;
      this._port = DEFAULT_PORT;
    } else {
      this._port = portOrIp;
      this._ip = ip;
    }
  }

  /**
   * Create a network connection to an AirSim server.
   * @returns Promise<true> if successful.
   */
  async connect(): Promise<boolean> {
    // eslint-disable-next-line no-use-before-define
    const newSession = new Session(this._port, this._ip);
    const result = await newSession.connect();
    if (result) {
      this._session = newSession;
      await this.init();
    }
    return result;
  }

  /**
   * Initialize the internal state such as
   * cache vehicles from an AirSim server.
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
   * Test if a Session with an AirSim server exists.
   * @returns True if session exists.
   */
  hasSession(): boolean {
    return !!this._session;
  }

  /**
   * Access the Session with an AirSim server.
   * Use `hasSession()` if you are not sure if the
   * session has been created.
   * @thows Error - When no session exists. 
   */
  get session(): Session {
    if (this._session) return this._session;
    throw(new Error('No session available. Use connect() to create a session.'));
  }

  /**
   * Ensure the AirSim server is reachable and active to respond to
   * api requests.
   * @returns Promise<true> on success.
   */
  ping(): Promise<boolean> {
    return this.session.ping();
  }

  /**
   * Close and shutdown the AirSim session.  
   */
  close(): void {
    this.session.close();
    this._session = undefined;
  }

  /**
   * Get the client version number, an increaing sequence 1, 2, 3, ...
   * @returns The client version number.
   */
  getClientVersion(): number {
    return 1; // sync with C++ client
  }

  /**
   * Get the AirSim server version number, an increaing sequence 1, 2, 3, ...
   * @returns The server version number.
   */
  getServerVersion(): Promise<number> {
    return this.session.getServerVersion();
  }

  /**
   * Get the lowest compatible server version.
   * @returns The minimum compatible server version.
   */
  getMinRequiredServerVersion(): number {
    return 1; // sync with C++ client
  }

  /**
   * Get the lowest compatible client version.
   * @returns The minimum compatible client version. 
   */
  getMinRequiredClientVersion(): Promise<number> {
    return this.session.getMinRequiredClientVersion();
  }

  /**
   * Checks state of connection and reports in Console
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
   * Note that you must call `enableApiControl()` and `arm()` again after the call to reset
   * @returns A Promise<void> to await on.
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
   * For example, `printLogMessage("Iteration: ", i.toString())`
   * keeps updating same line on display when API is called with different
   * values of i. The valid values of severity parameter corresponds
   * to different colors.
   * @param message - Message to be printed
   * @param messageParam - Parameter to be printed next to the message
   * @param severity - The severity level of the message
   * @returns A Promise<void> to await on.
   */
  printLogMessage(message: string, messageParam = '', severity = LogSeverity.INFO): Promise<void> {
    return this.session.simPrintLogMessage(message, messageParam, severity);
  }

  /**
   * Pauses simulation execution. Use resume() to continue.
   * @returns A Promise<void> to await on.
   */
  pause(): Promise<void> {
    return this.session.simPause(true);
  }

  /**
   * Resume simulation execution.
   * @returns A Promise<void> to await on.
   */
   resume(): Promise<void> {
    return this.session.simPause(false);
  }

  /**
   * Returns true if the simulation is paused
   * @returns A Promise<true> if the simulation is paused
   */
  isPaused(): Promise<boolean> {
    return this.session.simIsPaused();
  }

  /**
   * Continue the simulation for the specified number of seconds
   * @param seconds - Time (seconds) to run the simulation
   * @returns A Promise<void> to await on.
   */
  continueForTime(seconds: number): Promise<void> {
    return this.session.simContinueForTime(seconds);
  }

  /**
   * Continue (or resume if paused) the simulation for the specified number
   * of frames, after which the simulation will be paused.
   * @param frames - Frames to run the simulation for
   * @returns A Promise<void> to await on.
   */
  continueForFrames(frames: number): Promise<void> {
    return this.session.simContinueForFrames(frames);
  }

  /**
   * Get a JSON string of the AirSim server settings.
   * @see @Link{https://microsoft.github.io/AirSim/settings|AirSim setting discussion }
   * @returns A JSON string.
   */
  getSettingsString(): Promise<string> {
    return this.session.getSettingsString();
  }

  /**
   * Enable Weather effects. Needs to be called before using `setWeatherParameter()` API
   * @returns A Promise<void> to await on.
   */
  enableWeather(): Promise<void> {
    return this.session.simEnableWeather(true);
  }

  /**
   * Disable Weather effects. Needs to be called before using `setWeatherParameter` API
   * @returns A Promise<void> to await on.
   */
  disableWeather(): Promise<void> {
    return this.session.simEnableWeather(false);
  }

  /**
   * Set simulated wind, in World frame, NED direction, m/s
   * @param wind - Wind, in World frame, NED direction, in m/s
   * @returns A Promise<void> to await on.
   */
  setWind(wind: Vector3): Promise<void> {
    return this.session.simSetWind(MathConverter.toVector3r(wind));
  }

  /**
   * Enable various weather effects
   * @param param - Weather effect to be enabled
   * @param val - Intensity of the effect, Range 0-1
   * @returns A Promise<void> to await on.
   */
  setWeatherParameter(param: WeatherParameter, val: number): Promise<void> {
    return this.session.simSetWeatherParameter(param, val);
  }

  /**
   * 
   * Control the position of Sun in the environment. 
   * The Sun's position is computed using the coordinates
   * specified in `OriginGeopoint` in settings for the
   * date-time specified in the argument, else if the
   * string is empty, current date & time is used
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
   * @returns Promise<true> if successful, otherwise False
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
  async getCameraInfo(cameraName: CameraName): Promise<CameraInfo> {
    const rawCameraInfo = await this._session.simGetCameraInfo(cameraName, undefined, true);
    return {
      pose: MathConverter.toPose(rawCameraInfo.pose),
      fov: rawCameraInfo.fov,
      proj_mat: MathConverter.toProjectionMatrix(rawCameraInfo.proj_mat)
    };
  }

  async getCameraPose(cameraName: CameraName): Promise<Pose> {
    return (await this.getCameraInfo(cameraName)).pose;
  }

  /**
   * Control the pose of a selected camera
   * @param cameraName - Name of the camera to be controlled
   * @param pose - Pose representing the desired position and orientation of the camera
   * @param vehicleName - Name of vehicle which the camera corresponds to
   * @param external - Whether the camera is an External Camera
   * @returns A Promise<void> to await on.
   */
  setCameraPose(cameraName: CameraName, pose: Pose, vehicleName = '', external = false): void {
    this.session.simSetCameraPose(cameraName, MathConverter.toRawPose(pose), vehicleName, external);
  }

  /**
   * Get a listing of the names of all objects that makeup the AirSim seem.
   * @param regEx - A regex for filtering the names.
   * @returns An array of object names.
   */
  getSceneObjectNames(regEx = '.*'): Promise<Array<string>> {
    return this.session.simListSceneObjects(regEx);
  }

  /**
   * The name of the assets that make up the scene.
   * @returns An array of asset names.
   */
  getAssets(): Promise<Array<string>> {
    return this.session.simListAssets();
  }

  /**
   * Spawn a new instance of an existing sim object
   * @param objectName -  Desired name of new object
   * @param assetName - Name of asset(mesh) in the project database
   * @param pose - Desired pose of object
   * @param scale - Desired scale of object
   * @param physicsEnabled - Whether to enable physics for the object
   * @param isBlueprint - Whether to spawn a blueprint or an actor
   * @returns Name of spawned object, in case it had to be modified
   */
  spawnObject(objectName: string, assetName: string, pose: Pose, 
    scale: Vector3, physicsEnabled=false, isBlueprint=false): Promise<string> {
    return this.session.simSpawnObject(
                objectName,
                assetName,
                MathConverter.toRawPose(pose), 
                MathConverter.toVector3r(scale),
                physicsEnabled,
                isBlueprint);
  }

  /**
   * Delete an object from the AirSim server environment.
   * @param objectName - Name of object to delete
   * @returns Promise<true> if success
   */
  destroyObject(objectName: string): Promise<boolean> {
    return this.session.simDestroyObject(objectName);
  }

  /**
   * Get the pose of a simulation object in the world frame.
   * @param objectName - The name of the object who's pose is being requested.
   * @returns The pose
   */
  async getObjectPose(objectName: string): Promise<Pose | undefined> {
    const rawPose = await this.session.simGetObjectPose(objectName);
    return rawPose ? MathConverter.toPose(rawPose) : undefined;
  }

  /**
   * Set the pose of the object(actor) in the environment
   * The specified actor must have Mobility set to movable,
   * otherwise there will be undefined behaviour.
   * @ see @link {https://www.unrealengine.com/en-US/blog/moving-physical-objects | moving phyical objects} for
   * details on how to set Mobility and the effect of Teleport parameter
   * @param objectName - Name of the object(actor) to move
   * @param pose - Desired Pose of the object
   * @param teleport - Whether to move the object immediately without affecting their velocity
   * @returns Promise<true> when the move was successful
   */
  setObjectPose(objectName: string, pose: Pose, teleport = true): Promise<boolean> {
    return this.session.simSetObjectPose(objectName, MathConverter.toRawPose(pose), teleport);
  }

  /**
   * Gets scale of an object in the world frame
   * @param objectName - Object to get the scale of
   * @returns The object scale
   */
  async getObjectScale(objectName: string): Promise<Vector3> {
    const scale = await this.session.simGetObjectScale(objectName);
    return MathConverter.toVector3(scale);
  }

  /**
   * Sets scale of an object in the world frame
   * @param objectName - Object to set the scale of
   * @param scaleVector - Desired scale of object
   * @returns Promise<true> when scale change was successful
   */
  setObjectScale(objectName: string, scaleVector: Vector3): Promise<boolean> {
    return this.session
              .simSetObjectScale(
                objectName,
                MathConverter.toVector3r(scaleVector));
  }

  /**
   * Lists the names of vehicles in the simulation.
   * @returns List containing names of all vehicles
   */
  async getVehicles() : Promise<Array<T>> {
    return Array.from(this._vehicles.values());
  }

  /**
   * Access a vehicle instance by name.
   * @param name - The name of the vehicle.
   * @returns The vehicle
   */
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
   * @returns Promise<true> when vehicle was created
   */
   async addVehicle(vehicle: T, pose: Pose): Promise<boolean> {
    const result = 
      await this.session.simAddVehicle(vehicle.name, vehicle.controller,
            MathConverter.toRawPose(pose), vehicle.pawnPath) as boolean;
    if (result) this._vehicles.set(vehicle.name, vehicle);
    return result;
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
              undefined,
              true)
            .then( () => {
              if (search.radius) {
                this._session.simSetDetectionFilterRadius(
                  search.cameraName,
                  search.imageType,
                  search.radius,
                  undefined,
                  true);
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
        undefined,
        true);

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
        undefined,
        true) as Promise<void>;
  }

  /**
   * Clear any persistent markers from being displayed, 
   * i.e., those plotted with parameter `isPersistent=true`
   * @returns A Promise<void> to await on.
   */
  clearPersistentMarkers(): Promise<void> {
    return this.session.simFlushPersistentMarkers();
  }

  /**
   * Plot a list of 3D points in World NED frame
   * @param points - List of Vector3 objects
   * @param color - Color of points as an RGBA tuple with value 0.0 to 1.0 or
   *    CSS color name, Default = 'red'.
   * @param size - Size of plotted point. Default = 10.
   * @param durationOrPersistent - Duration (seconds) to display points or True to display indefinetly.
   *    Default = True.
   * @returns A Promise<void> to await on.
   */
  plotPoints(points: Array<Vector3>, color: Color = 'red',
      size = 10, durationOrPersistent: number | true = true): Promise<void> {

    let duration = -1;
    let isPersistent = false;
    if (typeof(durationOrPersistent) === 'number') {
      duration = durationOrPersistent;
    } else {
      duration = 0;
      isPersistent = true;
    }
    const newPoints = points.map(point => MathConverter.toVector3r(point));
    return this.session
            .simPlotPoints(
              newPoints,
              MathConverter.colorToRGBA(color),
              size,
              duration,
              isPersistent);
  }

  /**
   * Plots a line strip in World NED frame, defined from points[0] to
   * points[1], points[1] to points[2], ... , points[n-2] to points[n-1]
   * @param points - Array of 3D locations of line start and end points, specified as Vector3r objects
   * @param color - Line color as RGBA tuple of 0.0 to 1.0 values or
   *    CSS color name. Default = 'red'.
   * @param thickness - Thickness of line. Default = 5.
   * @param durationOrPersistent - Duration (seconds) to display line-strip or True to display indefinetly.
   *    Default = true.
   * @returns A Promise<void> to await on.
   */
  plotLineStrip(points: Array<Vector3>, color: Color = 'red', thickness = 5.0, 
      durationOrPersistent: number | true = true): Promise<void> {

    let duration = -1;
    let isPersistent = false;
    if (typeof(durationOrPersistent) === 'number') {
      duration = durationOrPersistent;
    } else {
      duration = 0;
      isPersistent = true;
    }
    const newPoints = points.map(point => MathConverter.toVector3r(point));
    return this.session
            .simPlotLineStrip(
                newPoints,
                MathConverter.colorToRGBA(color),
                thickness,
                duration,
                isPersistent);
  }

  /**
   * Plots a line strip in World NED frame, defined from points[0] to
   * points[1], points[2] to points[3], ... , points[n-2] to points[n-1]
   * @param points - List of 3D locations of line start and end points, specified as Vector3r objects. Must be even
   * @param color - Line color as RGBA tuple of values from 0.0 to 1.0 or
   *    CSS color name. Default = 'red'.
   * @param thickness - Thickness of line. Default = 5.0.
   * @param durationOrPersistent - Duration (seconds) to display lines or True to display indefinetly.
   *    Default = True.
   * @returns A Promise<void> to await on.
   */
  plotLineList(points: Array<Vector3>, color: Color = 'red', thickness = 5.0,
      durationOrPersistent: number | boolean = true): Promise<void> {

    let duration = -1;
    let isPersistent = false;
    if (typeof(durationOrPersistent) === 'number') {
      duration = durationOrPersistent;
    } else {
      duration = 0;
      isPersistent = true;
    }
    const newPoints = points.map(point => MathConverter.toVector3r(point));
    return this.session
            .simPlotLineList(
                newPoints,
                MathConverter.colorToRGBA(color),
                thickness,
                duration,
                isPersistent);
  } 

  /**
   * Plots a list of arrows in World NED frame, defined from points_start[0]
   * to points_end[0], points_start[1] to points_end[1], ... , 
   * points_start[n-1] to points_end[n-1]
   * @param pointsStart - Array of 3D start positions of arrow start positions, specified as Vector3 objects
   * @param pointsEnd - Array of 3D end positions of arrow start positions, specified as Vector3 objects
   * @param color - Line color as RGBA tuple of values from 0.0 to 1.0 or
   *    CSS color name. Default = 'red'.
   * @param thickness - Thickness of line. Default = 5.0.
   * @param arrowSize - Size of arrow head. Default = 2.0.
   * @param durationOrPersistent - Duration (seconds) to display arrows or True to display indefinetly.
   *    Default = True.
   * @returns A Promise<void> to await on.
   */
  plotArrows(pointsStart: Array<Vector3>, pointsEnd: Array<Vector3>, 
      color: Color = 'red',
      thickness = 5.0, arrowSize = 2.0,
      durationOrPersistent: number | true = true): Promise<void> {

    let duration = -1;
    let isPersistent = false;
    if (typeof(durationOrPersistent) === 'number') {
      duration = durationOrPersistent;
    } else {
      duration = 0;
      isPersistent = true;
    }
    const newPointsStart = pointsStart.map(point => MathConverter.toVector3r(point));
    const newPointsEnd = pointsEnd.map(point => MathConverter.toVector3r(point));
    return this.session.simPlotArrows(newPointsStart, newPointsEnd,
                    MathConverter.colorToRGBA(color),
                    thickness, arrowSize, duration,
                    isPersistent);
  }

  /**
   * Plots a list of strings at desired positions in World NED frame.
   * @param strings - List of strings to plot
   * @param positions - List of positions where the strings should be
   *                    plotted. Should be in one-to-one correspondence
   *                    with the strings' list
   * @param scale - Font scale of transform name. Default = 5.
   * @param color - Text color as RGBA tuple of values from 0.0 to 1.0 or
   *    CSS color name. Default = 'red'.
   * @param durationOrPersistent - Duration (seconds) to display strings or True to display indefinetly.
   *    Default = True.
   * @returns A Promise<void> to await on. 
   */
  plotStrings(strings: Array<string>, positions: Array<Vector3>,
      scale = 5, color: Color = 'red', 
      durationOrPersistent: number | true = true): Promise<void> {

    let duration = PLOT_MAX_TIME;
    if (typeof(durationOrPersistent) === 'number') {
      duration = durationOrPersistent;
    } 
    const newPositions = positions.map(position => MathConverter.toVector3r(position));              
    return this.session.simPlotStrings(
              strings, newPositions, scale,
              MathConverter.colorToRGBA(color),
              duration) as Promise<void>;
  }

  /**
   * Plots a list of transforms in World NED frame.
   * @param poses - Pose objects representing the transforms to plot
   * @param scale - Length of transforms' axes. Default = 5.
   * @param thickness -Thickness of transforms' axes. Default = 5.0.
   * @param durationOrPersistent - Duration (seconds) to display transform or True to display indefinetly.
   *    Default = True.
   * @returns  A Promise<void> to await on.
   */
  plotTransforms(poses: Array<Pose>, scale = 5.0, thickness = 5.0, 
      durationOrPersistent: number | true = true): Promise<void> {

    let duration = -1;
    let isPersistent = false;
    if (typeof(durationOrPersistent) === 'number') {
      duration = durationOrPersistent;
    } else {
      duration = 0;
      isPersistent = true;
    }
    const rawPoses = poses.map(pose => MathConverter.toRawPose(pose));
    return this.session.simPlotTransforms(rawPoses, scale, thickness,
                duration, isPersistent) as Promise<void>;
  }

  /**
   * Plots a list of transforms with their names in World NED frame.
   * @param poses - Pose objects representing the transforms to plot
   * @param names - Strings with one-to-one correspondence to list of poses 
   * @param scale - Length of transforms' axes. Default = 5.0.
   * @param thickness -Thickness of transforms' axes. Default = 5.0.
   * @param textScale - Font scale of transform name. Default = 10.
    * @param textColor - Color of transform name as RGBA tuple
    *   of values from 0.0 to 1.0 or CSS color name. 
   *    Default = 'red'.
   * @param durationOrPersistent - Duration (seconds) to display transforms or True to display indefinetly.
   *    Default = True.
   * @returns A Promise<void> to await on.
   */
  plotTransformsWithNames(poses: Array<Pose>, names: Array<string>, scale = 5.0,
        thickness = 5.0, textScale = 10.0, textColor: Color = 'red',
        durationOrPersistent: number | true = true): Promise<void> {

    let duration = PLOT_MAX_TIME;
    if (typeof(durationOrPersistent) === 'number') {
      duration = durationOrPersistent;
    }
    const rawPoses = poses.map(pose => MathConverter.toRawPose(pose));
    return this.session.simPlotTransformsWithNames(rawPoses, names, scale, thickness,
            textScale,  MathConverter.colorToRGBA(textColor), duration) as Promise<void>;
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
   * @returns Uint8Array of compressed png image
   */
  getImage(cameraName: CameraName, imageType: ImageType): Promise<Uint8Array> {
    return this.session.simGetImage(cameraName, imageType, undefined, true) as Promise<Uint8Array>;
  }

  /**
   * Get images from 1 or more cameras.
   * See https://microsoft.github.io/AirSim/image_apis/ for details and examples
   * @param requests - Images required
   * @returns The ImageResponse(s)
   */
  getImages(requests: Array<ImageRequest>): Promise<Array<ImageResponse>> {
    // eslint-disable-next-line no-return-assign
    requests.forEach(request => request.camera_name = request.camera_name.toString());
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
// simSetObjectMaterialFromTexture

