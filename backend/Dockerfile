FROM golang:1.22-alpine AS builder

RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server/

FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /app/migrations/001_core.sql /app/migrations/002_hr.sql /app/migrations/003_seed.sql /app/migrations/004_enhanced.sql /app/migrations/005_loans.sql ./migrations/

EXPOSE 8120

CMD ["./server"]
