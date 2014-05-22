Playground JS API
=================

Development Setup
-----------------

1. Install [Node](http://nodejs.org/)
2. Install [Bower](http://bower.io/)
3. If you're inside a corporate firewall that disallows `git://` URLs, see the note below and act accordingly
4. Clone this repo
5. In the root directory of this repo, run `bower install`

Directories
-----------

Put code in `src/`.

Put unit test specs in `test/spec/` and then add them to `test/testrunner.js`

Running Tests
-------------

Open `test/index.html` in a web browser. 

Notes
-----

To make bower work in places where `git://` URLs don't work (e.g. inside a corporate firewall), run this git command:

```bash
git config --global url."https://".insteadOf git://
```

To undo that, run:

```bash
git config --global --unset url."https://".insteadOf
```