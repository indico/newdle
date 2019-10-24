# builder image
FROM python:3.8 AS builder

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get update && apt-get install -y nodejs

ADD https://github.com/indico/newdle/archive/master.tar.gz /tmp/newdle.tar.gz
RUN mkdir /tmp/newdle && tar xzf /tmp/newdle.tar.gz -C /tmp/

WORKDIR /tmp/newdle-master

ENV HUSKY_SKIP_INSTALL 1
RUN PYTHON=python3.8 make
RUN make build


# production image
FROM python:3.8

RUN pip install uwsgi

COPY --from=builder /tmp/newdle-master/dist/newdle*.whl /tmp/
RUN pip install $(echo /tmp/newdle*.whl)[exchange]
RUN find /usr/local/lib/python3.8/site-packages/newdle/client/build/ -type f -exec gzip -k {} +
ADD run.sh uwsgi.ini /

# install some useful tools for debugging etc.
RUN pip install ipython flask-shell-ipython httpie

USER nobody

ENV NEWDLE_CONFIG=/newdle/newdle.cfg FLASK_ENV=production FLASK_APP=newdle.wsgi
CMD ["/run.sh"]
EXPOSE 8080
