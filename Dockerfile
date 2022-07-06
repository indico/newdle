# builder image
FROM python:3.9 AS builder

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get update && apt-get install -y nodejs

ADD . /build/
WORKDIR /build

RUN HUSKY_SKIP_INSTALL=1 make
RUN make build


# production image
FROM python:3.9

# create an unprivileged user to run as
RUN set -ex && \
	groupadd -r newdle && \
	useradd -r -g newdle -m -d /newdle newdle

RUN pip install uwsgi

COPY --from=builder /build/dist/newdle*.whl /tmp/
RUN pip install $(echo /tmp/newdle*.whl)[exchange,cern]
RUN find /usr/local/lib/python3.9/site-packages/newdle/client/build/ -type f -exec gzip -k {} +
ADD docker/run.sh docker/uwsgi.ini /

# install some useful tools for debugging etc.
RUN pip install ipython flask-shell-ipython httpie

USER newdle

ENV NEWDLE_CONFIG=/newdle/etc/newdle.cfg FLASK_ENV=production FLASK_APP=newdle.wsgi
CMD ["/run.sh"]
EXPOSE 8080
