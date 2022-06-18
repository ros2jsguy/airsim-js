import { Quaternionr, Vector3r } from './math';

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