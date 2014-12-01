module.exports = Resource;

/**
 * Create new `Resource` instance. Values set using the constructor are not
 * marked as dirty. Use `.set()` after instantiation for hydration of dirty
 * attributes.
 *
 * @example
 *
 * ```javascript
 * var user = new User({ name: "alex" });
 * ```
 *
 * @param {Object} values optional
 * @return {Resource}
 * @class
 * @alias module:mio
 */

function Resource (values) {
  if (!values) values = {};

  this.constructor.emit('initializing', this, values);

  Object.defineProperties(this, {
    // For EventEmitter
    listeners: {
      value: Object.create(null),
      writable: true
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
  this.constructor.attributes = this.constructor.attributes || Object.create(null);

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
      enumerable: params.enumerable === false ? false : true
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
      this.attributes[name] = values[name];
    }
  }

  this.constructor.emit('initialized', this);
}

/**
 * Extend `Resource` with new attributes or methods.
 *
 * @example
 *
 * ```javascript
 * var User = mio.Resource.extend({
 *   id: { primary: true }
 * });
 * ```
 *
 * @param {Object} prototype extend with attribute definitions or methods
 * @return {Resource}
 */

Resource.extend = function (prototype) {
  var parent = this;
  var child;

  prototype = prototype || {};

  child = function resource () {
    if (!(this instanceof child)) {
      var self = Object.create(child.prototype);
      child.apply(self, arguments);
      return self;
    }

    return parent.apply(this, arguments);
  };

  child.extend = parent.extend;
  child.attributes = Object.create(null);
  child.listeners = Object.create(null);
  child.options = Object.create(null);

  var Surrogate = function() {
    this.constructor = child;
  };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();

  for (var prop in Resource) {
    if (Resource.hasOwnProperty(prop)) {
      child[prop] = Resource[prop];
    }
  }

  for (var prop in prototype) {
    if (prototype.hasOwnProperty(prop)) {
      if (typeof prototype[prop] === 'function') {
        child.prototype[prop] = prototype[prop];
      } else {
        child.attr(prop, prototype[prop]);
      }
    }
  }

  child.__super__ = parent.prototype;

  return child;
};

/**
 * Define a resource attribute with the given `name` and `options`.
 *
 * @example
 *
 * ```javascript
 *   User
 *     .attr('id', { primary: true })
 *     .attr('name')
 *     .attr('created', {
 *       default: function() {
 *         return new Date();
 *       }
 *     });
 * ```
 *
 * @param {String} name
 * @param {Object=} options
 * @param {Mixed=} options.default default value or function that returns value
 * @param {Boolean=} options.enumerable attribute is enumerable (default: true)
 * @param {Boolean=} options.serializable include in JSON (default: true)
 * @param {Function=} options.get accessor function
 * @param {Boolean=} options.primary use attribute as primary key
 * @return {Resource}
 */

Resource.attr = function(name, options) {
  this.attributes = this.attributes || Object.create(null);

  if (this.attributes[name]) {
    throw new Error(name + " attribute already exists");
  }

  if (typeof options !== 'object') {
    options = { 'default': options };
  }

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
 * Call the given plugin `fn` with the Resource as both argument and context.
 *
 * @example
 *
 * ```javascript
 * User
 *   .use(require('example-plugin'))
 *   .server(function() {
 *     this.use(require('mio-mysql'));
 *   })
 *   .browser(function() {
 *     this.use(require('mio-ajax'));
 *   });
 * ```
 *
 * @param {Function(Resource)} fn
 * @return {Resource}
 */

Resource.use = function(fn) {
  if (typeof fn === 'function') {
    fn.call(this, this);
  }
  else {
    throw new Error(
      "Plugin must be a function."
    );
  }

  return this;
};

/**
 * Use given `fn` only in browser.
 *
 * @param {Function} fn
 * @return {Resource}
 */

Resource.browser = function(fn) {
  if (typeof window === 'object') {
    this.use.apply(this, arguments);
  }
  return this;
};

/**
 * Use given `fn` only in node.
 *
 * @param {Function} fn
 * @return {Resource}
 */

Resource.server = function(fn) {
  if (typeof window === 'undefined') {
    this.use.apply(this, arguments);
  }
  return this;
};

/**
 * Create a new resource and hydrate with given `attrs`,
 * or if `attrs` is already a resource return it.
 *
 * This is simply sugar for `new Resource(attrs)`.
 *
 * @param {Object} attrs
 * @return {Resource}
 */

Resource.create = function(attrs) {
  return ((attrs instanceof this) ? attrs : (new (this)(attrs)));
};

/**
 * Find a resource with given `id` or `query`.
 *
 * @example
 *
 * ```javascript
 * User.findOne(123, function (err, user) {
 *   // ...
 * })
 * ```
 *
 * @param {Number|Object} query
 * @param {Function(err, resource)} callback
 * @return {Resource}
 */

Resource.findOne = function(query, callback) {
  if (typeof query == 'number') {
    query = { id: query };
  }

  if (!callback && (!query || typeof query === 'object')) {
    return this.query('findOne', query);
  }

  return this.run('findOne', [query], callback, {
    stopOnResult: true
  });
};

Resource.get = Resource.findOne;
Resource.find = Resource.findOne;

/**
 * Find collection of resources using given `query`.
 *
 * @example
 *
 * ```javascript
 * User.findAll({ active: true }, function (err, users) {
 *   // ...
 * });
 * ```
 *
 * Queries can also be composed using chainable methods:
 *
 * ```javascript
 * User.findAll()
 *  .where({ active: true })
 *  .sort({ created_at: "desc" })
 *  .limit(10)
 *  .exec(function(err, users) {
 *    // ...
 *  });
 * ```
 *
 * @param {Object} query
 * @param {Function(err, collection)} callback
 * @return {Resource}
 */

Resource.findAll = function(query, callback) {
  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  if (!callback && (!query || typeof query === 'object')) {
    return this.query('findAll', query);
  }

  return this.run('findAll', [query], callback, {
    defaultResult: [],
    stopOnResult: true
  });
};

Resource.all = Resource.findAll;

/**
 * Count resources using given `query`.
 *
 * @param {Object} query
 * @param {Function(err, count)} callback
 * @return {Resource}
 */

Resource.count = function(query, callback) {
  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  if (!callback && (!query || typeof query === 'object')) {
    return this.query('count', query);
  }

  return this.run('count', [query], callback, {
    defaultResult: 0,
    stopOnResult: true
  });
};

/**
 * Destroy resources using given `query`.
 *
 * @param {Object} query
 * @param {Function(err, count)} callback
 * @return {Resource}
 */

Resource.destroyAll = function(query, callback) {
  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  if (!callback && (!query || typeof query === 'object')) {
    return this.query('destroyAll', query);
  }

  return this.run('destroyAll', [query], callback);
};

/**
 * Compose queries functionally.
 *
 * @example
 *
 * ```javascript
 * User.findAll()
 *  .where({ active: true })
 *  .sort({ created_at: "desc" })
 *  .limit(10)
 *  .exec(function(err, users) {
 *    // ...
 *  });
 * ```
 *
 * @param {String} method
 * @param {Object} query
 * @return {Object}
 * @private
 */

Resource.query = function(method, query) {
  var Resource = this;

  if (!query) query = {};

  var filters = {
    where: function(where) {
      query.where = query.where || {};
      for (var key in where) {
        query.where[key] = where[key];
      }
      return filters;
    },
    paginate: function(paginate) {
      for (var key in paginate) {
        query[key] = paginate[key]
      }
      return filters;
    },
    skip: function(skip) {
      query.offset = skip;
      return filters;
    },
    exec: function(cb) {
      return Resource[method](query, cb);
    }
  };

  ['sort', 'include', 'offset', 'limit', 'page'].forEach(function(key) {
    filters[key] = function(params) {
      if (typeof params === 'object' && typeof filter === 'object') {
        for (var param in params) {
          query[key][param] = params[param];
        }
      } else {
        query[key] = params;
      }
      return filters;
    };
  });

  return filters;
};

/**
 * Define a new relationship attribute. This is a helper method used by the
 * relation methods such as `.hasOne()`, `.hasMany()`, etc.
 *
 * @param {String} type hasOne, hasMany, belongsTo, or belongsToMany
 * @param {String} attr attribute name
 * @param {Object} params
 * @private
 */

Resource.addRelation = function (type, attr, params) {
  var options = {
    relation: {
      type: type,
      target: params.target,
      foreignKey: params.foreignKey,
      throughKey: params.throughKey,
      through: params.through,
      nested: params.nested
    }
  };

  for (var key in params) {
    if (!params.hasOwnProperty || params.hasOwnProperty(key)) {
      if (!key.match(/^(target|foreignKey|nested|throughKey|through)$/)) {
        options[key] = params[key];
      }
    }
  }

  return this.attr(attr, options);
};

/**
 * A one-to-one relation, where the resource has exactly one of the specified
 * target resource, referenced by a foreign key on the target resource.
 *
 * @example
 *
 * ```javascript
 * Patient.hasOne('record', {
 *   target: Record,
 *   foreignKey: 'patient_id'
 * });
 * ```
 *
 * @param {String} attr name of the attribute populated with target resource
 * @param {Object} params additional parameters passed to `.attr()`
 * @param {Resource} params.target
 * @param {String} params.foreignKey foreign key on target resource. defaults to
 * resource table name appended with `_id`.
 * @param {Boolean} params.nested whether to always include (default: false)
 * @return {Resource}
 */

Resource.hasOne = function (attr, params) {
  return this.addRelation('hasOne', attr, params);
};

/**
 * The `hasMany` relationship is for a resource with a one-to-many
 * relationship with the target resource. The resource is referenced by a
 * foreign key on the target resource.
 *
 * @example
 *
 * ```javascript
 * Author.hasMany('books', {
 *   target: Book,
 *   foreignKey: 'author_id'
 * });
 * ```
 *
 * @param {String} attr name of the attribute populated with target resource
 * @param {Object} params additional parameters passed to `.attr()`
 * @param {Resource} params.target
 * @param {String} params.foreignKey foreign key on target resource. defaults to
 * resource table name appended with `_id`.
 * @param {Boolean} params.nested always include relation in queries (default: false)
 * @return {Resource}
 */

Resource.hasMany = function (attr, params) {
  return this.addRelation('hasMany', attr, params);
};

/**
 * The `belongsTo` relationship is used when a resource is a member of another
 * target resource. It can be used in a one-to-one association as the inverse of
 * `hasOne`, or in a one-to-many association as the inverse of a `hasMany`.
 * In both cases, the `belongsTo` relationship is referenced by a
 * foreign key on the current resource.
 *
 * @example
 *
 * ```javascript
 * Book.belongsTo('author', {
 *   target: Author,
 *   foreignKey: 'author_id'
 * }):
 * ```
 *
 * @param {String} attr name of the attribute populated with target resource
 * @param {Object} params additional parameters passed to `.attr()`
 * @param {Resource|Function} params.target can be a function that returns
 * constructor to avoid circular reference issues
 * @param {String} params.foreignKey foreign key on current resource. defaults
 * to `params.target` table name appended with `_id`
 * @param {Boolean} params.nested whether to always include (default: false)
 * @return {Resource}
 */

Resource.belongsTo = function (attr, params) {
  return this.addRelation('belongsTo', attr, params);
};

/**
 * The `belongsToMany` relationship is for many-to-many relations, where the
 * current resource is joined to one or more of a target resource through
 * another table (or resource).
 *
 * @example
 *
 * ```javascript
 * Post.belongsToMany('tags', {
 *   target: Tag,
 *   foreignKey: 'tag_id',
 *   throughKey: 'post_id',
 *   through: 'post_tag'
 * });
 * ```
 *
 * @param {String} attr name of the attribute populated with target resource
 * @param {Object} params additional parameters passed to `.attr()`
 * @param {Resource|Function} params.target can be a function that returns
 * constructor to avoid circular reference issues
 * @param {String|Resource} params.through table or resource for association
 * @param {String} params.foreignKey foreign key of the target resource.
 * defaults to `params.target` table name appended with `_id`
 * @param {String} params.throughKey foreign key of the current resource.
 * defaults to resource table name appended with `_id`
 * @param {Boolean} params.nested whether to always include (default: false)
 * @return {Resource}
 */

Resource.belongsToMany = function (attr, params) {
  return this.addRelation('belongsToMany', attr, params);
};

/**
 * Register `fn` to be called when `ev` is emitted.
 *
 * @param {String} ev register multiple events with space-delimited names
 * @param {Function} fn
 * @return {Resource}
 */

Resource.on = function(ev, fn) {
  if (ev.match(/ /) && !ev.match(/^(before|after) \w+$/)) {
    var evs = ev.split(' '), hook;

    if (evs[0] === 'before' || evs[0] === 'after') {
      hook = evs.shift();
    }

    for (var i=0, l=evs.length; i<l; i++) {
      this.on((hook ? (hook + ' ' + evs[i]) : evs[i]), fn);
    }
  } else {
    if (!this.listeners[ev]) {
      this.listeners[ev] = [fn];
    }
    else {
      this.listeners[ev].push(fn);
    }
  }

  return this;
};

Resource.prototype.on = Resource.on;

/**
 * Register `fn` to be called once when `ev` is next emitted.
 *
 * @param {String} ev
 * @param {Function} fn
 * @return {Resource}
 */

Resource.once = function(ev, fn) {
  fn.once = true;
  return this.on.apply(this, arguments);
};

Resource.prototype.once = Resource.once;

/**
 * Emit `ev` and call listeners.
 *
 * @param {String} ev
 * @param {Mixed} ...
 * @return {Resource}
 * @private
 */

Resource.emit = function(ev) {
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

Resource.prototype.emit = Resource.emit;

/**
 * Alias for `Resource.on('before EVENT')`
 */

Resource.before = function(name, fn) {
  this.on('before ' + name, fn);
  return this;
};

Resource.prototype.before = Resource.before;

/**
 * Alias for `Resource.on('after EVENT')`
 */

Resource.after = function(name, fn) {
  this.on('after ' + name, fn);
  return this;
};

Resource.prototype.after = Resource.after;

/**
 * Run "before" and "after" events.
 *
 * @param {String} ev
 * @param {Array} args
 * @param {Function(err, result)} callback
 * @param {Options=} opts
 * @param {Boolean=} opts.stopOnResult
 * @param {Resource=} opts.resource
 * @return {Resource}
 * @private
 */

Resource.run = function(ev, args, callback, opts) {
  if (!opts) {
    opts = {};
  }

  var resource_listeners = this.listeners['before ' + ev] || [];
  var listeners = (opts.resource && opts.resource.listeners['before ' + ev]) || [];
  var self = (opts.resource || this);
  var Resource = this;

  if (resource_listeners) {
    resource_listeners = resource_listeners.slice(0);
  }

  if (listeners) {
    listeners = listeners.slice(0);
  }

  // Call each "before EVENT" handler in series.
  (function next(err, result) {
    if (err || (opts.stopOnResult && result)) {
      done(err, result);
    }
    else if (resource_listeners.length) {
      var applied = (opts.resource ? [opts.resource].concat(args) : args.slice(0));
      applied.push(next);
      resource_listeners.shift().apply(Resource, applied);
    }
    else if (listeners.length) {
      listeners.shift().apply(opts.resource, args.concat([next]));
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
    if (opts.resource) {
      Resource.emit('after ' + ev, opts.resource, (args.length && result));
      opts.resource.emit('after ' + ev, (args.length && result));
    }
    else {
      Resource.emit('after ' + ev, (args.length && result));
    }
  };

  return this;
};

/**
 * Check if resource is new and has not been saved.
 *
 * @return {Boolean}
 */

Resource.prototype.isNew = function() {
  var primaryKey = this.constructor.primaryKey;

  if (primaryKey) {
    return !this[primaryKey] || this.isDirty(primaryKey);
  }
  else {
    throw new Error("Primary key has not been defined.");
  }
};

/**
 * Check if resource is dirty (has any changed attributes).
 * If an attribute name is specified, check if that attribute is dirty.
 *
 * @param {String} attr optional attribute to check if dirty
 * @return {Boolean}
 */

Resource.prototype.isDirty = function(attr) {
  if (attr) {
    return Boolean(~this.dirtyAttributes.indexOf(attr));
  }

  return this.dirtyAttributes.length > 0;
};

/**
 * Return dirty attributes (changed since last save).
 *
 * @return {Object}
 */

Resource.prototype.changed = function() {
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
 * Check if resource has given `attr`.
 *
 * @param {String} attr
 * @return {Boolean}
 */

Resource.prototype.has = function(attr) {
  return this.constructor.attributes[attr] !== undefined;
};

/**
 * Set given resource `attrs`.
 *
 * @param {Object} attrs
 * @return {Resource}
 */

Resource.prototype.set = function(attrs) {
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
 * Persist resource to storage. Runs "create" or "update" event
 * handlers registered by persistence plugins.
 *
 * @param {Function(err)} callback
 * @return {Resource}
 */

Resource.prototype.save = function(callback) {
  var resource = this;
  var primaryKey = resource.constructor.primaryKey;
  var changed = this.changed();
  var op = (resource.isNew() ? 'create' : 'update');

  if (!callback) callback = noop;

  this.constructor.run(op, [changed], function(err) {
    if (err) return callback.call(resource, err);

    resource.dirtyAttributes.length = 0;

    callback.call(resource, null, changed);
  }, {
    resource: resource
  });

  return this;
};

/**
 * Remove resource from storage. Runs "destroy" event handlers registered by
 * persistence plugins.
 *
 * @param {Function(err)} callback
 * @return {Resource}
 */

Resource.prototype.destroy = function(callback) {
  var resource = this;

  if (!callback) callback = noop;

  this.constructor.run('destroy', [], function(err) {
    if (err) return callback.call(resource, err);

    // Set primary key to null
    resource.attributes[resource.constructor.primaryKey] = null;

    callback.call(resource);
  }, {
    resource: resource
  });

  return this;
};

Resource.prototype.remove = Resource.prototype.destroy;

/**
 * Return serializable attributes for JSON representation.
 *
 * @return {Object}
 * @private
 */

Resource.prototype.toJSON = function () {
  var attrs = this.constructor.attributes;
  var json = {};

  for (var attr in attrs) {
    if (attrs[attr].serializable !== false) {
      json[attr] = this[attr];
    }
  }

  return json;
};
