from celery import shared_task
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from firebase_admin import messaging
from .models import Order, OrderTracking

@shared_task
def send_order_notification(order_id, title, body, user_ids):
    """Send push notification to users about order updates."""
    try:
        # Create message
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            tokens=user_ids,  # FCM tokens of users
            data={
                'order_id': str(order_id),
                'type': 'order_update',
            }
        )

        # Send message
        response = messaging.send_multicast(message)
        return {
            'success_count': response.success_count,
            'failure_count': response.failure_count,
        }
    except Exception as e:
        print(f"Error sending notification: {str(e)}")
        return None

@shared_task
def assign_delivery_agent(order_id):
    """Automatically assign delivery agent to order."""
    from users.models import DeliveryAgent  # Import here to avoid circular import

    try:
        order = Order.objects.get(id=order_id)
        
        # Find available delivery agent
        available_agent = DeliveryAgent.objects.filter(
            is_available=True
        ).order_by('total_deliveries').first()

        if available_agent:
            # Assign delivery agent
            order.delivery_agent = available_agent.user
            order.status = Order.Status.CONFIRMED
            order.save()

            # Create tracking update
            OrderTracking.objects.create(
                order=order,
                status=order.status,
                description=f"Order assigned to {available_agent.user.get_full_name()}"
            )

            # Update delivery agent status
            available_agent.is_available = False
            available_agent.total_deliveries += 1
            available_agent.save()

            # Send notifications
            customer_token = order.customer.fcm_token
            agent_token = available_agent.user.fcm_token
            
            if customer_token:
                send_order_notification.delay(
                    order_id,
                    "Order Confirmed",
                    "Your order has been confirmed and assigned to a delivery agent.",
                    [customer_token]
                )
            
            if agent_token:
                send_order_notification.delay(
                    order_id,
                    "New Delivery Assignment",
                    f"You have been assigned to deliver order #{order.id}",
                    [agent_token]
                )

            return True
        return False
    except Order.DoesNotExist:
        return False

@shared_task
def check_pending_orders():
    """Check and process pending orders."""
    # Get orders that have been pending for more than 5 minutes
    pending_time = timezone.now() - timedelta(minutes=5)
    pending_orders = Order.objects.filter(
        status=Order.Status.PENDING,
        created_at__lte=pending_time
    )

    for order in pending_orders:
        assign_delivery_agent.delay(order.id)

@shared_task
def update_delivery_status():
    """Update status of orders in delivery."""
    # Get orders that are out for delivery
    delivering_orders = Order.objects.filter(
        status=Order.Status.OUT_FOR_DELIVERY
    ).select_related('delivery_agent')

    for order in delivering_orders:
        if order.delivery_agent and order.delivery_agent.delivery_profile.current_location:
            # Create tracking update
            OrderTracking.objects.create(
                order=order,
                status=order.status,
                location=order.delivery_agent.delivery_profile.current_location,
                description="Delivery location updated"
            )

            # Send notification to customer
            if order.customer.fcm_token:
                send_order_notification.delay(
                    order.id,
                    "Order Update",
                    "Your order is on the way!",
                    [order.customer.fcm_token]
                ) 