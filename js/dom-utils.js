const deepGet = (obj, path) => {
  const keys = path.split('.');
  let subObj = obj;
  let i, len;
  for (i = 0, len = keys.length - 1; i < len; i++) {
    subObj = subObj[keys[i]];
  }
  return subObj[keys[i]];
};

const deepSet = (obj, path, val) => {
  const keys = path.split('.');
  let subObj = obj;
  let i, len;
  for (i = 0, len = keys.length - 1; i < len; i++) {
    subObj = subObj[keys[i]];
  }
  subObj[keys[i]] = val;
};

export const bindStateListener = (selector, eventName, statePath, callback, state) => {
  const elt = document.querySelector(selector);
  const valueProp = elt.type === 'checkbox' ? 'checked' : 'value';
  elt.addEventListener(eventName, (evt) => {
    deepSet(state, statePath, evt.target[valueProp]);
    callback();
  });
  elt[valueProp] = deepGet(state, statePath);
};

export const populateOptions = (selectSelector, optionsObj, initialVal) => {
  const elt = document.querySelector(selectSelector);
  for (const key in optionsObj) {
    const option = document.createElement('option');
    option.text = key;
    elt.add(option);
  }
  elt.value = initialVal;
};

export const hexToRgb = (rgb, hex) => {
  const components = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  rgb[0] = parseInt(components[1], 16) / 255;
  rgb[1] = parseInt(components[2], 16) / 255;
  rgb[2] = parseInt(components[3], 16) / 255;
};