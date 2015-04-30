var Query = require('./query');
var util = require('./util');

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
 * @param {Object=} options
 * @param {module:mio.Query=} options.query
 * @memberof module:mio
 * @alias Resource.Collection
 * @class
 */
function Collection (resources, options) {
  var Resource = this.Resource;

  if (!Resource) {
    throw new Error("Resource is required");
  }

  // Set query from `options.query` or create a new one.
  // All collections have an associated query used to retrieve them.
  // The query is also used to populate collection pagination parameters.
  if (typeof options === 'object' && typeof options.query === 'object') {
    this.query = options.query;
  } else {
    this.query = new Query({
      context: this,
      handler: this.get
    });
  }

  /**
   * @property resources
   * @memberof module:mio.Resource.Collection
   * @type {Array.<Resource>}
   */
  this.reset(resources);

  /**
   * Number of resources in the collection.
   *
   * @type {Number}
   * @name length
   * @memberof module:mio.Resource.Collection.prototype
   */

  /**
   * Query offset for collection.
   *
   * @type {Number}
   * @name from
   * @memberof module:mio.Resource.Collection.prototype
   */

  /**
   * Query limit for collection.
   *
   * @type {Number}
   * @name size
   * @memberof module:mio.Resource.Collection.prototype
   */

  /**
   * Number of resources in the database for this collection's query. Only
   * included if `query.withCount()` was used.
   *
   * @type {Number=}
   * @name total
   * @memberof module:mio.Resource.Collection.prototype
   */
  Object.defineProperties(this, {
    length: {
      get: function () {
        return this.resources.length;
      }
    },
    from: {
      get: function () {
        return this.query.from();
      }
    },
    size: {
      get: function () {
        return this.query.size();
      }
    },
    total: {
      get: function () {
        return this.query.total;
      }
    }
  });
}

/**
 * Create a collection of resources and hydrate them if necessary.
 *
 * This is simply sugar for `new Collection(resources)`.
 *
 * @param {Array.<module:mio.Resource|Object>} resources
 * @returns {module:mio.Resource.Collection}
 */
Collection.create = function(resources, options) {
  if (resources instanceof this) {
    return resources;
  } else {
    return new (this)(resources, options);
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
  prototype = util.setEnvSpecificKeys(prototype || {});
  statics = util.setEnvSpecificKeys(statics || {});

  var child = util.extend.call(this, prototype, statics);

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
 * @param {module:mio.Collection.get.get} callback
 * @returns {module:mio.Resource.Collection}
 * @fires module:mio.Resource.hook.collection:get
 * @fires module:mio.Resource.on.collection:get
 */
Collection.get = function (query, callback) {
  if (arguments.length === 0) {
    return new Query({
      context: this,
      handler: this.get
    });
  }

  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  query = new Query({
    context: this,
    state: query
  });

  /**
   * Runs before callback for `Resource.Collection.get`.
   *
   * @event collection:get
   * @memberof module:mio.Resource.hook
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
    query,
    function (err, collection) {
      if (err) return callback.call(this.Collection, err);

      if (collection) {
        callback.apply(this.Collection, arguments);
      } else {
        callback.call(this.Collection, err, new this.Collection([], {
          query: query
        }));
      }
    });

  return this;
};

/**
 * Replace a collection of resources using given `query`.
 *
 * @param {module:mio.Query} query
 * @param {Object} representation
 * @param {module:mio.Collection.put.put} callback
 * @returns {module:mio.Resource.Collection}
 * @fires module:mio.Resource.hook.collection:put
 * @fires module:mio.Resource.on.collection:put
 */
Collection.put = function (query, resources, callback) {
  if (arguments.length === 1) {
    resources = query;

    return new Query({
      context: this,
      handler: function (query, callback) {
        this.put(query, resources, callback);
      }
    });
  }

  query = new Query({
    context: this,
    state: query
  });

  /**
   * Runs before callback for `Resource.Collection.put`.
   *
   * @event collection:put
   * @memberof module:mio.Resource.hook
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
    query,
    resources,
    function (err, collection) {
      callback.apply(this.Collection, arguments);
    });

  return this;
};

/**
 * Update (patch) a collection of resources using given `query` and `changes`.
 *
 * @param {module:mio.Query} query
 * @param {Object|Array.<Object>} changes
 * @param {module:mio.Collection.patch.patch} callback
 * @returns {module:mio.Resource.Collection}
 * @fires module:mio.Resource.hook.collection:patch
 * @fires module:mio.Resource.on.collection:patch
 */
Collection.patch = function (query, changes, callback) {
  if (arguments.length === 1) {
    changes = query;

    return new Query({
      context: this,
      handler: function (query, callback) {
        this.patch(query, changes, callback);
      }
    });
  }

  query = new Query({
    context: this,
    state: query
  });

  /**
   * Runs before callback for `Resource.Collection.patch`.
   *
   * @event collection:patch
   * @memberof module:mio.Resource.hook
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
    query,
    changes,
    function (err, collection) {
      callback.apply(this.Collection, arguments);
    });

  return this;
};

/**
 * Create resources using given `representations`.
 *
 * @param {Array.<Object>} representations
 * @param {module:mio.Collection.post.post} callback
 * @returns {module:mio.Resource.Collection}
 * @fires module:mio.Resource.hook.collection:post
 * @fires module:mio.Resource.on.collection:post
 */
Collection.post = function (representations, callback) {

  /**
   * Runs before callback for `Resource.Collection.post`.
   *
   * @event collection:post
   * @memberof module:mio.Resource.hook
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
  this.Resource.trigger(
    'collection:post',
    representations,
    function (err, collection) {
      callback.apply(this.Collection, arguments);
    });

  return this;
};

/**
 * Delete resources using given `query`.
 *
 * @param {module:mio.Query} query
 * @param {module:mio.Collection.delete.delete} callback
 * @returns {module:mio.Resource.Collection}
 * @fires module:mio.Resource.hook.collection:delete
 * @fires module:mio.Resource.on.collection:delete
 */
Collection.delete = function (query, callback) {
  if (arguments.length === 0) {
    return new Query({
      context: this,
      handler: this.get
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
   * @memberof module:mio.Resource.hook
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
    new Query({
      context: this,
      state: query
    }),
    function () {
      callback.apply(this.Collection, arguments);
    });

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

  if (!urls) {
    if (baseUrl) {
      urls = {
        'get': baseUrl,
        'put': baseUrl,
        'patch': baseUrl,
        'post': baseUrl,
        'delete': baseUrl,
        'options': baseUrl
      };
    } else {
      urls = {};
    }
  }

  this.urls = urls;

  return method ? urls[method] : urls;
};

/**
 * Refresh the collection instance with the most recent resource
 * representations passed to the last hook's `next()`.
 *
 * @param {module:mio.Collection.get.get} callback
 * @returns {module:mio.Collection}
 * @fires module:mio.Resource.hook.collection:get
 * @fires module:mio.Resource.on.collection:get
 */
Collection.prototype.get = function (callback) {
  var collection = this;

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback get
   * @memberof module:mio.Collection.get
   * @param {Error} err
   * @param {module:mio.Collection} collection
   */
  this.Resource.trigger('collection:get', this.query, function (err, collection) {
    if (err) return callback.call(collection, err);

    if (collection) {
      collection.reset(collection);
    }

    callback.apply(collection, arguments);
  });

  return this;
};

/**
 * Replace the collection resources using the instance representation.
 *
 * @param {module:mio.Collection.put.put} callback
 * @returns {module:mio.Collection}
 * @fires module:mio.Resource.hook.collection:put
 * @fires module:mio.Resource.on.collection:put
 */
Collection.prototype.put = function (callback) {
  var collection = this;

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback put
   * @memberof module:mio.Collection.put
   * @param {Error} err
   * @param {module:mio.Collection} collection
   */
  this.Resource.trigger('collection:put', this.query, this, function () {
    callback.apply(collection, arguments);
  });

  return this;
};

/**
 * Patch the collection resources using the instance representation.
 *
 * @param {module:mio.Collection.patch.patch} callback
 * @returns {module:mio.Collection}
 * @fires module:mio.Resource.hook.collection:patch
 * @fires module:mio.Resource.on.collection:patch
 */
Collection.prototype.patch = function (callback) {
  var collection = this;

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback patch
   * @memberof module:mio.Collection.patch
   * @param {Error} err
   * @param {module:mio.Collection} collection
   */
  this.Resource.trigger('collection:patch', this.query, this, function () {
    callback.apply(collection, arguments);
  });

  return this;
};

/**
 * Create resources using the instance representation.
 *
 * @param {module:mio.Collection.post.post} callback
 * @returns {module:mio.Collection}
 * @fires module:mio.Resource.hook.collection:post
 * @fires module:mio.Resource.on.collection:post
 */
Collection.prototype.post = function (callback) {
  var collection = this;

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback post
   * @memberof module:mio.Collection.post
   * @param {Error} err
   * @param {module:mio.Collection} collection
   */
  this.Resource.trigger('collection:post', this, function () {
    callback.apply(collection, arguments);
  });

  return this;
};

/**
 * Delete resources in collection.
 *
 * @param {module:mio.Collection.post.post} callback
 * @returns {module:mio.Collection}
 * @fires module:mio.Resource.hook.collection:post
 * @fires module:mio.Resource.on.collection:post
 */
Collection.prototype.delete = function (callback) {
  var collection = this;

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback delete
   * @memberof module:mio.Collection.delete
   * @param {Error} err
   * @param {module:mio.Collection} collection
   */
  this.Resource.trigger('collection:delete', this.query, function (err) {
    if (err) return callback.call(collection, err);

    collection.reset([]);

    callback.apply(collection, arguments);
  });

  return this;
};

/**
 * Reset collection with given `resources`.
 *
 * @param {Array.<Resource|Object>} resources
 * @returns {module:mio.Collection}
 */
Collection.prototype.reset = function (resources) {
  var Resource = this.Resource;

  this.resources = (resources || []).map(function (resource) {
    return Resource.create(resource);
  });

  return this;
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
 * Retrieve next page of collection.
 *
 * @example
 *
 * ```javascript
 * User.Collection.get().exec(function (err, users) {
 *   users.nextPage().exec(function (err, users) {
 *     // ...
 *   });
 * });
 * ```
 *
 * @param {Number} number page number
 * @returns {module:mio.Query}
 */
Collection.prototype.nextPage = function () {
  return this.query.page(this.query.page() + 1);
};

/**
 * Retrieve specified `page` of collection.
 *
 * @example
 *
 * ```javascript
 * User.Collection.get().exec(function (err, users) {
 *   users.page(3).exec(function (err, users) {
 *     // ...
 *   });
 * });
 * ```
 *
 * @param {Number} page page number
 * @returns {module:mio.Query}
 */
Collection.prototype.page = function (page) {
  return this.query.page(page);
};

/**
 * Returns array of resources in collection.
 *
 * @returns {Array.<module:mio.Resource>}
 */
Collection.prototype.toJSON = function () {
  var array = this.resources;
  array.size = this.resources.size;
  array.from = this.resources.from;

  if (typeof this.resources.total === 'number') {
    array.total = this.resources.total;
  }

  return array;
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
