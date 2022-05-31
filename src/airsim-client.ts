
import { Client, TcpClient } from 'msgpack-rpc-node';
import { CarControls, GeoPoint, Pose, Vector3r } from './types';

const DEFAULT_HOST_IP = '127.0.0.1';
const DEFAULT_PORT = 41451;

type MsgpackrpcClient = Client<TcpClient>;

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

  reset(): Promise<void> {
    return this.client.call('reset') as Promise<void>;
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

  simListSceneObjects(regEx = '.*'): Promise<unknown> {
    return this.client.call('simListSceneObjects', regEx) as Promise<unknown>;
  }

  simListAssets(): Promise<unknown> {
    return this.client.call('simListAssets') as Promise<unknown>;
  }

  simDestroyObject(objectName: string): Promise<boolean> {
    return this.client.call('simDestroyObject', objectName) as Promise<boolean>;
  }

  listVehicles(): Promise<unknown> {
    return this.client.call('listVehicles') as Promise<unknown>;
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

  // simGetCollisionInfo(vehicleName=''): Promise<CollisionInfo> {
  //   return this.client.call('simGetCollisionInfo', vehicleName) as Promise<CollisionInfo>
  // }

  simGetWorldExtents(): Promise<unknown> {
    return this.client.call('simGetWorldExtents') as Promise<unknown>;
  }
}

export class CarClient extends AirSimClient {

  constructor(ip = DEFAULT_HOST_IP, port = DEFAULT_PORT) {
    super(ip, port);
  }

  getCarState(vehicleName = ''): Promise<unknown> {
    return this.client.call('getCarState', vehicleName) as Promise<unknown>;
  }

  getCarControls(vehicleName = ''): Promise<CarControls> {
    return this.client.call('getCarControls', vehicleName) as Promise<CarControls>;
  }

  setCarControls(controls: CarControls, vehicleName=''): Promise<void> {
    return this.client.call('setCarControls', controls, vehicleName) as Promise<void>;
  }
}


// https://microsoft.github.io/AirSim/apis/
// ping
// reset
// enableApiControl(bool)
// isApiControlEnabled
// armDisarm(bool)
// confirmConnection
// simPrintLogMessage
// pause(False)
// continueForTime(seconds)


// simGetObjectPose
// simSetObjectPose
// teleport 

// simGetCollisionInfo 
// simEnableWeather

// CAR
// setCarControls
// getCarState
// {
//   "speed": 0,
//   "gear": 0,
//   "rpm": 0,
//   "maxrpm": 7500,
//   "handbrake": false,
//   "kinematics_estimated": {
//     "position": {
//       "x_val": -6.67572024326546e-8,
//       "y_val": -7.835681259393823e-8,
//       "z_val": 0.23371237516403198
//     },
//     "orientation": {
//       "w_val": 1,
//       "x_val": 0.00003087494405917823,
//       "y_val": 2.089863214936854e-15,
//       "z_val": 6.76880010375136e-11
//     },
//     "linear_velocity": {
//       "x_val": 0,
//       "y_val": 0,
//       "z_val": 0
//     },
//     "angular_velocity": {
//       "x_val": 0,
//       "y_val": 0,
//       "z_val": 0
//     },
//     "linear_acceleration": {
//       "x_val": 0,
//       "y_val": 0,
//       "z_val": 0
//     },
//     "angular_acceleration": {
//       "x_val": 0,
//       "y_val": 0,
//       "z_val": 0
//     }
//   },
//   "timestamp": 1653684928781205000
// }
