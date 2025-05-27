import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

interface TrackingUpdate {
  id: number;
  status: string;
  message: string;
  timestamp: string;
}

const OrderPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate(); // Initialize useNavigate
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  useEffect(() => {
    // Fetch order tracking data from the backend
    const fetchOrderTracking = async () => {
      try {
        const response = await fetch(`/api/v1/product/${orderId}/tracking`);
        if (response.ok) {
          const data = await response.json();
          setTrackingUpdates(data.tracking);
          setCurrentStatus(data.order.status);
        } else {
          console.error('Error fetching order tracking');
        }
      } catch (error) {
        console.error('Error fetching order tracking:', error);
      }
    };

    fetchOrderTracking();
  }, [orderId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    let badgeClass = '';
    switch (status) {
      case 'delivered':
        badgeClass = 'bg-green-100 text-green-800';
        break;
      case 'processing':
        badgeClass = 'bg-blue-100 text-blue-800';
        break;
      case 'shipped':
        badgeClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'cancelled':
        badgeClass = 'bg-red-100 text-red-800';
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-800';
    }

    return (
      <Badge variant="outline" className={`${badgeClass} capitalize px-2 py-1`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Order Tracking - {orderId}</h1>

      {/* Display current order status */}
      <div className="mb-6">
        <h3 className="text-xl font-medium">Current Status</h3>
        <div className="mt-2">{getStatusBadge(currentStatus)}</div>
      </div>

      {/* If there are no tracking updates, show a message */}
      {trackingUpdates.length === 0 ? (
        <div className="text-center p-8">
          <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No tracking updates yet</h3>
          <p className="text-gray-500">Your order is being processed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-xl font-medium">Tracking Updates</h3>
          <div className="border-t-2 pt-4">
            {trackingUpdates.map((update) => (
              <div
                key={update.id}
                className="flex items-start space-x-4 mb-6 relative"
              >
                <div className="absolute left-0 top-0 w-2 h-2 bg-gray-500 rounded-full"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {update.status[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500">{formatDate(update.timestamp)}</div>
                  <div className="mt-2">
                    <strong>{update.status.toUpperCase()}</strong>
                    <p className="text-gray-700">{update.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button variant="outline" onClick={() => navigate('/products')}> {/* Use navigate here */}
          Back to Products
        </Button>
      </div>
    </div>
  );
};

export default OrderPage;
