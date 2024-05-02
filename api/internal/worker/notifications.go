package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"firebase.google.com/go/v4/messaging"
	"github.com/adjust/rmq/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
	"github.com/peonii/inertia/internal/repository"
	"github.com/redis/go-redis/v9"
	"github.com/sideshow/apns2"
	"github.com/sideshow/apns2/token"
	"go.uber.org/zap"
)

type NotificationWorker struct {
	context.Context

	logger    *zap.Logger
	queue     rmq.Connection
	rdc       *redis.Client
	db        *pgxpool.Pool
	apnsToken *token.Token
	fcmClient *messaging.Client

	development bool
	consumers   int

	deviceRepo repository.NotificationRepository
}

type notificationConsumer struct {
	*NotificationWorker

	dapns *apns2.Client
	papns *apns2.Client

	tag int

	rmq.Consumer
}

func NewNotificationWorker(ctx context.Context, logger *zap.Logger, token *token.Token, fcmClient *messaging.Client, rdc *redis.Client, db *pgxpool.Pool, queue rmq.Connection, development bool, consumers int) *NotificationWorker {
	return &NotificationWorker{
		Context:     ctx,
		logger:      logger,
		apnsToken:   token,
		fcmClient:   fcmClient,
		rdc:         rdc,
		db:          db,
		queue:       queue,
		development: development,
		consumers:   consumers,
		deviceRepo:  repository.MakePostgresNotificationRepository(db),
	}
}

func (nw *NotificationWorker) Start() error {
	queue, err := nw.queue.OpenQueue("inertia-notifications")
	if err != nil {
		return err
	}

	if err := queue.StartConsuming(int64(nw.consumers), time.Second*5); err != nil {
		return err
	}

	host, _ := os.Hostname()

	for i := 0; i < nw.consumers; i++ {
		consumerId := fmt.Sprintf("consumer-%s-%d", host, i)
		consumer := NewNotificationConsumer(nw, i)

		if _, err := queue.AddConsumer(consumerId, consumer); err != nil {
			return nil
		}

		nw.logger.Info("started notification consumer",
			zap.String("consumer_id", consumerId),
		)
	}

	return nil
}

func (nw *NotificationWorker) Stop() {
	<-nw.queue.StopAllConsuming()
}

func NewNotificationConsumer(nw *NotificationWorker, tag int) *notificationConsumer {
	return &notificationConsumer{
		NotificationWorker: nw,
		tag:                tag,

		dapns: apns2.NewTokenClient(nw.apnsToken).Development(),
		papns: apns2.NewTokenClient(nw.apnsToken).Production(),
	}
}

func (nc *notificationConsumer) Consume(delivery rmq.Delivery) {
	payload := delivery.Payload()
	var n domain.Notification
	if err := json.Unmarshal([]byte(payload), &n); err != nil {
		nc.logger.Error("failed to unmarshal notification", zap.Error(err))
		delivery.Reject()
		return
	}

	key := fmt.Sprintf("locks:notifications:%s", payload)
	_, err := nc.rdc.Get(nc, key).Bool()
	if err == nil {
		// has already been locked
		nc.logger.Error("notification locked", zap.String("key", key))
		return
	}

	// attempt to lock the notification
	nc.rdc.Set(nc, key, true, time.Second*60)
	defer func() {
		nc.rdc.Del(nc, key)
	}()

	nc.logger.Info("received notification",
		zap.Int("tag", nc.tag),
		zap.Any("notification", n),
	)
	device, err := nc.deviceRepo.GetDevice(nc, n.DeviceID)
	if err != nil {
		nc.logger.Error("failed to get device", zap.Error(err))
		delivery.Reject()
		return
	}

	if device.ServiceType == domain.DeviceServiceTypeAPNs {
		// send to APNs
		notification := &apns2.Notification{}
		notification.DeviceToken = device.Token
		notification.Topic = "dev.nattie.Inertia"
		notification.PushType = apns2.PushTypeAlert
		notification.Priority = n.Priority
		notification.Payload = []byte(fmt.Sprintf(`{
			"aps": {
				"alert": {
					"title": "%s",
					"body": "%s"
				},
				"sound": "default",
				"interruption-level": "time-sensitive"
			}
		}`, n.Title, n.Body))

		if nc.development {
			nc.logger.Info("sending notification to development APNs",
				zap.Any("notification", notification),
				zap.String("device_token", device.Token),
			)
			resp, err := nc.dapns.PushWithContext(nc, notification)
			if err != nil {
				nc.logger.Error("failed to send notification", zap.Error(err))
				delivery.Reject()
			}

			nc.logger.Info("notification sent",
				zap.Any("response", resp),
				zap.String("url", nc.dapns.Host),
			)
		} else {
			nc.logger.Info("sending notification to production APNs", zap.Any("notification", notification))
			nc.papns.PushWithContext(nc, notification)
		}
	} else if device.ServiceType == domain.DeviceServiceTypeFCM {
		notification := &messaging.Message{
			Token: device.Token,
			Notification: &messaging.Notification{
				Title: n.Title,
				Body:  n.Body,
				// this is a very good idea!
				ImageURL: "https://raw.githubusercontent.com/peonii/inertia/main/mobile/assets/icon.png",
			},
		}

		if _, err := nc.fcmClient.Send(nc, notification); err != nil {
			nc.logger.Error("failed to send notification", zap.Error(err))
			delivery.Reject()
			return
		}

		nc.logger.Info("notification sent",
			zap.String("device_token", device.Token),
		)
	} else {
		nc.logger.Error("unknown service type", zap.String("service_type", device.ServiceType))
		delivery.Reject()
		return
	}

	delivery.Ack()
}
