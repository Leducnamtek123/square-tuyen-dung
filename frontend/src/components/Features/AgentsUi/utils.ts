export const log = (text: string) => `react-shaders: ${text}`;

export function isMatrixType(t: string, v: any): boolean {
  return t.includes('Matrix') && Array.isArray(v);
}
export function isVectorListType(t: string, v: any): boolean {
  return t.includes('v') && Array.isArray(v) && v.length > Number.parseInt(t.charAt(0));
}
export function isVectorType(t: string, v: any): boolean {
  return !t.includes('v') && Array.isArray(v) && v.length > Number.parseInt(t.charAt(0));
}

export const processUniform = (gl: WebGLRenderingContext, location: WebGLUniformLocation, t: string, value: any) => {
  if (isVectorType(t, value)) {
    switch (t) {
      case '2f': return gl.uniform2f(location, value[0], value[1]);
      case '3f': return gl.uniform3f(location, value[0], value[1], value[2]);
      case '4f': return gl.uniform4f(location, value[0], value[1], value[2], value[3]);
      case '2i': return gl.uniform2i(location, value[0], value[1]);
      case '3i': return gl.uniform3i(location, value[0], value[1], value[2]);
      case '4i': return gl.uniform4i(location, value[0], value[1], value[2], value[3]);
    }
  }
  if (typeof value === 'number') {
    switch (t) {
      case '1i': return gl.uniform1i(location, value);
      default: return gl.uniform1f(location, value);
    }
  }
  switch (t) {
    case '1iv': return gl.uniform1iv(location, value);
    case '2iv': return gl.uniform2iv(location, value);
    case '3iv': return gl.uniform3iv(location, value);
    case '4iv': return gl.uniform4iv(location, value);
    case '1fv': return gl.uniform1fv(location, value);
    case '2fv': return gl.uniform2fv(location, value);
    case '3fv': return gl.uniform3fv(location, value);
    case '4fv': return gl.uniform4fv(location, value);
    case 'Matrix2fv': return gl.uniformMatrix2fv(location, false, value);
    case 'Matrix3fv': return gl.uniformMatrix3fv(location, false, value);
    case 'Matrix4fv': return gl.uniformMatrix4fv(location, false, value);
  }
};

export const uniformTypeToGLSLType = (t: string): string | undefined => {
  switch (t) {
    case '1f': return 'float';
    case '2f': return 'vec2';
    case '3f': return 'vec3';
    case '4f': return 'vec4';
    case '1i': return 'int';
    case '2i': return 'ivec2';
    case '3i': return 'ivec3';
    case '4i': return 'ivec4';
    case '1iv': return 'int';
    case '2iv': return 'ivec2';
    case '3iv': return 'ivec3';
    case '4iv': return 'ivec4';
    case '1fv': return 'float';
    case '2fv': return 'vec2';
    case '3fv': return 'vec3';
    case '4fv': return 'vec4';
    case 'Matrix2fv': return 'mat2';
    case 'Matrix3fv': return 'mat3';
    case 'Matrix4fv': return 'mat4';
    default:
      console.error(log(`The uniform type "${t}" is not valid.`));
      return undefined;
  }
};

export const latestPointerClientCoords = (e: MouseEvent | TouchEvent): [number, number] => {
  if ('changedTouches' in e) {
    const t = e.changedTouches[0];
    return [t?.clientX ?? 0, t?.clientY ?? 0];
  }
  return [(e as MouseEvent).clientX, (e as MouseEvent).clientY];
};

export const lerpVal = (v0: number, v1: number, t: number) => v0 * (1 - t) + v1 * t;

export const insertStringAtIndex = (currentString: string, string: string, index: number) =>
  index > 0
    ? currentString.substring(0, index) + string + currentString.substring(index, currentString.length)
    : string + currentString;
