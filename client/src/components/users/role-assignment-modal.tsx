"use client";

import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  name: string;
  roles: { id: string; name: string }[];
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  userCount?: number;
}

interface RoleAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

// Fetch all roles
async function fetchRoles(): Promise<{ data: Role[] }> {
  const response = await apiClient.get("/roles?pageSize=100");
  return response.data;
}

// Assign roles to user
async function assignRoles(userId: string, roleIds: string[]): Promise<void> {
  await apiClient.put(`/users/${userId}/roles`, { roleIds });
}

export function RoleAssignmentModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: RoleAssignmentModalProps) {
  const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>([]);

  // Fetch roles
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles", "list"],
    queryFn: fetchRoles,
    enabled: open,
  });

  const roles = rolesData?.data ?? [];

  // Initialize selected roles when user changes
  React.useEffect(() => {
    if (user && open) {
      setSelectedRoleIds(user.roles.map((r) => r.id));
    }
  }, [user, open]);

  // Assign roles mutation
  const assignMutation = useMutation({
    mutationFn: () => assignRoles(user!.id, selectedRoleIds),
    onSuccess: () => {
      toast.success("Roller başarıyla atandı");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Roller atanırken bir hata oluştu";
      toast.error(message);
    },
  });

  // Toggle role selection
  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Handle save
  const handleSave = () => {
    assignMutation.mutate();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rol Ata</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{user.name}</span> kullanıcısına rol atayın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current roles */}
          <div>
            <p className="text-sm font-medium mb-2">Mevcut Roller:</p>
            <div className="flex flex-wrap gap-1">
              {user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  Rol atanmamış
                </span>
              )}
            </div>
          </div>

          {/* Role selection */}
          <div>
            <p className="text-sm font-medium mb-2">Roller:</p>
            {isLoadingRoles ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoleIds.includes(role.id)}
                        onCheckedChange={() => toggleRole(role.id)}
                      />
                      <div>
                        <label
                          htmlFor={`role-${role.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {role.name}
                        </label>
                        {role.description && (
                          <p className="text-xs text-muted-foreground">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {role.isSystem && (
                      <Badge variant="outline" className="text-xs">
                        Sistem
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected count */}
          <p className="text-sm text-muted-foreground">
            {selectedRoleIds.length} rol seçildi
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assignMutation.isPending}
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={assignMutation.isPending || selectedRoleIds.length === 0}
          >
            {assignMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
