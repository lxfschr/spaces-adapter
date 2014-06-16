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
7. Install and run the [generator-domains](https://github.com/iwehrman/generator-domains) Generator plug-in.

Directories
-----------

Put middleware code in `lib/`.

Put examples of how to use the middleware in `examples/`

Put unit test specs in `test/unit/spec/` and then add them to `test/unit/testrunner.js`.

Put integration test specs in `test/integration/spec/` and then add them to `test/integration/testrunner.js`.

Running Tests
-------------

1. To run the unit tests, open `test/index.html?section=unit` in a web browser. Or, install grunt (see optional development setup steps above) and run `grunt test`.
2. To run the integration tests, open `test/index.html?section=all` inside Playground.

Trying out the `playground-example` example
-------------------------------------------

1. Set up Playground, and then run Playground
2. Open the development console
3. Redirect Playground to the root of this repo (with something like `window.location.href = "file:///Users/jbrandt/development/playground-api/index.html"`).

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
