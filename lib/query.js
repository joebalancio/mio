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
