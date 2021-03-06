const fs = require('fs');
// const os = require('os');
// const path = require('path');
// const ini = require('ini');
const _ = require('lodash');

// let _transform = 'unloaded';

const config = require('./Config');

const FIELDS = [];
config.get().columns.forEach( column => {
  FIELDS.push(column.key);
});

/*
function loadTransform(_fs=fs) {
  if (_transform === 'unloaded') {
    let transformFile = path.resolve('.json-log-viewer');
    if (!_fs.existsSync(transformFile)) {
      transformFile = path.join(os.homedir(), '.json-log-viewer');
        if (!_fs.existsSync(transformFile)) {
			return;
		}
    }

    const contents = _fs.readFileSync(transformFile, 'utf8');
    const { transform } = ini.parse(contents);
    if (!transform) {
      return;
    }

    _transform = transform;
  }

  return _transform;
}
*/

function transform(entry, _fs=fs) {
  return entry;
  // const transform = loadTransform(_fs);
  const transform = config.get().columns;
  if (!transform) {
    return entry;
  }

  return Object.keys(transform).reduce((hash, key) => {
    const value = transform[key];
    if (value === '$') {
      hash[key] = _.cloneDeep(entry);
    } else {
      hash[key] = _.get(entry, value);
    }
    return hash;
  }, {});
}

function parse(line) {
  try {
    return transform(JSON.parse(line));
  } catch (e) {
    return null;
  }
}

function readLog(file, reader=fs) {
  const contents = reader.readFileSync(file).toString();
  const lines = _.compact(contents.split('\n').filter(line => line).map(parse));

  return lines.map(line => {
    // const result = _.pick(line, ['timestamp', 'level', 'message']);
    // const data = _.omit(line, ['timestamp', 'level', 'message']);
    const result = _.pick(line, FIELDS);
    const data = _.omit(line, FIELDS);
    return Object.assign({}, result, { data });
  });
};

module.exports = { readLog, transform };
