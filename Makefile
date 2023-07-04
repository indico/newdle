PYTHON ?= python
FLASK_HOST ?= 127.0.0.1
FLASK_PORT ?= 5000
REACT_PORT ?= 3000
VENV ?= .venv

SHELL := /bin/bash
PIP := ${VENV}/bin/pip
FLASK := ${VENV}/bin/flask
NODE_MODULES_GLOBAL := node_modules/.lastmake
NODE_MODULES_CLIENT := newdle/client/node_modules/.lastmake
CONFIG := newdle/newdle.cfg
I18N := newdle/client/src/locales/*/messages.mjs


.PHONY: all
all: ${VENV} ${NODE_MODULES_GLOBAL} ${NODE_MODULES_CLIENT} config
	@printf "\033[38;5;154mSETUP\033[0m  \033[38;5;105mInstalling newdle python package\033[0m\n"
	@${PIP} install -q -e '.[dev]'


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
	@${PYTHON} -m venv --prompt newdle .venv
	@${PIP} install -q -U pip setuptools

${CONFIG}: | ${CONFIG}.example
	@printf "\033[38;5;154mSETUP\033[0m  \033[38;5;105mCreating config [\033[38;5;147m${CONFIG}\033[38;5;105m]\033[0m\n"
	@cp ${CONFIG}.example ${CONFIG}
	@sed -i.bak "s/^SECRET_KEY = None/SECRET_KEY = '$$(LC_ALL=C tr -dc A-Za-z0-9 < /dev/urandom | head -c 32)'/" ${CONFIG}
	@sed -i.bak "s/^SKIP_LOGIN = False/SKIP_LOGIN = True/" ${CONFIG}
	@sed -i.bak "s/^EMAIL_BACKEND = '[^']\+'/EMAIL_BACKEND = 'newdle.vendor.django_mail.backends.console.EmailBackend'/" ${CONFIG}
	@rm -f ${CONFIG}.bak
	@printf "       \033[38;5;82mDon't forget to update the config file if needed!\033[0m\n"

${NODE_MODULES_GLOBAL}: package.json
	@printf "\033[38;5;154mSETUP\033[0m  \033[38;5;105mInstalling top-level node packages\033[0m\n"
	@npm install --silent
	@touch ${NODE_MODULES_GLOBAL}


${NODE_MODULES_CLIENT}: newdle/client/package.json newdle/client/package-lock.json
	@printf "\033[38;5;154mSETUP\033[0m  \033[38;5;105mInstalling client node packages\033[0m\n"
	@cd newdle/client && npm ci --silent
	@touch ${NODE_MODULES_CLIENT}

.PHONY: i18n-extract
i18n-extract:
	@printf "\033[38;5;154mI18N\033[0m  \033[38;5;105mExtracting strings\033[0m\n"
	@cd newdle/client && PATH="$(abspath ${VENV}/bin):${PATH}" npm run extract

${I18N}: newdle/client/src/locales/*/messages.po
	@printf "\033[38;5;154mI18N\033[0m  \033[38;5;105mCompiling translations\033[0m\n"
	@cd newdle/client && npm run compile


.PHONY: clean
clean:
	@printf "\033[38;5;154mCLEAN\033[0m  \033[38;5;202mDeleting all generated files...\033[0m\n"
	@rm -rf package-lock.json .venv node_modules newdle.egg-info pip-wheel-metadata dist build
	@rm -rf newdle/client/node_modules newdle/client/build newdle/client/src/locales/_build
	@rm -f newdle/client/src/locales/*/messages.mjs newdle/client/src/locales/en/messages.*
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
react-server: i18n
	@printf "  \033[38;5;154mRUN\033[0m  \033[38;5;75mRunning React dev server\033[0m\n"
	@source ${VENV}/bin/activate && \
		cd newdle/client && \
		WDS_SOCKET_PORT=0 PORT=${REACT_PORT} FLASK_URL=http://${FLASK_HOST}:${FLASK_PORT} npm start


.PHONY: lint
lint:
	@printf "  \033[38;5;154mDEV\033[0m  \033[38;5;77mLinting code\033[0m\n"
	@npm run flake8
	@npm run eslint:check
	@npm run prettier:check
	@npm run isort:check
	@npm run black:check


.PHONY: format
format:
	@printf "  \033[38;5;154mDEV\033[0m  \033[38;5;77mFormatting code\033[0m\n"
	@npm run eslint
	@npm run isort
	@npm run black


.PHONY: test
test:
	@printf "  \033[38;5;154mDEV\033[0m  \033[38;5;77mRunning tests\033[0m\n"
	@${VENV}/bin/pytest
	@cd newdle/client && \
		npm run test


.PHONY: lockpydeps
lockpydeps:
	@printf "  \033[38;5;154mDEV\033[0m  \033[38;5;77mLocking Python deps\033[0m\n"
	@npm run pydeps:lock


.PHONY: updatepydeps
updatepydeps:
	@printf "  \033[38;5;154mDEV\033[0m  \033[38;5;77mUpdating Python deps\033[0m\n"
	@npm run pydeps:update


.PHONY: build
build: i18n
	@printf "  \033[38;5;154mBUILD\033[0m  \033[38;5;176mBuilding production package\033[0m\n"
	@rm -rf newdle/client/build build
	@source ${VENV}/bin/activate && cd newdle/client && npm run build
	@python setup.py bdist_wheel -q


.PHONY: docker
docker:
	@printf "  \033[38;5;154mDOCKER\033[0m  \033[38;5;176mBuilding production docker image\033[0m\n"
	@docker build -t newdle .

.PHONY: config
config: ${CONFIG}

.PHONY: env
env: ${VENV}

.PHONY: i18n
i18n: i18n-extract ${I18N}

################ Docker-compose commands ################

docker-run:
	docker compose -f docker-compose.yml up --remove-orphans
.PHONY: docker-run

docker-clean:
	docker compose -f docker-compose.yml down --volumes
	docker compose -f docker-compose.yml rm -f
.PHONY: docker-clean

docker-shell:
	docker compose -f docker-compose.yml exec newdle /bin/bash
.PHONY: docker-shell

docker-dev-run:
	docker compose -f docker-compose.development.yml up --remove-orphans
.PHONY: docker-dev-run

docker-dev-clean:
	docker compose -f docker-compose.development.yml down --volumes
	docker compose -f docker-compose.development.yml rm -f
.PHONY: docker-dev-clean

docker-dev-shell-react:
	docker compose -f docker-compose.development.yml exec react-server /bin/bash
.PHONY: docker-dev-shell-react

docker-dev-shell-flask:
	docker compose -f docker-compose.development.yml exec flask-server /bin/bash
.PHONY: docker-dev-shell-flask
