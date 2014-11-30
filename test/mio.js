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
      .on('initializing', function(model, attrs) {
        expect(model).to.have.property('constructor', Model);
        expect(attrs).to.be.an('object');
        done();
      });
    new Model();
  });

  it('emits "initialized" event', function(done) {
    var Model = Resource.extend()
      .on('initialized', function(model) {
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
      id: { primary: true }
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
      expect(model.id).to.equal(3);
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

    it('does not pollute other models', function(done) {
      var User = Resource.extend();
      var Post = Resource.extend();

      User.before('findOne', function(query, callback) {
        callback(null, {foo: 'bar'});
      });

      Post.find({}, function(err, model) {
        expect(model).to.equal(undefined);

        User.find({}, function (err, model) {
          expect(model).to.have.property('foo', 'bar');
          done();
        });
      });
    });
  });

  describe('.browser()', function() {
    it('only runs methods in browser', function() {
      var Model = Resource.extend();
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

    it('emits "before findOne" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('before findOne', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Model.findOne(1, function(err, model) {
        if (err) return done(err);
      });
    });

    it('emits "after findOne" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model.on('after findOne', function(model) {
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

  describe('.findAll()', function() {
    it('finds collection of models using query', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.findAll(function(err, collection) {
        if (err) return done(err);
        expect(collection).to.be.an.instanceOf(Array);
        Model.findAll({ id: 1 }, function(err, collection) {
          done();
        });
      });
    });

    it("calls each store's findAll method", function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model
        .before('findAll', function(query, cb) {
          cb();
        })
        .before('findAll', function(query, cb) {
          cb(null, [new Model({ id: 1 })]);
        });

      Model.findAll(function(err, collection) {
        if (err) return done(err);
        expect(collection).to.have.property('length', 1);
        expect(collection[0]).to.have.property('constructor', Model);
        done();
      });
    });

    it('emits "before findAll" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('before findAll', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Model.findAll({ id: 1 }, function(err, collection) {
        if (err) return done(err);
      });
    });

    it('emits "after findAll" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('after findAll', function(collection) {
        expect(collection).to.be.an.instanceOf(Array);
        done();
      });
      Model.findAll({ id: 1 }, function(err, collection) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model.before('findAll', function(query, cb) {
        cb(new Error('test'));
      });

      Model.findAll(function(err, collection) {
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

    it('emits "before count" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('before count', function(query) {
        expect(query).to.be.a('object');
        done();
      });
      Model.count({ id: 1 }, function(err, count) {
        if (err) return done(err);
      });
    });

    it('emits "after count" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('after count', function(count) {
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

  describe('.destroyAll()', function() {
    it('destroys models using query', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.destroyAll(function(err) {
        if (err) return done(err);
        Model.destroyAll({ id: 1 }, function(err) {
          done();
        });
      });
    });

    it("calls each store's destroyAll method", function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model
        .before('destroyAll', function(query, cb) {
          cb();
        })
        .before('destroyAll', function(query, cb) {
          cb();
        });

      Model.destroyAll(function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('emits "before destroyAll" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('before destroyAll', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Model.destroyAll({ id: 1 }, function(err) {
        if (err) return done(err);
      });
    });

    it('emits "after destroyAll" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('after destroyAll', function() {
        done();
      });
      Model.destroyAll({ id: 1 }, function(err) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });

      Model
        .before('destroyAll', function(query, cb) {
          cb();
        })
        .before('destroyAll', function(query, cb) {
          cb(new Error('test'));
        });

      Model.destroyAll(function(err) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.query()', function() {
    it('returns query object', function() {
      var Model = Resource.extend().attr('id', { primary: true });
      var query = Model.findAll();
      expect(query).to.be.an('object');
      expect(query).to.have.keys([
        'where',
        'paginate',
        'skip',
        'exec',
        'sort',
        'include',
        'offset',
        'limit',
        'page'
      ]);
    });

    it('is chainable', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.findAll()
        .where({ name: 'alex' })
        .sort('asc')
        .limit(10)
        .exec(done);
    });

    it('modifies query', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.before('findAll', function(query, next) {
        expect(query).to.have.keys([
          'where',
          'sort',
          'page',
          'offset',
          'limit'
        ]);
        done();
      });
      Model.findAll()
        .where({ name: 'alex' })
        .sort('asc')
        .paginate({ page: 1 })
        .skip(10)
        .limit(10)
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
      var model = Model.create({ id: 1, name: 'alex', age: 26 });
      expect(model.id).to.equal(1);
      expect(model.name).to.equal('alex');
      expect(model).to.not.have.property('age');
    });

    it('emits "setting" event', function(done) {
      var Model = Resource.extend()
        .attr('id', { primary: true })
        .attr('name')
        .on('setting', function(model, attrs) {
          expect(model).to.have.property('constructor', Model);
          expect(attrs).to.have.property('name', 'alex');
          done();
        });
      var model = new Model();
      model.set({ name: 'alex' });
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

      expect(Model.create({ name: 'alex' }).isDirty('name')).to.equal(true);
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
    it("calls each store's save method", function(done) {
      var Model = Resource.extend()
        .attr('id', { primary: true, required: true })
        .before('save', function(model, changed, cb) {
          expect(changed).to.have.property('id', 1);
          cb();
        })
        .before('save', function(model, changed, cb) {
          expect(changed).to.have.property('id', 1);
          cb();
        });

      var model = Model.create({ id: 1 });

      model.save(function(err) {
        expect(err).to.equal(null);
        expect(model.id).to.equal(1);
        done();
      });
    });

    it("passes error from adapter to callback", function(done) {
      var Model = Resource.extend()
        .attr('id', { primary: true })
        .before('save', function(model, changed, cb) {
          cb(new Error("test"));
        });

      var model = Model.create();

      model.save(function(err) {
        expect(err.message).to.equal('test');
        done();
      });
    });

    it('emits "before save" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('before save', function(model, changed, next) {
        expect(model).to.have.property('constructor', Model);
        expect(changed).to.be.an('object');
        next();
      });
      var model = Model.create({ id: 1 });
      model.on('before save', function(changed) {
        expect(changed).to.be.an('object');
        done();
      }).save(function(err) { });
    });

    it('emits "after save" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('after save', function(model, changed) {
        expect(model).to.be.an.instanceOf(Model);
      });
      var model = Model.create({ id: 1 });
      model.on('after save', function() {
        done();
      }).save(function(err) { });
    });
  });

  describe('#destroy()', function() {
    it("calls each store's destroy method", function(done) {
      var Model = Resource.extend()
        .attr('id', { primary: true, required: true })
        .before('destroy', function(model, cb) {
          cb();
        })
        .before('destroy', function(model, cb) {
          cb();
        });
      var model = Model.create({ id: 1 });
      model.destroy(function(err) {
        expect(err).to.eql(undefined);
        expect(model).to.have.property('id', null);
        done();
      });
    });

    it("passes error from adapter to callback", function(done) {
      var Model = Resource.extend()
        .attr('id', { primary: true, required: true })
        .before('destroy', function(model, cb) {
          cb(new Error('test'));
        });
      var model = Model.create({ id: 1 });
      model.destroy(function(err) {
        expect(err).to.have.property('message', 'test');
        done();
      });
    });

    it('emits "before destroy" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('before destroy', function(model, next) {
        expect(model).to.have.property('constructor', Model);
        next();
      });
      var model = Model.create({ id: 1 });
      model.on('before destroy', function() {
        done();
      }).destroy(function(err) { });
    });

    it('emits "after destroy" event', function(done) {
      var Model = Resource.extend().attr('id', { primary: true });
      Model.on('after destroy', function(model) {
        expect(model).to.be.an.instanceOf(Model);
      });
      var model = Model.create({ id: 1 });
      model.on('after destroy', function() {
        done();
      }).destroy(function(err) { });
    });
  });
});
