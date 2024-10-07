import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

const Notification: React.FC<NotificationProps> = ({ type, message }) => {
  const icons = {
    success: <FiCheckCircle className="text-green-500" />,
    error: <FiAlertCircle className="text-red-500" />,
    info: <FiInfo className="text-blue-500" />
  };

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md flex items-center ${
      type === 'success' ? 'bg-green-100' :
      type === 'error' ? 'bg-red-100' : 'bg-blue-100'
    }`}>
      {icons[type]}
      <span className="ml-2">{message}</span>
    </div>
  );
};

export default Notification;
