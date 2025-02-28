import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from orders.models import Order, OrderTracking

User = get_user_model()

class LocationTrackingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.order_id = self.scope['url_route']['kwargs']['order_id']
        self.room_group_name = f'order_{self.order_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')
        
        if message_type == 'location_update':
            location = text_data_json.get('location')
            user_id = text_data_json.get('user_id')

            # Save location update
            await self.save_location_update(user_id, location)

            # Broadcast location to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'location_update',
                    'location': location,
                    'user_id': user_id
                }
            )

    async def location_update(self, event):
        location = event['location']
        user_id = event['user_id']

        # Send location update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'location_update',
            'location': location,
            'user_id': user_id
        }))

    @database_sync_to_async
    def save_location_update(self, user_id, location):
        try:
            order = Order.objects.get(id=self.order_id)
            user = User.objects.get(id=user_id)

            if user.role == 'delivery_agent' and order.delivery_agent_id == user.id:
                # Update delivery agent's location
                delivery_profile = user.delivery_profile
                delivery_profile.current_location = location
                delivery_profile.save()

                # Create tracking update
                OrderTracking.objects.create(
                    order=order,
                    status=order.status,
                    location=location,
                    description="Delivery agent location updated"
                )
        except (Order.DoesNotExist, User.DoesNotExist):
            pass  # Silently ignore if order or user doesn't exist
 