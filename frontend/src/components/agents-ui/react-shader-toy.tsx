import React, { useEffect, useRef, CanvasHTMLAttributes } from 'react';
import { 
  PRECISIONS, FS_MAIN_SHADER, BASIC_FS, BASIC_VS,
  UNIFORM_TIME, UNIFORM_TIMEDELTA, UNIFORM_DATE, UNIFORM_FRAME,
  UNIFORM_MOUSE, UNIFORM_RESOLUTION, UNIFORM_CHANNEL,
  UNIFORM_CHANNELRESOLUTION, UNIFORM_DEVICEORIENTATION
} from './constants';
import { 
  log, isMatrixType, isVectorListType, processUniform,
  uniformTypeToGLSLType, latestPointerClientCoords, lerpVal, insertStringAtIndex
} from './utils';
import { Texture, TextureArgs } from './Texture';

interface Uniform {
  type: string;
  value: any;
}

interface UniformInfo {
  type: string;
  isNeeded: boolean;
  value: any;
  arraySize?: string;
}

interface ReactShaderToyProps extends CanvasHTMLAttributes<HTMLCanvasElement> {
  fs: string;
  vs?: string;
  textures?: TextureArgs[];
  uniforms?: Record<string, Uniform>;
  clearColor?: [number, number, number, number];
  precision?: 'lowp' | 'mediump' | 'highp';
  style?: React.CSSProperties;
  contextAttributes?: WebGLContextAttributes;
  lerp?: number;
  devicePixelRatio?: number;
  onDoneLoadingTextures?: () => void;
  onError?: (error: any) => void;
  onWarning?: (warning: any) => void;
  animateWhenNotVisible?: boolean;
}

export function ReactShaderToy({
  fs,
  vs = BASIC_VS,
  textures = [],
  uniforms: propUniforms,
  clearColor = [0, 0, 0, 1],
  precision = 'highp',
  style,
  contextAttributes = {},
  lerp = 1,
  devicePixelRatio = 1,
  onDoneLoadingTextures,
  onError = console.error,
  onWarning = console.warn,
  animateWhenNotVisible = false,
  ...canvasProps
}: ReactShaderToyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const squareVerticesBufferRef = useRef<WebGLBuffer | null>(null);
  const shaderProgramRef = useRef<WebGLProgram | null>(null);
  const vertexPositionAttributeRef = useRef<number | undefined>(undefined);
  const animFrameIdRef = useRef<number | undefined>(undefined);
  const initFrameIdRef = useRef<number | undefined>(undefined);
  const isVisibleRef = useRef(true);
  const animateWhenNotVisibleRef = useRef(animateWhenNotVisible);
  const mousedownRef = useRef(false);
  const canvasPositionRef = useRef<DOMRect | undefined>(undefined);
  const timerRef = useRef(0);
  const lastMouseArrRef = useRef<[number, number]>([0, 0]);
  const texturesArrRef = useRef<Texture[]>([]);
  const lastTimeRef = useRef(0);
  const resizeObserverRef = useRef<ResizeObserver | undefined>(undefined);
  const uniformsRef = useRef<Record<string, UniformInfo>>({
    [UNIFORM_TIME]: { type: 'float', isNeeded: false, value: 0 },
    [UNIFORM_TIMEDELTA]: { type: 'float', isNeeded: false, value: 0 },
    [UNIFORM_DATE]: { type: 'vec4', isNeeded: false, value: [0, 0, 0, 0] },
    [UNIFORM_MOUSE]: { type: 'vec4', isNeeded: false, value: [0, 0, 0, 0] },
    [UNIFORM_RESOLUTION]: { type: 'vec2', isNeeded: false, value: [0, 0] },
    [UNIFORM_FRAME]: { type: 'int', isNeeded: false, value: 0 },
    [UNIFORM_DEVICEORIENTATION]: { type: 'vec4', isNeeded: false, value: [0, 0, 0, 0] },
  });
  const propsUniformsRef = useRef(propUniforms);

  const setupChannelRes = (texture: Texture | { width: number, height: number }, id: number) => {
    const width = (texture as any).width ?? 0;
    const height = (texture as any).height ?? 0;
    if (!uniformsRef.current.iChannelResolution) {
        uniformsRef.current.iChannelResolution = { type: 'vec3', isNeeded: false, value: [] };
    }
    const channelResValue = uniformsRef.current.iChannelResolution.value;
    channelResValue[id * 3] = width * devicePixelRatio;
    channelResValue[id * 3 + 1] = height * devicePixelRatio;
    channelResValue[id * 3 + 2] = 0;
  };

  const initWebGL = () => {
    if (!canvasRef.current) return;
    glRef.current = (canvasRef.current.getContext('webgl', contextAttributes) as WebGLRenderingContext) || (canvasRef.current.getContext('experimental-webgl', contextAttributes) as WebGLRenderingContext);
    glRef.current?.getExtension('OES_standard_derivatives');
    glRef.current?.getExtension('EXT_shader_texture_lod');
  };

  const initBuffers = () => {
    const gl = glRef.current;
    if (!gl) return;
    squareVerticesBufferRef.current = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBufferRef.current);
    const vertices = [1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  };

  const onDeviceOrientationChange = (e: any) => {
    uniformsRef.current.iDeviceOrientation.value = [e.alpha ?? 0, e.beta ?? 0, e.gamma ?? 0, (window.screen as any)?.orientation?.angle ?? 0];
  };

  const mouseDown = (e: MouseEvent | TouchEvent) => {
    const [clientX, clientY] = latestPointerClientCoords(e);
    const rect = canvasPositionRef.current;
    if (!rect) return;
    const mouseX = clientX - rect.left - window.scrollX;
    const mouseY = rect.height - clientY - rect.top - window.scrollY;
    mousedownRef.current = true;
    const mouseValue = uniformsRef.current.iMouse.value;
    mouseValue[2] = mouseX;
    mouseValue[3] = mouseY;
    lastMouseArrRef.current = [mouseX, mouseY];
  };

  const mouseMove = (e: MouseEvent | TouchEvent) => {
    canvasPositionRef.current = canvasRef.current?.getBoundingClientRect();
    const [clientX, clientY] = latestPointerClientCoords(e);
    const rect = canvasPositionRef.current;
    if (!rect) return;
    const mouseX = clientX - rect.left;
    const mouseY = rect.height - clientY - rect.top;
    if (lerp !== 1) {
      lastMouseArrRef.current = [mouseX, mouseY];
    } else {
      const mouseValue = uniformsRef.current.iMouse.value;
      mouseValue[0] = mouseX;
      mouseValue[1] = mouseY;
    }
  };

  const mouseUp = () => {
    const mouseValue = uniformsRef.current.iMouse.value;
    mouseValue[2] = 0; mouseValue[3] = 0;
  };

  const onResize = () => {
    const gl = glRef.current;
    if (!gl || !canvasRef.current) return;
    canvasPositionRef.current = canvasRef.current.getBoundingClientRect();
    const dpr = devicePixelRatio;
    gl.canvas.width = Math.floor(canvasPositionRef.current.width * dpr);
    gl.canvas.height = Math.floor(canvasPositionRef.current.height * dpr);
    if (uniformsRef.current.iResolution?.isNeeded && shaderProgramRef.current) {
      const rUniform = gl.getUniformLocation(shaderProgramRef.current, UNIFORM_RESOLUTION);
      gl.uniform2fv(rUniform, [gl.canvas.width, gl.canvas.height]);
    }
  };

  const createShader = (type: number, code: string): WebGLShader | null => {
    const gl = glRef.current; if (!gl) return null;
    const shader = gl.createShader(type); if (!shader) return null;
    gl.shaderSource(shader, code); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      onWarning?.(log(`Shader error:\n${code}`));
      onError?.(log(`Log: ${gl.getShaderInfoLog(shader)}`));
      gl.deleteShader(shader); return null;
    }
    return shader;
  };

  const initShaders = (fCode: string, vCode: string) => {
    const gl = glRef.current; if (!gl) return;
    const fShader = createShader(gl.FRAGMENT_SHADER, fCode);
    const vShader = createShader(gl.VERTEX_SHADER, vCode);
    if (!fShader || !vShader) return;
    const program = gl.createProgram(); if (!program) return;
    gl.attachShader(program, vShader); gl.attachShader(program, fShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      onError?.(log(`Link error: ${gl.getProgramInfoLog(program)}`)); return;
    }
    gl.useProgram(program); shaderProgramRef.current = program;
    vertexPositionAttributeRef.current = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(vertexPositionAttributeRef.current);
  };

  const processCustomUniforms = () => {
    if (!propUniforms) return;
    for (const name of Object.keys(propUniforms)) {
      const u = propUniforms[name]; if (!u) continue;
      const glslType = uniformTypeToGLSLType(u.type); if (!glslType) continue;
      const info: UniformInfo = { type: glslType, isNeeded: false, value: u.value };
      if (isMatrixType(u.type, u.value)) {
        const val = Number.parseInt(u.type.charAt(u.type.length - 3));
        const count = Math.floor(u.value.length / (val * val));
        if (u.value.length > val * val) info.arraySize = `[${count}]`;
      } else if (isVectorListType(u.type, u.value)) {
        info.arraySize = `[${Math.floor(u.value.length / Number.parseInt(u.type.charAt(0)))}]`;
      }
      uniformsRef.current[name] = info;
    }
  };

  const processTextures = () => {
    const gl = glRef.current; if (!gl) return;
    if (textures.length > 0) {
      uniformsRef.current[UNIFORM_CHANNELRESOLUTION] = { type: 'vec3', isNeeded: false, arraySize: `[${textures.length}]`, value: [] };
      const promises = textures.map((t, id) => {
        uniformsRef.current[`${UNIFORM_CHANNEL}${id}`] = { type: 'sampler2D', isNeeded: false, value: null };
        setupChannelRes(t as any, id);
        texturesArrRef.current[id] = new Texture(gl);
        return texturesArrRef.current[id].load(t).then((tex) => setupChannelRes(tex, id));
      });
      Promise.all(promises).then(() => onDoneLoadingTextures?.()).catch((e) => { onError?.(e); onDoneLoadingTextures?.(); });
    } else onDoneLoadingTextures?.();
  };

  const preProcessFragment = (code: string) => {
    const p = PRECISIONS.includes(precision) ? precision : 'highp';
    const pStr = `precision ${p} float;\n`;
    let fShader = pStr.concat(`#define DPR ${devicePixelRatio.toFixed(1)}\n`).concat(code.replace(/texture\(/g, 'texture2D('));
    for (const name of Object.keys(uniformsRef.current)) {
      if (code.includes(name)) {
        const u = uniformsRef.current[name]!;
        fShader = insertStringAtIndex(fShader, `uniform ${u.type} ${name}${u.arraySize || ''}; \n`, fShader.lastIndexOf(pStr) + pStr.length);
        u.isNeeded = true;
      }
    }
    if (code.includes('mainImage')) fShader = fShader.concat(FS_MAIN_SHADER);
    return fShader;
  };

  const setUniforms = (ts: number) => {
    const gl = glRef.current; if (!gl || !shaderProgramRef.current) return;
    const delta = lastTimeRef.current ? (ts - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = ts;
    const pU = propsUniformsRef.current;
    if (pU) {
      for (const name of Object.keys(pU)) {
        if (uniformsRef.current[name]?.isNeeded) {
          const loc = gl.getUniformLocation(shaderProgramRef.current, name);
          if (loc) processUniform(gl, loc, pU[name]!.type, pU[name]!.value);
        }
      }
    }
    const u = uniformsRef.current;
    if (u.iMouse?.isNeeded) gl.uniform4fv(gl.getUniformLocation(shaderProgramRef.current, UNIFORM_MOUSE), u.iMouse.value);
    if (u.iChannelResolution?.isNeeded) gl.uniform3fv(gl.getUniformLocation(shaderProgramRef.current, UNIFORM_CHANNELRESOLUTION), u.iChannelResolution.value);
    if (u.iDeviceOrientation?.isNeeded) gl.uniform4fv(gl.getUniformLocation(shaderProgramRef.current, UNIFORM_DEVICEORIENTATION), u.iDeviceOrientation.value);
    if (u.iTime?.isNeeded) gl.uniform1f(gl.getUniformLocation(shaderProgramRef.current, UNIFORM_TIME), (timerRef.current += delta));
    if (u.iTimeDelta?.isNeeded) gl.uniform1f(gl.getUniformLocation(shaderProgramRef.current, UNIFORM_TIMEDELTA), delta);
    if (u.iDate?.isNeeded) {
      const d = new Date();
      gl.uniform4fv(gl.getUniformLocation(shaderProgramRef.current, UNIFORM_DATE), [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() * 0.001]);
    }
    if (u.iFrame?.isNeeded) gl.uniform1i(gl.getUniformLocation(shaderProgramRef.current, UNIFORM_FRAME), u.iFrame.value++);
    texturesArrRef.current.forEach((tex, i) => {
      if (tex.isLoaded && tex._webglTexture && u[`iChannel${i}`]?.isNeeded) {
        const loc = gl.getUniformLocation(shaderProgramRef.current!, `iChannel${i}`);
        gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tex._webglTexture);
        gl.uniform1i(loc, i);
        if (tex.isVideo) tex.updateTexture(tex._webglTexture, tex.source as HTMLVideoElement, tex.flipY);
      }
    });
  };

  const drawScene = (ts: number) => {
    const gl = glRef.current; if (!gl) return;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBufferRef.current);
    gl.vertexAttribPointer(vertexPositionAttributeRef.current ?? 0, 3, gl.FLOAT, false, 0, 0);
    setUniforms(ts);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (u.iMouse?.isNeeded && lerp !== 1) {
      u.iMouse.value[0] = lerpVal(u.iMouse.value[0], lastMouseArrRef.current[0], lerp);
      u.iMouse.value[1] = lerpVal(u.iMouse.value[1], lastMouseArrRef.current[1], lerp);
    }
    if (animateWhenNotVisibleRef.current || isVisibleRef.current) animFrameIdRef.current = requestAnimationFrame(drawScene);
  };
  const u = uniformsRef.current;
  const addEventListeners = () => {
    const options: AddEventListenerOptions = { passive: true };
    const canvas = canvasRef.current;
    if (uniformsRef.current.iMouse?.isNeeded && canvas) {
      canvas.addEventListener('mousemove', mouseMove as EventListener, options);
      canvas.addEventListener('mouseout', mouseUp as EventListener, options);
      canvas.addEventListener('mouseup', mouseUp as EventListener, options);
      canvas.addEventListener('mousedown', mouseDown as EventListener, options);
      canvas.addEventListener('touchmove', mouseMove as EventListener, options);
      canvas.addEventListener('touchend', mouseUp as EventListener, options);
      canvas.addEventListener('touchstart', mouseDown as EventListener, options);
    }
    if (uniformsRef.current.iDeviceOrientation?.isNeeded) {
      window.addEventListener('deviceorientation', onDeviceOrientationChange, options);
    }
    if (canvas) {
      resizeObserverRef.current = new ResizeObserver(onResize);
      resizeObserverRef.current.observe(canvas);
      window.addEventListener('resize', onResize, options);
    }
  };

  const removeEventListeners = () => {
    const options: EventListenerOptions = { capture: false };
    const canvas = canvasRef.current;
    if (uniformsRef.current.iMouse?.isNeeded && canvas) {
      canvas.removeEventListener('mousemove', mouseMove as EventListener, options);
      canvas.removeEventListener('mouseout', mouseUp as EventListener, options);
      canvas.removeEventListener('mouseup', mouseUp as EventListener, options);
      canvas.removeEventListener('mousedown', mouseDown as EventListener, options);
      canvas.removeEventListener('touchmove', mouseMove as EventListener, options);
      canvas.removeEventListener('touchend', mouseUp as EventListener, options);
      canvas.removeEventListener('touchstart', mouseDown as EventListener, options);
    }
    if (uniformsRef.current.iDeviceOrientation?.isNeeded) {
      window.removeEventListener('deviceorientation', onDeviceOrientationChange, options);
    }
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      window.removeEventListener('resize', onResize, options);
    }
  };

  useEffect(() => { propsUniformsRef.current = propUniforms; }, [propUniforms]);
  useEffect(() => {
    animateWhenNotVisibleRef.current = animateWhenNotVisible;
    if (animateWhenNotVisible) isVisibleRef.current = true;
  }, [animateWhenNotVisible]);

  useEffect(() => {
    if (animateWhenNotVisible || !canvasRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        isVisibleRef.current = e.isIntersecting;
        if (e.isIntersecting) requestAnimationFrame(drawScene);
      }
    }, { threshold: 0 });
    obs.observe(canvasRef.current);
    return () => obs.disconnect();
  }, [animateWhenNotVisible]);

  useEffect(() => {
    const texArr = texturesArrRef.current;
    const init = () => {
      initWebGL();
      const gl = glRef.current;
      if (gl && canvasRef.current) {
        gl.clearColor(...clearColor); gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
        canvasRef.current.height = canvasRef.current.clientHeight;
        canvasRef.current.width = canvasRef.current.clientWidth;
        processCustomUniforms(); processTextures();
        initShaders(preProcessFragment(fs || BASIC_FS), vs || BASIC_VS);
        initBuffers(); requestAnimationFrame(drawScene);
        addEventListeners(); onResize();
      }
    };
    initFrameIdRef.current = requestAnimationFrame(init);
    return () => {
      const gl = glRef.current;
      if (gl) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        gl.useProgram(null);
        if (shaderProgramRef.current) gl.deleteProgram(shaderProgramRef.current);
        texArr.forEach(t => t._webglTexture && gl.deleteTexture(t._webglTexture));
      }
      removeEventListeners();
      cancelAnimationFrame(initFrameIdRef.current!);
      cancelAnimationFrame(animFrameIdRef.current!);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ height: '100%', width: '100%', ...style }} {...canvasProps} />;
}
