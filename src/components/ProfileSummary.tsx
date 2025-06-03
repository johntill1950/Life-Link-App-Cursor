import React from 'react';

interface ProfileSummaryProps {
  profile: {
    full_name: string;
    address1: string;
    address2?: string;
    address3?: string;
    country?: string;
    postal_code?: string;
    emergency_contact1_name?: string;
    emergency_contact1_phone?: string;
    emergency_contact1_email?: string;
    emergency_contact2_name?: string;
    emergency_contact2_phone?: string;
    emergency_contact2_email?: string;
    medical_history?: string;
    medications?: string;
    special_notes?: string;
  };
}

export default function ProfileSummary({ profile }: ProfileSummaryProps) {
  const composeAddress = () => {
    return [profile.address1, profile.address2, profile.address3, profile.country, profile.postal_code]
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-8 border-red-400 mb-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Emergency Information</h2>

      <div className="space-y-6">
        {/* Emergency Contacts */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Emergency Contacts</h3>
          <div className="space-y-4">
            {profile.emergency_contact1_name && (
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{profile.emergency_contact1_name}</p>
                <p className="text-gray-700 dark:text-gray-300">{profile.emergency_contact1_phone}</p>
                {profile.emergency_contact1_email && (
                  <p className="text-gray-700 dark:text-gray-300">{profile.emergency_contact1_email}</p>
                )}
              </div>
            )}
            {profile.emergency_contact2_name && (
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{profile.emergency_contact2_name}</p>
                <p className="text-gray-700 dark:text-gray-300">{profile.emergency_contact2_phone}</p>
                {profile.emergency_contact2_email && (
                  <p className="text-gray-700 dark:text-gray-300">{profile.emergency_contact2_email}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Medical Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Medical Information</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Medical History</h4>
              <p className="text-gray-700 dark:text-gray-300 break-words">
                {profile.medical_history || 'No medical history provided'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Current Medications</h4>
              <p className="text-gray-700 dark:text-gray-300 break-words">
                {profile.medications || 'No medications listed'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Special Notes</h4>
              <p className="text-gray-700 dark:text-gray-300 break-words">
                {profile.special_notes || 'No special notes provided'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 