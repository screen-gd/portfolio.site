import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

test('the scroll sequence hides video controls and pauses playback when the videos fade out', () => {
  const source = ts.createSourceFile('App.tsx', readFileSync(new URL('./App.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const app = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'App');
  const setup = app.body.statements.find((node) => ts.isExpressionStatement(node) && ts.isCallExpression(node.expression) && node.expression.expression.getText(source) === 'useGSAP').expression.arguments[0];
  let opacity = 0;
  let paused = 0;
  let animation;
  let timelineCount = 0;
  const introTitle = {};
  const videoTitle = {};
  const heading = { querySelector: () => videoTitle, querySelectorAll: () => [] };
  const videoRow = {};
  const intro = { querySelector: () => introTitle, querySelectorAll: () => [] };
  const product = { querySelector: () => ({}), querySelectorAll: () => [] };
  const nextProduct = { querySelector: () => ({}), querySelectorAll: () => [] };
  const content = { inert: false, querySelector: () => videoRow, querySelectorAll: () => [{ pause: () => paused++ }] };
  const section = {
    classList: { add() {}, remove() {} },
    querySelector: (selector) => selector === '.work-intro' ? intro : selector === '.editing-heading' ? heading : content,
  };
  const transitions = [];
  const jumps = [];
  const cleanup = runInNewContext(ts.transpileModule(`(${setup.getText(source)})();`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    page: { current: { querySelector: () => section } },
    work: { current: { querySelectorAll: (selector) => selector === '.project' ? [product, nextProduct] : [] } },
    matchMedia: () => ({ matches: false }),
    window: { innerHeight: 800, innerWidth: 1200 },
    smoothScroll: { current: { scrollTo: (top, options) => jumps.push({ top, options }) } },
    gsap: {
      set() {}, getProperty: (target) => target === content ? opacity : 0,
      timeline(options) {
        timelineCount++;
        if (!animation) animation = options;
        const timeline = {
          to(target, values, position) { transitions.push({ target, values, position }); return timeline; },
          fromTo(target, from, values, position) { transitions.push({ target, from, values, position }); return timeline; },
          set(target, values) { transitions.push({ target, values }); return timeline; },
        };
        return timeline;
      },
    },
  });
  assert.equal(content.inert, true);
  assert.equal(animation.scrollTrigger.pin, true);
  assert.equal(timelineCount, 1);
  assert.equal(animation.scrollTrigger.scrub, 0.3);
  assert.equal(animation.scrollTrigger.end(), '+=4560');
  transitions.forEach((transition, index) => {
    if (transition.from?.y === 40) assert.equal(transitions[index + 1].values.duration, 1);
  });
  const rowRevealIndex = transitions.findIndex(({ target, values }) => target === videoRow && values.autoAlpha === 1);
  assert.equal(transitions[rowRevealIndex + 1].values.duration, 2.4);
  assert.equal(transitions.find(({ target, values }) => target === content && values.autoAlpha === 1).position, undefined);
  assert.equal(transitions.find(({ target }) => target === product).position, undefined);
  assert.equal(transitions.find(({ values }) => values.xPercent !== undefined).values.xPercent, -100);
  const exit = transitions.find(({ target, values }) => target === content && values.autoAlpha === 0);
  assert.equal(exit.values.x(), -1200);
  assert.equal(exit.values.duration, 0.7);
  const textReveal = transitions.find(({ target }) => target === videoTitle);
  for (const title of [introTitle, videoTitle]) {
    const revealIndex = transitions.findIndex(({ target }) => target === title);
    assert.equal(transitions[revealIndex + 1].values.duration, 0.8);
  }
  assert.equal(textReveal.from.filter, 'blur(12px)');
  assert.equal(textReveal.values.filter, 'blur(0px)');
  assert.deepEqual(transitions.filter(({ target }) => target === intro || target === content).map(({ target, values }) => [target === intro ? 'intro' : 'videos', values.autoAlpha]),
    [['intro', 1], ['intro', 0], ['videos', 1], ['videos', 0]]);
  opacity = 1;
  animation.onUpdate();
  assert.equal(content.inert, false);
  opacity = 0;
  animation.onUpdate();
  assert.equal(content.inert, true);
  assert.equal(paused, 1);
  const backward = { direction: -1, isActive: true, start: 600, getTween: () => ({ pause() {} }), animation: { progress: (value) => assert.equal(value, 0) } };
  animation.scrollTrigger.onUpdate({ ...backward, direction: 1 });
  animation.scrollTrigger.onUpdate({ ...backward, isActive: false });
  assert.equal(jumps.length, 0);
  animation.scrollTrigger.onUpdate(backward);
  assert.equal(jumps[0].top, 599);
  assert.equal(jumps[0].options.immediate, true);
  assert.equal(jumps[0].options.force, true);
  cleanup();
  assert.equal(content.inert, false);
});

test('buttons and keyboard navigate the five-video row with Embla', () => {
  const source = ts.createSourceFile('App.tsx', readFileSync(new URL('./App.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const component = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'EditingCarousel');
  const clips = source.statements.find((node) => ts.isVariableStatement(node) && node.declarationList.declarations.some((declaration) => declaration.name.getText(source) === 'editingClips'));
  const navigation = [];
  const carousel = {
    scrollPrev: () => navigation.push('previous'), scrollNext: () => navigation.push('next'),
  };
  const carouselRef = () => {};
  const rendered = runInNewContext(ts.transpileModule(`${clips.getText(source)} ${component.getText(source).replace('export ', '')}; EditingCarousel();`, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    useState: (value) => [value, () => {}],
    useEmblaCarousel: (options) => {
      assert.equal(options.startIndex, 0);
      assert.equal(options.loop, false);
      return [carouselRef, carousel];
    },
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children: children.flat() } }) },
    HoverClip: () => null,
    ElasticSlider: () => null,
    VolumeIcon: () => null,
  });
  const { props } = rendered.props.children[1];
  assert.equal(props.ref, carouselRef);
  const slides = props.children[0].props.children;
  assert.equal(slides.length, 5);
  const titles = Array.from(slides, (slide) => slide.props.children[0].props.children[1].props.children[0]);
  assert.deepEqual(titles, ['Moment of Inertia', 'Fatty liver', 'Dal Lake', 'Commerce & government', 'Microwave Edit']);
  const root = {};
  const event = { currentTarget: root, target: root, preventDefault: () => {} };
  props.onKeyDown({ ...event, key: 'ArrowLeft' });
  props.onKeyDown({ ...event, key: 'ArrowRight' });
  props.onKeyDown({ ...event, target: {}, key: 'ArrowRight' });
  const buttons = rendered.props.children[2].props.children;
  buttons[0].props.onClick();
  buttons[1].props.onClick();
  assert.deepEqual(navigation, ['previous', 'next', 'previous', 'next']);
});
test('the phone uses a tap surface for playback and applies slider volume through audio gain', async () => {
  const source = ts.createSourceFile('App.tsx', readFileSync(new URL('./App.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const component = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'HoverClip');
  const refs = [];
  const effects = [];
  const gain = { gain: { value: 1 }, connect: () => {} };
  let resumed = false;
  const render = runInNewContext(ts.transpileModule(`${component.getText(source)}; HoverClip;`, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    useRef: (current) => { const ref = { current }; refs.push(ref); return ref; },
    useState: (value) => [value, () => {}],
    useEffect: (effect) => effects.push(effect),
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    Image: () => null,
    AudioContext: class {
      destination = {};
      createGain() { return gain; }
      createMediaElementSource(player) { assert.equal(player, refs[0].current); return { connect: () => gain }; }
      resume() { resumed = true; return Promise.resolve(); }
      close() { return Promise.resolve(); }
    },
  });
  const rendered = render({ src: 'clip.mp4', poster: 'poster.jpg', title: 'Clip', volume: 25 });
  const player = {
    paused: true, volume: 1, muted: false,
    play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; },
  };
  refs[0].current = player;
  const video = rendered.props.children[0];
  const button = rendered.props.children[2];
  assert.equal(video.props.controls, undefined);
  assert.equal(button.type, 'div');
  assert.equal(button.props.role, 'button');
  assert.equal(button.props.tabIndex, 0);
  assert.equal(button.props['aria-label'], 'Play Clip');
  effects[1]();
  assert.equal(player.volume, 0.25);
  button.props.onPointerEnter({ pointerType: 'touch' });
  assert.equal(player.paused, true);
  button.props.onPointerEnter({ pointerType: 'mouse' });
  assert.equal(player.paused, false, 'hover must start playback before any click');
  assert.equal(player.muted, false, 'hover must request audible playback');
  button.props.onPointerLeave({ pointerType: 'mouse' });
  button.props.onClick();
  assert.equal(player.paused, false);
  assert.equal(player.muted, false, 'clicking a muted preview must enable audio without pausing');
  assert.equal(player.volume, 1);
  assert.equal(gain.gain.value, 0.25);
  assert.ok(resumed);
  button.props.onPointerLeave({ pointerType: 'touch' });
  assert.equal(player.paused, false);
  button.props.onClick();
  assert.equal(player.paused, true);
  button.props.onPointerEnter({ pointerType: 'mouse' });
  assert.equal(player.paused, false);
  button.props.onPointerLeave({ pointerType: 'mouse' });
  assert.equal(player.paused, true);
  effects[1]();
  assert.equal(player.volume, 1, 'the volume effect must use gain after the graph is connected');
  button.props.onKeyDown({ key: 'Enter', preventDefault: () => {} });
  assert.equal(player.paused, false);
  button.props.onKeyDown({ key: ' ', preventDefault: () => {} });
  assert.equal(player.paused, true);
  let siblingPaused = false;
  player.closest = () => ({ querySelectorAll: () => [player, { pause: () => { siblingPaused = true; } }] });
  video.props.onPlay({ currentTarget: player });
  assert.ok(siblingPaused, 'playing a visible phone must pause the other clips');
  let attempts = 0;
  player.play = () => {
    if (++attempts === 1) return Promise.reject(new Error('Audio autoplay blocked'));
    player.paused = false;
    return Promise.resolve();
  };
  button.props.onPointerEnter({ pointerType: 'mouse' });
  await Promise.resolve();
  assert.equal(attempts, 2, 'blocked audio must fall back to a muted preview');
  assert.equal(player.muted, true);
  button.props.onClick();
  assert.equal(player.muted, false, 'clicking the fallback preview must enable audio');
});

test('React Bits slider sends clamped pointer and keyboard volume values to the videos', () => {
  const source = ts.createSourceFile('ElasticSlider.tsx', readFileSync(new URL('./components/ElasticSlider/ElasticSlider.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const slider = source.statements.find((node) => ts.isVariableStatement(node) && node.declarationList.declarations.some((declaration) => declaration.name.getText(source) === 'Slider'));
  const decay = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'decay');
  const values = [];
  let captured = false;
  const surface = { getBoundingClientRect: () => ({ left: 100, right: 200, width: 100 }), setPointerCapture: () => { captured = true; } };
  const render = runInNewContext(ts.transpileModule(`const MAX_OVERFLOW = 50; ${slider.getText(source)} ${decay.getText(source)}; Slider;`, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    useRef: () => ({ current: surface }),
    useState: (value) => [value, () => {}],
    useEffect: () => {},
    useMotionValue: (value) => ({ jump: () => {}, get: () => value }),
    useMotionValueEvent: () => {},
    useTransform: () => 1,
    animate: () => {},
    motion: { div: 'div' },
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
  });
  const rendered = render({ defaultValue: 50, startingValue: 0, maxValue: 100, isStepped: true, stepSize: 1, leftIcon: null, rightIcon: null, onValueChange: (value) => values.push(value) });
  const { props } = rendered.props.children[0].props.children[1];
  props.onPointerDown({ buttons: 1, clientX: 125, pointerId: 1, currentTarget: surface });
  assert.ok(captured);
  props.onPointerMove({ buttons: 1, clientX: -50 });
  props.onPointerMove({ buttons: 1, clientX: 300 });
  props.onKeyDown({ key: 'Home', preventDefault: () => {} });
  props.onKeyDown({ key: 'End', preventDefault: () => {} });
  props.onKeyDown({ key: 'ArrowLeft', preventDefault: () => {} });
  assert.deepEqual(values, [25, 0, 100, 0, 100, 49]);
});
