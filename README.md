# Newdle

This is something new and cool! 🎉

## Database

To create the tables, run `flask db upgrade`.

## Development

Run `make` to setup your virtualenv and install all dependencies.
If Python 3.7 is not in your PATH as `python3.7`, you can use e.g. `PYTHON=python3 make`
instead (or even point to the full path where your Python 3.7 interpreter is located).

To run the dev servers, use `make flask-server` and `make react-server` (in separate terminals).
You can use the `FLASK_HOST`, `FLASK_PORT` and `REACT_PORT` environment variables to override
where the dev servers will listen (make sure to set it for both dev servers, since the react
server needs to know where the Flask app is running).

Once everything is running, you can access the webapp on `http://127.0.0.1:3000` if you did not
change any of the ports.

Code formatting tools are automatically executed when you commit, but you can run `make format`
to run them manually.

The unit tests can be run using `make test`. Linting (with pycodestyle) can be done using `make lint`.

To build a Python wheel suitable for publishing or a production deployment, run `make build`.

## Note

In applying the MIT license, CERN does not waive the privileges and immunities
granted to it by virtue of its status as an Intergovernmental Organization
or submit itself to any jurisdiction.
