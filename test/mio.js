var expect = require('chai').expect;

var mio = process.env.JSCOV
        ? require('../lib-cov/mio') : require('../lib/mio');

var Resource = mio.Resource;

describe('Model', function() {
  it('is instanceof exports.Model', function() {
    var User = Resource.extend();
    var user = new User();
    expect(user).to.be.an.instanceOf(User);
    expect(user).to.be.an.instanceOf(Resource);
  });

  it('inherits from EventEmitter', function() {
    var Model = Resource.extend();
    expect(Model).to.have.property('emit');
    expect(Model).to.have.property('on');
  });

  it('emits "initializing" event', function(done) {
    var Model = Resource.extend()
      .on('initialize', function(model, attrs) {
        expect(model).to.have.property('constructor', Model);
        expect(attrs).to.be.an('object');
        done();
      });
    new Model();
  });

  it('emits "initialized" event', function(done) {
    var Model = Resource.extend()
      .on('create', function(model) {
        expect(model).to.be.an('object');
        expect(model).to.have.property('constructor', Model);
        done();
      });
    new Model();
  });

  it('emits "change" events', function(done) {
    var Model = Resource.extend()
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
    var Model = Resource.extend()
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
    var model = Resource.extend({
      attributes: {
        id: { primary: true }
      }
    }).create({ id: 1 });
    expect(model).to.have.property('id', 1);
  });

  it('provides mutable extras attribute', function() {
    var User = Resource.extend().attr('id');
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
    var Model = Resource.extend().attr('id');

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
      Model = Resource.extend().attr('id', { primary: true });
      var model = new Model();
      model.primary = 3;
      expect(model.primary).to.equal(3);
    });
  });

  describe('.extend()', function () {
    it('extends model with static props', function() {
      var Base = Resource.extend({
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
      expect(extended).to.be.instanceOf(Resource);
      expect(extended).to.be.instanceOf(Base);
      expect(extended.attributes).to.have.property('id');
    });

    it('extends model prototype', function() {
      var Base = Resource.extend({
        attributes: {
          id: { primary: true }
        },
        test: function() {
          return "test";
        }
      });
      var Extended = Base.extend();
      var extended = new Extended();
      expect(extended).to.be.instanceOf(Resource);
      expect(extended).to.be.instanceOf(Base);
      expect(extended).to.have.property('test');
      expect(extended.test).to.be.a('function');
      expect(extended.test()).to.equal('test');
    });
  });

  describe('.once()', function() {
    it('calls handler only once', function() {
      called = 0;

      var Model = Resource.extend().once('foo', function() {
        called++;
      });

      Model.emit('foo');
      Model.emit('foo');

      expect(called).to.equal(1);
    });
  });

  describe('.attr()', function() {
    it('throws error if defining two primary keys', function() {
      var Model = Resource.extend();
      Model.attr('id', { primary: true });
      expect(function() {
        Model.attr('_id', { primary: true });
      }).to.throw('Primary attribute already exists: id');
    });

    it('throws error if defining existing key', function() {
      var Model = Resource.extend();
      Model.attr('id', { primary: true });
      expect(function() {
        Model.attr('id');
      }).to.throw('id attribute already exists');
    });

    it('emits "attribute" event', function(done) {
      var Model = Resource.extend()
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
      var Model = Resource.extend();
      Model.use(function() {
        this.test = 1;
      });
      expect(Model).to.have.property('test', 1);
    });

    it('throws error if plugin is not a function', function() {
      expect(function() {
        Resource.extend().use(1);
      }).to.throw(/must be a function/);
    });

    it('does not pollute other models', function(done) {
      var User = Resource.extend();
      var Post = Resource.extend();

      User.before('findOne', function(query, callback) {
        callback(null, {foo: 'bar'});
      });

      Post.findOne({}, function(err, model) {
        expect(model).to.equal(undefined);

        User.findOne({}, function (err, model) {
          expect(model).to.have.property('foo', 'bar');
          done();
        });
      });
    });
  });

  describe('.browser()', function() {
    it('only runs methods in browser', function() {
      var Model = Resource.extend();
      global.window = {};
      Model.browser(function() {
        this.test = 1;
      });
    });
  });

  describe('.server()', function() {
    it('only runs methods in node', function() {
      var Model = Resource.extend();
      Model.server(function() {
        this.test = 1;
      });
    });
  });

  describe('.create()', function() {
    it('creates new models', function() {
      var Model = Resource.extend();
      var model = Model.create();
      expect(model).to.be.an.instanceOf(Model);
    });

    it('hydrates model from existing object', function() {
      var Model = Resource.extend().attr('id', { primary: true });
      var model = Model.create({ id: 1 });
      expect(model).to.have.property('id', 1);
    });
  });

  describe('.hasOne()', function () {
    it('should define attribute for relation', function () {
      var Patient = Resource.extend().hasOne('record', {
        target: Resource.extend(),
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
      var Patient = Resource.extend().hasOne('record', {
        target: Resource.extend(),
        foreignKey: 'patient_id',
        serializable: false
      });

      expect(Patient.attributes).to.have.property('record');
      expect(Patient.attributes.record).to.have.property('serializable', false);
    });
  });

  describe('.hasMany()', function () {
    it('should define attribute for relation', function () {
      var Author = Resource.extend().hasMany('books', {
        target: Resource.extend(),
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
      var Book = Resource.extend().belongsTo('author', {
        target: Resource.extend(),
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
      var Post = Resource.extend().belongsToMany('tags', {
        target: Resource.extend(),
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

  describe('.findOne()', function() {
    it('finds models by id', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.findOne(1, function(err, model) {
        if (err) return done(err);
        done();
      });
    });

    it("calls each store's findOne method", function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model
        .before('findOne', function(query, cb) {
          cb();
        })
        .before('findOne', function(query, cb) {
          cb(null, new Model({ id: 1 }));
        });

      Model.findOne(1, function(err, model) {
        if (err) return done(err);
        expect(model).to.have.property('id', 1);
        done();
      });
    });

    it('emits "before:findOne" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.before('findOne', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Model.findOne(1, function(err, model) {
        if (err) return done(err);
      });
    });

    it('emits "findOne" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model.on('findOne', function(model) {
        expect(model).to.be.an.instanceOf(Model);
        done();
      });

      Model.before('findOne', function(query, cb) {
        cb(null, new Model({ id: 1 }));
      });

      Model.findOne(1, function(err, model) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model.before('findOne', function(query, cb) {
        cb(new Error('test'));
      });

      Model.findOne(1, function(err, model) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.find()', function() {
    it('finds collection of models using query', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.find(function(err, collection) {
        if (err) return done(err);
        expect(collection).to.be.an.instanceOf(Array);
        Model.find({ id: 1 }, function(err, collection) {
          done();
        });
      });
    });

    it("calls each store's find method", function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model
        .before('find', function(query, cb) {
          cb();
        })
        .before('find', function(query, cb) {
          cb(null, [new Model({ id: 1 })]);
        });

      Model.find(function(err, collection) {
        if (err) return done(err);
        expect(collection).to.have.property('length', 1);
        expect(collection[0]).to.have.property('constructor', Model);
        done();
      });
    });

    it('emits "before:find" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.before('find', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Model.find({ id: 1 }, function(err, collection) {
        if (err) return done(err);
      });
    });

    it('emits "find" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('find', function(collection) {
        expect(collection).to.be.an.instanceOf(Array);
        done();
      });
      Model.find({ id: 1 }, function(err, collection) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model.before('find', function(query, cb) {
        cb(new Error('test'));
      });

      Model.find(function(err, collection) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.count()', function() {
    it('counts models using query', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.count(function(err, count) {
        if (err) return done(err);
        expect(count).to.be.a('number');
        Model.count({ id: 1 }, function(err, count) {
          done();
        });
      });
    });

    it("calls each store's count method", function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model
        .before('count', function(query, cb) {
          cb();
        })
        .before('count', function(query, cb) {
          cb(null, 3);
        });

      Model.count(function(err, count) {
        if (err) return done(err);
        expect(count).to.equal(3);
        done();
      });
    });

    it('emits "before:count" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.before('count', function(query) {
        expect(query).to.be.a('object');
        done();
      });
      Model.count({ id: 1 }, function(err, count) {
        if (err) return done(err);
      });
    });

    it('emits "count" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('count', function(count) {
        expect(count).to.be.a('number');
        done();
      });
      Model.count({ id: 1 }, function(err, count) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model
        .before('count', function(query, cb) {
          cb();
        })
        .before('count', function(query, cb) {
          cb(new Error('test'));
        });

      Model.count(function(err, collection) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.update()', function() {
    it('updates models using query', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.update({ id: 1 }, { id: 2 }, function(err) {
        done();
      });
    });

    it("calls each store's updateAll method", function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model
        .before('updateMany', function(query, changes, cb) {
          cb();
        })
        .before('updateMany', function(query, changes, cb) {
          cb();
        });

      Model.update({}, {}, function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('emits "before:updateMany" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.before('updateMany', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Model.update({ id: 1 }, { id: 2 }, function(err) {
        if (err) return done(err);
      });
    });

    it('emits "update many" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('updateMany', function() {
        done();
      });
      Model.update({ id: 1 }, { id: 2 }, function(err) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model
        .before('updateMany', function(query, changes, cb) {
          cb();
        })
        .before('updateMany', function(query, changes, cb) {
          cb(new Error('test'));
        });

      Model.update({}, {}, function(err) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });


  describe('.remove()', function() {
    it('removes models using query', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.remove(function(err) {
        if (err) return done(err);
        Model.remove({ id: 1 }, function(err) {
          done();
        });
      });
    });

    it("calls each store's removeAll method", function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model
        .before('removeMany', function(query, cb) {
          cb();
        })
        .before('removeMany', function(query, cb) {
          cb();
        });

      Model.remove(function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('emits "before:removeMany" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.before('removeMany', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Model.remove({ id: 1 }, function(err) {
        if (err) return done(err);
      });
    });

    it('emits "remove many" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('removeMany', function() {
        done();
      });
      Model.remove({ id: 1 }, function(err) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model
        .before('removeMany', function(query, cb) {
          cb();
        })
        .before('removeMany', function(query, cb) {
          cb(new Error('test'));
        });

      Model.remove(function(err) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.query()', function() {
    it('returns query object', function() {
      var Model = Resource.extend().attr('id', { primary: true });
      var query = Model.find();
      expect(query).to.be.an('object');
      expect(query).to.have.property('where');
      expect(query).to.have.property('sort');
      expect(query).to.have.property('paginate');
      expect(query).to.have.property('from');
      expect(query).to.have.property('size');
      expect(query).to.have.property('with');
      expect(query).to.have.property('exec');
    });

    it('is chainable', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.findOne()
      .where({ name: 'alex' })
      .sort('asc')
      .size(10)
      .with('related')
      .exec(function(err) {
        if (err) return done(err);

        Model.find()
        .where({ name: 'alex' })
        .sort('asc')
        .size(10)
        .with(['related'])
        .exec(function(err) {
          if (err) return done(err);

          Model.count()
          .where({ name: 'alex' })
          .sort({
            name: 'asc'
          })
          .size(10)
          .exec(function(err) {
            if (err) return done(err);

            Model.remove()
            .where({ name: 'alex' })
            .sort('asc')
            .size(10)
            .exec(done);
          });
        });
      });
    });

    it('modifies query', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.before('find', function(query, next) {
        expect(query).to.have.keys([
          'from',
          'page',
          'size',
          'sort',
          'where'
        ]);
        done();
      });
      Model.find()
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
      var Model = Resource.extend().attr('id', { primary: true });
      var m1 = Model.create();
      expect(m1.isNew()).to.equal(true);
      var m2 = Model.create({ id: 1 });
      expect(m2.isNew()).to.equal(false);
    });

    it('throws error if primary key has not been defined', function() {
      var Model = Resource.extend().attr('id');
      var model = Model.create();
      expect(function() {
        model.isNew();
      }).to.throw("Primary key has not been defined.");
    });
  });

  describe('#has()', function() {
    it('checks for attribute definition', function() {
      var Model = Resource.extend().attr('id', { primary: true });
      var model = Model.create({ id: 1 });
      expect(model.has('name')).to.equal(false);
      expect(model.has('id')).to.equal(true);
    });
  });

  describe('#set()', function() {
    it('sets values for defined attributes', function() {
      var Model = Resource.extend()
        .attr('id', { primary: true })
        .attr('name');
      var model = Model.create().set({ id: 1, name: 'alex', age: 26 });
      expect(model.id).to.equal(1);
      expect(model.name).to.equal('alex');
      expect(model).to.not.have.property('age');
    });

    it('emits "setting" event', function(done) {
      var Model = Resource.extend()
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
      var Model = Resource.extend()
        .attr('id', { primary: true })
        .attr('name');
      var model = Model.create().reset({ id: 1, name: 'alex', age: 26 });
      expect(model.id).to.equal(1);
      expect(model.name).to.equal('alex');
      expect(model).to.not.have.property('age');
    });

    it('emits "setting" event', function(done) {
      var Model = Resource.extend()
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
      var Model = Resource.extend().attr('id', { primary: true });
      var model = Model.create();
      expect(model.isDirty()).to.equal(false);
      model.id = 1;
      expect(model.isDirty()).to.equal(true);
    });

    it('returns whether attribute is changed/dirty', function() {
      var Model = Resource.extend()
        .attr('id', { primary: true })
        .attr('name', { required: true });

      var model = new Model();
      model.name = 'alex';
      expect(model.isDirty('name')).to.equal(true);
    });
  });

  describe('#changed()', function() {
    it('returns attributes changed since last save', function() {
      var Model = Resource.extend()
        .attr('id', { primary: true })
        .attr('name');
      var model = Model.create({ id: 1 });
      model.name = 'alex';
      expect(model.changed()).to.have.property('name', 'alex');
    });
  });

  describe('#save()', function() {
    it("calls each store's create method", function(done) {
      var Model = Resource.extend()
        .attr('id', { primary: true, required: true })
        .before('save:new', function(model, changed, cb) {
          expect(changed).to.have.property('id', 1);
          cb();
        })
        .before('save:new', function(model, changed, cb) {
          expect(changed).to.have.property('id', 1);
          cb();
        });

      var model = Model.create({ id: 1 });

      model.save(function(err) {
        expect(err).to.be.empty();
        expect(model.id).to.equal(1);
        done();
      });
    });

    it("passes error from adapter to callback", function(done) {
      var Model = Resource.extend()
        .attr('id', { primary: true })
        .before('save:new', function(model, changed, cb) {
          cb(new Error("test"));
        });

      var model = Model.create();

      model.save(function(err) {
        expect(err.message).to.equal('test');
        done();
      });
    });

    it('emits "before:save" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      var called = false;
      Model.before('save', function(model, changed, next) {
        called = true;
        expect(model).to.have.property('constructor', Model);
        expect(changed).to.be.an('object');
        next();
      });
      Model.create().set('id', 1).save(function(err) {
        expect(called).to.equal(true);
        done(err);
      });
    });

    it('emits "save" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      var model = Model.create().set('id', 1);
      model.on('save', function() {
        done();
      }).save(function(err) { });
    });

    it('emits "before:save:new" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.before('save:new', function(model, changed, next) {
        expect(model).to.have.property('constructor', Model);
        expect(changed).to.be.an('object');
        next();
      });
      var model = Model.create().set('id', 1);
      model.on('save:new', function(changed) {
        expect(changed).to.be.an('object');
        done();
      }).save(function(err) { });
    });

    it('emits "save:new" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      var model = Model.create().set('id', 1);
      model.on('save:new', function() {
        done();
      }).save(function(err) { });
    });

    it('emits "before:save:update" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.before('save:update', function(model, changed, next) {
        expect(model).to.have.property('constructor', Model);
        expect(changed).to.be.an('object');
        next();
      });
      var model = Model.create({ id: 1 }).set('name', 'alex');
      model.on('save:update', function(changed) {
        expect(changed).to.be.an('object');
        done();
      }).save(function(err) { });
    });

    it('emits "save:update" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      var model = Model.create({ id: 1 }).set('name', 'alex');
      model.on('save:update', function() {
        done();
      }).save(function(err) { });
    });
  });

  describe('#remove()', function() {
    it("calls each store's remove method", function(done) {
      var Model = Resource.extend()
        .attr('id', { primary: true, required: true })
        .before('remove', function(model, cb) {
          cb();
        })
        .before('remove', function(model, cb) {
          cb();
        });
      var model = Model.create({ id: 1 });
      model.remove(function(err) {
        expect(err).to.eql(undefined);
        expect(model).to.have.property('id', null);
        done();
      });
    });

    it("passes error from adapter to callback", function(done) {
      var Model = Resource.extend()
        .attr('id', { primary: true, required: true })
        .before('remove', function(model, cb) {
          cb(new Error('test'));
        });
      var model = Model.create({ id: 1 });
      model.remove(function(err) {
        expect(err).to.have.property('message', 'test');
        done();
      });
    });

    it('emits "before:remove" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.before('remove', function(model, next) {
        expect(model).to.have.property('constructor', Model);
        next();
      });
      var model = Model.create({ id: 1 });
      model.before('remove', function() {
        done();
      }).remove(function(err) { });
    });

    it('emits "remove" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('remove', function(model) {
        expect(model).to.be.an.instanceOf(Model);
      });
      var model = Model.create({ id: 1 });
      model.on('remove', function() {
        done();
      }).remove(function(err) { });
    });
  });

  describe('#toJSON()', function () {
    it('only includes serializable attributes', function () {
      var resource = Resource.extend({
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
