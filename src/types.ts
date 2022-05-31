
export type Vector2r = {
  x_val: number,
  y_val: number
}

export type Vector3r = {
  x_val: number,
  y_val: number,
  z_val: number
}

export type Quaternionr = {
  w_val: number,
  x_val: number,
  y_val: number,
  z_val: number
}

export type Pose = {
  position: Vector3r,
  orientation: Quaternionr;
}

export type GeoPoint = {
  latitude: number,
  longitude: number,
  altitude: number
}

export enum ImageType {
    Scene = 0,
    DepthPlanar = 1,
    DepthPerspective = 2,
    DepthVis = 3,
    DisparityNormalized = 4,
    Segmentation = 5,
    SurfaceNormals = 6,
    Infrared = 7,
    OpticalFlow = 8,
    OpticalFlowVis = 9,
};

export enum DrivetrainType {
    MaxDegreeOfFreedom = 0,
    ForwardOnly = 1
}

export enum LandedState {
    Landed = 0,
    Flying = 1
}

export type ImageRequest = {
    cameraName?: string,
    imageType: ImageType,
    pixelsAsFloat: boolean,
    compress: boolean
}

export type ImageResponse = {
    image_data_uint8: Array<Uint8Array>,
    image_data_float: number,
    camera_position: Vector3r,
    camera_orientation: Quaternionr,
    time_stamp: number,
    message: string,
    pixelsAsFloat: number,
    compress: boolean,
    width: number,
    height: number,
    imagType: ImageType
}

export enum WeatherParameter {
      Rain = 0,
      Roadwetness = 1,
      Snow = 2,
      RoadSnow = 3,
      MapleLeaf = 4,
      RoadLeaf = 5,
      Dust = 6,
      Fog = 7,
      Enabled = 8,
}

export type CollisionInfo = {
  has_collided: boolean,
  normal: Vector3r,
  impact_point: Vector3r,
  position: Vector3r,
  penetration_depth: number,
  time_stamp: number
  object_name: string
  object_id: number
}

export type CarControls = {
  throttle: number,
  steering: number,
  brake: number,
  handbrake: boolean,
  is_manual_gear: boolean,
  manual_gear: number,
  gear_immediate: boolean
}
