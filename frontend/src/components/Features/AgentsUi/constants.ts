export const PRECISIONS = ['lowp', 'mediump', 'highp'];
export const FS_MAIN_SHADER = `\nvoid main(void){
    vec4 color = vec4(0.0,0.0,0.0,1.0);
    mainImage( color, gl_FragCoord.xy );
    gl_FragColor = color;
}`;
export const BASIC_FS = `void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = fragCoord/iResolution.xy;
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    fragColor = vec4(col,1.0);
}`;
export const BASIC_VS = `attribute vec3 aVertexPosition;
void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
}`;
export const UNIFORM_TIME = 'iTime';
export const UNIFORM_TIMEDELTA = 'iTimeDelta';
export const UNIFORM_DATE = 'iDate';
export const UNIFORM_FRAME = 'iFrame';
export const UNIFORM_MOUSE = 'iMouse';
export const UNIFORM_RESOLUTION = 'iResolution';
export const UNIFORM_CHANNEL = 'iChannel';
export const UNIFORM_CHANNELRESOLUTION = 'iChannelResolution';
export const UNIFORM_DEVICEORIENTATION = 'iDeviceOrientation';

export const LinearFilter = 9729;
export const NearestFilter = 9728;
export const LinearMipMapLinearFilter = 9987;
export const NearestMipMapLinearFilter = 9986;
export const LinearMipMapNearestFilter = 9985;
export const NearestMipMapNearestFilter = 9984;
export const MirroredRepeatWrapping = 33648;
export const ClampToEdgeWrapping = 33071;
export const RepeatWrapping = 10497;
