var Collection = require('./collection');
var Query = require('./query');
var extend = require('./util').extend;

module.exports = Resource;

/**
 * Values set using the constructor are not marked as dirty. Use `.set()`
 * after instantiation for hydration of dirty attributes.
 *
 * @example
 *
 * ```javascript
 * var user = new User({ name: "alex" });
 * ```
 *
 * @param {Object} values optional
 * @constructor
 * @memberof module:mio
 * @alias Resource
 * @fires initialize
 * @fires create
 */
function Resource(values) {
  if (!values) values = {};

  /**
   * Run at the beginning of resource constructor.
   *
   * @event initialize
   * @param {Resource} resource
   * @param {Object} values values passed to constructor
   */
  this.constructor.emit('initialize', this, values);

  Object.defineProperties(this, {
    // For EventEmitter
    listeners: {
      value: Object.create(null),
      writable: true
    },
    hooks: {
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

          /**
           * Fired whenever a resource attribute is changed.
           *
           * @event change
           * @param {Resource} resource
           * @param {String} name name of the attribute
           * @param {Mixed} value
           * @param {Mixed} prev
           */

          /**
           * Fired whenever [attr] is changed.
           *
           * @event change:[attr]
           * @param {Resource} resource
           * @param {Mixed} value
           * @param {Mixed} prev
           */
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

  /**
   * Run at the end of resource constructor.
   *
   * **Note:** This event is not the same as {@link save}.
   *
   * @event create
   * @param {Resource} resource
   */
  this.constructor.emit('create', this);
}

/**
 * Extend `Resource` with attributes, prototype, or static properties.
 *
 * @example
 *
 * ```javascript
 * var User = mio.Resource.extend({
 *   attributes: {
 *     id: { primary: true }
 *   },
 * }, {
 *   use: [
 *     Validators,
 *     MongoDB(...)
 *   ]
 * });
 * ```
 *
 * @param {Object} prototype extend resource prototype
 * @param {Object} prototype.attributes attribute definitions passed to `attr()`
 * @param {Object=} statics extend resource with static properties or methods
 * @param {Array=} statics.use array of plugins to use
 * @param {Array=} statics.browser array of browser plugins to use
 * @param {Array=} statics.server array of server plugins to use
 * @returns {Resource}
 */
Resource.extend = function (prototype, statics) {
  statics = statics || {};
  var attributes;

  if (prototype && prototype.attributes) {
    attributes = prototype.attributes;
    delete prototype.attributes;
  }

  var child = extend.call(this, prototype, statics);

  // static object properties to inherit with shallow copy
  var methods = ['attributes', 'hooks', 'listeners', 'options'];

  for (var i=0, l=methods.length; i<l; i++) {
    var obj = this[methods[i]];

    child[methods[i]] = Object.create(null);

    for (var key in obj) {
      child[methods[i]][key] = obj[key];
    }
  }

  // use plugins
  for (var prop in statics) {
    switch (prop) {
      case 'use':
      case 'browser':
      case 'server':

        // extend by using plugin
        for (var i=0, l=statics[prop].length; i<l; i++) {
          child[prop](statics[prop][i]);
        }
        break;
    }
  }

  // define instance attributes using `Resource#attr()`
  if (attributes) {
    for (var attr in attributes) {
      if (attributes.hasOwnProperty(attr)) {
        child.attr(attr, attributes[attr]);
      }
    }
  }

  // expose child collection
  if (!statics.collection || typeof statics.collection === 'object') {
    child.Collection = Collection.extend({
      Resource: child
    }, statics.collection);
  }

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
 * @returns {Resource}
 * @fires attribute
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

  /**
   * @event attribute
   * @param {String} name attribute name
   * @param {Object} options attribute options
   */
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
 * @param {plugin} plugin
 * @returns {Resource}
 */
Resource.use = function(plugin) {
  if (typeof plugin === 'function') {

    /**
     * @callback plugin
     * @param {Resource} Resource
     * @this {Resource}
     */
    plugin.call(this, this);
  } else {
    throw new Error(
      "Plugin must be a function."
    );
  }

  return this;
};

/**
 * Use given `fn` only in browser.
 *
 * @param {plugin} fn
 * @returns {Resource}
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
 * @param {plugin} fn
 * @returns {Resource}
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
 * @returns {Resource}
 */
Resource.create = function(attrs) {
  return ((attrs instanceof this) ? attrs : (new (this)(attrs)));
};

/**
 * Define a new relationship attribute. This is a helper method used by the
 * relation methods such as `.hasOne()`, `.hasMany()`, etc.
 *
 * @param {String} type hasOne, hasMany, belongsTo, or belongsToMany
 * @param {String} attr attribute name
 * @param {Object} params
 * @returns {Resource}
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
 * @returns {Resource}
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
 * @returns {Resource}
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
 * @returns {Resource}
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
 * @returns {Resource}
 */
Resource.belongsToMany = function (attr, params) {
  return this.addRelation('belongsToMany', attr, params);
};

/**
 * Register `listener` to be called when `event` is emitted.
 *
 * @param {String} event
 * @param {Function} listener
 * @returns {Resource}
 */
Resource.on = function(event, listener) {
  if (!this.listeners[event]) {
    this.listeners[event] = [listener];
  }
  else {
    this.listeners[event].push(listener);
  }

  return this;
};

Resource.prototype.on = Resource.on;

/**
 * Register `listener` to be called once when `event` is next emitted.
 *
 * @param {String} event
 * @param {Function} listener
 * @returns {Resource}
 */
Resource.once = function(event, listener) {
  listener.once = true;
  return this.on.apply(this, arguments);
};

Resource.prototype.once = Resource.once;

/**
 * Emit `event` and call listeners.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @returns {Resource}
 */
Resource.emit = function(event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var listeners = this.listeners[event];

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
 * Register `hook` to be called before `event`.
 *
 * Hooks are {@link module:mio.Resource.trigger|triggered} by various methods
 * such as {@link module:mio.Resource.findOne} or
 * {@link module:mio.Resource#save}, are asynchronous, and run in series.
 * Hooks receive a `next` function as the last argument, which must be called
 * to continue firing subsequent listeners. Subsequent hooks will not be run
 * if `next` receives any arguments. Arguments received by `next` are passed to
 * the callback of the method that fired the event.
 *
 * @param {String} event
 * @param {Function} hook
 */
Resource.before = function(event, hook) {
  if (!this.hooks[event]) {
    this.hooks[event] = [hook];
  }
  else {
    this.hooks[event].push(hook);
  }
  return this;
};

Resource.prototype.before = Resource.before;

/**
 * Runs before callback for `Resource.get` or `Resource#get`.
 *
 * @event before:get
 */

/**
 * Runs before callback for `Resource.put` or `Resource#put`.
 *
 * @event before:put
 */

/**
 * Runs before callback for `Resource.patch` or `Resource#patch`.
 *
 * @event before:patch
 */

/**
 * Runs before callback for `Resource.patch` or `Resource#patch`.
 *
 * @event before:post
 */

/**
 * Runs before callback for `Resource.delete` or `Resource#delete`.
 *
 * @event before:delete
 */

/**
 * Runs at the beginning of callback for `Resource.get` or `Resource#get`.
 *
 * @event get
 */

/**
 * Runs at the beginning of callback for `Resource.put` or `Resource#put`.
 *
 * @event put
 */

/**
 * Runs at the beginning of callback for `Resource.patch` or `Resource#patch`.
 *
 * @event patch
 */

/**
 * Runs at the beginning of callback for `Resource.post` or `Resource#post`.
 *
 * @event post
 */

/**
 * Runs at the beginning of callback for `Resource.delete` or `Resource#delete`.
 *
 * @event delete
 */

/**
 * Run {@link module:mio.Resource.before} hooks for given `event`.
 *
 * Hooks registered with {@link module:mio.Resource.before} are asynchronous and
 * run in series. Hooks receive a `next` function as the last argument, which
 * must be called to continue firing subsequent listeners. Arguments received by
 * `next` are passed to the callback of the method that fired the event. If
 * `next` receives any arguments, subsequent hooks will not be run.
 *
 * @param {String} event
 * @param {Mixed} args multiple arguments can be passed
 * @param {Function} callback
 * @returns {Resource}
 */
Resource.trigger = function(event, args, callback) {
  var Resource = this.dirtyAttributes ? this.constructor : this;
  var resource = this.isNew && this;

  args = Array.prototype.slice.call(arguments, 1);

  if (args.length === 1) {
    callback = args[0];
    args = [];
  } else if (args.length === 2) {
    callback = args[1];
    args = [args[0]];
  } else {
    callback = args.pop();
  }

  var hooks = Resource.hooks[event] || [];
  var instanceHooks = (resource && resource.hooks[event]) || [];
  var self = resource || Resource;
  var nextArgs = args.concat(resource ? [next, resource] : [next]);
  var instanceNextArgs = args.concat([next]);
  var instanceArgs = args.concat([resource]);

  if (hooks) {
    hooks = hooks.slice(0);
  }

  if (instanceHooks) {
    instanceHooks = instanceHooks.slice(0);
  }

  // Call each "before:EVENT" handler in series.
  function next (err, result) {
    if (err || result) {
      done.apply(this, arguments);
    }
    else if (hooks.length) {
      hooks.shift().apply(Resource, nextArgs);
    }
    else if (instanceHooks.length) {
      instanceHooks.shift().apply(resource, instanceNextArgs);
    }
    else {
      done.apply(this, arguments);
    }
  }

  // Handle result and emit event(s).
  function done (err) {
    if (err) return callback.call(self, err);

    var cbArgs = Array.prototype.slice.call(arguments, 1);
    cbArgs.unshift(event);

    // Run `.on()` "EVENT" handlers.
    if (resource) {
      Resource.emit.apply(Resource, cbArgs.concat(instanceArgs));
      resource.emit.apply(resource, cbArgs.concat(args));
    }
    else {
      Resource.emit.apply(Resource, cbArgs.concat(args));
    }

    callback.apply(self, arguments);
  }

  next();

  return this;
};

Resource.prototype.trigger = Resource.trigger;

/**
 * Get a resource with given `query`.
 *
 * If `query` is a non-object it's transformed into `{ where: query }`.
 *
 * @example
 *
 * ```javascript
 * User.get(123, function (err, user) {
 *   // ...
 * });
 * ```
 *
 * @param {query} query
 * @param {getCallback} callback
 * @returns {Resource}
 * @fires before:get
 * @fires get
 */
Resource.get = function(query, callback) {
  if (typeof query !== 'object') {
    query = { where: { id: query } };
  }

  if (arguments.length === 0) {
    return new Query(this, this.get);
  }

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback getCallback
   * @param {Error} err
   */
  return this.trigger('get', query, callback);
};

/**
 * Replace or create resource using given `query` and `representation`.
 *
 * @param {query} query
 * @param {Object} representation
 * @param {putCallback} callback
 * @returns {Resource}
 * @fires before:put
 * @fires put
 */
Resource.put = function (query, representation, callback) {

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback putCallback
   * @param {Error} err
   */
  return this.trigger('put', query, representation, callback);
};

/**
 * Patch resource using given `query` and corresponding set of `changes`.
 *
 * To patch multiple resources use `Resource.Collection.patch`.
 *
 * @example
 *
 * ```javascript
 * User.patch({ active: true }, { active: false }, function(err) {
 *   // ...
 * });
 * ```
 *
 * @param {query} query
 * @param {Object|Array} changes
 * @param {patchCallback} callback
 * @returns {Resource}
 * @fires before:patch
 * @fires patch
 */
Resource.patch = function (query, changes, callback) {

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback patchCallback
   * @param {Error} err
   */
  return this.trigger('patch', query, changes, callback);
};

/**
 * Post resource using given `representation`.
 *
 * To post multiple resources use `Resource.Collection.post`.
 *
 * @param {Object} representation
 * @param {postCallback} callback
 * @returns {Resource}
 * @fires before:post
 * @fires post
 */
Resource.post = function (representation, callback) {

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback postCallback
   * @param {Error} err
   */
  return this.trigger('post', representation, callback);
};

/**
 * Delete resource using given `query`.
 *
 * To delete multiple resources use `Resource.Collection.delete`.
 *
 * @param {query} query
 * @param {deleteCallback} callback
 * @returns {Resource}
 * @fires before:delete
 * @fires delete
 */
Resource.delete = function(query, callback) {
  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  if (arguments.length === 0) {
    return new Query(this, this.remove);
  }

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback deleteCallback
   * @param {Error} err
   */
  return this.trigger('delete', query, callback);
};

/**
 * Refresh the resource instance with the representation passed to the last
 * hook's `next`.
 *
 * @param {getCallback} callback
 * @returns {Resource}
 * @fires before:get
 * @fires get
 */
Resource.prototype.get = function (callback) {
  var query = this.primaryKeyQuery();

  return this.trigger('get', query, function (err, representation) {
    if (err) return callback.call(this, err);

    if (representation) {
      this.reset(representation);
    }

    callback.apply(this, arguments);
  });
};

/**
 * Replace resource with instance representation.
 *
 * @param {putCallback} callback
 * @returns {Resource}
 * @fires before:put
 * @fires put
 */
Resource.prototype.put = function (callback) {
  var query = this.primaryKeyQuery();
  return this.trigger('put', query, this.toJSON(), callback);
};

/**
 * Patch resource with diff of instance representation.
 *
 * @param {patchCallback} callback
 * @returns {Resource}
 * @fires before:patch
 * @fires patch
 */
Resource.prototype.patch = function (callback) {
  var query = this.primaryKeyQuery();
  return this.trigger('patch', query, this.changed(), callback);
};

/**
 * Post resource and update instance.
 *
 * @param {postCallback} callback
 * @returns {Resource}
 * @fires before:post
 * @fires post
 */
Resource.prototype.post = function (callback) {
  return this.trigger('post', this.changed(), function (err, representation) {
    if (err) return callback.call(this, err);

    if (representation) {
      this.reset(representation);
    }

    callback.apply(this, arguments);
  });
};

/**
 * Delete resource.
 *
 * @param {deleteCallback} callback
 * @returns {Resource}
 * @fires before:delete
 * @fires delete
 */
Resource.prototype.delete = function (callback) {
  return this.trigger('delete', this.primaryKeyQuery(), callback);
};

/**
 * Return a query using the resources primary key.
 *
 * @returns {Object}
 * @private
 */
Resource.prototype.primaryKeyQuery = function () {
  var query = { where: {} };
  var primaryKey = this.constructor.primaryKey;
  var primary = this.primary;

  if (primary) {
    query.where[primaryKey] = primary;
  }

  return query;
};

/**
 * Check if resource is new and has not been saved.
 *
 * @returns {Boolean}
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
 * @returns {Boolean}
 */
Resource.prototype.isDirty = function(attr) {
  if (attr) {
    return Boolean(~this.dirtyAttributes.indexOf(attr));
  }

  return this.dirtyAttributes.length > 0;
};

/**
 * Return dirty attributes (changed since last put/patch/post/reset).
 *
 * @returns {Object}
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
 * @returns {Boolean}
 */
Resource.prototype.has = function(attr) {
  return this.constructor.attributes[attr] !== undefined;
};

/**
 * Set given resource `attributes`.
 *
 * @param {Object} attributes
 * @returns {Resource}
 * @fires set
 */
Resource.prototype.set = function (attributes) {

  /**
   * @event set
   * @param {Resource} resource
   * @param {Object} attributes
   */
  this.constructor.emit('set', this, attributes);
  this.emit('set', attributes);

  for (var attr in attributes) {
    if (this.constructor.attributes[attr]) {
      this[attr] = attributes[attr];
    }
  }

  return this;
};

/**
 * Reset attributes for resource. Marks resource as clean. Instance attributes
 * not defined in `attributes` will be reset to `undefined`.
 *
 * @param {Object} attributes
 * @returns {Resource}
 * @fires reset
 */
Resource.prototype.reset = function (attributes) {

  /**
   * @event reset
   * @param {Resource} resource
   * @param {Object} attributes
   */
  this.constructor.emit('reset', this, attributes);
  this.emit('reset', attributes);

  this.dirtyAttributes.length = 0;

  for (var attr in attributes) {
    if (this.constructor.attributes[attr]) {
      this.attributes[attr] = attributes[attr];
    }
  }

  return this;
};

/**
 * Returns map of HTTP methods to resource URLs. If `method` is specified, the
 * URL for that `method` is returned.
 *
 * @param {String=} method
 * @returns {Object|String}
 */
Resource.url = function (method) {
  var baseUrl = this.baseUrl;

  if (!this.urls) {
    this.urls = {
      'get': baseUrl + '/:primary',
      'put': baseUrl + '/:primary',
      'patch': baseUrl + '/:primary',
      'post': baseUrl,
      'delete': baseUrl + '/:primary',
      'options': baseUrl + '/:primary'
    };
  }

  return method ? this.urls[method] : this.urls;
};

/**
 * Return serializable attributes for JSON representation.
 *
 * @returns {Object}
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
