import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Search,
  Plus,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  Save,
  X,
  Shield,
  ShieldOff,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LiquidButton } from "./glass-button";
import ProfileAvatar from "./ui/ProfileAvatar";

interface Contact {
  id: number;
  phoneNumber: string;
  contactName: string;
  isBlocked: boolean;
  profileImageUrl?: string; // Profile picture URL from database
}

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editName, setEditName] = useState("");
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    let filtered = contacts;

    if (searchTerm.trim() !== "") {
      filtered = contacts.filter(
        (contact) =>
          contact.contactName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          contact.phoneNumber.includes(searchTerm)
      );
    }

    // Sort contacts alphabetically by name
    filtered.sort((a, b) =>
      a.contactName.toLowerCase().localeCompare(b.contactName.toLowerCase())
    );

    setFilteredContacts(filtered);
  }, [searchTerm, contacts]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("http://localhost:8080/user/getcontacts", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("ContactsPage: Raw contact data from backend:", data);

      // Check if the first contact has profileImageUrl
      if (data && data.length > 0) {
        console.log("ContactsPage: First contact structure:", {
          id: data[0].id,
          phoneNumber: data[0].phoneNumber,
          contactName: data[0].contactName,
          isBlocked: data[0].isBlocked,
          profileImageUrl: data[0].profileImageUrl,
          availableKeys: Object.keys(data[0]),
        });
      }

      setContacts(data || []);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts. Please try again.");
      // For demo purposes, let's add some sample contacts
      setContacts([
        {
          id: 1,
          phoneNumber: "+1234567890",
          contactName: "John Doe",
          isBlocked: false,
          profileImageUrl:
            "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        },
        {
          id: 2,
          phoneNumber: "+1987654321",
          contactName: "Jane Smith",
          isBlocked: false,
          profileImageUrl:
            "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        },
        {
          id: 3,
          phoneNumber: "+1122334455",
          contactName: "Alice Johnson",
          isBlocked: false,
          profileImageUrl:
            "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        },
        {
          id: 4,
          phoneNumber: "+1555666777",
          contactName: "Bob Wilson",
          isBlocked: true,
          profileImageUrl:
            "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToChat = () => {
    navigate("/chat");
  };

  const handleAddContact = () => {
    // This could open the floating contact menu or navigate to a contact form
    navigate("/chat");
  };

  const handleContactClick = (contact: Contact) => {
    // Navigate to chat with this contact
    navigate("/chat");
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setEditName(contact.contactName);
  };

  const handleSaveEdit = async () => {
    if (!editingContact || !editName.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:8080/user/updateContact/${editingContact.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactName: editName.trim(),
          }),
        }
      );

      if (response.ok) {
        const updatedContact = await response.json();
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === editingContact.id ? updatedContact : contact
          )
        );
        setEditingContact(null);
        setEditName("");
      } else {
        throw new Error("Failed to update contact");
      }
    } catch (err) {
      console.error("Error updating contact:", err);
      alert("Failed to update contact. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
    setEditName("");
  };

  const handleToggleBlock = async (contact: Contact) => {
    try {
      const response = await fetch(
        `http://localhost:8080/user/toggleBlockContact/${contact.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const updatedContact = await response.json();
        setContacts((prev) =>
          prev.map((c) => (c.id === contact.id ? updatedContact : c))
        );
      } else {
        throw new Error("Failed to toggle block status");
      }
    } catch (err) {
      console.error("Error toggling block status:", err);
      alert("Failed to update contact. Please try again.");
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        const response = await fetch(
          `http://localhost:8080/user/deleteContact/${contactId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setContacts((prev) =>
            prev.filter((contact) => contact.id !== contactId)
          );
        } else {
          throw new Error("Failed to delete contact");
        }
      } catch (err) {
        console.error("Error deleting contact:", err);
        alert("Failed to delete contact. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkbg">
      {/* Header */}
      <div className="bg-darkbg border-b border-chatbg p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToChat}
              className="p-2 text-gray-400 hover:text-foreground transition-colors duration-300 rounded-lg hover:bg-muted"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-400">Contacts</h1>
          </div>
          <button
            className="px-6 py-3 text-foreground flex items-center space-x-2 bg-primary2 hover:bg-primary2/75 rounded-full transition-all duration-300"
            onClick={handleAddContact}
          >
            <Plus size={20} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-chatbg text-white/90 placeholder-white/75 pl-12 pr-4 py-4 rounded-xl border border-dark2 focus:outline-none focus:ring-2 focus:ring-primary2/50 transition-all duration-300"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="px-6 pb-6 max-w-4xl mx-auto">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-2">
              {searchTerm ? "No contacts found" : "No contacts yet"}
            </div>
            <div className="text-muted-foreground/70 text-sm">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start by adding your first contact"}
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredContacts.map((contact, index) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                index={index}
                onContactClick={handleContactClick}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
                onToggleBlock={handleToggleBlock}
                isEditing={editingContact?.id === contact.id}
                editName={editName}
                onEditNameChange={setEditName}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ContactCardProps {
  contact: Contact;
  index: number;
  onContactClick: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: number) => void;
  onToggleBlock: (contact: Contact) => void;
  isEditing: boolean;
  editName: string;
  onEditNameChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  index,
  onContactClick,
  onEdit,
  onDelete,
  onToggleBlock,
  isEditing,
  editName,
  onEditNameChange,
  onSaveEdit,
  onCancelEdit,
}) => {
  // Debug: Log contact data
  console.log("ContactCard: Rendering avatar for contact:", {
    id: contact.id,
    name: contact.contactName,
    profileImageUrl: contact.profileImageUrl,
    hasProfileImage: !!contact.profileImageUrl,
  });

  return (
    <div className="group relative bg-chatbg backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-contact-card-hover hover:scale-105 hover:border-primary/20 transition-all duration-300 hover:shadow-contact-glow">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-center space-x-5">
        {/* Avatar */}
        <div className="flex-shrink-0 rounded-lg">
          <ProfileAvatar
            src={contact.profileImageUrl}
            alt={contact.contactName}
            size="xl"
            fallbackText={contact.contactName}
            showOnlineStatus={false}
            className="w-16 h-16 transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Contact Info */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => onEditNameChange(e.target.value)}
                className="bg-muted text-foreground px-4 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                autoFocus
              />
              <button
                onClick={onSaveEdit}
                className="p-2 text-green-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-300"
              >
                <Save size={18} />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-300"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => onContactClick(contact)}
              className="cursor-pointer"
            >
              <h3 className="text-white/90 font-semibold text-xl mb-1 group-hover:text-primary transition-colors duration-300 truncate">
                {contact.contactName}
              </h3>
              <div className="flex items-center space-x-2 text-white/90 text-sm mb-2">
                <Phone size={14} />
                <span>{contact.phoneNumber}</span>
              </div>
              {contact.isBlocked && (
                <div className="inline-flex items-center space-x-1 text-destructive text-xs bg-destructive/10 px-2 py-1 rounded-lg">
                  <Shield size={12} />
                  <span>Blocked</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 opacity-100 transition-opacity ">
          {!isEditing && (
            <>
              <button
                onClick={() => onContactClick(contact)}
                className="p-3 text-primary hover:text-primary-foreground hover:bg-primary rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                title="Start chat"
              >
                <MessageSquare size={18} />
              </button>
              <button
                onClick={() => onToggleBlock(contact)}
                className={`p-3 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl ${
                  contact.isBlocked
                    ? "text-green-500 hover:text-white hover:bg-green-500"
                    : "text-yellow-500 hover:text-white hover:bg-yellow-500"
                }`}
                title={contact.isBlocked ? "Unblock contact" : "Block contact"}
              >
                {contact.isBlocked ? (
                  <ShieldOff size={18} />
                ) : (
                  <Shield size={18} />
                )}
              </button>
              <button
                onClick={() => onEdit(contact)}
                className="p-3 text-blue-500 hover:text-white hover:bg-blue-500 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
                title="Edit contact"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => onDelete(contact.id)}
                className="p-3 text-red-500 hover:text-white hover:bg-red-500 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
                title="Delete contact"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
