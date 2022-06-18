/* eslint-disable max-classes-per-file */
/* eslint-disable no-use-before-define */


import { Pose, ProjectionMatrix } from '../src/math';
import { Session } from '../src/session';

// eslint-disable-next-line import/no-cycle
import { Vehicle } from '../src/vehicle';

export type CameraInfo = {
  pose: Pose,
  fov: number,
  proj_mat: ProjectionMatrix
  }

  export class Camera {

    // eslint-disable-next-line no-useless-constructor
    constructor(public name: string, public readonly vehicle?: Vehicle) {
    }

    isExternal(): boolean {
      return !this.vehicle;
    }

    // get info(): CameraInfo {

    // }
  }

  export interface CameraManager {

    getCameras(): Array<Camera> ;

    hasCamera(name: string): boolean;

    getCamera(name: string): Camera | undefined;

  }

  export class CameraManagerImpl implements CameraManager {
    
    private _cameras: Map<string, Camera>;
    
    constructor(private _session: Session, private _vehicle?: Vehicle) {
      this._cameras = new Map<string, Camera>();
    }

    addCamera(camera: Camera): void {
      // todo: factor in vehicle scope
      this._cameras.set(camera.name, camera);
    }

    getCameras(): Array<Camera> {
      return Array.from(this._cameras.values());
    }
  
    getCamera(name: string): Camera | undefined {
      return this._cameras.get(name);
    }
  
    hasCamera(name: string): boolean {
      return this._cameras.has(name);
    }

    private async loadCameras(): Promise<void> {
      const cameras = (await airsim.getSceneObjects()).filter((obj) => obj.toLowerCase().includes('camera'));
  console.log('Cameras: ');
  cameras.forEach((camera) => console.log(`  ${camera}`));
    }
  }

