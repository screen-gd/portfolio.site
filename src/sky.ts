const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float daylight;

float random(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(random(cell), random(cell + vec2(1.0, 0.0)), f.x),
    mix(random(cell + vec2(0.0, 1.0)), random(cell + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float clouds(vec2 p) {
  float value = 0.0;
  float weight = 0.5;
  for (int i = 0; i < 4; i++) {
    value += noise(p) * weight;
    p *= 2.02;
    weight *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float aspect = resolution.x / resolution.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
  float drift = time * 0.012;
  float broad = clouds(p * vec2(2.1, 2.8) + vec2(drift, 0.7));
  float detail = clouds(p * vec2(5.8, 5.0) - vec2(drift * 0.4, 0.3));
  float cloud = smoothstep(0.41, 0.59, broad * 0.8 + detail * 0.2);
  cloud *= smoothstep(0.03, 0.28, uv.y);

  vec3 day = mix(vec3(0.84, 0.93, 1.0), vec3(0.42, 0.68, 0.94), smoothstep(0.0, 1.0, uv.y));
  day = mix(day, vec3(1.0, 0.995, 0.98), cloud * 0.9);
  float sunDistance = length((uv - vec2(0.78, 0.78)) * vec2(aspect, 1.0));
  day += vec3(1.0, 0.97, 0.89) * exp(-sunDistance * 11.0) * 0.16;
  day = mix(day, vec3(1.0), (1.0 - smoothstep(0.043, 0.053, sunDistance)) * 0.8);

  vec3 night = mix(vec3(0.13, 0.23, 0.39), vec3(0.025, 0.06, 0.16), uv.y);
  night = mix(night, vec3(0.37, 0.46, 0.61), cloud * 0.36);
  night += vec3(0.65, 0.73, 0.9) * exp(-sunDistance * 13.0) * 0.14;

  gl_FragColor = vec4(clamp(mix(night, day, daylight), 0.0, 1.0), 1.0);
}
`;

export type SkyController = {
  setDay(day: number): void;
  dispose(): void;
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Could not create sky shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || 'Could not compile sky shader.');
  }
  return shader;
}

/** Renders the sky only while its canvas is visible. */
export function createSky(canvas: HTMLCanvasElement, initialDay: number): SkyController {
  const root = document.documentElement;
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) return { setDay() {}, dispose() {} };

  let vertex: WebGLShader | undefined;
  let fragment: WebGLShader | undefined;
  let program: WebGLProgram | undefined;
  let buffer: WebGLBuffer | undefined;

  try {
    vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    program = gl.createProgram() ?? undefined;
    if (!program) throw new Error('Could not create sky program.');
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Could not link sky program.');
    gl.useProgram(program);
    buffer = gl.createBuffer() ?? undefined;
    if (!buffer) throw new Error('Could not create sky geometry.');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  } catch (error) {
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    console.error('Sky shader unavailable:', error);
    return { setDay() {}, dispose() {} };
  }

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  const resolution = gl.getUniformLocation(program, 'resolution');
  const clock = gl.getUniformLocation(program, 'time');
  const light = gl.getUniformLocation(program, 'daylight');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let targetDay = initialDay;
  let shownDay = initialDay;
  let elapsed = 0;
  let previous = 0;
  let lastDraw = 0;
  let frame = 0;
  let visible = true;
  let disposed = false;

  const draw = () => {
    if (!canvas.width || !canvas.height) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform1f(clock, elapsed);
    gl.uniform1f(light, shownDay);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    root.classList.add('sky-ready');
  };

  const tick = (now: number) => {
    frame = 0;
    if (disposed || !visible || document.hidden) { previous = 0; return; }
    if (now - lastDraw >= 1000 / 24) {
      elapsed += previous ? Math.min((now - previous) / 1000, 0.1) : 0;
      previous = now;
      lastDraw = now;
      shownDay += (targetDay - shownDay) * 0.12;
      draw();
    }
    if (!reducedMotion.matches) frame = requestAnimationFrame(tick);
  };

  const schedule = () => {
    if (disposed || !visible || document.hidden) return;
    if (reducedMotion.matches) {
      shownDay = targetDay;
      draw();
    } else if (!frame) frame = requestAnimationFrame(tick);
  };

  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1_200_000 / (width * height)));
    const nextWidth = Math.max(1, Math.floor(width * ratio));
    const nextHeight = Math.max(1, Math.floor(height * ratio));
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }
    schedule();
  };

  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    else schedule();
  });
  resizeObserver.observe(canvas);
  intersectionObserver.observe(canvas);
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', schedule);
  resize();

  return {
    setDay(day) {
      targetDay = day;
      schedule();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', schedule);
      reducedMotion.removeEventListener('change', schedule);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      root.classList.remove('sky-ready');
    },
  };
}
