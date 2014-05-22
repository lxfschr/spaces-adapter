Playground JS API
=================

Development Setup
-----------------

1. Install [Node](http://nodejs.org/)
2. Install [Bower](http://bower.io/)
3. If you're inside a corporate firewall that disallows `git://` URLs, see the note below and act accordingly
4. Clone this repo
5. In the root directory of this repo, run `bower install`
6. Optional: If you want to run tests and jshint from the command line:
   a. Install grunt-cli with `npm install -g grunt-cli`
   b. Run `npm install` from the root of this repo

Directories
-----------

Put middleware code in `src/`.

Put examples of how to use the middleware in `examples/`

Put unit test specs in `test/spec/` and then add them to `test/testrunner.js`

Running Tests
-------------

Open `test/index.html` in a web browser. Or, install grunt (see optional development setup steps above) and run `grunt test`.

Coding Conventions
------------------

All code must follow our [coding conventions](https://github.com/adobe-photoshop/playground-api/wiki/Coding-Conventions) and pass [JSHint](http://www.jshint.com/).

JSHint can be run on all files in the project by running `grunt jshint` (which is a subtask of `grunt test`). See the optional development setup steps for information on how to install grunt.

Notes
-----

### git/bower behind firewalls

To make bower work in places where `git://` URLs don't work (e.g. inside a corporate firewall), run this git command:

```bash
git config --global url."https://".insteadOf git://
```

To undo that after you've quit your job at a large corporate institution, run:

```bash
git config --global --unset url."https://".insteadOf
```
