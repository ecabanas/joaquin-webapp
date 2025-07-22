import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Users, Mail } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, notifications, and list settings.
        </p>
      </header>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> Profile
            </CardTitle>
            <CardDescription>
              This is how others will see you on the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://placehold.co/100x100" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Button variant="outline">Change Photo</Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="jane.doe@example.com" />
              </div>
            </div>
            <Button>Save Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" /> Notifications
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="item-added" className="font-semibold">Item Added</Label>
                <p className="text-sm text-muted-foreground">When someone adds an item to the list.</p>
              </div>
              <Switch id="item-added" defaultChecked />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="item-checked" className="font-semibold">Item Checked Off</Label>
                <p className="text-sm text-muted-foreground">When an item is marked as purchased.</p>
              </div>
              <Switch id="item-checked" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Sharing
            </CardTitle>
            <CardDescription>Manage who has access to your list.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-4">
                <Label htmlFor="invite-email" className="sr-only">Invite by email</Label>
                <Input id="invite-email" placeholder="partner@example.com" type="email" />
                <Button>Send Invite</Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">People with access</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Avatar>
                    <AvatarImage src="https://placehold.co/40x40" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">Jane Doe (you)</span>
                </div>
                <span className="text-sm text-muted-foreground">Owner</span>
              </div>
               <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Avatar>
                    <AvatarImage src="https://placehold.co/40x40" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">John Doe</span>
                </div>
                <Button variant="ghost" size="sm">Remove</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
