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
RUN pip install /tmp/newdle*.whl
ADD run.sh uwsgi.ini /

USER nobody

ENV NEWDLE_CONFIG /newdle/newdle.cfg
CMD ["/run.sh"]
EXPOSE 8080
