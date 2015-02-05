module.exports = {
  extend: extend,
  setEnvSpecificKeys: setEnvSpecificKeys,
  pluck: pluck,
  merge: merge
};

function extend(prototype, statics) {
  var parent = this;
  var child;

  child = function resource () {
    if (!(this instanceof child)) {
      var self = Object.create(child.prototype);
      child.apply(self, arguments);
      return self;
    }

    return parent.apply(this, arguments);
  };

  child.extend = parent.extend;

  var Surrogate = function() {
    this.constructor = child;
  };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();

  // static properties to inherit
  for (var prop in parent) {
    if (!child[prop]) {
      child[prop] = parent[prop];
    }
  }

  for (var prop in statics) {
    if (statics.hasOwnProperty(prop)) {
      child[prop] = statics[prop];
    }
  }

  // extend prototype with properties
  for (var prop in prototype) {
    if (prototype.hasOwnProperty(prop)) {
      child.prototype[prop] = prototype[prop];
    }
  }

  child.__super__ = parent.prototype;

  return child;
};

function setEnvSpecificKeys(target) {
  for (var key in target) {
    if (target.hasOwnProperty(key)) {
      if (key === 'server') {
        if (typeof window === 'undefined') {
          merge(target, target.server);
        }
        delete target.server;
      } else if (key === 'browser') {
        if (typeof window === 'object') {
          merge(target, target.browser);
        }
        delete target.browser;
      } else if (typeof target[key] === 'object') {
        setEnvSpecificKeys(target[key]);
      }
    }
  }

  return target;
};

function pluck(source, keys) {
  var plucked = {};

  keys.forEach(function (key) {
    plucked[key] = source[key];
    delete source[key];
  });

  return plucked;
};

function merge(target, source) {
  target = target || {};

  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      if (key === 'server' || key === 'browser') {
        setEnvSpecificKeys(target);
      } else if (typeof source[key] === 'object') {
        if (typeof target[key] === 'object') {
          merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      } else {
        target[key] = source[key];
      }
    }
  }

  return target;
}
