import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

test('work tabs switch content, follow direction, and support keyboard navigation', () => {
  const source = ts.createSourceFile('WorkShowcase.tsx', readFileSync(new URL('./components/WorkShowcase.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const body = source.statements.filter((node) => !ts.isImportDeclaration(node)).map((node) => node.getText(source).replace('export ', '')).join('\n');
  const state = [0, 1];
  let cursor = 0;
  let focused;
  const render = runInNewContext(ts.transpileModule(`${body}; WorkShowcase;`, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    useState: () => { const index = cursor++; return [state[index], (value) => { state[index] = value; }]; },
    useReducedMotion: () => false,
    document: { getElementById: (id) => ({ focus: () => { focused = id; } }) },
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children: children.flat() } }) },
    motion: { div: 'motion.div', span: 'motion.span' },
    AnimatePresence: 'presence', EditingCarousel: 'videos',
  });
  const getView = () => { cursor = 0; return render({ children: 'products' }); };
  const tabs = (view) => view.props.children[0].props.children[1].props.children;
  const panel = (view) => view.props.children[1].props.children[0].props.children[0];
  let view = getView();
  assert.equal(panel(view).props.children[0], 'products');
  tabs(view)[1].props.onClick();
  view = getView();
  assert.equal(tabs(view)[1].props['aria-selected'], true);
  assert.equal(panel(view).props.children[0].type, 'videos');
  assert.equal(panel(view).props.variants.enter(state[1]).x, 48);
  tabs(view)[1].props.onKeyDown({ key: 'ArrowLeft', preventDefault() {} });
  view = getView();
  assert.equal(focused, 'work-tab-0');
  assert.equal(panel(view).props.children[0], 'products');
  assert.equal(panel(view).props.variants.enter(state[1]).x, -48);
});
