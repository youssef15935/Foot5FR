import React from 'react';

const ConfirmationModal = ({ show, onClose, onConfirm, message }) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 9999 }} // Ensure this z-index is higher than other elements
    >
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="text-lg mb-4">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
