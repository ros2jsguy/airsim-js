
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
