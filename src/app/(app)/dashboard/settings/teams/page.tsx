"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  MoreVertical,
  Mail,
  Crown,
  Shield,
  User,
  X,
  Loader2,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InviteMemberDialog } from "@/components/dashboard/teams/invite-member-dialog";
import { UpdateRoleDialog } from "@/components/dashboard/teams/update-role-dialog";
import { RemoveMemberDialog } from "@/components/dashboard/teams/remove-member-dialog";
import {
  getTeamMembers,
  getPendingInvitations,
  getCurrentMemberRole,
  cancelInvitation,
} from "@/server/teams";
import { CreateOrganizationDialog } from "@/components/dashboard/teams/create-organization-dialog";

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type Member = {
  id: string;
  role: "owner" | "admin" | "member";
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

type Invitation = {
  id: string;
  email: string;
  role: string | null;
  status: string;
  expiresAt: Date;
};

export default function TeamsSettingsPage() {
  const { data: session } = authClient.useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [currentRole, setCurrentRole] = useState<
    "owner" | "admin" | "member" | null
  >(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [updateRoleDialogOpen, setUpdateRoleDialogOpen] = useState(false);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [createOrgDialogOpen, setCreateOrgDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [cancelingInvite, setCancelingInvite] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string>("");

  const canManageMembers = currentRole === "owner" || currentRole === "admin";
  const canChangeRoles = currentRole === "owner";
  const hasOrganization = session?.session?.activeOrganizationId;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersResult, invitationsResult, roleResult] = await Promise.all([
        getTeamMembers(),
        getPendingInvitations(),
        getCurrentMemberRole(),
      ]);

      if (membersResult.success && membersResult.members) {
        setMembers(membersResult.members as Member[]);
      }

      if (invitationsResult.success && invitationsResult.invitations) {
        setInvitations(invitationsResult.invitations as Invitation[]);
      }

      if (roleResult.success && roleResult.role) {
        setCurrentRole(roleResult.role);
      }

      // Fetch organization name
      if (session?.session?.activeOrganizationId) {
        const orgs = await authClient.organization.list();
        const activeOrg = orgs.data?.find(
          (org: any) => org.id === session.session.activeOrganizationId,
        );
        if (activeOrg) {
          setOrganizationName(activeOrg.name);
        }
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelInvitation = async (invitationId: string) => {
    setCancelingInvite(invitationId);
    try {
      const result = await cancelInvitation(invitationId);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Invitation canceled");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel invitation");
    } finally {
      setCancelingInvite(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />;
      case "admin":
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      owner: "default",
      admin: "secondary",
      member: "outline",
    };

    return (
      <Badge variant={variants[role] || "outline"} className="capitalize gap-1">
        {getRoleIcon(role)}
        {role}
      </Badge>
    );
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl lg:text-4xl tracking-tight">
              Teams
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your team members and their permissions
            </p>
          </div>
          {canManageMembers && session?.session?.activeOrganizationId ? (
            <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          ) : !session?.session?.activeOrganizationId ? (
            <Button
              onClick={() => setCreateOrgDialogOpen(true)}
              className="gap-2"
            >
              <Building2 className="h-4 w-4" />
              Create Organization
            </Button>
          ) : null}
        </div>
      </div>

      {/* Team Members */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members ({members.length})
          </h2>
        </div>
        <div className="divide-y">
          {members.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                No team members yet
              </p>
              {!session?.session?.activeOrganizationId && (
                <Button
                  onClick={() => setCreateOrgDialogOpen(true)}
                  variant="outline"
                  className="gap-2"
                >
                  Create Organization
                </Button>
              )}
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="p-4 flex items-center justify-between hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.user.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.user.name, member.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {member.user.name || "Unnamed User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getRoleBadge(member.role)}
                  {session?.user?.id !== member.user.id && canManageMembers && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canChangeRoles && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMember(member);
                                setUpdateRoleDialogOpen(true);
                              }}
                            >
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedMember(member);
                            setRemoveMemberDialogOpen(true);
                          }}
                        >
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      {canManageMembers && invitations.length > 0 && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Pending Invitations ({invitations.length})
            </h2>
          </div>
          <div className="divide-y">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="p-4 flex items-center justify-between hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{invitation.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited as {invitation.role || "member"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Pending</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCancelInvitation(invitation.id)}
                    disabled={cancelingInvite === invitation.id}
                  >
                    {cancelingInvite === invitation.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {session?.session?.activeOrganizationId && (
        <InviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          organizationId={session.session.activeOrganizationId}
          onSuccess={fetchData}
        />
      )}

      <CreateOrganizationDialog
        open={createOrgDialogOpen}
        onOpenChange={setCreateOrgDialogOpen}
        onSuccess={fetchData}
      />

      {selectedMember && (
        <>
          <UpdateRoleDialog
            open={updateRoleDialogOpen}
            onOpenChange={setUpdateRoleDialogOpen}
            member={selectedMember}
            onSuccess={fetchData}
          />
          <RemoveMemberDialog
            open={removeMemberDialogOpen}
            onOpenChange={setRemoveMemberDialogOpen}
            member={selectedMember}
            onSuccess={fetchData}
          />
        </>
      )}
    </div>
  );
}
