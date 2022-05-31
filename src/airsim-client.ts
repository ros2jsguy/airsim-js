
import { Client, TcpClient } from 'msgpack-rpc-node';
import { CompletionTriggerKind } from 'typescript';
import { CarControls, CollisionInfo, GeoPoint, Pose, Vector3r, WeatherParameter } from './types';

const DEFAULT_HOST_IP = '127.0.0.1';
const DEFAULT_PORT = 41451;

type MsgpackrpcClient = Client<TcpClient>;

/**
 * https://microsoft.github.io/AirSim/apis/
 * https://github.com/microsoft/AirSim/blob/master/PythonClient/airsim/client.py
 */
export class AirSimClient {

  private _client: MsgpackrpcClient;

  constructor(readonly ip = DEFAULT_HOST_IP, readonly port = DEFAULT_PORT) {
    this._client = new Client(TcpClient, port, ip);
  }

  protected get client(): MsgpackrpcClient {
    return this._client;
  }

  connect(): Promise<boolean> {
    return this.client.connect() as Promise<boolean>;
  }

  armDisarm(arm: boolean, vehicleName = ''): Promise<boolean> {
    return this.client.call('armDisarm', arm, vehicleName) as Promise<boolean>;
  }

  close(): void {
    this.client.close();
  }

  ping(): Promise<boolean> {
    return this.client.call('ping') as Promise<boolean>;
  }

  /**
   * Checks state of connection every 1 sec and reports it in Console
   * so user can see the progress for connection.
   */
  // async confirmConnection(): void {
 
  // if (await this.ping()) {
  //   console.log("Connected!");
  // } else {
  //   console.log("Ping returned false!");
    
  //   const server_ver = self.getServerVersion();
  //   const client_ver = self.getClientVersion();
  //   const server_min_ver = self.getMinRequ${client_min_ver + \
  //         "), Server Ver:" + str(server_ver) + " (Min Req: " + str(server_min_ver) + ")"
  //   }
  // }

  // // if server_ver < server_min_ver:
  // //     print(ver_info, file=sys.stderr)
  // //     print("AirSim server is of older version and not supported by this client. Please upgrade!")
  // // elif client_ver < client_min_ver:
  // //     print(ver_info, file=sys.stderr)
  // //     print("AirSim client is of older version and not supported by this server. Please upgrade!")
  // // else:
  // //     print(ver_info)
  // // print('')

  reset(): Promise<void> {
    return this.client.call('reset') as Promise<void>;
  }

  /**
   * Prints the specified message in the simulator's window.
   * If messageParam is supplied, then it's printed next to the message
   * and in that case if this API is called with same message value
   * but different messageParam again then previous line is overwritten
   * with new line (instead of API creating new line on display).
   * For example, `simPrintLogMessage("Iteration: ", i.toString())`
   * keeps updating same line on display when API is called with different
   * values of i. The valid values of severity parameter is 0 to 3 inclusive
   * that corresponds to different colors.
   * @param message - Message to be printed
   * @param messageParam - Parameter to be printed next to the message
   * @param severity - Range 0-3, inclusive, corresponding to the severity of the message
   */
  simPrintLogMessage(message: string, messageParam = "", severity = 0): Promise<void> {
    return this.client.call('simPrintLogMessage', message, messageParam, severity) as Promise<void>;
  }

  /**
   * Enables or disables API control for vehicle corresponding to vehicle_name
   * @param isEnabled - True to enable, False to disable API control
   * @param vehicleName - Name of the vehicle to send this command to
   */
  enableApiControl(isEnabled = false, vehicleName = ''): Promise<void> {
    return this.client.call('enableApiControl', isEnabled, vehicleName) as Promise<void>;
  }

  isApiControlEnabled(vehicleName = ''): Promise<boolean> {
    return this.client.call('isApiControlEnabled', vehicleName) as Promise<boolean>;
  }

  simPause(shouldPause = true): Promise<boolean> {
    return this.client.call('simPause', shouldPause) as Promise<boolean>;
  }

  simIsPaused(): Promise<boolean> {
    return this.client.call('simIsPaused') as Promise<boolean>;
  }

  continueForTime(seconds: number): Promise<void> {
    return this.client.call('continueForTime', seconds) as Promise<void>;
  }

  continueForFrames(frames: number): Promise<void> {
    return this.client.call('continueForFrames', frames) as Promise<void>;
  }

  getSettingsString(): Promise<string> {
    return this.client.call('getSettingsString') as Promise<string>;
  }

  simEnableWeather(enabled: boolean): Promise<void> {
    return this.client.call('simEnableWeather', enabled) as Promise<void>;
  }

  /**
   * Set simulated wind, in World frame, NED direction, m/s
   * @param wind - Wind, in World frame, NED direction, in m/
   */
  simSetWind(wind: Vector3r): Promise<void> {
    return this.client.call('simSetWind', wind) as Promise<void>;
  }

  /**
   * Enable various weather effects
   * @param param - Weather effect to be enabled
   * @param val - Intensity of the effect, Range 0-1
   */
  simSetWeatherParameter(param: WeatherParameter, val: unknown): Promise<void> {
    return this.client.call('simSetWeatherParameter', param, val) as Promise<void>;
  }

  simListSceneObjects(regEx = '.*'): Promise<unknown> {
    return this.client.call('simListSceneObjects', regEx) as Promise<unknown>;
  }

  simListAssets(): Promise<unknown> {
    return this.client.call('simListAssets') as Promise<unknown>;
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
      scale: number, physicsEnabled=false, isBlueprint=false): Promise<string> {
        return this.client.call('simSpawnObject', objectName, assetName,
                                pose, scale, physicsEnabled, isBlueprint) as Promise<string>;
      }

  simDestroyObject(objectName: string): Promise<boolean> {
    return this.client.call('simDestroyObject', objectName) as Promise<boolean>;
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
   simAddVehicle(vehicleName: string, vehicleType: string, pose: Pose, pawnPath = ""): Promise<boolean> {
    return this.client.call('simAddVehicle', vehicleName, vehicleType, pose, pawnPath) as Promise<boolean>;
  }

  /**
   * Lists the names of current vehicles
   * @returns List containing names of all vehicles
   */
  listVehicles(): Promise<Array<string>> {
    return this.client.call('listVehicles') as Promise<Array<string>>;
  }

  getHomeGeoPoint(vehicleName = '') : Promise<GeoPoint> {
    return this.client.call('getHomeGeoPoint', vehicleName) as Promise<GeoPoint>;
  }

  /**
   * Get a single image
   * @param cameraName - Name of the camera, for backwards compatibility, ID numbers such as 0,1,etc. can also be used
   * @param imageType - Type of image required
   * @param vehicleName - Name of the vehicle with the camera
   * @param external - Whether the camera is an External Camera
   * @returns Binary string literal of compressed png image
   */
  simGetImage(cameraName: string, imageType = 0, vehicleName = '', external = false): Promise<unknown> {
    return this.client.call('simGetImage', cameraName, imageType, vehicleName, external) as Promise<unknown>;
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
   * 
   * Control the position of Sun in the environment
        Sun's position is computed using the coordinates specified in `OriginGeopoint` in settings for the date-time specified in the argument,
        else if the string is empty, current date & time is used
        
   * @param isEnabled - True to enable time-of-day effect, False to reset the position to original
   * @param startDatetime - Date & Time in %Y-%m-%d %H:%M:%S format, e.g. `2018-02-12 15:20:00`
   * @param isStartDatetimeDst - True to adjust for Daylight Savings Time
   * @param celestialClockSpeed - Run celestial clock faster or slower than simulation clock
                                                     E.g. Value 100 means for every 1 second of simulation clock, Sun's position is advanced by 100 seconds
                                                     so Sun will move in sky much faster
   * @param updateIntervalSecs - Interval to update the Sun's position
   * @param moveSun - Whether or not to move the Sun
   */
  simSetTimeOfDay(isEnabled: boolean, startDatetime = "", isStartDatetimeDst = false, 
      celestialClockSpeed = 1, updateIntervalSecs = 60, moveSun = true): Promise<void> {
    
    return this.client.call('simSetTimeOfDay', isEnabled, startDatetime, isStartDatetimeDst,
    celestialClockSpeed, updateIntervalSecs, moveSun) as Promise<void>;
  }

  simGetVehiclePose(vehicleName = ''): Promise<unknown> {
    return this.client.call('simGetVehiclePose', vehicleName) as Promise<unknown>;
  }

  simSetVehiclePose(pose: Pose, ignorecollision: boolean, vehicleName = ''): Promise<unknown> {
    return this.client.call('simSetVehiclePose', pose, ignorecollision, vehicleName) as Promise<unknown>;
  }

  simGetObjectPose(objectName: string): Promise<boolean> {
    return this.client.call('simGetObjectPose', objectName) as Promise<boolean>;
  }

  simSetObjectPose(objectName: string, pose: Pose, teleport = true): Promise<boolean> {
    return this.client.call('simSetObjectPose', objectName, pose, teleport) as Promise<boolean>;
  }

  simGetObjectScale(objectName: string): Promise<Vector3r> {
    return this.client.call('simGetObjectScale', objectName) as Promise<Vector3r>;
  }

  simSetObjectScale(objectName: string, scaleVector: Vector3r): Promise<boolean> {
    return this.client.call('simSetObjectScale', objectName, scaleVector) as Promise<boolean>;
  }

  simTestLineOfSightToPoint(point: GeoPoint, vehicleName = ''): Promise<boolean> {
    return this.client.call('simTestLineOfSightToPoint', point, vehicleName) as Promise<boolean>;
  }

  simTestLineOfSightBetweenPoints(point1: GeoPoint, point2: GeoPoint, vehicleName = ''): Promise<boolean> {
    return this.client.call('simTestLineOfSightBetweenPoints', point1, point2, vehicleName) as Promise<boolean>;
  }

  simGetCollisionInfo(vehicleName=''): Promise<CollisionInfo> {
    return this.client.call('simGetCollisionInfo', vehicleName) as Promise<CollisionInfo>
  }

  simGetWorldExtents(): Promise<[Vector3r,Vector3r]> {
    return this.client.call('simGetWorldExtents') as Promise<[Vector3r,Vector3r]>;
  }

  /**
   * Control the pose of a selected camera
   * @param cameraName - Name of the camera to be controlled
   * @param pose - Pose representing the desired position and orientation of the camera
   * @param vehicleName - Name of vehicle which the camera corresponds to
   * @param external - Whether the camera is an External Camera
   */
  simSetCameraPose(cameraName: string, pose: Pose, vehicleName = '', external = false): void {
    this.client.call('simSetCameraPose', cameraName, pose,
                            vehicleName, external) as Promise<void>;
  }

  /**
   * Clear any persistent markers - those plotted with setting 
   * `isPersistent=true` in the APIs below
   */
  simFlushPersistentMarkers(): void {
    this.client.call('simFlushPersistentMarkers');
  }

  /**
   * Plot a list of 3D points in World NED frame
   * @param points - List of Vector3r objects
   * @param colorRGBA - desired RGBA values from 0.0 to 1.0
   * @param size - Size of plotted point
   * @param duration -Duration (seconds) to plot for
   * @param isPersistent - If set to True, the desired object will be plotted for infinite time.
   */
  simPlotPoints(points: Array<Vector3r>, colorRGBA=[1.0, 0.0, 0.0, 1.0],
                size = 10.0, duration = -1.0, isPersistent = false): void {
    this.client.call('simPlotPoints', points, colorRGBA, size, duration, isPersistent);
  }

  /**
   * Plots a line strip in World NED frame, defined from points[0] to
   * points[1], points[1] to points[2], ... , points[n-2] to points[n-1]
   * @param points - Array of 3D locations of line start and end points, specified as Vector3r objects
   * @param colorRGBA - Array of desired RGBA values from 0.0 to 1.0
   * @param thickness - Thickness of line
   * @param duration - Duration (seconds) to plot for
   * @param isPersistent - If set to True, the desired object will be plotted for infinite time.
   */
  simPlotLineStrip(points: Vector3r, colorRGBA=[1.0, 0.0, 0.0, 1.0], thickness = 5.0, duration = -1.0, 
                  isPersistent = false): void {
    this.client.call('simPlotLineStrip', points, colorRGBA, thickness, duration, isPersistent);
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
   */
  simPlotLineList(points: Array<Vector3r>, colorRGBA=[1.0, 0.0, 0.0, 1.0], thickness = 5.0,
                  duration = -1.0, isPersistent = false): void {
    this.client.call('simPlotLineList', points, colorRGBA, thickness, duration, isPersistent);
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
   */
  simPlotArrows(pointsStart: Array<Vector3r>, pointsEnd: Array<Vector3r>, 
                colorRGBA=[1.0, 0.0, 0.0, 1.0],
                thickness = 5.0, arrowSize = 2.0, duration = -1.0,
                isPersistent = false): void {
       
    this.client.call('simPlotArrows', pointsStart, pointsEnd, colorRGBA,
                     thickness, arrowSize, duration, isPersistent);
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
   */
  simPlotStrings(strings: Array<string>, positions: Array<Vector3r>,
                 scale = 5, colorRGBA=[1.0, 0.0, 0.0, 1.0], duration = -1.0): void {
    this.client.call('simPlotStrings', strings, positions, scale, colorRGBA, duration);
  }

}

// simSetTraceLine
// simSetVehiclePose
// simRunConsoleCommand
// simGetImages
// getImuData
// getBarometerData
// getMagnetometerData
// getGpsData
// getDistanceSensorData
// getLidarData
// simGetLidarSegmentation
// getSettingsString
// simPlotTransforms
// simPlotTransformsWithNames
// cancelLastTas


