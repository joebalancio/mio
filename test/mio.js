var expect = require('chai').expect;

var mio = process.env.JSCOV
        ? require('../lib-cov/mio') : require('../lib/mio');

describe('Model', function() {
  it('is instanceof exports.Model', function() {
    var User = mio.Resource.extend();
    var user = new User();
    expect(user).to.be.an.instanceOf(User);
    expect(user).to.be.an.instanceOf(mio.Resource);
  });

  it('inherits from EventEmitter', function() {
    var Model = mio.Resource.extend();
    expect(Model).to.have.property('emit');
    expect(Model).to.have.property('on');
  });

  it('emits "initializing" event', function(done) {
    var Model = mio.Resource.extend()
      .on('initialize', function(model, attrs) {
        expect(model).to.have.property('constructor', Model);
        expect(attrs).to.be.an('object');
        done();
      });
    new Model();
  });

  it('emits "initialized" event', function(done) {
    var Model = mio.Resource.extend()
      .on('create', function(model) {
        expect(model).to.be.an('object');
        expect(model).to.have.property('constructor', Model);
        done();
      });
    new Model();
  });

  it('emits "change" events', function(done) {
    var Model = mio.Resource.extend()
      .attr('id', { primary: true })
      .attr('name')
      .on('change', function(model, name, value, prev) {
        expect(model).to.be.an('object');
        expect(model).to.have.property('constructor', Model);
        expect(name).to.equal('name');
        expect(value).to.equal('alex');
        expect(prev).to.equal(null);
        done();
      });
    var model = new Model();
    model.name = 'alex';
  });

  it('sets default values on initialization', function() {
    var Model = mio.Resource.extend()
    .attr('id', {
      primary: true
    })
    .attr('active', {
      default: true
    })
    .attr('created_at', {
      default: function() {
        return new Date();
      }
    });
    var model = new Model({ id: 1 });
    expect(model.active).to.equal(true);
    expect(model.created_at).to.be.an.instanceOf(Date);
  });

  it('sets attributes on initialization', function() {
    var model = mio.Resource.extend({
      attributes: {
        id: { primary: true }
      }
    }).create({ id: 1 });
    expect(model).to.have.property('id', 1);
  });

  it('provides mutable extras attribute', function() {
    var User = mio.Resource.extend().attr('id');
    var user = new User;

    // Exists
    expect(user.extras).to.eql({});

    // Is writable
    user.extras.stuff = "things";
    expect(user.extras.stuff).to.equal("things");

    // Is not enumerable
    expect(Object.keys(user).indexOf('extras')).to.equal(-1);
  });

  describe('.primary', function() {
    var Model = mio.Resource.extend().attr('id');

    it('throws error on get if primary key is undefined', function() {
      expect(function() {
        var model = new Model({ id: 1 });
        var id = model.primary;
      }).to.throw('Primary key has not been defined.');
    });

    it('throws error on set if primary key is undefined', function() {
      expect(function() {
        var model = new Model({ id: 1 });
        model.primary = 1;
      }).to.throw('Primary key has not been defined.');
    });

    it('sets primary key attribute', function() {
      Model = mio.Resource.extend().attr('id', { primary: true });
      var model = new Model();
      model.primary = 3;
      expect(model.primary).to.equal(3);
    });
  });

  describe('.extend()', function () {
    it('extends model with static props', function() {
      var Base = mio.Resource.extend({
        attributes: {
          id: { primary: true }
        }
      }, {
        description: "test",
        use: [function(){}],
        browser: [function(){}],
        server: [function(){}]
      });
      var Extended = Base.extend();
      expect(Extended).to.have.property('description', 'test');
      var extended = new Extended();
      expect(extended).to.be.instanceOf(mio.Resource);
      expect(extended).to.be.instanceOf(Base);
      expect(extended.attributes).to.have.property('id');
    });

    it('extends model prototype', function() {
      var Base = mio.Resource.extend({
        attributes: {
          id: { primary: true }
        },
        test: function() {
          return "test";
        }
      });
      var Extended = Base.extend();
      var extended = new Extended();
      expect(extended).to.be.instanceOf(mio.Resource);
      expect(extended).to.be.instanceOf(Base);
      expect(extended).to.have.property('test');
      expect(extended.test).to.be.a('function');
      expect(extended.test()).to.equal('test');
    });
  });

  describe('.once()', function() {
    it('calls handler only once', function() {
      called = 0;

      var Model = mio.Resource.extend().once('foo', function() {
        called++;
      });

      Model.emit('foo');
      Model.emit('foo');

      expect(called).to.equal(1);
    });
  });

  describe('.trigger()', function () {
    it('runs hooks in series', function (done) {
      var Resource = mio.Resource.extend({
        attributes: {
          id: { primary: true }
        }
      });

      Resource
        .before('post', function (changed, next) {
          next(new Error('should stop hook execution'));
        })
        .before('post', function (changed, next) {
          done(new Error("second hook should not be called"));
        });

      Resource.create().post(function(err) {
        expect(err).to.exist();
        done();
      });
    });
  });

  describe('.attr()', function() {
    it('throws error if defining two primary keys', function() {
      var Model = mio.Resource.extend();
      Model.attr('id', { primary: true });
      expect(function() {
        Model.attr('_id', { primary: true });
      }).to.throw('Primary attribute already exists: id');
    });

    it('throws error if defining existing key', function() {
      var Model = mio.Resource.extend();
      Model.attr('id', { primary: true });
      expect(function() {
        Model.attr('id');
      }).to.throw('id attribute already exists');
    });

    it('emits "attribute" event', function(done) {
      var Model = mio.Resource.extend()
        .on('attribute', function(name, params) {
          expect(name).to.equal('id');
          expect(params).to.be.an('object');
          expect(params).to.have.property('primary', true);
          done();
        });
      Model.attr('id', { primary: true });
    });
  });

  describe('.use()', function() {
    it('extends model', function() {
      var Model = mio.Resource.extend();
      Model.use(function() {
        this.test = 1;
      });
      expect(Model).to.have.property('test', 1);
    });

    it('throws error if plugin is not a function', function() {
      expect(function() {
        mio.Resource.extend().use(1);
      }).to.throw(/must be a function/);
    });

    it('does not pollute other models', function(done) {
      var User = mio.Resource.extend();
      var Post = mio.Resource.extend();

      User.before('get', function(query, callback) {
        callback(null, {foo: 'bar'});
      });

      Post.get({}, function(err, model) {
        expect(model).to.equal(undefined);

        User.get({}, function (err, model) {
          expect(model).to.have.property('foo', 'bar');
          done();
        });
      });
    });
  });

  describe('.browser()', function() {
    it('only runs methods in browser', function() {
      var Model = mio.Resource.extend();
      global.window = {};
      Model.browser(function() {
        this.test = 1;
      });
    });
  });

  describe('.server()', function() {
    it('only runs methods in node', function() {
      var Model = mio.Resource.extend();
      Model.server(function() {
        this.test = 1;
      });
    });
  });

  describe('.create()', function() {
    it('creates new models', function() {
      var Model = mio.Resource.extend();
      var model = Model.create();
      expect(model).to.be.an.instanceOf(Model);
    });

    it('hydrates model from existing object', function() {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      var model = Model.create({ id: 1 });
      expect(model).to.have.property('id', 1);
    });
  });

  describe('.hasOne()', function () {
    it('should define attribute for relation', function () {
      var Patient = mio.Resource.extend().hasOne('record', {
        target: mio.Resource.extend(),
        foreignKey: 'patient_id'
      });

      expect(Patient.attributes).to.have.property('record');
      expect(Patient.attributes.record).to.have.property('relation');

      var relation = Patient.attributes.record.relation;

      expect(relation).to.have.property('type', 'hasOne');
      expect(relation).to.have.property('foreignKey', 'patient_id');
    });
  });

  describe('.addRelation()', function () {
    it('should pass params to .attr()`', function () {
      var Patient = mio.Resource.extend().hasOne('record', {
        target: mio.Resource.extend(),
        foreignKey: 'patient_id',
        serializable: false
      });

      expect(Patient.attributes).to.have.property('record');
      expect(Patient.attributes.record).to.have.property('serializable', false);
    });
  });

  describe('.hasMany()', function () {
    it('should define attribute for relation', function () {
      var Author = mio.Resource.extend().hasMany('books', {
        target: mio.Resource.extend(),
        foreignKey: 'author_id'
      });

      expect(Author.attributes).to.have.property('books');
      expect(Author.attributes.books).to.have.property('relation');

      var relation = Author.attributes.books.relation;

      expect(relation).to.have.property('type', 'hasMany');
      expect(relation).to.have.property('foreignKey', 'author_id');
    });
  });

  describe('.belongsTo()', function () {
    it('should define attribute for relation', function () {
      var Book = mio.Resource.extend().belongsTo('author', {
        target: mio.Resource.extend(),
        foreignKey: 'author_id'
      });

      expect(Book.attributes).to.have.property('author');
      expect(Book.attributes.author).to.have.property('relation');

      var relation = Book.attributes.author.relation;

      expect(relation).to.have.property('type', 'belongsTo');
      expect(relation).to.have.property('foreignKey', 'author_id');
    });
  });

  describe('.belongsToMany()', function () {
    it('should define attribute for relation', function () {
      var Post = mio.Resource.extend().belongsToMany('tags', {
        target: mio.Resource.extend(),
        foreignKey: 'tag_id',
        throughKey: 'post_id',
        through: 'post_tag'
      });

      expect(Post.attributes).to.have.property('tags');
      expect(Post.attributes.tags).to.have.property('relation');

      var relation = Post.attributes.tags.relation;

      expect(relation).to.have.property('type', 'belongsToMany');
      expect(relation).to.have.property('foreignKey', 'tag_id');
      expect(relation).to.have.property('throughKey', 'post_id');
      expect(relation).to.have.property('through', 'post_tag');
    });
  });

  describe('.get()', function() {
    it('finds models by id', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.get(1, function(err, model) {
        if (err) return done(err);
        done();
      });
    });

    it("triggers get hooks", function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });

      Model
        .before('get', function(query, cb) {
          cb();
        })
        .before('get', function(query, cb) {
          cb(null, new Model({ id: 1 }));
        });

      Model.get(1, function(err, model) {
        if (err) return done(err);
        expect(model).to.have.property('id', 1);
        done();
      });
    });

    it('emits "before:get" event', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.before('get', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Model.get(1, function(err, model) {
        if (err) return done(err);
      });
    });

    it('emits "get" event', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });

      Model.on('get', function(model) {
        expect(model).to.be.an.instanceOf(Model);
        done();
      });

      Model.before('get', function(query, cb) {
        cb(null, new Model({ id: 1 }));
      });

      Model.get(1, function(err, model) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });

      Model.before('get', function(query, cb) {
        cb(new Error('test'));
      });

      Model.get(1, function(err, model) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.Collection.get()', function() {
    it('finds collection of models using query', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.Collection.get(function(err, collection) {
        if (err) return done(err);
        expect(collection).to.be.an.instanceOf(Model.Collection);
        Model.get({ id: 1 }, function(err, collection) {
          done();
        });
      });
    });

    it("emits collection hooks", function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });

      Model
        .before('collection:get', function(query, cb) {
          cb();
        })
        .before('collection:get', function(query, cb) {
          cb(null, [new Model({ id: 1 })]);
        });

      Model.Collection.get(function(err, collection) {
        if (err) return done(err);
        expect(collection).to.have.property('length', 1);
        expect(collection[0]).to.have.property('constructor', Model);
        done();
      });
    });

    it('emits "before:collection:get" event', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.before('collection:get', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Model.Collection.get({ id: 1 }, function(err, collection) {
        if (err) return done(err);
      });
    });

    it('emits "collection:get" event', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.on('collection:get', function(collection, query) {
        done();
      });
      Model.Collection.get({ id: 1 }, function(err, collection) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });

      Model.before('collection:get', function(query, cb) {
        cb(new Error('test'));
      });

      Model.Collection.get(function(err, collection) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.Collection.patch()', function() {
    it('updates models using query', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.Collection.patch({ id: 1 }, { id: 2 }, function(err) {
        done();
      });
    });

    it('triggers "collection:patch" hooks', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });

      Model
        .before('collection:patch', function(query, changes, cb) {
          cb();
        })
        .before('collection:patch', function(query, changes, cb) {
          cb();
        });

      Model.Collection.patch({}, {}, function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('emits "before:collection:patch" event', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.before('collection:patch', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Model.Collection.patch({ id: 1 }, { id: 2 }, function(err) {
        if (err) return done(err);
      });
    });

    it('emits "collection:patch" event', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.on('collection:patch', function() {
        done();
      });
      Model.Collection.patch({ id: 1 }, { id: 2 }, function(err) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });

      Model
        .before('collection:patch', function(query, changes, cb) {
          cb();
        })
        .before('collection:patch', function(query, changes, cb) {
          cb(new Error('test'));
        });

      Model.Collection.patch({}, {}, function(err) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });


  describe('.Collection.delete()', function() {
    it('deletes models using query', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.Collection.delete({ id: 1 }, function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('triggers "collection:delete" hooks', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });

      Model
        .before('collection:delete', function(query, cb) {
          cb();
        })
        .before('collection:delete', function(query, cb) {
          cb();
        });

      Model.Collection.delete({}, function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('emits "before:collection:delete" event', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.before('collection:delete', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Model.Collection.delete({ id: 1 }, function(err) {
        if (err) return done(err);
      });
    });

    it('emits "collection:delete" event', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.on('collection:delete', function() {
        done();
      });
      Model.Collection.delete({ id: 1 }, function(err) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });

      Model
        .before('collection:delete', function(query, cb) {
          cb();
        })
        .before('collection:delete', function(query, cb) {
          cb(new Error('test'));
        });

      Model.Collection.delete(function(err) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.query()', function() {
    it('returns query object', function() {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      var query = Model.Collection.get();
      expect(query).to.be.an('object');
      expect(query).to.have.property('where');
      expect(query).to.have.property('sort');
      expect(query).to.have.property('paginate');
      expect(query).to.have.property('from');
      expect(query).to.have.property('size');
      expect(query).to.have.property('withRelated');
      expect(query).to.have.property('exec');
    });

    it('is chainable', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.get()
      .where({ name: 'alex' })
      .sort('asc')
      .size(10)
      .withRelated('related')
      .exec(function(err) {
        if (err) return done(err);

        Model.Collection.get()
        .where({ name: 'alex' })
        .sort('asc')
        .size(10)
        .withRelated(['related'])
        .exec(function(err) {
          if (err) return done(err);

          Model.Collection.delete()
          .where({ name: 'alex' })
          .sort('asc')
          .size(10)
          .exec(done);
        });
      });
    });

    it('modifies query', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.before('collection:get', function(query, next) {
        expect(query).to.have.keys([
          'from',
          'page',
          'size',
          'sort',
          'where'
        ]);
        done();
      });
      Model.Collection.get()
        .where({ name: 'alex' })
        .sort('asc')
        .paginate({ page: 1 })
        .from(10)
        .size(10)
        .exec(function() {});
    });
  });

  describe('#isNew()', function() {
    it('checks whether primary attribute is set', function() {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      var m1 = Model.create();
      expect(m1.isNew()).to.equal(true);
      var m2 = Model.create({ id: 1 });
      expect(m2.isNew()).to.equal(false);
    });

    it('throws error if primary key has not been defined', function() {
      var Model = mio.Resource.extend().attr('id');
      var model = Model.create();
      expect(function() {
        model.isNew();
      }).to.throw("Primary key has not been defined.");
    });
  });

  describe('#has()', function() {
    it('checks for attribute definition', function() {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      var model = Model.create({ id: 1 });
      expect(model.has('name')).to.equal(false);
      expect(model.has('id')).to.equal(true);
    });
  });

  describe('#set()', function() {
    it('sets values for defined attributes', function() {
      var Model = mio.Resource.extend()
        .attr('id', { primary: true })
        .attr('name');
      var model = Model.create().set({ id: 1, name: 'alex', age: 26 });
      expect(model.id).to.equal(1);
      expect(model.name).to.equal('alex');
      expect(model).to.not.have.property('age');
    });

    it('emits "setting" event', function(done) {
      var Model = mio.Resource.extend()
        .attr('id', { primary: true })
        .attr('name')
        .on('set', function(model, attrs) {
          expect(model).to.have.property('constructor', Model);
          expect(attrs).to.have.property('name', 'alex');
          done();
        });
      var model = new Model();
      model.set({ name: 'alex' });
    });
  });

  describe('#reset()', function() {
    it('resets values for defined attributes', function() {
      var Model = mio.Resource.extend()
        .attr('id', { primary: true })
        .attr('name');
      var model = Model.create().reset({ id: 1, name: 'alex', age: 26 });
      expect(model.id).to.equal(1);
      expect(model.name).to.equal('alex');
      expect(model).to.not.have.property('age');
    });

    it('emits "setting" event', function(done) {
      var Model = mio.Resource.extend()
        .attr('id', { primary: true })
        .attr('name')
        .on('reset', function(model, attrs) {
          expect(model).to.have.property('constructor', Model);
          expect(attrs).to.have.property('name', 'alex');
          done();
        });
      var model = new Model();
      model.reset({ name: 'alex' });
    });
  });

  describe('#isDirty()', function() {
    it('returns whether model is changed/dirty', function() {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      var model = Model.create();
      expect(model.isDirty()).to.equal(false);
      model.id = 1;
      expect(model.isDirty()).to.equal(true);
    });

    it('returns whether attribute is changed/dirty', function() {
      var Model = mio.Resource.extend()
        .attr('id', { primary: true })
        .attr('name', { required: true });

      var model = new Model();
      model.name = 'alex';
      expect(model.isDirty('name')).to.equal(true);
    });
  });

  describe('#changed()', function() {
    it('returns attributes changed since last save', function() {
      var Model = mio.Resource.extend()
        .attr('id', { primary: true })
        .attr('name');
      var model = Model.create({ id: 1 });
      model.name = 'alex';
      expect(model.changed()).to.have.property('name', 'alex');
    });
  });

  describe('#post()', function() {
    it('triggers "post" hooks', function(done) {
      var Model = mio.Resource.extend()
        .attr('id', { primary: true, required: true })
        .before('post', function(changed, cb, model) {
          expect(changed).to.have.property('id', 1);
          cb();
        })
        .before('post', function(changed, cb, model) {
          expect(changed).to.have.property('id', 1);
          cb();
        });

      var model = Model.create().set({ id: 1 });

      model.post(function(err) {
        expect(model.id).to.equal(1);
        done();
      });
    });

    it("passes error from adapter to callback", function(done) {
      var Model = mio.Resource.extend()
        .attr('id', { primary: true })
        .before('post', function(changed, cb) {
          cb(new Error("test"));
        });

      var model = Model.create();

      model.post(function(err) {
        expect(err.message).to.equal('test');
        done();
      });
    });

    it('emits "before:post" event', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      var called = false;
      Model.before('post', function(changed, next, model) {
        called = true;
        expect(model).to.have.property('constructor', Model);
        expect(changed).to.be.an('object');
        next();
      });
      Model.create().set('id', 1).post(function(err) {
        expect(called).to.equal(true);
        done(err);
      });
    });

    it('emits "post" event', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      var model = Model.create().set('id', 1);
      model.on('post', function() {
        done();
      }).post(function(err) { });
    });
  });

  describe('#delete()', function() {
    it('triggers "delete" hooks', function(done) {
      var Model = mio.Resource.extend()
        .attr('id', { primary: true, required: true })
        .before('delete', function(model, cb) {
          cb();
        })
        .before('delete', function(model, cb) {
          cb();
        });
      var model = Model.create({ id: 1 });
      model.delete(function(err) {
        expect(err).to.eql(undefined);
        done();
      });
    });

    it("passes error from adapter to callback", function(done) {
      var Model = mio.Resource.extend()
        .attr('id', { primary: true, required: true })
        .before('delete', function(model, cb) {
          cb(new Error('test'));
        });
      var model = Model.create({ id: 1 });
      model.delete(function(err) {
        expect(err).to.have.property('message', 'test');
        done();
      });
    });

    it('emits "before:delete" event', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.before('delete', function(query, next, model) {
        expect(model).to.have.property('constructor', Model);
        next();
      });
      var model = Model.create({ id: 1 });
      model.before('delete', function() {
        done();
      }).delete(function(err) { });
    });

    it('emits "delete" event', function(done) {
      var Model = mio.Resource.extend().attr('id', { primary: true });
      Model.on('delete', function(query, model) {
        expect(model).to.be.an.instanceOf(Model);
      });
      var model = Model.create({ id: 1 });
      model.on('delete', function() {
        done();
      }).delete(function(err) { });
    });
  });

  describe('#toJSON()', function () {
    it('only includes serializable attributes', function () {
      var resource = mio.Resource.extend({
        attributes: {
          name: {},
          active: {
            serializable: false
          }
        }
      })({ name: 'alex', active: true });

      var json = resource.toJSON();
      expect(json).to.have.property('name', 'alex');
      expect(json).not.to.have.property('active');
    });
  });
});
