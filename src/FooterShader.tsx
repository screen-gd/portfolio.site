'use client';

import { useEffect, useRef } from 'react';

// Field and colour settings supplied by Screen from OpenShaders.
const FIELD_SHADER = `struct Uniforms {
  resolution: vec2f,
  time: f32,
  lightMode: f32,
  darkBackground: vec3f,
  pixelRatio: f32,
  lightBackground: vec3f,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

const HUE: f32 = 0.0247616936;
const HUE_SPREAD: f32 = 0.00896027964;
const HUE_TRAVEL: f32 = 1.61191618;
const CHROMA: f32 = 0.0828986764;
const LIGHTNESS: f32 = 0.566419363;
const COLOUR_CYCLE: f32 = 0.210922211;
const THETA: f32 = 2.11860061;
const SHEAR: f32 = 0.955188811;
const SHRINK: f32 = 0.958665013;
const LAYERS: f32 = 72.0;
const WARP_FREQ_X: f32 = 0.595242977;
const WARP_FREQ_Y: f32 = 2.40765452;
const WARP_AMP_X: f32 = 0.104781911;
const WARP_AMP_Y: f32 = 0.0273131337;
const ASPECT_X: f32 = 2.19655395;
const ASPECT_Y: f32 = 0.187779561;
const OFFSET_X: f32 = 0.391835809;
const OFFSET_Y: f32 = -0.0259866789;
const TILT: f32 = 1.37964761;
const ZOOM: f32 = 1.16922402;
const CENTRE_X: f32 = -0.606007397;
const CENTRE_Y: f32 = -0.400004715;
const GLOW_SIZE: f32 = 0.00274323416;
const FALLOFF: f32 = 0.303328395;
const VIGNETTE: f32 = 0.0613339283;
const FLOW_SPEED: f32 = 0.518149257;
const FLOW_DIRECTION: f32 = -1.0;
const BREATH_RATE: f32 = 0.471057415;
const BREATH_AMOUNT: f32 = 0.0587214343;
const PHASE: f32 = 78.3789444;
const ECHO: f32 = 0.0;
const ECHO_SHIFT: f32 = -0.127812564;
const SOFTNESS: f32 = 0.00230249879;
const LIGHT_SWING: f32 = 0.2629686;

@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let position = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  return vec4f(position * 2.0 - 1.0, 0.0, 1.0);
}

const TAU: f32 = 6.28318530718;

fn oklchToLinear(L: f32, C: f32, h: f32) -> vec3f {
  let a = C * cos(h);
  let b = C * sin(h);
  let l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  let m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  let s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  var lms = vec3f(l_, m_, s_);
  lms = lms * lms * lms;
  return mat3x3f(4.0767416621, -1.2684380046, -0.0041960863,
                 -3.3077115913, 2.6097574011, -0.7034186147,
                 0.2309699292, -0.3413193965, 1.7076147010) * lms;
}

fn fmod(x: f32, y: f32) -> f32 { return x - y * floor(x / y); }

fn blueNoise(p: vec2f, frame: f32) -> f32 {
  let q = p + 5.588238 * fmod(frame, 64.0);
  return fract(52.9829189 * fract(0.06711056 * q.x + 0.00583715 * q.y));
}

@fragment fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let R = u.resolution;
  let frag = vec2f(position.x, R.y - position.y);
  let pos = (frag - 0.5 * R) / R.y;
  let t = u.time * FLOW_SPEED * FLOW_DIRECTION + PHASE;
  let breath = (-sin(u.time * BREATH_RATE * 1.5) + sin(u.time * BREATH_RATE + 1.0)) * 0.25 + 0.5;

  var p = (pos - vec2f(CENTRE_X, CENTRE_Y)) * (ZOOM - breath * BREATH_AMOUNT);
  let ct = cos(TILT);
  let st = sin(TILT);
  p = mat2x2f(ct, st, -st, ct) * p;

  let fold = mat2x2f(cos(THETA), sin(THETA), -SHEAR, cos(THETA));

  let hue0 = HUE * TAU;
  let hue1 = hue0 + HUE_SPREAD * TAU;
  var color = vec3f(0.0);

  for (var i: f32 = 1.0; i <= 96.0; i += 1.0) {
    if (i > LAYERS) { break; }
    p.x += -sin(p.y * WARP_FREQ_X + t + i * 0.007) * WARP_AMP_X;
    p.y += -sin(p.x * WARP_FREQ_Y - t + i * 0.02) * WARP_AMP_Y;
    p = fold * p * SHRINK;

    let q = p - vec2f(OFFSET_X + breath * 0.1, OFFSET_Y);
    let s = vec2f(q.x * ASPECT_X, q.y * ASPECT_Y);
    var glow = GLOW_SIZE / (dot(s, s) + SOFTNESS);
    if (ECHO > 0.0) {
      let e = vec2f((q.x - ECHO_SHIFT) * ASPECT_X, s.y);
      glow += ECHO * GLOW_SIZE / (dot(e, e) + SOFTNESS);
    }
    glow *= 0.25 + breath * 0.4;

    let r = length(p);
    let k = sin(i * COLOUR_CYCLE + t * 1.2 + r * HUE_TRAVEL) * 0.5 + 0.5;
    let tint = clamp(oklchToLinear(LIGHTNESS + LIGHT_SWING * k, CHROMA * (0.75 + 0.35 * k), mix(hue0, hue1, k)), vec3f(0.0), vec3f(1.0));
    color += glow * tint * exp2(-r * FALLOFF);
  }

  let x = max(color, vec3f(0.0));
  color = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
  color = pow(clamp(color, vec3f(0.0), vec3f(1.0)), vec3f(0.85, 0.92, 0.98));

  let edge = smoothstep(0.5, 1.6, length(pos));
  color *= 1.0 - edge * VIGNETTE;

  let dark = u.darkBackground + color * (1.0 - u.darkBackground);
  let strength = max(color.r, max(color.g, color.b));
  let light = u.lightBackground * (1.0 - strength) + color * 0.96;
  color = mix(dark, light, vec3f(u.lightMode));

  color += (blueNoise(frag, floor(u.time * 24.0)) - 0.5) / 255.0;
  return vec4f(clamp(color, vec3f(0.0), vec3f(1.0)), 1.0);
}`;

export function FooterShader({ dark }: { dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.gpu) return;

    let disposed = false;
    let frame = 0;
    let visible = false;
    let elapsed = 0;
    let previous = 0;
    let device: GPUDevice | undefined;
    let context: GPUCanvasContext | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let stopWatching: (() => void) | undefined;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

    const start = async () => {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter || disposed) return;
      const nextDevice = await adapter.requestDevice();
      if (disposed) { nextDevice.destroy(); return; }
      device = nextDevice;

      const format = navigator.gpu.getPreferredCanvasFormat();
      const module = device.createShaderModule({ code: FIELD_SHADER });
      const pipeline = await device.createRenderPipelineAsync({
        layout: 'auto',
        vertex: { module, entryPoint: 'vertexMain' },
        fragment: { module, entryPoint: 'fragmentMain', targets: [{ format }] },
        primitive: { topology: 'triangle-list' },
      });
      if (disposed) return;

      const uniforms = device.createBuffer({ size: 48, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
      const values = new Float32Array(12);
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniforms } }],
      });
      const nextContext = canvas.getContext('webgpu');
      if (!nextContext) return;
      context = nextContext;
      context.configure({ device, format, alphaMode: 'opaque' });

      const draw = () => {
        if (disposed || !visible || !context || !device || !canvas.width || !canvas.height) return;
        values.set([canvas.width, canvas.height, elapsed, dark ? 0 : 1,
          dark ? 0 : 1, dark ? 0 : 1, dark ? 0 : 1, 1,
          1, 1, 1, 0]);
        device.queue.writeBuffer(uniforms, 0, values);
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [{ view: context.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store' }],
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(3);
        pass.end();
        device.queue.submit([encoder.finish()]);
      };

      const tick = (now: number) => {
        frame = 0;
        if (disposed || !visible || document.hidden) { previous = 0; return; }
        elapsed += previous ? Math.min((now - previous) / 1000, 0.1) : 0;
        previous = now;
        draw();
        if (!reducedMotion.matches) frame = requestAnimationFrame(tick);
      };

      const resume = () => {
        if (disposed || !visible || document.hidden) return;
        if (reducedMotion.matches) draw();
        else if (!frame) frame = requestAnimationFrame(tick);
      };

      resizeObserver = new ResizeObserver(() => {
        const { width, height } = canvas.getBoundingClientRect();
        if (!width || !height) return;
        const ratio = Math.min(devicePixelRatio || 1, 2, Math.sqrt(1_200_000 / (width * height)), device!.limits.maxTextureDimension2D / width, device!.limits.maxTextureDimension2D / height);
        canvas.width = Math.max(1, Math.floor(width * ratio));
        canvas.height = Math.max(1, Math.floor(height * ratio));
        resume();
      });
      intersectionObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
        else resume();
      });
      resizeObserver.observe(canvas);
      intersectionObserver.observe(canvas);
      document.addEventListener('visibilitychange', resume);
      reducedMotion.addEventListener('change', resume);
      stopWatching = () => {
        document.removeEventListener('visibilitychange', resume);
        reducedMotion.removeEventListener('change', resume);
      };
    };

    void start().catch((error: unknown) => {
      if (!disposed) console.error('Footer shader could not start', error);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      stopWatching?.();
      context?.unconfigure();
      device?.destroy();
    };
  }, [dark]);

  return <canvas ref={canvasRef} className="footer-shader" aria-hidden="true" />;
}
