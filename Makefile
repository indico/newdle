PYTHON ?= python3.7
FLASK_HOST ?= 127.0.0.1
FLASK_PORT ?= 5000
REACT_PORT ?= 3000
VENV ?= .venv

SHELL := /bin/bash
PIP := ${VENV}/bin/pip
FLASK := ${VENV}/bin/flask
NODE_MODULES_GLOBAL := node_modules/.lastmake
NODE_MODULES_CLIENT := newdle/client/node_modules/.lastmake
PYDEPS := ${VENV}/.lastmake
CONFIG := newdle/newdle.cfg


.PHONY: all
all: ${PYDEPS} ${NODE_MODULES_GLOBAL} ${NODE_MODULES_CLIENT} ${CONFIG}
	@printf "\033[38;5;154mSETUP\033[0m  \033[38;5;105mInstalling newdle python package\033[0m\n"
	@${PIP} install -q -e .


${VENV}:
	@printf "\033[38;5;154mSETUP\033[0m  \033[38;5;105mCreating virtualenv\033[0m\n"
ifeq (, $(shell which ${PYTHON} 2> /dev/null))
	@printf "\033[38;5;220mFATAL\033[0m  \033[38;5;196mPython not found (${PYTHON})\033[0m\n"
	@exit 1
endif
ifneq (True, $(shell ${PYTHON} -c 'import sys; print(sys.version_info[:2] >= (3, 7))'))
	@printf "\033[38;5;220mFATAL\033[0m  \033[38;5;196mYou need at least Python 3.7\033[0m\n"
	@exit 1
endif
	@${PYTHON} -m venv .venv
	@${PIP} install -q -U pip setuptools


${PYDEPS}: ${VENV} requirements.txt requirements.dev.txt setup.py
	@printf "\033[38;5;154mSETUP\033[0m  \033[38;5;105mInstalling Python packages\033[0m\n"
	@${PIP} install -q -r requirements.txt
	@${PIP} install -q -r requirements.dev.txt
	@touch ${PYDEPS}


${CONFIG}: | ${CONFIG}.example
	@printf "\033[38;5;154mSETUP\033[0m  \033[38;5;105mCreating config [\033[38;5;147m${CONFIG}\033[38;5;105m]\033[0m\n"
	@cp ${CONFIG}.example ${CONFIG}
	@printf "       \033[38;5;82mDon't forget to update the config file if needed!\033[0m\n"


${NODE_MODULES_GLOBAL}: package.json
	@printf "\033[38;5;154mSETUP\033[0m  \033[38;5;105mInstalling top-level node packages\033[0m\n"
	@npm install --silent
	@touch ${NODE_MODULES_GLOBAL}


${NODE_MODULES_CLIENT}: newdle/client/package.json
	@printf "\033[38;5;154mSETUP\033[0m  \033[38;5;105mInstalling client node packages\033[0m\n"
	@cd newdle/client && npm install --silent
	@touch ${NODE_MODULES_CLIENT}


.PHONY: clean
clean:
	@printf "\033[38;5;154mCLEAN\033[0m  \033[38;5;202mDeleting all generated files...\033[0m\n"
	@rm -rf package-lock.json .venv node_modules newdle.egg-info pip-wheel-metadata dist build
	@rm -rf newdle/client/node_modules newdle/client/build
	@find newdle/ -name __pycache__ -exec rm -rf {} +


.PHONY: distclean
distclean: clean
	@printf "\033[38;5;154mCLEAN\033[0m  \033[38;5;202mDeleting config file...\033[0m\n"
	@rm -f ${CONFIG}


.PHONY: flask-server
flask-server:
	@printf "  \033[38;5;154mRUN\033[0m  \033[38;5;75mRunning Flask dev server [\033[38;5;81m${FLASK_HOST}\033[38;5;75m:\033[38;5;81m${FLASK_PORT}\033[38;5;75m]\033[0m\n"
	@${FLASK} run -h ${FLASK_HOST} -p ${FLASK_PORT} --extra-files $(abspath newdle/newdle.cfg)


.PHONY: react-server
react-server:
	@printf "  \033[38;5;154mRUN\033[0m  \033[38;5;75mRunning React dev server\033[0m\n"
	@source ${VENV}/bin/activate && \
		cd newdle/client && \
		PORT=${REACT_PORT} FLASK_URL=http://${FLASK_HOST}:${FLASK_PORT} npm start


.PHONY: lint
lint:
	@printf "  \033[38;5;154mDEV\033[0m  \033[38;5;77mLinting code\033[0m\n"
	@npm run pycodestyle


.PHONY: newdb
newdb:
	@printf "  \033[38;5;154mDEV\033[0m  \033[38;5;77mRecreating initial alembic revision & tables\033[0m\n"
	@${FLASK} db downgrade base
	@git rm -f newdle/migrations/versions/????????_????_000000000000_create_initial_tables.py
	@${FLASK} db migrate -m 'Create initial tables' --rev-id 000000000000
	@sed -i -e '/^Revises: $$/d' newdle/migrations/versions/????????_????_000000000000_create_initial_tables.py
	@sed -i -e '/^    # ### /d' newdle/migrations/versions/????????_????_000000000000_create_initial_tables.py
	@${VENV}/bin/isort --recursive newdle/migrations/versions/
	@${VENV}/bin/black newdle/migrations/versions/
	@git add newdle/migrations/versions/????????_????_000000000000_create_initial_tables.py
	@${FLASK} db upgrade head


.PHONY: format
format:
	@printf "  \033[38;5;154mDEV\033[0m  \033[38;5;77mFormatting code\033[0m\n"
	@npm run prettier
	@npm run isort
	@npm run black


.PHONY: test
test:
	@printf "  \033[38;5;154mDEV\033[0m  \033[38;5;77mRunning tests\033[0m\n"
	@${VENV}/bin/pytest
	@cd newdle/client && \
		npm run test


.PHONY: build
build:
	@printf "  \033[38;5;154mBUILD\033[0m  \033[38;5;176mBuilding production package\033[0m\n"
	@rm -rf newdle/client/build build
	@source ${VENV}/bin/activate && cd newdle/client && npm run build
	@python setup.py bdist_wheel -q
