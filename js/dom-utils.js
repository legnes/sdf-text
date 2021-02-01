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
  elt.addEventListener(eventName, (evt) => {
    deepSet(state, statePath, evt.target.value);
    callback();
  });
  elt.value = deepGet(state, statePath);
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