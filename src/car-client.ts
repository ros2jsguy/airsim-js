import { AirSimClient } from "./airsim-client";
import { CarControls } from "./types";

export class CarClient extends AirSimClient {

  constructor(ip?: string, port?: number) {
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