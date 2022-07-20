
import { MathUtils, Quaternion, Vector3 } from "@ros2jsguy/three-math-ts";

let q1 = new Quaternion();
let q2 = new Quaternion();
let v1 = new Vector3(1,0,0);
for (let i=0; i < 540; i+=10) {
  let rad = i * 2 * Math.PI / 360;
  console.log(`deg: ${i}  rad: ${rad}`);
  q2.setFromAxisAngle(v1,rad);
  let angle = q1.angleTo(q2);
  console.log(`angle: ${MathUtils.RAD2DEG * angle}`);
}