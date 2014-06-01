var noop = function() {};

try {
  var Emitter = require('emitter');
}
catch (e) {
  var Emitter = require('emitter-component');
}

/**
 * Create a new model with given `type`.
 *
 * Options:
 *
 * - thunkify   wrap methods to return thunks for use
 *              with visionmedia/co (default: false)
 * - promisify  wrap methods to return promise using
 *              specified function (default: false)
 *
 * Example:
 *
 *   var User = mio.createModel('user', {
 *     promisify: function(fn) {
 *       return require('promise').denodeify(fn);
 *     }
 *   });
 *
 * @param {String} type
 * @param {Object} options
 * @return {AbstractModel}
 */

exports.createModel = function(type, options) {
  options = options || Object.create(null);

  function Model(attributes) {
    if (!attributes) attributes = {};

    this.constructor.emit('initializing', this, attributes);

    Object.defineProperties(this, {
      // For EventEmitter
      _callbacks: {
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

      if (params.relation === 'has many') {

      }

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

      if (params.default !== undefined && this.attributes[name] === undefined) {
        if (attributes[name] === undefined) {
          attributes[name] = typeof params.default === 'function' ?
            params.default.call(this) :
            params.default;
        }
      }
      else {
        this.attributes[name] = null;
      }
    }, this);

    // Set initial attributes
    for (var name in attributes) {
      if (this.constructor.attributes[name]) {
        if (this.attributes[name] !== attributes[name]) {
          this.dirtyAttributes.push(name);
        }
        this.attributes[name] = attributes[name];
      }
    }

    Object.seal(this);

    this.constructor.emit('initialized', this);
  };

  Emitter(Model.prototype);
  Emitter(Model);

  Model.type = type.charAt(0).toUpperCase() + type.substr(1);
  Model.primaryKey = null;
  Model.attributes = Object.create(null);
  Model.plugins = Object.create(null);
  Model.options = options;

  Model.prototype.constructor = Model;

  // extend model
  for (var key in AbstractModel) {
    Model[key] = AbstractModel[key];
  }

  // extend model prototype
  for (var key in model) {
    Model.prototype[key] = model[key];
  }

  if (options.thunks || options.promisify) {
    var somethingify = options.thunks ? thunkify : options.promisify;
    Model.findAll = somethingify(Model.findAll);
    Model.find = somethingify(Model.find);
    Model.count = somethingify(Model.count);
    Model.prototype.save = somethingify(Model.prototype.save);
    Model.prototype.remove = somethingify(Model.prototype.remove);
  }

  ['find', 'findAll', 'count', 'save', 'remove'].forEach(function(method) {
    Model.plugins[method] = [];
  });

  return Model;
};

/**
 * AbstractModel methods
 */

var AbstractModel = Object.create(null);

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
 * @api public
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
 * @param {String} method Optional. Used for store plugins.
 * @param {Function} plugin
 * @return {AbstractModel}
 * @api public
 */

AbstractModel.use = function(method, plugin) {
  if (typeof method === 'string') {
    if (!method.match(/(find|findAll|count|remove|save)/i)) {
      throw new Error(method + " is not a pluggable method.");
    }
  }
  else if (typeof method === 'function') {
    plugin = method;
    method = null;
  }

  if (typeof plugin !== 'function') {
    throw new Error("Plugin must be a function.");
  }

  if (method) {
    this.plugins[method] = (this.plugins[method] || [])
    this.plugins[method].push(plugin);
  }
  else {
    plugin.call(this, this);
  }

  return this;
};

/**
 * Use given `fn` only in browser.
 *
 * @param {Function} fn
 * @return {AbstractModel}
 * @api public
 */

AbstractModel.browser = function(fn) {
  if (require('is-browser')) {
    fn.call(this, this);
  }
  return this;
};

/**
 * Use given `fn` only in node.
 *
 * @param {Function} fn
 * @return {AbstractModel}
 * @api public
 */

AbstractModel.server = function(fn) {
  if (!require('is-browser')) {
    fn.call(this, this);
  }
  return this;
};

/**
 * Create a new model and hydrate with given `attrs`,
 * or if `attrs` is already a model return it.
 *
 * @param {Object} attrs
 * @return {AbstractModel}
 * @api public
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
 * @api public
 */

AbstractModel.find = function(query, callback) {
  var Model = this;
  var i = 0;

  if (typeof query == 'number') {
    query = { id: query };
  }

  this.emit('before find', query);

  // Call each store's find method until we find the model.
  (function next(err, model) {
    if (err) return done(err);

    if (model || i === Model.plugins.find.length) {
      done(null, model);
    }
    else {
      Model.plugins.find[i++].call(Model, query, next);
    }
  })();

  // Handle result and emit `after find` event.
  function done(err, model) {
    if (err) return callback.call(Model, err);

    Model.emit('after find', model);

    callback.call(Model, null, model);
  };

  return this;
};

/**
 * Find collection of models using given `query`.
 *
 * @param {Object} query
 * @param {Function(err, collection)} callback
 * @return {AbstractModel}
 * @api public
 */

AbstractModel.findAll = function(query, callback) {
  var Model = this;
  var i = 0;

  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  this.emit('before findAll', query);

  // Call each store's findAll method until we have a result.
  (function next(err, collection) {
    if (err) return done(err);

    if ((collection && collection.length) || (i === Model.plugins.findAll.length)) {
      done(null, collection);
    }
    else {
      Model.plugins.findAll[i++].call(Model, query, next);
    }
  })();

  // Handle result and emit `after findAll` event.
  function done(err, collection) {
    if (err) return callback.call(Model, err);

    if (!collection) {
      collection = [];
    }

    Model.emit('after findAll', collection);
    callback.call(Model, null, collection);
  };

  return this;
};

/**
 * Count models using given `query`.
 *
 * @param {Object} query
 * @param {Function(err, count)} callback
 * @return {AbstractModel}
 * @api public
 */

AbstractModel.count = function(query, callback) {
  var Model = this;
  var i = 0;

  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  this.emit('before count', query);

  // Call each store's count method until we have a result.
  (function next(err, count) {
    if (err) return done(err);

    if (count !== undefined || i === Model.plugins.count.length) {
      done(null, count);
    }
    else {
      Model.plugins.count[i++].call(Model, query, next);
    }
  })();

  // Handle result and emit `after count` event.
  function done(err, count) {
    if (err) return callback.call(Model, err, count);

    if (count === undefined) {
      count = 0;
    }

    Model.emit('after count', count);
    callback.call(Model, null, count);
  };

  return this;
};

// Aliases
AbstractModel.all = AbstractModel.findAll;
AbstractModel.get = AbstractModel.find;
AbstractModel.findOne = AbstractModel.find;

/**
 * Model prototype
 */

var model = Object.create(null);

/**
 * Check if model is new and has not been saved.
 *
 * @return {Boolean}
 */

model.isNew = function() {
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

model.isDirty = function(attr) {
  if (attr) {
    return Boolean(this.dirtyAttributes[attr]);
  }

  return this.dirtyAttributes.length > 0;
};

/**
 * Return attributes changed since last save.
 *
 * @return {Object}
 */

model.changed = function() {
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

model.has = function(attr) {
  return this.constructor.attributes[attr] !== undefined;
};

/**
 * Set given model `attrs`.
 *
 * @param {Object} attrs
 * @return {Model}
 */

model.set = function(attrs) {
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

model.save = function(callback) {
  if (!callback) callback = noop;

  var model = this;
  var Model = this.constructor;
  var changed = this.changed();

  var i = 0;

  Model.emit('before save', model, changed);
  model.emit('before save', changed);

  // If we're already saved, execute callback immediately.
  if (model.primary && !model.isDirty()) {
    return done();
  }

  // Call each store's save method.
  (function next(err) {
    if (err) return done(err);

    if (i === Model.plugins.save.length) {
      done(null);
    }
    else {
      Model.plugins.save[i++].call(model, changed, next);
    }
  })();

  function done(err) {
    if (err) return callback.call(model, err);

    model.dirtyAttributes.length = 0;

    Model.emit('after save', model);
    model.emit('after save');

    callback.call(model);
  };

  return this;
};

/**
 * Remove model.
 *
 * @param {Function(err)} callback
 * @return {Model}
 */

model.remove = function(callback) {
  if (!callback) callback = function() {};

  var model = this;
  var Model = this.constructor;

  var i = 0;

  Model.emit('before remove', model);
  model.emit('before remove');

  // Call each store's remove method.
  (function next(err) {
    if (err) return done(err);

    if (i === Model.plugins.remove.length) {
      done();
    }
    else {
      Model.plugins.remove[i++].call(model, next);
    }
  })();

  function done(err) {
    if (err) return callback.call(model, err);

    // Set primary key to null
    model.attributes[Model.primaryKey] = null;

    Model.emit('after remove', model);
    model.emit('after remove');

    callback.call(model);
  };

  return this;
};

/**
 * Wrap function to return thunk.
 *
 * Assumes `fn`'s last argument is a node-style callback.
 *
 * @see https://github.com/visionmedia/co/#thunks-vs-promises
 * @param {Function} fn
 * @return {Function}
 * @api private
 */

function thunkify(fn) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var ctx = this;

    return function(cb) {
      args.push(cb);
      fn.apply(ctx, args);
    };
  };
};
