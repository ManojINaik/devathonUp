"use client";
import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import Header from "../_components/Header";
import { Bell, Moon, Sun, Volume2, MessageSquare, Clock, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useUser();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/settings', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        setSettings(data);
        
        // Apply initial dark mode setting
        if (data.darkMode) {
          document.documentElement.classList.add('dark');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error("Failed to load settings. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSettingChange = async (key, value) => {
    if (!settings || !user) return;

    // Optimistically update UI
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      const updatedSettings = await response.json();
      if (updatedSettings.error) {
        throw new Error(updatedSettings.error);
      }

      // Apply dark mode changes
      if (key === 'darkMode') {
        document.documentElement.classList.toggle('dark', value);
      }

      // Handle sound changes
      if (key === 'sound') {
        if (!value) {
          // Mute all audio elements if sound is disabled
          document.querySelectorAll('audio').forEach(audio => {
            audio.muted = true;
          });
        } else {
          // Unmute audio elements if sound is enabled
          document.querySelectorAll('audio').forEach(audio => {
            audio.muted = false;
            audio.volume = settings.volume / 100;
          });
        }
      }

      // Handle volume changes
      if (key === 'volume') {
        document.querySelectorAll('audio').forEach(audio => {
          audio.volume = value / 100;
        });
      }

      // Handle notification changes
      if (key === 'notifications' && value) {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            throw new Error('Notification permission denied');
          }
        }
      }

      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} updated successfully`);
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error(`Failed to update ${key}. Please try again.`);
      
      // Revert the setting
      setSettings(prev => ({
        ...prev,
        [key]: !value
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const SettingItem = ({ icon: Icon, title, description, children }) => (
    <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="bg-primary/10 p-2 rounded-lg">
        <Icon className="text-primary h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header />
        <main className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-500">Please sign in to access settings</p>
          </div>
        </main>
      </div>
    );
  }

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header />
        <main className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your interview preferences and account settings</p>
          </div>

          <div className="divide-y divide-gray-100">
            <SettingItem
              icon={Moon}
              title="Dark Mode"
              description="Enable dark mode for better visibility in low light"
            >
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              />
            </SettingItem>

            <SettingItem
              icon={Bell}
              title="Notifications"
              description="Receive notifications about your interviews and feedback"
            >
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </SettingItem>

            <SettingItem
              icon={Volume2}
              title="Sound"
              description="Enable sound effects and voice responses"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-end space-x-2">
                  <Label htmlFor="sound">Sound Effects</Label>
                  <Switch
                    id="sound"
                    checked={settings.sound}
                    onCheckedChange={(checked) => handleSettingChange('sound', checked)}
                  />
                </div>
                {settings.sound && (
                  <div className="w-[200px]">
                    <Slider
                      value={[settings.volume]}
                      onValueChange={([value]) => handleSettingChange('volume', value)}
                      max={100}
                      step={1}
                    />
                  </div>
                )}
              </div>
            </SettingItem>

            <SettingItem
              icon={MessageSquare}
              title="Voice Response"
              description="Enable AI voice responses during interviews"
            >
              <Switch
                checked={settings.voiceResponse}
                onCheckedChange={(checked) => handleSettingChange('voiceResponse', checked)}
              />
            </SettingItem>

            <SettingItem
              icon={Clock}
              title="Interview Duration"
              description="Set default duration for interview sessions"
            >
              <div className="w-[200px]">
                <Slider
                  value={[settings.interviewDuration]}
                  onValueChange={([value]) => handleSettingChange('interviewDuration', value)}
                  max={60}
                  step={5}
                />
                <div className="text-right mt-1 text-sm text-gray-500">
                  {settings.interviewDuration} minutes
                </div>
              </div>
            </SettingItem>

            <SettingItem
              icon={Shield}
              title="Privacy Mode"
              description="Enable enhanced privacy features for your interviews"
            >
              <Switch
                checked={settings.privacyMode}
                onCheckedChange={(checked) => handleSettingChange('privacyMode', checked)}
              />
            </SettingItem>
          </div>

          <div className="p-6 border-t border-gray-100">
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
