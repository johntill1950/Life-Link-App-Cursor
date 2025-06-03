import { useState, useEffect } from 'react';
// import { notificationService } from '@/lib/notificationService';

interface AlertStatusProps {
  activeAlertId: string | null;
  onAlertCancelled: () => void;
}

export default function AlertStatus({ activeAlertId, onAlertCancelled }: AlertStatusProps) {
  const [countdown, setCountdown] = useState(30);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!activeAlertId) {
      setCountdown(30);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAlertId]);

  const handleCancel = async () => {
    if (!activeAlertId) return;

    setCancelling(true);
    try {
      // await notificationService.cancelAlert(activeAlertId);
      onAlertCancelled();
    } catch (error) {
      console.error('Error cancelling alert:', error);
      alert('Failed to cancel alert. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (!activeAlertId) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <h3 className="font-bold">Emergency Alert Active</h3>
          <p className="text-sm">
            {countdown > 0
              ? `Emergency services will be notified in ${countdown} seconds`
              : 'Emergency services are being notified'}
          </p>
        </div>
        <button
          onClick={handleCancel}
          disabled={cancelling || countdown === 0}
          className={`px-4 py-2 bg-white text-red-500 rounded-md font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-500 ${
            (cancelling || countdown === 0) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {cancelling ? 'Cancelling...' : 'Cancel Alert'}
        </button>
      </div>
    </div>
  );
} 