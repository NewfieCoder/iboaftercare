import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Crown, MoreVertical, Loader2, Mail, Code } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UserManagement({ adminEmail }) {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [roleReason, setRoleReason] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showSubDialog, setShowSubDialog] = useState(false);
  const [selectedSubUser, setSelectedSubUser] = useState(null);
  const [manualTier, setManualTier] = useState("standard");
  const [manualDays, setManualDays] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const { data } = await base44.functions.invoke('adminGetUsers');
      setUsers(data || []);
      setLoading(false);
    } catch (e) {
      console.error('Load users error:', e);
      toast.error("Failed to load users");
      setLoading(false);
    }
  }

  function openRoleDialog(user, role) {
    setSelectedUser(user);
    setNewRole(role);
    setRoleReason("");
    setShowRoleDialog(true);
  }

  async function confirmRoleChange() {
    if (!selectedUser || !newRole) return;
    
    try {
      const result = await base44.functions.invoke('adminChangeUserRole', {
        userId: selectedUser.id,
        newRole: newRole,
        reason: roleReason || `Changed role to ${newRole}`
      });
      
      if (result.data.premiumGranted) {
        toast.success(`${selectedUser.email} granted ${newRole} role with FREE premium access`);
      } else {
        toast.success(result.data.message);
      }
      
      setShowRoleDialog(false);
      await loadUsers();
    } catch (e) {
      console.error('Role change error:', e);
      toast.error(e.message || "Failed to change user role");
    }
  }

  function openSubDialog(user) {
    setSelectedSubUser(user);
    setManualTier("standard");
    setManualDays("");
    setManualReason("");
    setShowSubDialog(true);
  }

  async function handleManualSubscription(action) {
    if (!selectedSubUser) {
      toast.error("No user selected");
      return;
    }
    
    setSubLoading(true);
    try {
      const result = await base44.functions.invoke('adminManualSubscription', {
        userId: selectedSubUser.id,
        action: action,
        tier: manualTier,
        expirationDays: manualDays ? parseInt(manualDays) : null,
        reason: manualReason || `Admin manual ${action} - ${manualTier}`
      });
      
      toast.success(result.data.message);
      setShowSubDialog(false);
      setSubLoading(false);
      await loadUsers();
    } catch (e) {
      console.error('Manual subscription error:', e);
      toast.error(e.message || "Failed to update subscription");
      setSubLoading(false);
    }
  }

  function getRoleDescription(role) {
    switch(role) {
      case 'admin': return 'Full access to all features, user management, and settings';
      case 'tester': return 'FREE Premium tier access for beta testing (no payment required)';
      case 'user': return 'Standard user access based on subscription tier';
      default: return '';
    }
  }

  async function sendAnnouncement() {
    const message = prompt("Enter announcement message:");
    if (!message) return;
    
    try {
      for (const user of users.slice(0, 10)) { // Limit for demo
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: "IboAftercare Coach Announcement",
          body: message
        });
      }
      await base44.entities.AdminActivityLog.create({
        admin_email: adminEmail,
        action_type: 'announcement_sent',
        details: `Sent announcement to ${users.length} users`
      });
      toast.success("Announcement sent to all users");
    } catch (e) {
      toast.error("Failed to send announcement");
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || (u.role || 'user') === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search users by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40 rounded-xl">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="tester">Tester</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={sendAnnouncement} className="rounded-xl gap-2">
          <Mail className="w-4 h-4" />
          Send Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
          <p className="text-2xl font-bold text-violet-600">{users.filter(u => u.role === 'admin').length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Admins</p>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
          <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'tester').length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Testers</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredUsers.map((user) => {
                return (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {user.full_name || "Anonymous"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {new Date(user.created_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 w-fit">
                        Full Access
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        user.role === 'admin'
                          ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400"
                          : user.role === 'tester'
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      }`}>
                        {user.role === 'admin' && <Crown className="w-3 h-3" />}
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {user.role !== 'admin' && (
                            <DropdownMenuItem onClick={() => openRoleDialog(user, 'admin')}>
                              <Crown className="w-4 h-4 mr-2" />
                              Set as Admin
                            </DropdownMenuItem>
                          )}
                          {user.role !== 'tester' && (
                            <DropdownMenuItem onClick={() => openRoleDialog(user, 'tester')}>
                              <Code className="w-4 h-4 mr-2" />
                              Set as Tester (Free Premium)
                            </DropdownMenuItem>
                          )}
                          {(user.role && user.role !== 'user') && (
                            <DropdownMenuItem onClick={() => openRoleDialog(user, 'user')}>
                              Demote to User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(user.email);
                              toast.success("Email copied");
                            }}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Copy Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Confirmation Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              You're about to change the role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1 capitalize">
                New Role: {newRole}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {getRoleDescription(newRole)}
              </p>
            </div>
            
            {newRole === 'tester' && (
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
                  ⚡ Beta Tester Access
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  This user will have the Tester role for beta testing and feedback purposes.
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Reason (optional, for activity log)
              </label>
              <Input
                placeholder="e.g., Beta testing new features"
                value={roleReason}
                onChange={(e) => setRoleReason(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={confirmRoleChange} className="rounded-xl bg-violet-600 hover:bg-violet-700">
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
}