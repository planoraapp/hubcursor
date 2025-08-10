
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Profile = () => {
  const { username } = useParams<{ username: string }>();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Perfil de {username}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Página de perfil em desenvolvimento...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
