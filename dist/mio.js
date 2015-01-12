!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.mio=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @module mio
 */
exports.Resource = require('./resource');
exports.Collection = require('./collection');
exports.Query = require('./query');

},{"./collection":2,"./query":3,"./resource":4}],2:[function(require,module,exports){
var Query = require('./query');
var extend = require('./util').extend;

module.exports = Collection;

/**
 * A collection is the interface for working with multiple resources, and
 * exposes the same set of HTTP verbs as `Resource`.
 *
 * Array.prototype methods are available for collections, but a collection
 * is not an array. The array of resources is kept at `Collection#resources`.
 * Methods such as `map` return arrays instead of the collection.
 *
 * @example
 *
 * ```javascript
 * var resource1 = new Resource();
 * var collection = new Resource.Collection([resource]);
 *
 * collection.push(new Resource());
 * collection.splice(1, 1, new Resource());
 *
 * collection.at(0) === resource; // => true
 * collection.length === 2;       // => true
 * collection.indexOf(resource);  // => 0
 * ```
 *
 * @param {Array.<module:mio.Resource>} resources
 * @memberof module:mio
 * @alias Resource.Collection
 * @class
 */
function Collection (resources) {
  var Resource = this.Resource;

  /**
   * @type {Array.<Resource>}
   */
  this.resources = (resources || []).map(function (resource) {
    return Resource.create(resource);
  });

  /**
   * Number of resources in the collection.
   *
   * @type {Number}
   * @name length
   * @memberof module:mio.Resource.Collection.prototype
   */
  Object.defineProperty(this, 'length', {
    get: function () {
      return this.resources.length;
    }
  });

  if (!Resource) {
    throw new Error("Resource is required");
  }
}

/**
 * Create a collection of resources and hydrate them if necessary.
 *
 * This is simply sugar for `new Collection(resources)`.
 *
 * @param {Array.<module:mio.Resource|Object>} resources
 * @returns {module:mio.Resource.Collection}
 */
Collection.create = function(resources) {
  if (resources instanceof this) {
    return resources;
  } else {
    return new (this)(resources);
  }
};

/**
 * Extend collection prototype or class properties.
 *
 * @param {Object} prototype
 * @param {Object} statics
 * @param {String} statics.baseUrl
 * @returns {module:mio.Resource.Collection}
 */
Collection.extend = function (prototype, statics) {
  var child = extend.call(this, prototype, statics);

  child.Resource = child.prototype.Resource;

  if (!child.Resource) {
    throw new Error("Resource is required");
  }

  return child;
};

/**
 * Get a collection of resources using given `query`.
 *
 * @param {module:mio.Query} query
 * @param {module:mio.Resource.get.get} callback
 * @returns {module:mio.Resource.Collection}
 * @fires module:mio.Resource.before.collection:get
 * @fires module:mio.Resource.on.collection:get
 */
Collection.get = function (query, callback) {
  var Collection = this;

  if (arguments.length === 0) {
    return new Query({
      handler: this.get,
      context: this
    });
  }

  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  /**
   * Runs before callback for `Resource.Collection.get`.
   *
   * @event collection:get
   * @memberof module:mio.Resource.before
   * @param {module:mio.Query} query
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource.Collection} collection included if triggered
   * by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.Collection.get`.
   *
   * @event collection:get
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {module:mio.Resource.Collection} collection included if triggered
   * by instance.
   * @this {module:mio.Resource}
   */
  this.Resource.trigger(
    'collection:get',
    new Query({ state: query }),
    function (err, collection) {
      if (err) return callback.call(this, err);

      if (!collection) {
        collection = new Collection([]);
      }

      callback.call(this, err, collection);
    });

  return this;
};

/**
 * Replace a collection of resources using given `query`.
 *
 * @param {module:mio.Query} query
 * @param {Object} representation
 * @param {module:mio.Resource.put.put} callback
 * @returns {module:mio.Resource.Collection}
 * @fires module:mio.Resource.before.collection:put
 * @fires module:mio.Resource.on.collection:put
 */
Collection.put = function (query, resources, callback) {
  if (arguments.length === 1) {
    resources = query;

    return new Query({
      handler: function (query, callback) {
        this.put(query, resources, callback);
      },
      context: this
    });
  }

  /**
   * Runs before callback for `Resource.Collection.put`.
   *
   * @event collection:put
   * @memberof module:mio.Resource.before
   * @param {module:mio.Query} query
   * @param {Array.<Object|module:mio.Resource>} resources
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource.Collection} collection included if triggered
   * by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.Collection.put`.
   *
   * @event collection:put
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {Array.<Object>|Array.<module:mio.Resource>} resources
   * @param {module:mio.Resource.Collection} collection included if triggered
   * by instance.
   * @this {module:mio.Resource}
   */
  this.Resource.trigger(
    'collection:put',
    new Query({ state: query }),
    resources,
    callback
  );

  return this;
};

/**
 * Update (patch) a collection of resources using given `query` and `changes`.
 *
 * @param {module:mio.Query} query
 * @param {Object|Array.<Object>} changes
 * @param {module:mio.Resource.patch.patch} callback
 * @returns {module:mio.Resource.Collection}
 * @fires module:mio.Resource.before.collection:patch
 * @fires module:mio.Resource.on.collection:patch
 */
Collection.patch = function (query, changes, callback) {
  if (arguments.length === 1) {
    changes = query;

    return new Query({
      handler: function (query, callback) {
        this.patch(query, changes, callback);
      },
      context: this
    });
  }

  /**
   * Runs before callback for `Resource.Collection.patch`.
   *
   * @event collection:patch
   * @memberof module:mio.Resource.before
   * @param {module:mio.Query} query
   * @param {Object|Array.<Object>} patch
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource.Collection} collection included if triggered
   * by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.Collection.patch`.
   *
   * @event collection:patch
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {Object|Array.<Object>} patch
   * @param {module:mio.Resource.Collection} collection included if triggered
   * by instance.
   * @this {module:mio.Resource}
   */
  this.Resource.trigger(
    'collection:patch',
    new Query({ state: query }),
    changes,
    callback
  );

  return this;
};

/**
 * Create resources using given `representations`.
 *
 * @param {Array.<Object>} representations
 * @param {module:mio.Resource.post.post} callback
 * @returns {module:mio.Resource.Collection}
 * @fires module:mio.Resource.before.collection:post
 * @fires module:mio.Resource.on.collection:post
 */
Collection.post = function (representations, callback) {

  /**
   * Runs before callback for `Resource.Collection.post`.
   *
   * @event collection:post
   * @memberof module:mio.Resource.before
   * @param {module:mio.Query} query
   * @param {Array.<Object>|Array.<module:mio.Resource>} resources
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource.Collection} collection included if triggered
   * by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.Collection.post`.
   *
   * @event collection:post
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {Array.<Object>|Array.<module:mio.Resource>} resources
   * @param {module:mio.Resource.Collection} collection included if triggered
   * by instance.
   * @this {module:mio.Resource}
   */
  this.Resource.trigger('collection:post', representations, callback);
  return this;
};

/**
 * Delete resources using given `query`.
 *
 * @param {module:mio.Query} query
 * @param {module:mio.Resource.delete.delete} callback
 * @returns {module:mio.Resource.Collection}
 * @fires module:mio.Resource.before.collection:delete
 * @fires module:mio.Resource.on.collection:delete
 */
Collection.delete = function (query, callback) {
  if (arguments.length === 0) {
    return new Query({
      handler: this.get,
      context: this
    });
  }

  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  /**
   * Runs before callback for `Resource.Collection.delete`.
   *
   * @event collection:delete
   * @memberof module:mio.Resource.before
   * @param {module:mio.Query} query
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource.Collection} collection included if triggered
   * by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.Collection.delete`.
   *
   * @event collection:delete
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {module:mio.Resource.Collection} collection included if triggered
   * by instance.
   * @this {module:mio.Resource}
   */
  this.Resource.trigger(
    'collection:delete',
    new Query({ state: query }),
    callback
  );

  return this;
};

/**
 * Returns map of HTTP methods to collection URLs. If `method` is specified, the
 * URL for that `method` is returned.
 *
 * @param {String=} method
 * @returns {Object|String}
 */
Collection.url = function (method) {
  var baseUrl = this.Resource.baseUrl;
  var urls = this.urls;

  if (!baseUrl) {
    throw new Error("No Resource.baseUrl defined.");
  }

  if (!urls) {
    urls = this.urls = {
      'get': baseUrl,
      'put': baseUrl,
      'patch': baseUrl,
      'post': baseUrl,
      'delete': baseUrl,
      'options': baseUrl
    };
  }

  return method ? urls[method] : urls;
};

/**
 * Returns map of HTTP methods to collection URLs. If `method` is specified, the
 * URL for that `method` is returned.
 *
 * @param {String=} method
 * @returns {Object|String}
 */
Collection.prototype.url = function (method) {
  return this.constructor.url(method);
};

/**
 * Returns resource at given `index`.
 *
 * @param {Number} index
 * @returns {module:mio.Resource}
 */
Collection.prototype.at = function (index) {
  return this.resources[index];
};

/**
 * Returns array of resources in collection.
 *
 * @returns {Array.<module:mio.Resource>}
 */
Collection.prototype.toJSON = function () {
  return this.resources;
};

/**
 * Returns array of resources in collection.
 *
 * @returns {Array.<module:mio.Resource>}
 */
Collection.prototype.toArray = Collection.prototype.toJSON;

/**
 * Collections inherit `Array.prototype` methods. `Array.prototype` methods
 * that return arrays such as `map` still return an array, not the collection.
 *
 * @function [ArrayMethod]
 * @memberof module:mio.Resource.Collection.prototype
 */
[
  'every',
  'filter',
  'forEach',
  'indexOf',
  'lastIndexOf',
  'map',
  'pop',
  'push',
  'reduce',
  'reduceRight',
  'reverse',
  'shift',
  'slice',
  'some',
  'sort',
  'splice',
  'unshift'
].forEach(function (key) {
  if (typeof Array.prototype[key] === 'function') {
    Collection.prototype[key] = function () {
      return this.resources[key].apply(this.resources, arguments);
    };
  }
});

},{"./query":3,"./util":5}],3:[function(require,module,exports){
module.exports = Query;

/**
 * Compose queries functionally.
 *
 * @example
 *
 * ```javascript
 * User.Collection.get()
 *  .where({ active: true })
 *  .sort({ created_at: "desc" })
 *  .size(10)
 *  .exec(function(err, users) {
 *    // ...
 *  });
 * ```
 *
 * The above is equivelant to:
 *
 * ```javascript
 * User.Collection.get({
 *   where: { active: true },
 *   sort:  { created_at: 'desc' },
 *   size:  10
 * }, function (err, users) {
 *   // ...
 * });
 * ```
 *
 * @param {Object=} options
 * @param {Object=} options.state set initial query state
 * @param {Function=} options.handler method to execute for Query#exec
 * @param {Object=} options.context context when executing `options.handler`
 * @memberof module:mio
 * @alias Query
 * @constructor
 */
function Query(options) {
  options = options || {};

  this.context = options.context;
  this.handler = options.handler;

  /**
   * @typedef query
   * @type {Object}
   * @property {Object} where
   * @property {Object} sort
   * @property {Mixed} from
   * @property {Number} size
   * @property {String|Array.<String>} withRelated
   */
  this.query = options.state || {};

  if (!this.query.where) {
    this.query.where = {};
  }
}

/**
 * Set `query.where` parameters individually or using a map.
 *
 * @example
 *
 * Specify multiple parameters using a map:
 *
 * ```javascript
 * User.Collection.get().where({
 *   active: true,
 *   role: 'admin'
 * }).exec(function (err, users) { ... });
 * ```
 *
 * Specify individual parameters using a key and value:
 *
 * ```javascript
 * User.Collection.get()
 *   .where('active', true)
 *   .where('role', 'admin')
 *   .exec(function (err, users) { ... })
 * ```
 *
 * @param {Object} where
 * @param {Mixed=} value
 * @returns {module:mio.Query}
 */
Query.prototype.where = function(where, value) {
  var query = this.query;

  if (arguments.length === 0) return query.where;

  if (value) {
    query.where[where] = value;
  } else {
    for (var key in where) {
      query.where[key] = where[key];
    }
  }

  return this;
};

/**
 * Set `query.sort` parameters.
 *
 * @param {Object} sort
 * @returns {module:mio.Query}
 */
Query.prototype.sort = function(sort) {
  var query = this.query;

  query.sort = query.sort || {};

  if (arguments.length === 0) return query.sort;

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
 * Set `query.from` and `query.size` using a map.
 *
 * @param {Object} paginate
 * @param {Number=} paginate.from
 * @param {Number=} paginate.size
 * @returns {module:mio.Query}
 */
Query.prototype.paginate = function(paginate) {
  for (var key in paginate) {
    this.query[key] = paginate[key]
  }

  return this;
};

/**
 * Set `query.from` parameter.
 *
 * @param {Mixed} from treated as an offset if number
 * @returns {module:mio.Query}
 */
Query.prototype.from = function(from) {
  if (arguments.length === 0) return this.query.from;
  this.query.from = from;
  return this;
};

/**
 * Set `query.size` parameter.
 *
 * @param {Number} size
 * @returns {module:mio.Query}
 */
Query.prototype.size = function(size) {
  if (arguments.length === 0) return this.query.size;
  this.query.size = Number(size);
  return this;
};

/**
 * Set `query.page` parameter. Must be used after `query.size` is set. This
 * method sets the proper `query.from` value from `page`.
 *
 * @param {Number} page first page is 1
 * @returns {module:mio.Query}
 */
Query.prototype.page = function(page) {
  var size = this.query.size;

  if (arguments.length === 0) return size;

  if (!size) {
    throw new Error('page parameter requires size parameter to be set first');
  }

  this.query.from = Number((size * page) - size);

  return this;
};

/**
 * Include related resources.
 *
 * @example
 *
 * Include one or more related resources in query:
 *
 * ```javascript
 * Book.get('0-945466-47-1')
 *   .withRelated('author', 'reviews')
 *   .exec(function (err, book) {
 *     console.log(book.author);
 *     console.log(book.reviews);
 *   });
 * ```
 *
 * Relation query parameters can be specified using a map:
 *
 * ```javascript
 * // only fetches 5 of this user's posts
 * User.get(1).withRelated({
 *   posts: { limit: 5 }
 * }).exec(function (err, user) {
 *   console.log(user.posts.length); // => 5
 * });
 * ```
 *
 * @param {String|Array<String>|Object} relations
 * @returns {module:mio.Query}
 */
Query.prototype.withRelated = function(relations) {
  var query = this.query;

  if (arguments.length === 0) {
    return query.withRelated;
  }

  if (!query.withRelated) {
    query.withRelated = {};
  }

  if (typeof relations === 'string') {
    if (arguments.length === 1) {
      query.withRelated[relations] = {
        name: relations
      };
    } else {
      for (var i = 0, l = arguments.length; i < l; i++) {
        query.withRelated[arguments[i]] = {
          name: arguments[i]
        };
      }
    }
  } else if (typeof relations === 'object') {
    query.withRelated = relations;

    for (var key in relations) {
      if (relations[key].nested === true) {
        relations[key].nested = {};
      }

      query.withRelated[key] = relations[key];
    }
  }

  return this;
};

/**
 * Execute query.
 *
 * @param {Function} callback
 */
Query.prototype.exec = function(callback) {
  var handler = this.handler;
  var context = this.context || handler;
  var query = this.query;

  if (!handler) {
    throw new Error("no handler defined to execute query");
  }

  return handler.call(context, query, callback);
};

/**
 * Return query object JSON.
 *
 * @returns {Object}
 */
Query.prototype.toJSON = function () {
  return this.query;
};

},{}],4:[function(require,module,exports){
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
 * @alias Resource
 * @memberof module:mio
 * @fires module:mio.Resource.on.initialize
 * @fires module:mio.Resource.on.create
 */
function Resource(values) {
  if (!values) values = {};

  /**
   * Run at the beginning of resource constructor.
   *
   * @event initialize
   * @memberof module:mio.Resource.on
   * @param {module:mio.Resource} resource
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
           * @memberof module:mio.Resource.on
           * @param {module:mio.Resource} resource
           * @param {String} name name of the attribute
           * @param {Mixed} value
           * @param {Mixed} prev
           */

          /**
           * Fired whenever [attr] is changed.
           *
           * @event change:[attr]
           * @memberof module:mio.Resource.on
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
   * **Note:** Not the same event as {@link module:mio.Resource.on.post}.
   *
   * @event create
   * @memberof module:mio.Resource.on
   * @param {Resource} resource
   */
  this.constructor.emit('create', this);
}

/**
 * Extend `Resource` attributes and prototype or class properties.
 *
 * @example
 *
 * ```javascript
 * var User = mio.Resource.extend({
 *   attributes: {
 *     id: { primary: true }
 *   },
 * }, {
 *   baseUrl: '/users'
 * });
 * ```
 *
 * @param {Object} prototype extend resource prototype
 * @param {Object} prototype.attributes attribute definitions passed to
 * {@link Resource.attr}
 * @param {Object=} statics extend resource with static properties or methods
 * @param {String} baseUrl used by {@link Resource#url} to construct URLs
 * @param {Array=} statics.use array of plugins passed to {@link Resource.use}
 * @param {Array=} statics.browser array of browser plugins to use
 * @param {Array=} statics.server array of server plugins to use
 * @returns {module:mio.Resource}
 */
Resource.extend = function (prototype, statics) {
  var attributes;

  statics = statics || {};

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

  return child;
};

/**
 * Define a resource attribute with the given `name` and `options`.
 *
 * @example
 *
 * ```javascript
 * User
 *   .attr('id', { primary: true })
 *   .attr('name')
 *   .attr('created', {
 *     default: function() {
 *       return new Date();
 *     }
 *   });
 * ```
 *
 * Passing a non-object for `options` sets that value as the default:
 *
 * ```javascript
 * User.attr('created', function () {
 *   return new Date();
 * });
 * ```
 *
 * @param {String} name
 * @param {Object=} options
 * @param {Mixed=} options.default default value or function that returns value
 * @param {Boolean=} options.enumerable attribute is enumerable (default: true)
 * @param {Boolean=} options.serializable include in JSON (default: true)
 * @param {Function=} options.get accessor function
 * @param {Boolean=} options.primary use attribute as primary key
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.on.attribute
 */
Resource.attr = function(name, options) {
  this.attributes = this.attributes || Object.create(null);

  if (this.attributes[name]) {
    throw new Error(name + " attribute already exists");
  }

  if (typeof options !== 'object') {
    options = {
      'default': options
    };
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
   * @memberof module:mio.Resource.on
   * @param {String} name attribute name
   * @param {Object} options attribute options
   */
  this.emit('attribute', name, options);

  return this;
};

/**
 * Call the given `plugin` function with the Resource as both argument and
 * context.
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
 * @param {module:mio.Resource.use.plugin} plugin
 * @returns {module:mio.Resource}
 */
Resource.use = function(plugin) {
  if (typeof plugin === 'function') {

    /**
     * Called with Resource as argument and context.
     *
     * @callback plugin
     * @memberof module:mio.Resource.use
     * @param {module:mio.Resource} Resource
     * @this {module:mio.Resource}
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
 * Use given `plugin` only in browser.
 *
 * @param {module:mio.Resource.use.plugin} plugin
 * @returns {module:mio.Resource}
 */
Resource.browser = function(plugin) {
  if (typeof window === 'object') {
    this.use.apply(this, arguments);
  }
  return this;
};

/**
 * Use given `plugin` only in node.
 *
 * @param {module:mio.Resource.use.plugin} plugin
 * @returns {module:mio.Resource}
 */
Resource.server = function(fn) {
  if (typeof window === 'undefined') {
    this.use.apply(this, arguments);
  }
  return this;
};

/**
 * Create a new resource and hydrate with given `attributes`,
 * or if `attributes` is already a resource return it.
 *
 * This is simply sugar for `new Resource(attributes)`.
 *
 * @param {Object} attributes
 * @returns {module:mio.Resource}
 */
Resource.create = function(attributes) {
  if (attributes instanceof this) {
    return attributes;
  } else {
    return new (this)(attributes);
  }
};

/**
 * Get a resource with given `query`.
 *
 * If `query` is a non-object (such as an ID) it's transformed into
 * `{ where: { primary: query } }`.
 *
 * @example
 *
 * ```javascript
 * User.get(123, function (err, user) {
 *   // ...
 * });
 * ```
 *
 * @param {module:mio.Query} query
 * @param {module:mio.Resource.get.get} callback
 * @returns {module:mio.Resource|module:mio.Query}
 * @fires module:mio.Resource.before.get
 * @fires module:mio.Resource.on.get
 */
Resource.get = function(query, callback) {
  if (typeof query === 'string' || typeof query === 'number') {
    query = { where: { id: query } };
  }

  if (arguments.length < 2) {
    return new Query({
      handler: this.get,
      context: this,
      state: query
    });
  }

  /**
   * Runs before callback for `Resource.get` or `Resource#get`.
   *
   * @event get
   * @memberof module:mio.Resource.before
   * @param {module:mio.Query} query
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.get` or `Resource#get`.
   *
   * @event get
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback get
   * @memberof module:mio.Resource.get
   * @param {Error} err
   */
  return this.trigger('get', new Query({ state: query }), callback);
};

/**
 * Replace or create resource using given `query` and `representation`.
 *
 * @param {module:mio.Query} query
 * @param {Object} representation
 * @param {module:mio.Resource.put.put} callback
 * @returns {module:mio.Resource|module:mio.Query}
 * @fires module:mio.Resource.before.put
 * @fires module:mio.Resource.on.put
 */
Resource.put = function (query, rep, callback) {
  if (arguments.length === 1) {
    rep = query;

    return new Query({
      handler: function (query, callback) {
        this.put(query, rep, callback);
      },
      context: this
    });
  }

  /**
   * Runs before callback for `Resource.put` or `Resource#put`.
   *
   * @event put
   * @memberof module:mio.Resource.before
   * @param {module:mio.Query} query
   * @param {Object|module:mio.Resource} representation
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.put` or `Resource#put`.
   *
   * @event put
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {Object|module:mio.Resource} representation
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback put
   * @memberof module:mio.Resource.put
   * @param {Error} err
   */
  return this.trigger('put', new Query({ state: query }), rep, callback);
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
 * @param {module:mio.Query} query
 * @param {Object|Array} changes
 * @param {module:mio.Resource.patch.patch} callback
 * @returns {module:mio.Resource|module:mio.Query}
 * @fires module:mio.Resource.before.patch
 * @fires module:mio.Resource.on.patch
 */
Resource.patch = function (query, changes, callback) {
  if (arguments.length === 1) {
    changes = query;

    return new Query({
      handler: function (query, callback) {
        this.patch(query, changes, callback);
      },
      context: this
    });
  }

  /**
   * Runs before callback for `Resource.patch` or `Resource#patch`.
   *
   * @event patch
   * @memberof module:mio.Resource.before
   * @param {module:mio.Query} query
   * @param {Object|Array.<Object>} patch
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.patch` or `Resource#patch`.
   *
   * @event patch
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {Object|Array.<Object>} patch
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback patch
   * @memberof module:mio.Resource.patch
   * @param {Error} err
   */
  return this.trigger('patch', new Query({ state: query }), changes, callback);
};

/**
 * Post resource using given `representation`.
 *
 * To post multiple resources use `Resource.Collection.post`.
 *
 * @param {Object} representation
 * @param {module:mio.Resource.post.post} callback
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.before.post
 * @fires module:mio.Resource.on.post
 */
Resource.post = function (representation, callback) {

  /**
   * Runs before callback for `Resource.post` or `Resource#post`.
   *
   * @event post
   * @memberof module:mio.Resource.before
   * @param {module:mio.Query} query
   * @param {Object|module:mio.Resource} representation
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.post` or `Resource#post`.
   *
   * @event post
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {Object|module:mio.Resource} representation
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback post
   * @memberof module:mio.Resource.post
   * @param {Error} err
   */
  return this.trigger('post', representation, callback);
};

/**
 * Delete resource using given `query`.
 *
 * To delete multiple resources use `Resource.Collection.delete`.
 *
 * @param {module:mio.Query} query
 * @param {module:mio.Resource.delete} callback
 * @returns {module:mio.Resource|query}
 * @fires module:mio.Resource.before.delete
 * @fires module:mio.Resource.on.delete
 */
Resource.delete = function(query, callback) {
  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  if (arguments.length === 0) {
    return new Query({
      handler: this.delete,
      context: this
    });
  }

  /**
   * Runs before callback for `Resource.delete` or `Resource#delete`.
   *
   * @event delete
   * @memberof module:mio.Resource.before
   * @param {module:mio.Query} query
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.delete` or `Resource#delete`.
   *
   * @event delete
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback delete
   * @memberof module:mio.Resource.delete
   * @param {Error} err
   */
  return this.trigger('delete', new Query({ state: query }), callback);
};

/**
 * Define a new relationship attribute. This is a helper method used by the
 * relation methods such as `.hasOne()`, `.hasMany()`, etc.
 *
 * @param {String} type hasOne, hasMany, belongsTo, or belongsToMany
 * @param {String} attr attribute name
 * @param {Object} params
 * @returns {module:mio.Resource}
 * @private
 */
Resource.addRelation = function (type, attr, params) {
  var options = {
    relation: {
      attribute: attr,
      type: type,
      target: params.target,
      foreignKey: params.foreignKey,
      nested: params.nested
    }
  };

  for (var key in params) {
    if (!params.hasOwnProperty || params.hasOwnProperty(key)) {
      if (!key.match(/^(type|attribute|target|foreignKey|nested)$/)) {
        options[key] = params[key];
      }
    }
  }

  return this.attr(attr, options);
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
 *
 * Book.get(1).withRelated('author').exec(function (err, book) {
 *   assert(book.author instanceof Author);
 * });
 * ```
 *
 * @param {String} attr name of the attribute populated with target resource
 * @param {Object} params additional parameters passed to `.attr()`
 * @param {module:mio.Resource|Function} params.target can be a function that returns
 * constructor to avoid circular reference issues
 * @param {String} params.foreignKey foreign key on current resource.
 * @param {Boolean} params.nested whether to always include (default: false)
 * @returns {module:mio.Resource}
 */
Resource.belongsTo = function (attr, params) {
  return this.addRelation('belongsTo', attr, params);
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
 *
 * Patent.get(1).withRelated('record').exec(function (err, patient) {
 *   assert(patient.record instanceof Record);
 * });
 * ```
 *
 * @param {String} attr name of the attribute populated with target resource
 * @param {Object} params additional parameters passed to `.attr()`
 * @param {module:mio.Resource} params.target
 * @param {String} params.foreignKey foreign key on target resource.
 * @param {Boolean} params.nested whether to always include (default: false)
 * @returns {module:mio.Resource}
 */
Resource.hasOne = function (attr, params) {
  return this.addRelation('hasOne', attr, params);
};

/**
 * The `hasMany` relationship is for a resource with a one-to-many
 * relationship with the target resource. The resource is referenced by a
 * foreign key on the target resource.
 *
 * ```javascript
 * Organization.hasMany('members', {
 *   target: User,
 *   foreignKey: 'organization_id'
 * });
 *
 * Organization.get(1).withRelated('members').exec(function (err, organization)
 *   organization.members.forEach(function (member) {
 *     assert(member instanceof User);
 *   });
 * });
 * ```
 *
 * Many-to-many relationships can be modeled using an intermediary resource,
 * where the current resource is joined to the target resources through an
 * intermediary resource.
 *
 * ```javascript
 * Membership
 *   .belongsTo('organization', {
 *     target: Organization,
 *     foreignKey: 'organization_id'
 *   })
 *   .belongsTo('user', {
 *     target: User,
 *     foreignKey: 'user_id'
 *   });
 *
 * Organization.hasMany('memberships', {
 *   target: Membership,
 *   foreignKey: 'organization_id'
 * });
 *
 * Organization.get(1)
 *   .withRelated('memberships'
 *   .exec(function (err, organization) {
 *     organization.memberships.forEach(function (member) {
 *       assert(membership.member instanceof User);
 *       assert(membership.organization instanceof Organization);
 *     });
 *   });
 * ```
 *
 * While this strategy may seem verbose, it is robust and allows for
 * relationships that keep state such as a membership role, or the date a post
 * was tagged. Sometimes you need both the intermediary resource and the
 * resources it relates, and other times you need solely the relationship
 * (intermediary resource).
 *
 * @param {String} attr name of the attribute populated with target resource
 * @param {Object} params additional parameters passed to `.attr()`
 * @param {module:mio.Resource|Function} params.target can be a function that returns
 * constructor to avoid circular reference issues
 * @param {String} params.foreignKey foreign key on target resource.
 * @param {Boolean} params.nested always include relation in queries (default: false)
 * @returns {module:mio.Resource}
 */
Resource.hasMany = function (attr, params) {
  return this.addRelation('hasMany', attr, params);
};

/**
 *
 * @param {String} attr name of the attribute populated with target resource
 * @param {Object} params additional parameters passed to `.attr()`
 * @param {Boolean} params.nested whether to always include (default: false)
 * @returns {module:mio.Resource}
 */

/**
 * Register `listener` to be called when `event` is emitted.
 *
 * @param {String} event
 * @param {Function} listener
 * @returns {module:mio.Resource}
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
 * @returns {module:mio.Resource}
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
 * @returns {module:mio.Resource}
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
 * such as {@link module:mio.Resource.get} or
 * {@link module:mio.Resource#post}, are asynchronous, and run in series.
 * Hooks receive a `next` function as the last argument, which must be called
 * to continue firing subsequent listeners. Subsequent hooks will not be run
 * if `next` receives any arguments. Arguments received by `next` are passed to
 * the callback of the method that fired the event.
 *
 * @example
 *
 * ```javascript
 * User.before('get', function (query, next) {
 *   // do something before save such as validation and then call next()
 * });
 *
 * User.on('patch', function (query, changed) {
 *   // do something after update
 * });
 * ```
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
 * Run {@link module:mio.Resource.before} hooks for given `event`.
 *
 * Hooks are {@link module:mio.Resource.trigger|triggered} by various methods
 * such as {@link module:mio.Resource.get} or
 * {@link module:mio.Resource#post}, are asynchronous, and run in series.
 * Hooks receive a `next` function as the last argument, which must be called
 * to continue firing subsequent listeners. Subsequent hooks will not be run
 * if `next` receives any arguments. Arguments received by `next` are passed to
 * the callback of the method that fired the event.
 *
 * @param {String} event
 * @param {Mixed} args multiple arguments can be passed
 * @param {Function} callback
 * @returns {module:mio.Resource}
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

  /**
   * Call the next hook in series, unless an `error` or `result` was received.
   *
   * @callback next
   * @memberof module:mio.Resource.trigger
   * @param {Error} error
   * @param {module:mio.Resource|Array.<module:mio.Resource>} result
   * @param {Mixed} ...
   */
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
 * Refresh the resource instance with the representation passed to the last
 * hook's `next()`.
 *
 * @param {module:mio.Resource.get.get} callback
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.before.get
 * @fires module:mio.Resource.on.get
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
 * @param {module:mio.Resource.put.put} callback
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.before.put
 * @fires module:mio.Resource.on.put
 */
Resource.prototype.put = function (callback) {
  var query = this.primaryKeyQuery();
  return this.trigger('put', query, this.toJSON(), callback);
};

/**
 * Patch resource with diff of instance representation.
 *
 * @param {module:mio.Resource.patch.patch} callback
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.before.patch
 * @fires module:mio.Resource.on.patch
 */
Resource.prototype.patch = function (callback) {
  var query = this.primaryKeyQuery();
  return this.trigger('patch', query, this.changed(), callback);
};

/**
 * Post resource and update instance.
 *
 * @param {postCallback} callback
 * @returns {resource}
 * @fires module:mio.Resource.before.post
 * @fires module:mio.Resource.on.post
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
 * @param {module:mio.Resource.delete.delete} callback
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.before.delete
 * @fires module:mio.Resource.on.delete
 */
Resource.prototype.delete = function (callback) {
  return this.trigger('delete', this.primaryKeyQuery(), callback);
};

/**
 * Return a query using the resources primary key.
 *
 * @returns {module:mio.Query}
 * @private
 */
Resource.prototype.primaryKeyQuery = function () {
  var query = new Query();

  if (this.primary) {
    query.where(this.constructor.primaryKey, this.primary);
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
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.on.set
 */
Resource.prototype.set = function (attributes) {

  /**
   * @event set
   * @memberof module:mio.Resource.on
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
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.on.reset
 */
Resource.prototype.reset = function (attributes) {

  /**
   * @event reset
   * @memberof module:mio.Resource.on
   * @param {module:mio.Resource} resource
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
  var urls = this.urls;

  if (!baseUrl) {
    throw new Error("No baseUrl defined.");
  }

  if (!urls) {
    urls = this.urls = {
      'get': baseUrl + '/:primary',
      'put': baseUrl + '/:primary',
      'patch': baseUrl + '/:primary',
      'post': baseUrl,
      'delete': baseUrl + '/:primary',
      'options': baseUrl + '/:primary'
    };
  }

  return method ? urls[method] : urls;
};

/**
 * Returns map of HTTP methods to resource URLs. If `method` is specified, the
 * URL for that `method` is returned.
 *
 * @param {String=} method
 * @returns {Object|String}
 */
Resource.prototype.url = function (method) {
  return this.constructor.url(method);
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

},{"./collection":2,"./query":3,"./util":5}],5:[function(require,module,exports){
exports.extend = function (prototype, statics) {
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

  // static properties to inherit
  for (var prop in parent) {
    if (!child[prop]) {
      child[prop] = parent[prop];
    }
  }

  for (var prop in statics) {
    if (!(prop === 'use' || prop === 'browser' || prop === 'server')) {
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

},{}]},{},[1])(1)
});