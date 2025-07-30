
'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/auth-context';
import { User, Bell, Users, Loader2, Landmark, Mail, Send, Trash2, Copy } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import { createInvite, getInvitesForWorkspace, getMembersForWorkspace, deleteInvite } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import type { WorkspaceMember, Invite } from '@/lib/types';


export default function SettingsPage() {
  const { user, userProfile, loading } from useAuth();
  const { currency, setCurrency } = useCurrency();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const { toast } = useToast();
  
  const workspaceId = userProfile?.workspaceId;

  useEffect(() => {
    if (!workspaceId) return;
    
    const unsubscribeMembers = getMembersForWorkspace(workspaceId, setMembers);
    const unsubscribeInvites = getInvitesForWorkspace(workspaceId, setInvites);

    return () => {
      unsubscribeMembers();
      unsubscribeInvites();
    }
  }, [workspaceId]);


  if (loading || !user || !userProfile || !workspaceId) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name = '') => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || <User className="w-5 h-5" />;
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !inviteEmail) return;
    
    setIsInviting(true);
    try {
      const inviteUrl = await createInvite(workspaceId, inviteEmail);

      navigator.clipboard.writeText(inviteUrl);

      toast({
        title: 'Invitation Sent (Copied to Clipboard!)',
        description: `An invite for ${inviteEmail} has been created. The URL has been copied to your clipboard.`,
      });
      setInviteEmail('');
    } catch (error: any) {
       toast({
        title: 'Invite Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  }

  const handleCopyInvite = (token: string) => {
    const inviteUrl = `${window.location.origin}/signup?inviteToken=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: 'Link Copied!',
      description: 'The invitation link has been copied to your clipboard.',
    });
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (!workspaceId) return;
    if (window.confirm('Are you sure you want to delete this invitation?')) {
      try {
        await deleteInvite(workspaceId, inviteId);
        toast({
          title: 'Invitation Deleted',
          description: 'The pending invitation has been removed.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Could not delete the invitation.',
          variant: 'destructive',
        });
      }
    }
  };


  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="space-y-1.5 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </header>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="w-6 h-6" />
              <span className="text-2xl">Profile</span>
            </CardTitle>
            <CardDescription>
              This is how others will see you on the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />
                <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
              </Avatar>
              <Button variant="outline">Change Photo</Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={userProfile.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email || ''} readOnly disabled/>
              </div>
            </div>
          </CardContent>
          <CardFooter>
             <Button>Save Profile</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Landmark className="w-6 h-6" />
              <span className="text-2xl">Currency</span>
            </CardTitle>
            <CardDescription>Choose your preferred currency.</CardDescription>
          </CardHeader>
          <CardContent>
             <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bell className="w-6 h-6" />
              <span className="text-2xl">Notifications</span>
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="item-added" className="font-semibold text-base">Item Added</Label>
                <p className="text-sm text-muted-foreground">When someone adds an item to the list.</p>
              </div>
              <Switch id="item-added" defaultChecked />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="item-checked" className="font-semibold text-base">Item Checked Off</Label>
                <p className="text-sm text-muted-foreground">When an item is marked as purchased.</p>
              </div>
              <Switch id="item-checked" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <span className="text-2xl">Sharing</span>
            </CardTitle>
            <CardDescription>Manage who has access to your list.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <form onSubmit={handleInvite} className="flex items-center gap-2">
                <Label htmlFor="invite-email" className="sr-only">Invite by email</Label>
                <Input 
                    id="invite-email" 
                    placeholder="partner@example.com" 
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isInviting}
                />
                <Button type="submit" disabled={isInviting || !inviteEmail}>
                    {isInviting ? <Loader2 className="animate-spin" /> : <Send />}
                    <span className="sr-only">Invite</span>
                </Button>
            </form>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium">People with access</h4>
              <ul className="space-y-3">
                 {members.map(member => (
                    <li key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={member.photoURL} alt={member.name} />
                                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.id === user.uid ? 'you' : member.email}</p>
                            </div>
                        </div>
                        <span className="text-sm text-muted-foreground capitalize">{member.role}</span>
                    </li>
                 ))}
              </ul>

              {invites.length > 0 && (
                <>
                  <Separator />
                  <h4 className="font-medium">Pending Invitations</h4>
                   <ul className="space-y-3">
                    {invites.map(invite => (
                        <li key={invite.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <Mail className="text-muted-foreground" />
                                </Avatar>
                                <div>
                                    <p className="font-medium">{invite.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleCopyInvite(invite.token)}>
                                    <Copy className="h-4 w-4" />
                                    <span className="sr-only">Copy invite link</span>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteInvite(invite.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Delete invitation</span>
                                </Button>
                            </div>
                        </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
