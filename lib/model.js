(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory); /* AMD */
  } else if (typeof exports === 'object') {
    factory(exports); /* CommonJS */
  } else {
    factory((root.mio = (root.mio || {}))); /* Global */
  }
})(this, function(exports) {
  var noop = function() {};

  exports.Model = AbstractModel;

  /**
   * Create a new model with given `type`.
   *
   * Example:
   *
   *   var User = mio.createModel('user');
   *
   * @param {String} type
   * @param {Array} attributes
   * @return {AbstractModel}
   */

  exports.createModel = function(type, attributes) {
    function Model(values) {
      AbstractModel.call(this, values);
    };

    // Static
    Model.listeners = Object.create(null); // for event emitter
    Model.type = type.charAt(0).toUpperCase() + type.substr(1);
    Model.primaryKey = null;
    Model.attributes = Object.create(null);
    Model.options = Object.create(null);

    Object.keys(AbstractModel).forEach(function(key) {
      Model[key] = AbstractModel[key];
    });

    // Instance
    Model.prototype = Object.create(AbstractModel.prototype);
    Model.prototype.constructor = Model;
    Model.prototype.model = Model;

    // Define attributes if provided.
    if (attributes) {
      Object.keys(attributes).forEach(function(key) {
        Model.attr(key, attributes[key]);
      });
    }

    return Model;
  };

  /**
   * Create new model instance.
   *
   * @param {Object} values optional
   * @return {AbstractModel}
   */

  function AbstractModel(values) {
    if (!values) values = {};

    this.constructor.emit('initializing', this, values);

    Object.defineProperties(this, {
      // For EventEmitter
      listeners: {
        value: Object.create(null)
      },
      // Where we store attribute values
      attributes: {
        value: Object.create(null)
      },
      // Dirty attributes
      dirtyAttributes: {
        value: []
      },
      // A mutable object for saving extra information
      extras: {
        value: Object.create(null),
        writable: true
      },
      // Primary key
      primary: {
        enumerable: false,
        get: function() {
          if (this.constructor.primaryKey) {
            return this[this.constructor.primaryKey];
          }
          else {
            throw new Error("Primary key has not been defined.");
          }
        },
        set: function(value) {
          if (this.constructor.primaryKey) {
            this[this.constructor.primaryKey] = value;
          }
          else {
            throw new Error("Primary key has not been defined.");
          }
        }
      }
    });

    // Create accessors for defined attributes
    Object.keys(this.constructor.attributes).forEach(function(name) {
      var params = this.constructor.attributes[name];

      Object.defineProperty(this, name, {
        get: params.get || function() {
          return this.attributes[name];
        },
        set: function(value) {
          var changed = this.attributes[name] !== value;

          if (changed) {
            var prev = this.attributes[name];
            this.attributes[name] = value;

            if (!~this.dirtyAttributes.indexOf(name)) {
              this.dirtyAttributes.push(name);
            }

            this.constructor.emit('change', this, name, value, prev);
            this.constructor.emit('change:' + name, this, value, prev);
            this.emit('change', name, value, prev);
            this.emit('change:' + name, value, prev);
          }
        },
        enumerable: params.enumerable === false || params.filtered ? false : true
      }, this);

      // Set attribute defaults.
      if (params.default !== undefined && this.attributes[name] === undefined) {
        if (values[name] === undefined) {
          values[name] = typeof params.default === 'function' ?
            params.default.call(this) :
            params.default;
        }
      }
      else {
        this.attributes[name] = null;
      }
    }, this);

    // Set initial attribute values if provided.
    for (var name in values) {
      if (this.constructor.attributes[name]) {
        if (this.attributes[name] !== values[name]) {
          this.dirtyAttributes.push(name);
        }
        this.attributes[name] = values[name];
      }
    }

    Object.seal(this);

    this.constructor.emit('initialized', this);
  };

  /**
   * Define a model attribute with the given `name` and `params`.
   *
   * Supported `options`:
   *
   *    - default     Provide default value or function that returns value.
   *    - filtered    Exclude attribute from enumeration.
   *    - get         Accessor function. Optional.
   *    - primary     Use attribute as primary key.
   *
   * @param {String} name
   * @param {Object} options
   * @return {AbstractModel}
   */

  AbstractModel.attr = function(name, options) {
    if (this.attributes[name]) return this;

    options = options || Object.create(null);

    if (options.primary) {
      if (this.primaryKey) {
        throw new Error(
          "Primary attribute already exists: " + this.primaryKey
        );
      }
      this.primaryKey = name;
    }

    this.attributes[name] = options;

    this.emit('attribute', name, options);

    return this;
  };

  /**
   * Use a plugin function that extends the model.
   *
   *     User
   *       .use(require('example-plugin'))
   *       .server(function() {
   *         this.use(require('mio-mysql'));
   *       })
   *       .browser(function() {
   *         this.use(require('mio-ajax'));
   *       });
   *
   * @param {Function} plugin
   * @return {AbstractModel}
   */

  AbstractModel.use = function(ev, plugin) {
    if (typeof ev === 'function') {
      plugin = ev;
      ev = null;
    }

    if (typeof plugin === 'object') {
      for (var key in plugin) {
        if (plugin.hasOwnProperty(key)) {
          this.prototype[key] = plugin[key];
        }
      }
    }
    else if (typeof plugin === 'function') {
      ev ? this.before(ev, plugin) : plugin.call(this, this);
    }
    else {
      throw new Error(
        "Plugin must be a function or map of prototype methods."
      );
    }

    return this;
  };

  /**
   * Use given `fn` only in browser.
   *
   * @param {Function} fn
   * @return {AbstractModel}
   */

  AbstractModel.browser = function(fn) {
    if (typeof window === 'object') {
      this.use.apply(this, arguments);
    }
    return this;
  };

  /**
   * Use given `fn` only in node.
   *
   * @param {Function} fn
   * @return {AbstractModel}
   */

  AbstractModel.server = function(fn) {
    if (typeof window === 'undefined') {
      this.use.apply(this, arguments);
    }
    return this;
  };

  /**
   * Register `fn` to be called when `ev` is emitted.
   *
   * @param {String} ev
   * @param {Function} fn
   * @return {AbstractModel}
   */

  AbstractModel.on = function(ev, fn) {
    if (!this.listeners[ev]) {
      this.listeners[ev] = [fn];
    }
    else {
      this.listeners[ev].push(fn);
    }

    return this;
  };

  AbstractModel.prototype.on = AbstractModel.on;

  /**
   * Register `fn` to be called once when `ev` is next emitted.
   *
   * @param {String} ev
   * @param {Function} fn
   * @return {AbstractModel}
   */

  AbstractModel.once = function(ev, fn) {
    fn.once = true;
    return this.on.apply(this, arguments);
  };

  AbstractModel.prototype.once = AbstractModel.once;

  /**
   * Emit `ev` and call listeners.
   *
   * @param {String} ev
   * @param {Mixed} ...
   * @return {AbstractModel}
   */

  AbstractModel.emit = function(ev) {
    var args = Array.prototype.slice.call(arguments, 1);
    var listeners = this.listeners[ev];

    if (listeners) {
      for (var i=0, l=listeners.length; i<l; i++) {
        listeners[i].apply(this, args);

        if (listeners[i].once) {
          listeners.splice(i, 1);
          l = listeners.length;
        }
      }
    }

    return this;
  };

  AbstractModel.prototype.emit = AbstractModel.emit;

  /**
   * Alias for `Model.on('before EVENT')`
   */

  AbstractModel.before = function(name, fn) {
    this.on('before ' + name, fn);
    return this;
  };

  AbstractModel.prototype.before = AbstractModel.before;

  /**
   * Alias for `Model.on('after EVENT')`
   */

  AbstractModel.after = function(name, fn) {
    this.on('after ' + name, fn);
    return this;
  };

  AbstractModel.prototype.after = AbstractModel.after;

  /**
   * Run "before" and "after" events.
   *
   * @param {String} ev
   * @param {Array} args
   * @param {Function(err, result)} callback
   * @param {Boolean} stopOnResult
   * @param {AbstractModel} model
   * @return {AbstractModel}
   */

  AbstractModel.run = function(ev, args, callback, opts) {
    if (!opts) {
      opts = {};
    }

    var model_listeners = this.listeners['before ' + ev] || [];
    var listeners = (opts.model && opts.model.listeners['before ' + ev]) || [];
    var self = (opts.model || this);
    var Model = this;

    if (model_listeners) {
      model_listeners = model_listeners.slice(0);
    }

    if (listeners) {
      listeners = listeners.slice(0);
    }

    // Call each "before EVENT" handler in series.
    (function next(err, result) {
      if (err || (opts.stopOnResult && result)) {
        done(err, result);
      }
      else if (model_listeners.length) {
        var applied = (opts.model ? [opts.model].concat(args) : args.slice(0));
        applied.push(next);
        model_listeners.shift().apply(Model, applied);
      }
      else if (listeners.length) {
        listeners.shift().apply(opts.model, args.concat([next]));
      }
      else {
        done(null, (result || opts.defaultResult));
      }
    })();

    // Handle result and emit event(s).
    function done(err, result) {
      if (err) return callback.call(self, err);

      callback.call(self, null, result);

      // Run "after EVENT" handlers.
      if (opts.model) {
        Model.emit('after ' + ev, opts.model, (args.length && result));
        opts.model.emit('after ' + ev, (args.length && result));
      }
      else {
        Model.emit('after ' + ev, (args.length && result));
      }
    };

    return this;
  };

  /**
   * Create a new model and hydrate with given `attrs`,
   * or if `attrs` is already a model return it.
   *
   * @param {Object} attrs
   * @return {AbstractModel}
   */

  AbstractModel.create = function(attrs) {
    return ((attrs instanceof this) ? attrs : (new (this)(attrs)));
  };

  /**
   * Find a model with given `id` or `query`.
   *
   * @param {Number|Object} query
   * @param {Function(err, model)} callback
   * @return {AbstractModel}
   */

  AbstractModel.find = function(query, callback) {
    if (typeof query == 'number') {
      query = { id: query };
    }

    return this.run('find', [query], callback, {
      stopOnResult: true
    });
  };

  AbstractModel.get = AbstractModel.find;

  /**
   * Find collection of models using given `query`.
   *
   * @param {Object} query
   * @param {Function(err, collection)} callback
   * @return {AbstractModel}
   */

  AbstractModel.findAll = function(query, callback) {
    var self = this;

    if (typeof query === 'function') {
      callback = query;
      query = {};
    }

    return this.run('findAll', [query], callback, {
      defaultResult: [],
      stopOnResult: true
    });
  };

  AbstractModel.all = AbstractModel.findAll;

  /**
   * Count models using given `query`.
   *
   * @param {Object} query
   * @param {Function(err, count)} callback
   * @return {AbstractModel}
   */

  AbstractModel.count = function(query, callback) {
    if (typeof query === 'function') {
      callback = query;
      query = {};
    }

    return this.run('count', [query], callback, {
      defaultResult: 0,
      stopOnResult: true
    });
  };

  /**
   *  models using given `query`.
   *
   * @param {Object} query
   * @param {Function(err, count)} callback
   * @return {AbstractModel}
   */

  AbstractModel.removeAll = function(query, callback) {
    if (typeof query === 'function') {
      callback = query;
      query = {};
    }

    return this.run('removeAll', [query], callback);
  };

  /**
   * Check if model is new and has not been saved.
   *
   * @return {Boolean}
   */

  AbstractModel.prototype.isNew = function() {
    if (this.constructor.primaryKey) {
      return !this[this.constructor.primaryKey];
    }
    else {
      throw new Error("Primary key has not been defined.");
    }
  };

  /**
   * Check if model is dirty (has any changed attributes).
   * If an attribute name is specified, check if that attribute is dirty.
   *
   * @param {String} attr optional attribute to check if dirty
   * @return {Boolean}
   */

  AbstractModel.prototype.isDirty = function(attr) {
    if (attr) {
      return Boolean(~this.dirtyAttributes.indexOf(attr));
    }

    return this.dirtyAttributes.length > 0;
  };

  /**
   * Return attributes changed since last save.
   *
   * @return {Object}
   */

  AbstractModel.prototype.changed = function() {
    var changed = Object.create(null);

    for (var len = this.dirtyAttributes.length, i=0; i<len; i++) {
      var name = this.dirtyAttributes[i];
      if (this.constructor.attributes[name]) {
        changed[name] = this[name];
      }
    }

    return changed;
  };

  /**
   * Check if model has given `attr`.
   *
   * @param {String} attr
   * @return {Boolean}
   */

  AbstractModel.prototype.has = function(attr) {
    return this.constructor.attributes[attr] !== undefined;
  };

  /**
   * Set given model `attrs`.
   *
   * @param {Object} attrs
   * @return {Model}
   */

  AbstractModel.prototype.set = function(attrs) {
    this.constructor.emit('setting', this, attrs);
    this.emit('setting', attrs);

    for (var attr in attrs) {
      if (this.constructor.attributes[attr]) {
        this[attr] = attrs[attr];
      }
    }

    return this;
  };

  /**
   * Save model.
   *
   * @param {Function(err)} callback
   * @return {Model}
   */

  AbstractModel.prototype.save = function(callback) {
    var model = this;
    var changed = this.changed();

    if (!callback) callback = noop;

    this.constructor.run('save', [changed], function(err) {
      if (err) return callback.call(model, err);

      model.dirtyAttributes.length = 0;

      callback.call(model, null, changed);
    }, {
      model: model
    });

    return this;
  };

  /**
   * Remove model.
   *
   * @param {Function(err)} callback
   * @return {Model}
   */

  AbstractModel.prototype.remove = function(callback) {
    var model = this;

    if (!callback) callback = noop;

    this.constructor.run('remove', [], function(err) {
      if (err) return callback.call(model, err);

      // Set primary key to null
      model.attributes[model.constructor.primaryKey] = null;

      callback.call(model);
    }, {
      model: model
    });

    return this;
  };

  AbstractModel.prototype.destroy = AbstractModel.prototype.remove;

  return exports;
});
