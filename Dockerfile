
FROM <your-base-image-location>
COPY . /playwright_ts_quickstart
WORKDIR /playwright_ts_quickstart

RUN ./install.sh

