import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SuccessMessage = ({ contact, onClose, onAddAnother }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 text-center"
    >
      {/* Success Icon */}
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <Icon name="Check" size={32} className="text-green-600" />
      </div>
      {/* Success Message */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Saved!</h3>
      <p className="text-sm text-gray-600 mb-6">
        {contact?.firstName} {contact?.lastName} has been added to your contacts.
      </p>
      {/* Contact Details */}
      <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 mb-6 text-left">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon name="User" size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700">
              {contact?.firstName} {contact?.lastName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Phone" size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700">{contact?.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Calendar" size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700">
              {new Date(contact.createdAt)?.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Close
        </Button>
        <Button
          variant="default"
          onClick={onAddAnother}
          iconName="Plus"
          iconPosition="left"
          className="flex-1"
        >
          Add Another
        </Button>
      </div>
    </motion.div>
  );
};

export default SuccessMessage;