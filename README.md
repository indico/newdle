## WARNING: newdle is not yet production ready
### Currently missing
 * [ ] E-mail sending;
 * [ ] Integration with calendaring systems;
 * [ ] Integration with Indico;

If you would like to help with any of that, please contact us through the relevant GitHub issue.

# Newdle [![Travis Build Status](https://travis-ci.com/indico/newdle.svg?branch=master)](https://travis-ci.org/indico/newdle) [![License](https://img.shields.io/github/license/indico/newdle.svg)](https://github.com/indico/newdle/blob/master/LICENSE) [![Made at CERN!](https://img.shields.io/badge/CERN-Open%20Source-%232980b9.svg)](https://home.cern)

<img src="./newdle/client/src/images/logo.svg" width="300"><br>


**Newdle** is the new, shiny tool brought to you by the [Indico Team](https://getindico.io/about) @ [CERN](https://home.cern) 🎉
Here at CERN we **hold a lot of meetings**. While [Indico](https://getindico.io) makes it super easy to manage those meetings, we still **lose a lot of time** 📈 trying to schedule them, which usually involves numerous emails and private messages. That is what newdle has been created for: to streamline the process of choosing **the perfect date and time** 🗓 for your next meeting/event.

Newdle is part of the [MALT project](https://malt.web.cern.ch).

## Why another tool?


It is true that there is an abundance of similar tools like e.g. [Nuages](https://nuages.domainepublic.net) or [croodle](https://github.com/jelhan/croodle) which are just two of many others available out there. Despite that, we still believe that newdle will provide users with more features and will offer much better user experience. We are putting huge efforts in order to be sure that newdle will meet the following requirements:

- clean and user-friendly UI;
- integration with [Indico](https://getindico.io);
- integration with enterprise calendars;
- data privacy.

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
 - `make lint` - runs `pycodestyle` which reports possible code style issues
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
