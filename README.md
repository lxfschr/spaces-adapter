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

Put middleware code in `src/`.

Put examples of how to use the middleware in `examples/`

Put unit test specs in `test/unit/spec/` and then add them to `test/unit/testrunner.js`.

Put integration test specs in `test/integration/spec/` and then add them to `test/integration/testrunner.js`.

Running Tests
-------------

1. To run the unit tests, open `test/unit/index.html` in a web browser. Or, install grunt (see optional development setup steps above) and run `grunt test`.
2. To run the integration tests, open `test/integration/index.html` in a web browser.

Trying out the `playground-example` example
-------------------------------------------

1. Set up Playground
2. Tell Playground where to find the `playground-example` directory with `defaults write com.adobe.photoshop Playground.Root <<path to playground-example>>`
3. Flush your defaults cache with ```killall -u `whoami` cfprefsd```
4. Start Playground

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
