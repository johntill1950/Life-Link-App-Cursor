import { useState, useEffect } from 'react';
// import { notificationService } from '@/lib/notificationService';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    phone: '',
    email: '',
    relationship: ''
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      // const savedContacts = await notificationService.getEmergencyContacts();
      setContacts([]);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone || !newContact.email || !newContact.relationship) {
      alert('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      const updatedContacts = [
        ...contacts,
        {
          ...newContact,
          id: Date.now().toString() // Temporary ID generation
        } as EmergencyContact
      ];
      // await notificationService.setEmergencyContacts(updatedContacts);
      setContacts(updatedContacts);
      setNewContact({
        name: '',
        phone: '',
        email: '',
        relationship: ''
      });
      alert('Contact added successfully!');
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to remove this contact?')) return;

    setSaving(true);
    try {
      const updatedContacts = contacts.filter(c => c.id !== contactId);
      // await notificationService.setEmergencyContacts(updatedContacts);
      setContacts(updatedContacts);
      alert('Contact removed successfully!');
    } catch (error) {
      console.error('Error removing contact:', error);
      alert('Failed to remove contact. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading contacts...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Emergency Contacts
      </h2>

      {/* Add new contact form */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
          Add New Contact
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={newContact.name}
            onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={newContact.phone}
            onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={newContact.email}
            onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Relationship"
            value={newContact.relationship}
            onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            onClick={handleAddContact}
            disabled={saving}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Adding...' : 'Add Contact'}
          </button>
        </div>
      </div>

      {/* List of contacts */}
      <div className="space-y-4">
        {contacts.map(contact => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{contact.name}</h4>
              <p className="text-sm text-gray-500">{contact.relationship}</p>
              <p className="text-sm text-gray-500">{contact.phone}</p>
              <p className="text-sm text-gray-500">{contact.email}</p>
            </div>
            <button
              onClick={() => handleRemoveContact(contact.id)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 