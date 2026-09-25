'use client';

import { useEffect, useRef } from 'react';

const vertexSource = `#version 300 es
void main() {
  vec2 point = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(point * 2.0 - 1.0, 0.0, 1.0);
}`;

const fragmentSource = `#version 300 es
precision mediump float;
uniform vec2 resolution;
uniform float time;
out vec4 color;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  uv.y = 1.0 - uv.y;
  float t = time * 0.14;
  float leftFold = exp(-pow((uv.x - (0.29 + 0.15 * sin(uv.y * 3.6 + t))) / 0.105, 2.0));
  float middleFold = exp(-pow((uv.x - (0.59 + 0.12 * sin(uv.y * 4.1 - t * 0.8))) / 0.09, 2.0));
  float rightFold = exp(-pow((uv.x - (0.91 + 0.12 * sin(uv.y * 3.0 + t * 0.6))) / 0.13, 2.0));
  float softWave = 0.035 * sin(uv.x * 14.0 + uv.y * 7.0 + t);
  float shade = 0.08 + 0.22 * leftFold + 0.16 * middleFold + 0.12 * rightFold + softWave;
  float gray = clamp(1.0 - shade, 0.62, 1.0);
  color = vec4(vec3(gray), 1.0);
}`;

function compile(gl: WebGL2RenderingContext, kind: number, source: string) {
  const shader = gl.createShader(kind);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

/** A small grayscale shader that stops drawing when the About header is offscreen. */
export function AboutShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!canvas || !gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      return;
    }

    const program = gl.createProgram();
    if (!program) { gl.deleteShader(vertex); gl.deleteShader(fragment); return; }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); return; }

    const resolution = gl.getUniformLocation(program, 'resolution');
    const time = gl.getUniformLocation(program, 'time');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = false;
    let frame = 0;
    let last = 0;

    const resize = () => {
      const scale = Math.min(1, 1000 / canvas.clientWidth);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (now: number) => {
      gl.useProgram(program);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, now / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.style.opacity = '1';
    };

    const tick = (now: number) => {
      frame = 0;
      if (!visible || document.hidden || reducedMotion) return;
      if (now - last >= 50) { draw(now); last = now; }
      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      if (visible && !document.hidden) {
        resize();
        draw(performance.now());
        if (!reducedMotion && !frame) frame = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const observer = new ResizeObserver(() => { if (visible) sync(); });
    intersection.observe(canvas);
    observer.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    return () => {
      intersection.disconnect();
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      cancelAnimationFrame(frame);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas className="about-shader" ref={canvasRef} aria-hidden="true" />;
}
