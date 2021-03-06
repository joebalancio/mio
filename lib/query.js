module.exports = Query;

/**
 * Queries are created by actions such as `Resource.get()` and provide a
 * consistent query interface across plugins and other related modules.
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
 * @param {Object} settings
 * @param {module:mio.Resource|module:mio.Resource.Collection} settings.context
 * @param {Function=} settings.handler method to execute for Query#exec
 * @param {Object=} settings.state set initial query state
 * @memberof module:mio
 * @constructor
 */
function Query(settings) {
  settings = settings || {};

  this.context = settings.context;
  this.handler = settings.handler;
  this.Resource = this.context && (this.context.Resource || this.context);

  if (!this.Resource) {
    throw new Error('Query requires a Resource or Collection.');
  }

  if (this.Resource.maxPageSize) {
    this.maxSize = this.Resource.maxPageSize;
  }

  if (this.Resource.defaultPageSize) {
    this.defaultSize = this.Resource.defaultPageSize;
  }

  /**
   * @typedef query
   * @type {Object}
   * @property {Object} where
   * @property {Object} sort
   * @property {Mixed} from
   * @property {Number} size
   * @property {String|Array.<String>} withRelated
   */
  if (typeof settings.state === 'object' && settings.state !== null) {
    this.query = settings.state;
  } else {
    this.query = {};
  }

  if (typeof this.query.where !== 'object' || this.query.where === null) {
    this.query.where = {};
  }

  if (!this.query.from) {
    this.query.from = 0;
  }

  if (!this.query.size) {
    this.query.size = this.defaultSize || 0;
  }

  if (this.maxSize && this.query.size > this.maxSize) {
    this.query.size = this.maxSize;
  }

  if (this.query.withRelated) {
    this.withRelated(this.query.withRelated);
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
 * @returns {module:mio.Query|Object}
 */
Query.prototype.where = function(where, value) {
  var query = this.query;

  if (arguments.length === 0) return query.where;

  if (value) {
    query.where[where] = value;
  } else if (typeof where === 'string') {
    return query.where[where];
  } else {
    for (var key in where) {
      query.where[key] = where[key];
    }
  }

  return this;
};

/**
 * Include count in resulting collection as Collection#total.
 *
 * @example
 *
 * ```javascript
 * Resource.Collection.get().withCount().exec(function (err, collection) {
 *   console.log(collection.total); // prints count
 * });
 * ```
 *
 * @returns {module:mio.Query}
 */
Query.prototype.withCount = function () {
  this.query.withCount = true;

  return this;
}

/**
 * Set `query.sort` parameters.
 *
 * @param {Object} sort
 * @returns {module:mio.Query|Object}
 */
Query.prototype.sort = function(sort) {
  var query = this.query;

  if (arguments.length === 0) return query.sort;

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
  if (size > this.maxSize) {
    size = this.maxSize;
  }
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

  if (arguments.length === 0) {
    if (size === 0) {
      return 1;
    } else {
      return Math.floor(this.query.from / size) + 1;
    }
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
 *   posts: { size: 5 }
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

  if (typeof query.withRelated !== 'object') {
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
