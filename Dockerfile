# builder image
FROM python:3.12 AS builder

ADD . /build/
WORKDIR /build

RUN ./install_node.sh

RUN HUSKY_SKIP_INSTALL=1 make
RUN make build


# production image
FROM python:3.12

# create an unprivileged user to run as
RUN set -ex && \
	groupadd -r newdle && \
	useradd -r -g newdle -m -d /newdle newdle

# required packages for uwsgi to build
RUN apt-get update && apt-get install -y libpcre3 libpcre3-dev
RUN pip install uwsgi

ENV UV_NO_CACHE=1
ENV UV_SYSTEM_PYTHON=1
COPY --from=ghcr.io/astral-sh/uv /uv /bin/uv
COPY --from=builder /build/dist/newdle*.whl /tmp/
RUN uv pip install $(echo /tmp/newdle*.whl)[exchange,cern]
RUN find /usr/local/lib/python3.12/site-packages/newdle/client/build/ -type f -exec gzip -k {} +
ADD docker/run.sh docker/uwsgi.ini /

# install some useful tools for debugging etc.
RUN uv pip install ipython flask-shell-ipython httpie

USER newdle

ENV NEWDLE_CONFIG=/newdle/etc/newdle.cfg FLASK_APP=newdle.wsgi
CMD ["/run.sh"]
EXPOSE 8080
