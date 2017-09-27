const blessed = require('blessed');
const _ = require('lodash');

const BaseWidget = require('./BaseWidget');

const fmtKey = (rawKey, padding=undefined) => {
  const key = padding
    ? `${rawKey}:`.padEnd(padding+1)
    : `${rawKey}:`;
  return `{blue-fg}{bold}${key}{/bold}{/blue-fg}`;
};
const fmtVal = (val) => ` ${val}`;

const spaces = (s, len) => new Array(len).join(' ') + s;

const formatEntry = (key, val, padding=undefined, level=0) => {
  const value = _.isObject(val)
    ? formatObject(val, level + 1)
    : fmtVal(val);
  return `${fmtKey(key, padding)}${value}`;
};

const formatObject = (obj, level=0) => {
  const padding = Math.max(...Object.keys(obj).map(k => k.length));
  const entries = Object.keys(obj)
    .map(key => `${formatEntry(key, obj[key], padding, level)}`)
    .map(val => spaces(val, level * 2));
  return [''].concat(entries).join('\n');
};

class LogDetails extends BaseWidget {
  constructor(opts={}) {
    super(Object.assign({}, opts, {
      width: '80%',
      height: '80%',
      shadow: true,
      handleKeys: true,
    }));
    this.json = false;
  }

  handleKeyPress(ch, key) {
    this.log('[LogDetails] key', key.name);
    if (key.name === 'enter') {
      this.log('detach');
      this.el.detach();
      this.detach();
      this.screen.render();
      return;
    }
    if (key.name === 'j') {
      this.json = !this.json;
      this.update();
    }
  };

  display(entry) {
    this.entry = entry;
    this.update();
  }

  update() {
    const content = this.json
      ? JSON.stringify(this.entry, null, 2)
      : formatObject(this.entry);
    this.el = blessed.element({
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      scrollbar: { ch: ' ', track: { bg: 'grey' }, style: { bg: 'yellow' } },
      tags: true,
      content,
    });
    this.el.on('keypress', this.handleKeyPress.bind(this));
    this.el.focus();

    this.append(this.el);
    this.screen.render();
  }
}

module.exports = LogDetails;