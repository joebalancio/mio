var Query = require('./query');
var extend = require('./util').extend;

module.exports = Collection;

/**
 * A collection is the interface for working with multiple resources, and
 * exposes the same set of HTTP verbs as `Resource`.
 *
 * All Array.prototype methods are available for collections, but a collection
 * is not an array. The array of resources is kept at `Collection#resources`.
 *
 * @param {Array.<Resource>} resources
 * @memberof module:mio
 * @alias Collection
 * @class
 */
function Collection (resources) {

  /**
   * @type {Array.<Resource>}
   */
  this.resources = resources;

  /**
   * @type {Number}
   */
  this.length = this.resources.length;

  if (!this.Resource) {
    throw new Error("Resource is required");
  }
}

/**
 * Extend collection prototype or class.
 *
 * @param {Object} prototype
 * @param {Object} statics
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

Collection.get = function (query, callback) {
  var Collection = this;

  if (arguments.length === 0) {
    return new Query(this, this.get);
  }

  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  return this.Resource.trigger(
    'collection:get',
    query,
    function (err, collection) {
      if (err) return callback.call(this, err);

      if (!collection) {
        collection = new Collection([]);
      }

      callback.call(this, err, collection);
    });
};

Collection.put = function (query, resources, callback) {
  return this.Resource.trigger('collection:put', query, resources, callback);
};

Collection.patch = function (query, changes, callback) {
  return this.Resource.trigger('collection:patch', query, changes, callback);
};

Collection.post = function (resources, callback) {
  return this.Resource.trigger('collection:post', resources, callback);
};

Collection.delete = function (query, callback) {
  if (arguments.length === 0) {
    return new Query(this, this.get);
  }

  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  return this.Resource.trigger('collection:delete', query, callback);
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

  if (!this.urls) {
    this.urls = {
      'get': baseUrl,
      'put': baseUrl,
      'patch': baseUrl,
      'post': baseUrl,
      'delete': baseUrl,
      'options': baseUrl
    };
  }

  return method ? this.urls[method] : this.urls;
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

/*!
 * Inherit Array methods
 */
Array.prototype.forEach(function (key) {
  if (typeof Array.prototype[key] === 'function') {
    Collection.prototype[key] = function () {
      return this.resources[key].apply(this.resources, arguments);
    };
  }
});
