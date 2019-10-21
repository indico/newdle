## WARNING: newdle is not yet production ready and still under heavy development
### Currently missing
 * E-mail sending
 * Integration with calendaring systems
 * Integration with Indico

If you would like to help with any of that, please contact us through the relevant GitHub issue.

# Newdle [![Travis Build Status](https://travis-ci.com/indico/newdle.svg?branch=master)](https://travis-ci.org/indico/newdle) [![License](https://img.shields.io/github/license/indico/newdle.svg)](https://github.com/indico/newdle/blob/master/LICENSE) [![Made at CERN!](https://img.shields.io/badge/CERN-Open%20Source-%232980b9.svg)](https://home.cern)

<p align="center">
  <img src="/newdle/client/src/images/logo_color.svg" width="300"><br>
</p>
<br>

**Newdle** is the new, shiny tool brought to you by the [Indico Team](https://getindico.io/about) @ [CERN](https://home.cern) 🎉
Here at CERN we **hold a lot of meetings**. While [Indico](https://getindico.io) makes it super easy to manage those meetings, we still **lose a lot of time** 📈 trying to schedule them, which usually involves numerous emails and private messages. That is what newdle has been created for: to streamline the process of choosing **the perfect date and time** 🗓 for your next meeting/event.

Newdle is part of the [MALT project](https://malt.web.cern.ch).

## Why another tool?

It is true that there are already several commercial and Open Source solutions available that facilitate creating "polls". One of them is [Doodle](https://doodle.com) which was one of our main inspirations when starting the development process. The biggest advantage of newdle over it is the fact that newdle is free of charge and Open Source - you just have to set it up on your server and you can start newdling! Apart from the commercial products on the market, there is a handful of Open Source projects e.g. [Nuages](https://nuages.domainepublic.net) or [croodle](https://github.com/jelhan/croodle) which differ a lot in the features they offer. We have noticed that the majority of those tools don't provide users with proper User Experience which makes using them harder than it should be. This is one of the major advantages of newdle. We made sure that our tool is easy to use and intuitive with really good-looking design.

**Integration**

Since we are also the developers behind [Indico](https://getindico.io) we thought of integrating newdle with it. So, for example after a poll/newdle has finished it will be possible to create an event in [Indico](https://getindico.io). Also newdle will make it a lot easier to choose possible slots for your meeting since we will integrate it with enterprise calendars to fetch participant availability. While making sure we still protect your data.


## Development

We chose Python 3.7 as the backend language, so make sure you have it installed. To prepare the development environment it is enough to run `make` which takes care of installing all required dependencies inside a new virtualenv. Typically that will be the `.venv` directory unless you override the environment variable `VENV` *e.g.* `VENV=.virtualenv make`.

Make sure you have the `python3.7` binary in your PATH. You can also use the `PYTHON` environment variable to override the location of the
`python` binary. *e.g.:*
```bash
$ PYTHON=/usr/bin/python3.7 make
```

## Database schema

Before running the alembic migrations make sure you  have created a database called `newdle` (or adjust the config file). Having done that, run `flask db upgrade` to upgrade the schema.

**:warning: Schema changes :warning:**

At the initial stages of the development it might be pretty common to change the DB schema which also incurs modifications to the SQLAlchemy models. To facilitate the process of keeping actual schema and models in sync we provide `make newdb` command. The purpose of it is to update the initial alembic revision (according to the models declared) and recreate your local database. This is a destructive operation! This command will be removed as soon as there are more alembic revisions.


## Running the development server

To run the dev servers, use `make flask-server` and `make react-server` (in separate terminals). You can use the `FLASK_HOST`, `FLASK_PORT` and `REACT_PORT` environment variables to override where the dev servers will listen (make sure to set it for both dev servers, since the React server needs to know where the Flask app is running).

Once everything is running, you can access the webapp on `http://127.0.0.1:3000` if you did not change any of the ports.

Use the `BROWSER` environment variable if you want to prevent new browser windows being opened every time you run `make react-server`.

```bash
BROWSER=none make react-server
```

## Other available `make` targets

We provide a couple of additional `make` targets that should streamline the development process:

 - `make clean` - removes all generated files
 - `make distclean` - runs `clean` target first and removes config files afterwards
 - `make lint` - runs `pycodestyle` and `flake8`, which report possible code style issues
 - `make newdb` - recreates the DB tables according to the SQLAlchemy models (run it every time you update the models)
 - `make format` - runs code formatters over the entire codebase (black, isort, prettier)
 - `make test` - runs Python and React tests
 - `make build` - builds a Python wheel which then could be used to install `newdle` in production

|||
|-|-|
|<a href="https://home.cern"><img src="https://raw.githubusercontent.com/indico/assets/master/cern_badge.png" width="64"></a>|Made at [CERN](https://home.cern)<br>[Take part!](https://careers.cern/)|
|||

## Note

> In applying the MIT license, CERN does not waive the privileges and immunities
> granted to it by virtue of its status as an Intergovernmental Organization
> or submit itself to any jurisdiction.
