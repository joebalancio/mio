var extend = require('./util').extend;

module.exports = Collection;

function Collection (resources) {
  this.resources = resources;
  this.length = this.resources.length;

  if (!this.Resource) {
    throw new Error("Resource is required");
  }
}

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
    return new this.Resource.Query(this, this.get);
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
    return new this.Resource.Query(this, this.get);
  }

  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  return this.Resource.trigger('collection:delete', query, callback);
};

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
 * Returns `Collection#resources`.
 *
 * @returns {Array.<Resource>}
 */
Collection.prototype.toJSON = function () {
  return this.resources;
};

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
