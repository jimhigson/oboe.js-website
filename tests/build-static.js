var chai = require('chai');
var expect = chai.expect;

var build = require('../build-static');

describe('sass', function() {

  describe('fileIsNotScss', function () {

    it('returns false if file is scss', function() {
      expect(build.fileIsNotScss({}, 'src/test.scss')).to.eql(false);
    });

    it('returns true if file is not scss', function() {
      expect(build.fileIsNotScss({}, 'src/test.md')).to.eql(true);
    });

    it('returns true if file is all.scss', function() {
      expect(build.fileIsNotScss({}, 'src/all.scss')).to.eql(true);
    });

  });

  describe('excludeScss', function() {

    it('excludes files that are scss', function() {

      const files = {
        'src/test.md': {},
        'src/test.scss': {},
        'src/test.js': {}
      };

      expect(build.excludeScss(files)).to.deep.eql({
        'src/test.md': {},
        'src/test.js': {}
      });

    });

  });

});

describe('addProperty', function() {

  it('adds root variable to all files', function() {
    const root = 'test';
    const files = {
      first: {}
    };

    // Mutates files
    build.addProperty('root', root, files);

    expect(files.first).to.have.property('root', 'test');
  });

});

describe('addHeading', function(){

  it('adds heading property to all files', function(){
    const files = {
      'first.html': {
        contents: '<h1 id="test-id">Test</h1>'
      }
    };

    // Mutates files
    build.addHeading(files);

    expect(files['first.html']).to.have.property('heading')
      .and.to.deep.eql({
        text: 'Test',
        id: 'test-id'
      });
  });

});

describe('addSections', function(){

  it('adds sections property to all files', function(){
    const files = {
      'first.html': {
        contents: '<h2 id="test-id1">Test1</h2>\n<h2 id="test-id2">Test2</h2>'
      }
    };

    // Mutates files
    build.addSections(files);

    expect(files['first.html']).to.have.property('sections')
      .and.to.deep.eql([{
        text: 'Test1',
        id: 'test-id1'
      }, {
        text: 'Test2',
        id: 'test-id2'
      }]);

  });

  it('adds multipleSections property to all files', function(){
    const files = {
      'first.html': {
        contents: '<h2 id="test-id1">Test1</h2>\n<h2 id="test-id2">Test2</h2>'
      }
    };

    // Mutates files
    build.addSections(files);

    expect(files['first.html']).to.have.property('multipleSections', true);
  });

});
