import { Box2, Box3, Quaternion, Vector2, Vector3 } from '@ros2jsguy/three-math-ts';

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

export type RawBox2 = {
  min: Vector2r,
  max:Vector2r
}

export type RawBox3 = {
  min: Vector3r,
  max:Vector3r
}

export type RawPose = {
  position: Vector3r,
  orientation: Quaternionr;
}

export type Pose = {
  position: Vector3,
  orientation: Quaternion
}

export type ProjectionMatrix = {
  matrix: Array<number> 
}

export class MathConverter {

  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor() {}

  static toVector2(v2r: Vector2r): Vector2 {
    return new Vector2(v2r.x_val, v2r.y_val);
  }

  static toVector2r(v2: Vector2): Vector2r {
    return { x_val: v2.x, y_val: v2.y };
  }

  static toVector3(v3r: Vector3r): Vector3 {
    return new Vector3(v3r.x_val, v3r.y_val, v3r.z_val);
  }

  static toVector3r(v3: Vector3): Vector3r {
    return { x_val: v3.x, y_val: v3.y, z_val: v3.z };
  }

  static  toQuaternion(qr: Quaternionr): Quaternion {
    return new Quaternion(qr.x_val, qr.y_val, qr.z_val, qr.w_val);
  }

  static toQuaternionr(q: Quaternion): Quaternionr {
    return { x_val: q.x, y_val: q.y, z_val: q.z, w_val: q.w };
  }

  static toPose(pose: RawPose): Pose {
    return {
      position: MathConverter.toVector3(pose.position),
      orientation: MathConverter.toQuaternion(pose.orientation)
    };
  }

  static toRawPose(pose: Pose): RawPose {
    return {
      position: MathConverter.toVector3r(pose.position),
      orientation: MathConverter.toQuaternionr(pose.orientation)
    };
  }

  static toBox2(rawBox2: RawBox2): Box2 {
    return new Box2(
            MathConverter.toVector2(rawBox2.min),
            MathConverter.toVector2(rawBox2.max)
          );
  }

  static toRawBox2(box2: Box2): RawBox2 {
    return {
      min: MathConverter.toVector2r(box2.min),
      max:MathConverter. toVector2r(box2.max)
    };
  }

  static toBox3(rawBox3: RawBox3): Box3 {
    return new Box3(
                MathConverter.toVector3(rawBox3.min),
                MathConverter. toVector3(rawBox3.max)
              );
  }

  static toRawBox3(box3: Box3): RawBox3 {
    return { 
      min: MathConverter.toVector3r(box3.min),
      max: MathConverter.toVector3r(box3.max)
    };
  }
}
