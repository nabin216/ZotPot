import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'zotpot.settings')

app = Celery('zotpot')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Configure periodic tasks
app.conf.beat_schedule = {
    'check-pending-orders': {
        'task': 'orders.tasks.check_pending_orders',
        'schedule': crontab(minute='*/5'),  # Run every 5 minutes
    },
    'update-delivery-status': {
        'task': 'orders.tasks.update_delivery_status',
        'schedule': crontab(minute='*/2'),  # Run every 2 minutes
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 