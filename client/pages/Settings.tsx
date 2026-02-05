import Layout from "@/components/neo10/Layout";
import { useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { getUser, clearToken, getToken } from "@/lib/auth";
import { Bell, Lock, Eye, LogOut, Save } from "lucide-react";

const SettingSection = memo(({ title, description, children }: any) => (
  <div className="rounded-lg border bg-card p-4 space-y-3">
    <div>
      <h3 className="font-semibold text-sm">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
    {children}
  </div>
));

SettingSection.displayName = "SettingSection";

function SettingsContent() {
  const user = getUser();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    messages: true,
  });
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    allowMessages: true,
  });

  const handleSaveProfile = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ bio }),
      });

      if (res.ok) {
        alert("Profile updated successfully");
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  }, [bio]);

  const handleLogout = useCallback(() => {
    if (confirm("Are you sure you want to logout?")) {
      clearToken();
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Layout>
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold">Settings</h1>

        {/* Profile Settings */}
        <SettingSection
          title="Profile"
          description="Manage your profile information"
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold">Name</label>
              <Input
                type="text"
                value={user?.name || ""}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full mt-1 min-h-20 rounded-md border bg-background p-2 text-sm"
                placeholder="Tell us about yourself..."
              />
            </div>
            <Button
              size="sm"
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection
          title="Notifications"
          description="Manage how you receive notifications"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Email Notifications</div>
                <p className="text-xs text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Push Notifications</div>
                <p className="text-xs text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, push: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Message Notifications</div>
                <p className="text-xs text-muted-foreground">
                  Get notified when you receive messages
                </p>
              </div>
              <Switch
                checked={notifications.messages}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, messages: checked })
                }
              />
            </div>
          </div>
        </SettingSection>

        {/* Privacy */}
        <SettingSection
          title="Privacy & Security"
          description="Control who can see your profile and contact you"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Public Profile</div>
                <p className="text-xs text-muted-foreground">
                  Allow others to see your profile
                </p>
              </div>
              <Switch
                checked={privacy.profilePublic}
                onCheckedChange={(checked) =>
                  setPrivacy({ ...privacy, profilePublic: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Allow Messages</div>
                <p className="text-xs text-muted-foreground">
                  Let anyone send you messages
                </p>
              </div>
              <Switch
                checked={privacy.allowMessages}
                onCheckedChange={(checked) =>
                  setPrivacy({ ...privacy, allowMessages: checked })
                }
              />
            </div>
          </div>
        </SettingSection>

        {/* Logout */}
        <SettingSection title="Account" description="Manage your account">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </SettingSection>
      </div>
    </Layout>
  );
}

export default memo(SettingsContent);
