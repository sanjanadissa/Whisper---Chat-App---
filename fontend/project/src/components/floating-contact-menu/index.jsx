import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import FloatingModal from './components/FloatingModal';
import ContactForm from './components/ContactForm';
import SuccessMessage from './components/SuccessMessage';

const FloatingContactMenu = ({ isOpen = false, onClose = () => {}, onContactSaved = () => {} }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedContact, setSavedContact] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync with external isOpen prop
  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setShowSuccess(false);
    setSavedContact(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowSuccess(false);
    setSavedContact(null);
    onClose(); // Call external onClose
  };

  const handleSaveContact = (contactData) => {
    setSavedContact(contactData);
    setShowSuccess(true);
    
    // Notify parent component that contact was saved
    onContactSaved();
    
    // Log the saved contact (in real app, this would be sent to API)
    console.log('Contact saved:', contactData);
  };

  const handleAddAnother = () => {
    setShowSuccess(false);
    setSavedContact(null);
  };

  return (
    <>
      {/* Floating Modal */}
      <FloatingModal isOpen={isModalOpen} onClose={handleCloseModal}>
        {showSuccess ? (
          <SuccessMessage
            contact={savedContact}
            onClose={handleCloseModal}
            onAddAnother={handleAddAnother}
          />
        ) : (
          <ContactForm
            onSave={handleSaveContact}
            onCancel={handleCloseModal}
            onContactSaved={onContactSaved}
          />
        )}
      </FloatingModal>
    </>
  );
};

export default FloatingContactMenu;