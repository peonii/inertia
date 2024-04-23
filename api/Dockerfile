FROM golang:1.21
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .
RUN go build -v -o /bin/app ./cmd/inertia

ADD launch.sh /bin/
RUN chmod +x /bin/launch.sh

ENTRYPOINT ["/bin/launch.sh"]
