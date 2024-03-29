import { Box2, Box3, Color as Color3, MathUtils, Matrix4, Quaternion, Vector2, Vector3 } from 'threejs-math';
// eslint-disable-next-line import/no-cycle
import { Color, RGBA } from './internal-types';

export type Vector2r = {
  x_val: number;
  y_val: number;
}

export type Vector3r = {
  x_val: number;
  y_val: number;
  z_val: number;
}

export type Quaternionr = {
  w_val: number;
  x_val: number;
  y_val: number;
  z_val: number;
}

export type RawBox2 = {
  min: Vector2r;
  max:Vector2r;
}

export type RawBox3 = {
  min: Vector3r;
  max:Vector3r;
}

export type RawPose = {
  position: Vector3r;
  orientation: Quaternionr;
}

export type Pose = {
  position: Vector3;
  orientation: Quaternion;
}

export type RawProjectionMatrix = {
  matrix: [number[], number[], number[], number[]]; 
}

export type ProjectionMatrix = {
  matrix: Matrix4;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static toProjectionMatrix(projMatrix: RawProjectionMatrix): ProjectionMatrix {
    const matrix = new Matrix4();
    matrix.set(
      projMatrix.matrix[0][0],
      projMatrix.matrix[0][1],
      projMatrix.matrix[0][2],
      projMatrix.matrix[0][3],
      projMatrix.matrix[1][0],
      projMatrix.matrix[1][1],
      projMatrix.matrix[1][2],
      projMatrix.matrix[1][3],
      projMatrix.matrix[2][0],
      projMatrix.matrix[2][1],
      projMatrix.matrix[2][2],
      projMatrix.matrix[2][3],
      projMatrix.matrix[3][0],
      projMatrix.matrix[3][1],
      projMatrix.matrix[3][2],
      projMatrix.matrix[3][3]
    );
    return { matrix };
  }

  // static toRawProjectionMatrix(matrix: Matrix4): ProjectionMatrix {
  //   const rawArray = matrix.toArray();
  //   const projMatrix: [number[],number[],number[],number[]] = [
  //     [
  //       rawArray[0],
  //       rawArray[1],
  //       rawArray[2],
  //       rawArray[3],
  //     ],
  //     [
  //       rawArray[4],
  //       rawArray[5],
  //       rawArray[6],
  //       rawArray[7],
  //     ],
  //     [
  //       rawArray[8],
  //       rawArray[9],
  //       rawArray[10],
  //       rawArray[11],
  //     ],
  //     [
  //       rawArray[12],
  //       rawArray[13],
  //       rawArray[14],
  //       rawArray[15]
  //     ]
  //   ];

  //   return { 'matrix': projMatrix };
  // }

  static colorToRGBA(color: Color, alpha = 1.0): RGBA {
    if (Array.isArray(color)) {
      return color;
    }

    const c3 = new Color3(color);
    return [c3.r, c3.g, c3.b, alpha];
  }
}


// Coordinate system transforms

export const NED2ENU_ROT_MATRIX = new Matrix4();
NED2ENU_ROT_MATRIX.set(
  0, 1, 0,  0,
  1, 0, 0,  0,
  0, 0, -1, 0,
  0, 0, 0,  1
);

export const ENU2NED_ROT_MATRIX = new Matrix4();
ENU2NED_ROT_MATRIX.set(
  0, 1,  0, 0,
  1, 0,  0, 0,
  0, 0, -1, 0,
  0, 0,  0, 1
);

// export const ENU2NED_QUATERNION = (new Quaternion).setFromRotationMatrix(ENU2NED_ROT_MATRIX);
// export const NED2ENU_QUATERNION = (new Quaternion).setFromRotationMatrix(NED2ENU_ROT_MATRIX);
const SQRT2HALF = Math.sqrt(2) / 2;
const ENU2NED_QUATERNION = new Quaternion(-SQRT2HALF, -SQRT2HALF, 0, 0);
const NED2ENU_QUATERNION = new Quaternion(SQRT2HALF, SQRT2HALF, 0, 0);

/**
 * Convert a vector in the ENU (xyz) coordinate system to the
 * NED coordinate system. Swap x and y and negate z.
 * 
 * @param enu - The source east-north-up vector
 * @param ned - (optional) The output north-east-down vector
 * @returns A quaternion in NED coodinate system
 */
export function ENU2NED(enu: Vector3): Vector3;

/**
 * Convert a quaternion in the ENU (xyz) coordinate system to the
 * NED coordinate system. Swap x and y and negate z.
 * 
 * @param enu - The source east-north-up vector
 * @param ned - (optional) The output north-east-down vector
 * @returns A vector in NED coodinate system
 */
export function ENU2NED(enu: Quaternion): Quaternion

/**
 * Convert a Pose in the ENU (xyz) coordinate system to the
 * NED coordinate system. Swap x and y and negate z.
 * 
 * @param enu - The source east-north-up vector
 * @param ned - (optional) The output north-east-down vector
 * @returns A Pose in NED coodinate system
 */
 export function ENU2NED(enu: Pose): Pose

export function ENU2NED(enu: Vector3 | Quaternion | Pose): Vector3 | Quaternion | Pose {
  if (enu instanceof Vector3) {
    return new Vector3(enu.y, enu.x, -enu.z);
  } 

  if (enu instanceof Quaternion) {
    return ENU2NED_QUATERNION.clone().multiply(enu);
  }

  return {
    position: ENU2NED(enu.position),
    orientation: ENU2NED(enu.orientation),
  };
}

/**
 * Convert a vector in the NED (north-east-down) coordinate system to the
 * ENU (xyz) coordinate system.
 * 
 * @param ned - The source north-east-down vector
 * @param enu - (optional) The output east-north-up vector
 * @returns A vector in ENU coodinate system
 */
export function NED2ENU(ned: Vector3): Vector3;

/**
 * Convert a quaterion in the NED (north-east-down) coordinate system to the
 * ENU (xyz) coordinate system.
 * 
 * @param ned - The source north-east-down vector
 * @param enu - (optional) The output east-north-up vector
 * @returns A quaternion in ENU coodinate system
 */
export function NED2ENU(ned: Quaternion): Quaternion;

/**
 * Convert a Pose in the NED (north-east-down) coordinate system to the
 * ENU (xyz) coordinate system.
 * 
 * @param ned - The source north-east-down vector
 * @param enu - (optional) The output east-north-up vector
 * @returns A Pose in ENU coodinate system
 */
export function NED2ENU(ned: Pose): Pose;
export function NED2ENU(ned: Vector3 | Quaternion | Pose): Vector3 | Quaternion | Pose {
  if (ned instanceof Vector3) {
    return ned.clone().applyMatrix4(NED2ENU_ROT_MATRIX);
  }

  if (ned instanceof Quaternion) {
    return NED2ENU_QUATERNION.clone().multiply(ned);
  }

  return {
    position: NED2ENU(ned.position),
    orientation: NED2ENU(ned.orientation)
  };
}

export const XYZ2NEDQuaternion = new Quaternion();
MathUtils.setQuaternionFromProperEuler(
  XYZ2NEDQuaternion,
  1.5708,
  1.5708,
  0,
  'YZY'
);
XYZ2NEDQuaternion.normalize();

export function XYZ2NED(xyz: Vector3): Vector3;
export function XYZ2NED(xyz: Quaternion): Quaternion;
export function XYZ2NED(xyz: Pose): Pose;
export function XYZ2NED(xyz: Vector3 | Quaternion | Pose): Vector3 | Quaternion | Pose {
  // v = new Vector3(1,0,0);
  // v.applyAxisAngle(new Vector3(0,1,0), 1.5708); // rotate y (vertical axis)
  // v.applyAxisAngle(new Vector3(1,0,0), 1.5708); // rotate x

  if (xyz instanceof Vector3) {
    // return xyz.clone().applyQuaternion(XYZ2NEDQuaternion);
    return new Vector3(-xyz.z, xyz.x, -xyz.y);
  }

  if (xyz instanceof Quaternion) {
    return xyz.clone().multiply(XYZ2NEDQuaternion);
  }

  return { 
    position: XYZ2NED(xyz.position),
    orientation: XYZ2NED(xyz.orientation) 
  };
}

export const NED2XYZQuaternion = XYZ2NEDQuaternion.conjugate().normalize();
// export const NED2XYZQuaternion = new Quaternion();
// MathUtils.setQuaternionFromProperEuler(
//   NED2XYZQuaternion,
//   -1.5708,
//   -1.5708,
//   0,
//   'ZYZ'
// );

export function NED2XYZ(ned: Vector3): Vector3;
export function NED2XYZ(ned: Quaternion): Quaternion;
export function NED2XYZ(ned: Pose): Pose;
export function NED2XYZ(ned: Vector3 | Quaternion | Pose): Vector3 | Quaternion | Pose {
  // v = new Vector3(1,0,0);
  // v.applyAxisAngle(new Vector3(1,0,0), -1.5708);
  // v.applyAxisAngle(new Vector3(0,1,0), -1.5708);

  if (ned instanceof Vector3) {
    // return ned.clone().applyQuaternion(NED2XYZQuaternion);
    return new Vector3(ned.y, -ned.z,-ned.x);
  }

  if (ned instanceof Quaternion) {
    return ned.clone().multiply(NED2XYZQuaternion);
  }

  return { 
    position: NED2XYZ(ned.position),
    orientation: NED2XYZ(ned.orientation) 
  };
}

// export function NEDQuaternion2ENUQuaternion(ned: Quaternion): Quaternion {
//   const sqrt2half = Math.sqrt(2) / 2;
//   return (new Quaternion(sqrt2half, sqrt2half, 0, 0)).multiply(ned);
// }

// export function ENUQuaternion2NEDQuaternion(enu: Quaternion): Quaternion {
//   const sqrt2half = Math.sqrt(2) / 2;
//   return (new Quaternion(-sqrt2half, -sqrt2half, 0, 0)).multiply(enu);
// }

