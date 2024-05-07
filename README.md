# Newdle ![CI Status](https://github.com/indico/newdle/workflows/CI/badge.svg) [![License](https://img.shields.io/github/license/indico/newdle.svg)](https://github.com/indico/newdle/blob/master/LICENSE) [![Made at CERN!](https://img.shields.io/badge/CERN-Open%20Source-%232980b9.svg)](https://home.cern)

<p align="center">
  <img src="/newdle/client/src/images/logo_color.svg" width="300"><br>
</p>
<br>

**Newdle** is the new, shiny tool brought to you by the [Indico Team](https://getindico.io/about) @ [CERN](https://home.cern) 🎉
Here at CERN we **hold a lot of meetings**. While [Indico](https://getindico.io) makes it super easy to manage those meetings, we still **lose a lot of time** 📈 trying to schedule them, which usually involves numerous emails and private messages. That is what newdle has been created for: to streamline the process of choosing **the perfect date and time** 🗓 for your next meeting/event.

Newdle is part of the [MALT project](https://malt.web.cern.ch).

![A sneak peek of Newdle](./sneakpeek.gif)

## Why another tool?

It's true that there are already several commercial and Open Source solutions available that provide ad-hoc "polls".
However, we have noticed that none of those tools seem to offer, at the same time, a user-friendly and modern interface
and the additional freedom and flexibility that come with being part of an Open Source ecosystem. Additionally, none of
them seem to seamlessly integrate with other enterprise systems.

**Integration**

newdle can currently fetch free-busy information from **Exchange servers**. This information can be used while deciding
on candidate slots ("when is everyone free?") as well as when answering to a "poll" ("when am I free?"). We are
currently working on integrating with other providers.

newdle is also developed by the same people who are behind [Indico](https://getindico.io), and that's not by pure
chance. newdle naturally complements Indico, as it targets what comes immediately before the actual creation of a
meeting. This is why we would like to have the possibility to **create meetings on Indico** once a final date is
decided (still work in progress!).


## Development

We chose Python 3.12 as the backend language, so make sure you have it installed (3.9-3.11 should work as well). To prepare the development environment it is enough to run `make` which takes care of installing all required dependencies inside a new virtualenv. Typically that will be the `.venv` directory unless you override the environment variable `VENV` *e.g.* `VENV=.virtualenv make`. Activate your virtualenv using ``source .venv/bin/activate`` since this is required to run the various `flask` comments that come later.

Make sure you have the `python` binary in your PATH. You can also use the `PYTHON` environment variable to override the location of the
`python` binary. *e.g.:*
```bash
$ PYTHON=/usr/bin/python3.12 make
```

## Database schema

Before running the alembic migrations make sure you have created a database called `newdle` (or adjust the config file). Having done that, run `flask db upgrade` to upgrade the schema.

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
 - `make lint` - runs linters, which report possible code style issues
 - `make format` - runs code formatters over the entire codebase (ruff, prettier)
 - `make test` - runs Python and React tests
 - `make build` - builds a Python wheel which then could be used to install `newdle` in production

## Develop with `docker compose` [beta]

 - `make docker-dev-run` - Build and runs the containers. Once everything is running, you can access the webapp on `http://127.0.0.1:3000`
 - `make docker-dev-clean` - Stops and destroys the images and containers
 - `make docker-dev-shell-react` - Bash the `react-server` container
 - `make docker-dev-shell-flask` - Bash the `flask-server` container

## Run newdle with `docker compose`
> :info: Production **like** environment

 - `make docker-run` - Build and runs the containers. Once everything is running, you can access the webapp on `http://127.0.0.1:8080`
 - `make docker-clean` - Stops and destroys the images and containers
 - `make docker-shell` - Bash the `newdle` container

|||
|-|-|
|<a href="https://home.cern"><img src="https://raw.githubusercontent.com/indico/assets/master/cern_badge.png" width="64"></a>|Made at [CERN](https://home.cern)<br>[Take part!](https://careers.cern/)|
|||

## Note

> In applying the MIT license, CERN does not waive the privileges and immunities
> granted to it by virtue of its status as an Intergovernmental Organization
> or submit itself to any jurisdiction.
