import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';

const ContactForm = ({ onSave, onCancel, onContactSaved }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });

  const { token } = useAuth();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData?.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10,15}$/?.test(formData?.phoneNumber?.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e?.target?.value?.replace(/\D/g, '');
    handleInputChange('phoneNumber', value);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
     console.log(formData?.firstName?.trim());
    //  console.log(formData?.isLoadingt?.trim());
      const contactData = {       
        contactName: formData?.firstName?.trim()+" "+formData?.lastName?.trim(),
        phoneNumber: formData?.phoneNumber?.trim() 
           
      };

      console.log(contactData);
      
      const contactDatas = {       
        firstName: formData?.firstName?.trim(),
        lastName: formData?.lastName?.trim(),
        phone: formData?.phoneNumber?.trim(),
        createdAt: new Date()?.toISOString()     
      };
      // Create URL with query parameters
      const url = new URL('http://localhost:8080/user/addContact');
      url.searchParams.append('otherPhone', formData?.phoneNumber?.trim());
      url.searchParams.append('contactName', formData?.firstName?.trim() + " " + formData?.lastName?.trim());
      
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Notify parent component that contact was saved
      onSave(contactDatas);
      
      // Notify parent to refresh chats if callback provided
      if (onContactSaved) {
        onContactSaved();
      }
      
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setIsLoading(false);
     
    }
  };

  

  return (
    <div className="p-6 bg-black/15">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Save Contact</h2>
        <p className="text-sm text-gray-600">Add a new contact to your address book</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name - Required */}
        <Input
          label="First Name"
          type="text"
          placeholder="Enter first name"
          value={formData?.firstName}
          onChange={(e) => handleInputChange('firstName', e?.target?.value)}
        
          required
          className={`w-full px-3 py-2.5 bg-white/50 backdrop-blur-sm border rounded-lg transition-all duration-200  placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50  focus:bg-white/60  placeholder:text-gray-500 ${
                  errors?.firstName ? 'border-red-300' : 'border-white/20'
                }`}
        />

        {/* Last Name - Optional */}
        <Input
          label="Last Name"
          type="text"
          placeholder="Enter last name (optional)"
          value={formData?.lastName}
          onChange={(e) => handleInputChange('lastName', e?.target?.value)}
           className={`w-full px-3 py-2.5 bg-white/50 backdrop-blur-sm border rounded-lg transition-all duration-200  placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50  focus:bg-white/60  placeholder:text-gray-500 ${
                  errors?.lastName ? 'border-red-300' : 'border-white/20'
                }`}
          
        />

        {/* Phone Number Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            
            
            <div className="flex-1">
              <input
                type="tel"
                placeholder="Enter phone number"
                value={formData?.phoneNumber}
                onChange={handlePhoneChange}
                className={`w-full px-3 py-2.5 bg-white/50 backdrop-blur-sm border rounded-lg transition-all duration-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/60 ${
                  errors?.phoneNumber ? 'border-red-300' : 'border-white/20'
                }`}
              />
            </div>
          </div>
          {errors?.phoneNumber && (
            <p className="text-sm text-red-600 mt-1">{errors?.phoneNumber}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            loading={isLoading}
            iconName="Save"
            iconPosition="left"
            className="flex-1"
          >
            Save Contact
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;