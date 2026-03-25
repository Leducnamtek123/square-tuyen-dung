import { 
  RepeatWrapping, 
  ClampToEdgeWrapping, 
  NearestFilter, 
  LinearFilter, 
  LinearMipMapLinearFilter 
} from './constants';
import { log } from './utils';

export interface TextureArgs {
  url?: string;
  wrapS?: number;
  wrapT?: number;
  minFilter?: number;
  magFilter?: number;
  flipY?: number;
}

export class Texture {
  gl: WebGLRenderingContext;
  isLoaded = false;
  isVideo = false;
  flipY = -1;
  width = 0;
  height = 0;
  _webglTexture: WebGLTexture | null = null;
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap | null = null;
  url?: string;
  wrapS?: number;
  wrapT?: number;
  minFilter?: number;
  magFilter?: number;
  pow2canvas?: HTMLCanvasElement;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  updateTexture = (texture: WebGLTexture, video: HTMLVideoElement, flipY: number) => {
    const { gl } = this;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
  };

  setupVideo = (url: string): HTMLVideoElement => {
    const video = document.createElement('video');
    let playing = false;
    let timeupdate = false;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.crossOrigin = 'anonymous';
    const checkReady = () => {
      if (playing && timeupdate) this.isLoaded = true;
    };
    video.addEventListener('playing', () => {
      playing = true;
      this.width = video.videoWidth || 0;
      this.height = video.videoHeight || 0;
      checkReady();
    }, true);
    video.addEventListener('timeupdate', () => {
      timeupdate = true;
      checkReady();
    }, true);
    video.src = url;
    return video;
  };

  makePowerOf2 = (image: HTMLImageElement | HTMLCanvasElement | ImageBitmap): HTMLCanvasElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap => {
    if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement || image instanceof ImageBitmap) {
      if (this.pow2canvas === undefined) this.pow2canvas = document.createElement('canvas');
      this.pow2canvas.width = 2 ** Math.floor(Math.log(image.width) / Math.LN2);
      this.pow2canvas.height = 2 ** Math.floor(Math.log(image.height) / Math.LN2);
      const context = this.pow2canvas.getContext('2d');
      context?.drawImage(image, 0, 0, this.pow2canvas.width, this.pow2canvas.height);
      return this.pow2canvas;
    }
    return image;
  };

  load = async (textureArgs: TextureArgs): Promise<this> => {
    const { gl } = this;
    const { url, wrapS, wrapT, minFilter, magFilter, flipY = -1 } = textureArgs;
    if (!url) return Promise.reject(new Error(log('Missing url')));

    const isVideo = /(\.mp4|\.3gp|\.webm|\.ogv)$/i.exec(url);
    Object.assign(this, { url, wrapS, wrapT, minFilter, magFilter, flipY });

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 0]));

    if (isVideo) {
      const video = this.setupVideo(url);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      this._webglTexture = texture;
      this.source = video;
      this.isVideo = true;
      return video.play().then(() => this);
    }

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(log(`failed loading url: ${url}`)));
      img.src = url;
    });

    let finalImage: HTMLImageElement | HTMLCanvasElement | ImageBitmap = image;
    let isPowerOf2 = (image.width & (image.width - 1)) === 0 && (image.height & (image.height - 1)) === 0;
    if ((wrapS !== ClampToEdgeWrapping || wrapT !== ClampToEdgeWrapping || (minFilter !== NearestFilter && minFilter !== LinearFilter)) && !isPowerOf2) {
      finalImage = this.makePowerOf2(image);
      isPowerOf2 = true;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, finalImage);

    if (isPowerOf2 && minFilter !== NearestFilter && minFilter !== LinearFilter) gl.generateMipmap(gl.TEXTURE_2D);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS || RepeatWrapping);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT || RepeatWrapping);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter || LinearMipMapLinearFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter || LinearFilter);

    this._webglTexture = texture;
    this.source = finalImage;
    this.isLoaded = true;
    this.width = (finalImage as any).width || 0;
    this.height = (finalImage as any).height || 0;
    return this;
  };
}
