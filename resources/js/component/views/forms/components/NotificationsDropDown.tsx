import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotification } from '../../../context/NotificationContext'; // Ensure the import path is correct

const NotificationsDropdown: React.FC = () => {
  const { notifications = [] } = useNotification(); // Provide default value for notifications
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50"> {/* Set a high z-index here */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        <FaBell />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50"> {/* Apply z-index */}
          <div className="p-4">
            <h2 className="text-lg font-semibold text-black">Notifications</h2>
            <div className="mt-2 max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="border-b border-gray-200 py-2">
                    <p className="text-sm text-black">{notification.content}</p>
                    <span className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-black">No notifications</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
