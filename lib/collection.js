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
 * @param {Array.<Resource>} resources
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
 * @param {Array.<Resource|Object>} resources
 * @returns {Collection}
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
 * @returns {Collection}
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
 * @param {query} query
 * @param {getCallback} callback
 * @returns {Collection}
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
 * @param {query} query
 * @param {Object} representation
 * @param {putCallback} callback
 * @returns {Collection}
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
 * @param {query} query
 * @param {Object|Array.<Object>} changes
 * @param {patchCallback} callback
 * @returns {Collection}
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
 * @param {postCallback} callback
 * @returns {Collection}
 * @fires module:mio.Resource.before.collection:post
 * @fires module:mio.Resource.on.collection:post
 */
Collection.post = function (representations, callback) {
  this.Resource.trigger('collection:post', representations, callback);
  return this;
};

/**
 * Delete resources using given `query`.
 *
 * @param {query} query
 * @param {deleteCallback} callback
 * @returns {Collection}
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
 * @returns {Resource}
 */
Collection.prototype.at = function (index) {
  return this.resources[index];
};

/**
 * Returns array of resources in collection.
 *
 * @returns {Array.<Resource>}
 */
Collection.prototype.toJSON = function () {
  return this.resources;
};

/**
 * Returns array of resources in collection.
 *
 * @returns {Array.<Resource>}
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
