var initCtx;

helios(function (ctx) {
  initCtx = ctx;
});

describe('onload', function () {
  it('should emit the first request', function () {
    should.exist(initCtx);
    initCtx.should.have.property('canonicalUrl', '/');
    initCtx.should.have.property('url', '/');
  });

  it('should allow for reset of state', function () {
    helios.should.have.property('_events');
    helios.init();
    helios.should.not.have.property('_events');
  });
});

describe('operation', function () {
  beforeEach(function () {
    helios.start();
  });

  afterEach(function () {
    helios.stop();
    helios.init();
  });

  it('should allow for a redirect', function (done) {
    helios(function (ctx) {
      ctx.should.have.property('url', '/test-redirect');
      done();
    });

    helios('/test-redirect');
  });

  it('should allow for a replace', function (done) {
    helios(function (ctx) {
      ctx.should.have.property('url', '/test-replace');
      done();
    });

    helios.replace('/test-replace');
  });
});

after(function () {
  helios.start();
  helios('/');
});
