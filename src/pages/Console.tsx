
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Console = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>My Account</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Account information will appear here.</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Hotel Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Hotel activities will appear here.</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Friends Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Friends activities will appear here.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Console;
