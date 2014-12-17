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
 * @param {Object} context context to execute `handler` with
 * @param {Function} handler method to execute for Query#exec
 * @returns {Query}
 * @memberof module:mio
 * @alias Query
 * @constructor
 */
function Query(context, handler) {
  this.context = context;
  this.handler = handler;

  /**
   * @typedef query
   * @type {Object}
   * @property {Object} where
   * @property {Object} sort
   * @property {Mixed} from
   * @property {Number} size
   * @property {String|Array.<String>} withRelated
   */
  this.query = {};
}

/**
 * Set `query.where` parameters.
 *
 * @param {Object} where
 * @returns {Query}
 */
Query.prototype.where = function(where) {
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
 * @returns {Query}
 */
Query.prototype.sort = function(sort) {
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
 * @returns {Query}
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
 * @returns {Query}
 */
Query.prototype.from = function(from) {
  this.query.from = from;
  return this;
};

/**
 * Set `query.size` parameter.
 *
 * @param {Number} size
 * @returns {Query}
 */
Query.prototype.size = function(size) {
  this.query.size = Number(size);
  return this;
};

/**
 * Set `query.page` parameter. Must be used after `query.size` is set.
 *
 * @param {Number} page first page is 1
 * @returns {Query}
 */
Query.prototype.page = function(page) {
  var size = this.query.size;

  if (!size) {
    throw new Error('page parameter requires size parameter to be set first');
  }

  this.query.from = Number((size * page) - size);

  return this;
};

/**
 * Set `query.withRelated` parameter.
 *
 * @param {String|Array<String>} relations
 * @returns {Query}
 */
Query.prototype.withRelated = function(relations) {
  if (typeof relations === 'string') {
    this.query.withRelated = [relations];
  } else {
    this.query.withRelated = relations;
  }
  return this;
};

/**
 * Execute query.
 *
 * @param {Function} callback
 */
Query.prototype.exec = function(callback) {
  return this.handler.call(this.context, this.query, callback);
};

/**
 * Return query object.
 *
 * @returns {query}
 */
Query.prototype.toJSON = function () {
  return this.query;
};
