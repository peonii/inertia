FROM golang:1.21
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .
RUN go build -v -o /bin/app ./cmd/inertia

EXPOSE 3001
CMD ["/bin/app", "api"]
