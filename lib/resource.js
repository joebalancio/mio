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

  var Surrogate = function() {
    this.constructor = child;
  };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();

  // static object properties to inherit with shallow copy
  var methods = ['attributes', 'hooks', 'listeners', 'options'];

  for (var i=0, l=methods.length; i<l; i++) {
    var obj = parent[methods[i]];

    child[methods[i]] = Object.create(null);

    for (var key in obj) {
      child[methods[i]][key] = obj[key];
    }
  }

  // static properties to inherit
  for (var prop in parent) {
    if (!child[prop]) {
      child[prop] = parent[prop];
    }
  }

  // extend class with static properties
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
      default:
        child[prop] = statics[prop];
    }
  }

  // extend prototype with properties
  for (var prop in prototype) {
    if (prototype.hasOwnProperty(prop)) {
      if (prop === 'attributes') {

        // define instance attributes using `Resource#attr()`
        for (var key in prototype.attributes) {
          child.attr(key, prototype.attributes[key]);
        }
      } else {
        child.prototype[prop] = prototype[prop];
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
 * @param {findOneCallback} callback
 * @returns {Resource}
 * @fires before:findOne
 * @fires findOne
 */
Resource.findOne = function(query, callback) {
  if (typeof query == 'number') {
    query = { where: { id: query } };
  }

  if (arguments.length === 0) {
    return new this.Query(this, this.findOne);
  }

  /**
   * Callback for {@link module:mio.Resource.findOne}.
   *
   * @callback findOneCallback
   * @param {Error} err
   * @param {Resource} resource
   * @this {Resource}
   */

  /**
   * Runs before {@link module:mio.Resource.findOne} callback.
   *
   * Asynchronous. Listeners run in series. If an error is passed as the first
   * argument to `next` **or a value as the second**, subsequent hooks are
   * **not** executed and `next` arguments are passed to the callback
   * for {@link module:mio.Resource.findOne}.
   *
   * @event before:findOne
   * @param {Object} query
   * @param {Function} next
   */

  /**
   * Run at the beginning of {@link module:mio.Resource.findOne}'s callback.
   *
   * @event findOne
   * @param {Object} query
   * @param {Resource} resource
   */
  return this.trigger('findOne', query, callback);
};

Resource.get = Resource.findOne;

/**
 * Find collection of resources using given `query`.
 *
 * @example
 *
 * ```javascript
 * User.find({ active: true }, function (err, users) {
 *   // ...
 * });
 * ```
 *
 * Queries can also be composed using chainable methods:
 *
 * ```javascript
 * User.find()
 *  .where({ active: true })
 *  .sort({ created_at: "desc" })
 *  .size(10)
 *  .exec(function(err, users) {
 *    // ...
 *  });
 * ```
 *
 * @param {Object} query
 * @param {findCallback} callback
 * @returns {Resource}
 * @fires before:find
 * @fires find
 */
Resource.find = function(query, callback) {
  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  if (arguments.length === 0) {
    return new this.Query(this, this.find);
  }

  /**
   * Callback for {@link module:mio.Resource.find}.
   *
   * @callback findCallback
   * @param {Error} err
   * @param {Array<Resource>} resources
   * @this {Resource}
   */

  /**
   * Runs before {@link module:mio.Resource.find} callback.
   *
   * Asynchronous. Listeners run in series. If an error is passed as the first
   * argument to `next` **or a value as the second**, subsequent hooks are
   * **not** executed and `next` arguments are passed to the callback
   * for {@link module:mio.Resource.find}.
   *
   * @event before:find
   * @param {Object} query
   * @param {Function} next
   */

  /**
   * Runs at the beginning of {@link module:mio.Resource.find}'s callback.
   *
   * @event find
   * @param {Object} query
   * @param {Array<Resource>} collection
   */
  return this.trigger('find', query, callback, []);
};

Resource.all = Resource.findAll = Resource.find;

/**
 * Count resources using given `query`.
 *
 * @param {Object} query
 * @param {countCallback} callback
 * @returns {Resource}
 * @fires before:count
 * @fires count
 */
Resource.count = function(query, callback) {
  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  if (arguments.length === 0) {
    return new this.Query(this, this.count);
  }

  /**
   * Callback for {@link module:mio.Resource.count}.
   *
   * @callback countCallback
   * @param {Error} err
   * @param {Number} count
   * @this {Resource}
   */

  /**
   * Runs before {@link module:mio.Resource.count} callback.
   *
   * Asynchronous. Listeners run in series. If an error is passed as the first
   * argument to `next` **or a value as the second**, subsequent hooks are
   * **not** executed and the `next` arguments are passed to the callback
   * for {@link module:mio.Resource.count}.
   *
   * @event before:count
   * @param {Object} query
   * @param {Function} next
   */

  /**
   * Run at the beginning of {@link module:mio.Resource.count}'s callback.
   *
   * @event count
   * @param {Object} query
   * @param {Number} count
   */
  return this.trigger('count', query, callback, 0);
};

/**
 * Update all resources using given `query` and corresponding set of `changes`.
 *
 * @example
 *
 * ```javascript
 * User.update({ active: true }, { active: false }, function(err) {
 *   // ...
 * });
 * ```
 *
 * @param {Object} query
 * @param {Object|Array} changes
 * @param {updateCallback} callback
 * @returns {Resource}
 * @fires before:updateMany
 * @fires updateMany
 */
Resource.update = function (query, changes, callback) {

  /**
   * Runs before {@link module:mio.Resource.update} callback.
   *
   * Asynchronous. Listeners run in series. If an error is passed as the first
   * argument to `next`, subsequent hooks are not executed and the `next`
   * arguments are passed to the callback for
   * {@link module:mio.Resource.update}.
   *
   * @event before:updateMany
   * @param {Object} query
   * @param {Object|Array} changes
   * @param {Function} next
   */

  /**
   * Run at the beginning of {@link module:mio.Resource.update}'s callback.
   *
   * @event updateMany
   * @param {Object} query
   * @param {Object|Array} changes
   */
  return this.trigger('updateMany', query, changes, function(err) {

    /**
     * Callback for {@link module:mio.Resource.update}.
     *
     * @callback updateCallback
     * @param {Error} err
     * @param {Object} query
     * @param {Object|Array} changes
     * @this {Resource}
     */
    callback.call(this, err, query, changes);
  });
};

/**
 * Destroy many resources using given `query`.
 *
 * @param {Object} query
 * @param {removeManyCallback} callback
 * @returns {Resource}
 * @fires before:removeMany
 * @fires removeMany
 */

Resource.remove = function(query, callback) {
  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  if (arguments.length === 0) {
    return new this.Query(this, this.remove);
  }

  /**
   * Runs before {@link module:mio.Resource.remove} callback.
   *
   * Asynchronous. Listeners run in series. If an error is passed as the first
   * argument to `next`, subsequent hooks are not executed and the `next`
   * arguments are passed to the callback for
   * {@link module:mio.Resource.remove}.
   *
   * @event before:removeMany
   * @param {Object} query
   * @param {Function} next
   */

  /**
   * Run at the beginning of {@link module:mio.Resource.remove}'s callback.
   *
   * @event removeMany
   * @param {Object} query
   */
  return this.trigger('removeMany', query, function(err) {

    /**
     * Callback for {@link module:mio.Resource.remove}.
     *
     * @callback removeManyCallback
     * @param {Error} err
     * @param {Object} query
     * @this {Resource}
     */
    callback.call(this, err, query);
  });
};

/**
 * Compose queries functionally.
 *
 * @example
 *
 * ```javascript
 * User.find()
 *  .where({ active: true })
 *  .sort({ created_at: "desc" })
 *  .size(10)
 *  .exec(function(err, users) {
 *    // ...
 *  });
 * ```
 *
 * @param {Resource} Resource
 * @param {Function} handler method to execute for Query#exec
 * @return {Object}
 * @private
 */
Resource.Query = function Query(Resource, handler) {
  this.Resource = Resource;
  this.handler = handler;
  this.query = {};
};

/**
 * Set `query.where` parameters.
 *
 * @param {Object} where
 * @return {Resource.Query}
 */
Resource.Query.prototype.where = function(where) {
  var query = this.query;

  query.where = query.where || {};

  for (var key in where) {
    query.where[key] = where[key];
  }

  return this;
};

/**
 * Set `query.sort` parameters.
 *
 * @param {Object} sort
 * @return {Resource.Query}
 */
Resource.Query.prototype.sort = function(sort) {
  var query = this.query;

  query.sort = query.sort || {};

  if (typeof sort === 'object') {
    for (var key in sort) {
      query.sort[key] = sort[key];
    }
  } else {
    query.sort = sort;
  }

  return this;
};

/**
 * Set `query.paginate` parameters.
 *
 * @param {Object} paginate
 * @param {Number=} paginate.from
 * @param {Number=} paginate.size
 * @return {Resource.Query}
 */
Resource.Query.prototype.paginate = function(paginate) {
  for (var key in paginate) {
    this.query[key] = paginate[key]
  }
  return this;
};

/**
 * Set `query.from` parameter.
 *
 * @param {Mixed} from treated as an offset if number
 * @return {Resource.Query}
 */
Resource.Query.prototype.from = function(from) {
  this.query.from = from;
  return this;
};

/**
 * Set `query.size` parameter.
 *
 * @param {Number} size
 * @return {Resource.Query}
 */
Resource.Query.prototype.size = function(size) {
  this.query.size = Number(size);
  return this;
};

/**
 * Set `query.page` parameter. Must be used after `query.size` is set.
 *
 * @param {Number} page first page is 1
 * @return {Resource.Query}
 */
Resource.Query.prototype.page = function(page) {
  var size = this.query.size;

  if (!size) {
    throw new Error('page parameter requires size parameter to be set first');
  }

  this.query.from = Number((size * page) - size);

  return this;
};

/**
 * Set `query.with` parameter.
 *
 * @param {String|Array<String>} relations
 * @return {Resource.Query}
 */
Resource.Query.prototype.with = function(relations) {
  if (typeof relations === 'string') {
    this.query.with = [relations];
  } else {
    this.query.with = relations;
  }
  return this;
};

/**
 * Execute query.
 *
 * @param {Function} callback
 * @return {Resource}
 */
Resource.Query.prototype.exec = function(callback) {
  return this.handler.call(this.Resource, this.query, callback);
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
  if (event === 'save') {
    this.on(event + ':new', listener);
    this.on(event + ':update', listener);
  } else {
    if (!this.listeners[event]) {
      this.listeners[event] = [listener];
    }
    else {
      this.listeners[event].push(listener);
    }
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
  if (event === 'save') {
    this.before(event + ':new', hook);
    this.before(event + ':update', hook);
  } else {
    if (!this.hooks[event]) {
      this.hooks[event] = [hook];
    }
    else {
      this.hooks[event].push(hook);
    }
  }
  return this;
};

Resource.prototype.before = Resource.before;

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
 * @param {Mixed=} defaultResult
 * @returns {Resource}
 */
Resource.trigger = function(event, args, callback, defaultResult) {
  var Resource = this.dirtyAttributes ? this.constructor : this;
  var resource = this.save && this;

  if (arguments.length > 3) {
    args = Array.prototype.slice.call(arguments, 1);
    callback = args.pop();
    if (typeof callback !== 'function') {
      defaultResult = callback;
      callback = args.pop();
    }
  } else if (arguments.length === 2) {
    callback = args;
    args = [];
  } else {
    args = [args];
  }

  var hooks = Resource.hooks[event] || [];
  var instanceHooks = (resource && resource.hooks[event]) || [];
  var self = resource || Resource;
  var nextArgs = (resource ? [resource].concat(args):args).concat([next]);
  var instanceNextArgs = args.concat([next]);

  if (hooks) {
    hooks = hooks.slice(0);
  }

  if (instanceHooks) {
    instanceHooks = instanceHooks.slice(0);
  }

  // Call each "before:EVENT" handler in series.
  function next (err, result) {
    if (err || result) {
      done(err, result);
    }
    else if (hooks.length) {
      hooks.shift().apply(Resource, nextArgs);
    }
    else if (instanceHooks.length) {
      instanceHooks.shift().apply(resource, instanceNextArgs);
    }
    else {
      done(null, defaultResult);
    }
  }

  // Handle result and emit event(s).
  function done (err, result) {
    if (err) return callback.call(self, err);

    // Run `.on()` "EVENT" handlers.
    if (resource) {
      Resource.emit.apply(Resource, [event, resource].concat(args));
      resource.emit.apply(resource, [event].concat(args));
    }
    else {
      Resource.emit.apply(Resource, [event, result].concat(args));
    }

    callback.call(self, null, result);
  }

  next();

  return this;
};

Resource.prototype.trigger = Resource.trigger;

/**
 * Persist resource to storage. Runs "save" event handlers registered by
 * persistence plugins.
 *
 * @param {saveInstanceCallback} callback
 * @returns {Resource}
 * @fires before:save
 * @fires before:save:new
 * @fires before:save:update
 * @fires save
 * @fires save:new
 * @fires save:update
 */
Resource.prototype.save = function(callback) {
  var resource = this;
  var primaryKey = resource.constructor.primaryKey;
  var changed = this.changed();
  var op = (resource.isNew() ? 'save:new' : 'save:update');

  if (!callback) callback = noop;

  /**
   * Runs before {@link module:mio.Resource#save} callback for new or previously
   * saved resources.
   *
   * Asynchronous. Listeners run in series. If an error is passed as the first
   * argument to `next`, subsequent hooks are not executed and the `next`
   * arguments are passed to the callback for
   * {@link module:mio.Resource#save}.
   *
   * @event before:save
   * @see before:save:new
   * @see before:save:update
   * @param {Resource} resource
   * @param {Object} changed map of dirty attributes
   * @param {Function} next
   */

  /**
   * Runs before {@link module:mio.Resource#save} callback for new resources
   * that have not been saved.
   *
   * Asynchronous. Listeners run in series. If an error is passed as the first
   * argument to `next`, subsequent hooks are not executed and the `next`
   * arguments are passed to the callback for
   * {@link module:mio.Resource#save}.
   *
   * @event before:save:new
   * @param {Resource} resource
   * @param {Object} changed map of dirty attributes
   * @param {Function} next
   */

  /**
   * Runs before {@link module:mio.Resource#save} callback for resources that
   * have been successfully saved.
   *
   * Asynchronous. Listeners run in series. If an error is passed as the first
   * argument to `next`, subsequent hooks are not executed and the `next`
   * arguments are passed to the callback for
   * {@link module:mio.Resource#save}.
   *
   * @event before:save:update
   * @param {Resource} resource
   * @param {Object} changed map of dirty attributes
   * @param {Function} next
   */

  /**
   * Run at the beginning of {@link module:mio.Resource#save}'s callback for
   * new or previously saved resources.
   *
   * @event save
   * @see save:new
   * @see save:update
   * @param {Resource} resource
   * @param {Object} changed map of dirty attributes
   */

  /**
   * Run at the beginning of {@link module:mio.Resource#save}'s callback for
   * new resources that have not been saved.
   *
   * @event save:new
   * @param {Resource} resource
   * @param {Object} changed map of dirty attributes
   */

  /**
   * Run at the beginning of {@link module:mio.Resource#save}'s callback for
   * resources that have been successfully saved.
   *
   * @event save:update
   * @param {Resource} resource
   * @param {Object} changed map of dirty attributes
   */
  this.trigger(op, changed, function(err) {
    if (err) return callback.call(resource, err);

    resource.dirtyAttributes.length = 0;

    /**
     * Callback for {@link module:mio.Resource.prototype.save}.
     *
     * @callback saveInstanceCallback
     * @param {Error} err
     * @this {resource}
     */
    callback.call(resource);
  });

  return this;
};

/**
 * Remove resource from storage. Runs "remove" event handlers registered by
 * persistence plugins.
 *
 * @param {removeCallback} callback
 * @returns {Resource}
 * @fires before:remove
 * @fires remove
 */
Resource.prototype.remove = function(callback) {
  var resource = this;

  if (!callback) callback = noop;

  /**
   * Runs before {@link module:mio.Resource#remove} callback.
   *
   * Asynchronous. Listeners run in series. If an error is passed as the first
   * argument to `next`, subsequent hooks are not executed and the `next`
   * arguments are passed to the callback for
   * {@link module:mio.Resource#remove}.
   *
   * @event before:remove
   * @param {Resource} resource
   * @param {Function} next
   */

  /**
   * Run at the beginning of {@link module:mio.Resource#remove}'s callback.
   *
   * @event remove
   * @param {Resource} resource
   */
  this.trigger('remove', function(err) {
    if (err) return callback.call(resource, err);

    // Set primary key to null
    resource.attributes[resource.constructor.primaryKey] = null;

    /**
     * Callback for {@link module:mio.Resource#remove}.
     *
     * @callback removeCallback
     * @param {Error} err
     * @this {resource}
     */
    callback.call(resource);
  });

  return this;
};

Resource.prototype.destroy = Resource.prototype.remove;

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
 * Return dirty attributes (changed since last save).
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
 * Reset attributes for resource. Marks resource as clean.
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
