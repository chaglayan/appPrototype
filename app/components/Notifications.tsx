import React from 'react';
import { useApp } from '../context/AppContext';
import { Notification } from '../types';

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { markNotificationAsRead, removeNotification } = useApp();

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
    }
  };

  const getColorClasses = () => {
    if (notification.read) {
      return 'bg-gray-50 border-gray-200';
    }
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-300';
      case 'error':
        return 'bg-red-50 border-red-300';
      case 'warning':
        return 'bg-yellow-50 border-yellow-300';
      case 'info':
        return 'bg-blue-50 border-blue-300';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      className={`border-l-4 p-4 mb-2 rounded-lg border transition-colors ${getColorClasses()} ${
        !notification.read ? 'font-medium' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <span className="text-xl mr-3">{getIcon()}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className={`text-sm ${!notification.read ? 'font-bold' : 'font-semibold'} text-gray-900`}>
                {notification.title}
              </h4>
              {!notification.read && (
                <span className="w-2 h-2 bg-blue-600 rounded-full ml-2"></span>
              )}
            </div>
            <p className="text-sm mt-1 text-gray-700">{notification.message}</p>
            <p className="text-xs text-gray-500 mt-2">{formatTime(notification.timestamp)}</p>
          </div>
        </div>
        <div className="flex gap-2 ml-3">
          {!notification.read && (
            <button
              onClick={() => markNotificationAsRead(notification.id)}
              className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
              title="Mark as read"
            >
              ✓
            </button>
          )}
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-gray-400 hover:text-gray-600"
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export const Notifications: React.FC<NotificationsProps> = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsAsRead } = useApp();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Notifications</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              ✕
            </button>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-100">{unreadCount} unread</p>
              <button
                onClick={markAllNotificationsAsRead}
                className="text-sm text-white font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30 transition-colors"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
