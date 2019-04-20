FROM python:3.5-alpine

MAINTAINER Rafael Schultze-Kraft "skraftr@gmail.com"

RUN apk add --update curl gcc g++ && rm -rf /var/cache/apk/*

RUN ln -s /usr/include/locale.h /usr/include/xlocale.h

RUN pip install numpy pandas
RUN pip install flask dash dash-core-components dash-html-components

ADD . /api
WORKDIR /api

EXPOSE 8050

ENTRYPOINT ["python", "dash_app.py"]
