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

interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

interface GroupedPermissions {
  [resource: string]: Permission[];
}

interface PermissionAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onSuccess?: () => void;
}

// Fetch all permissions grouped by resource
async function fetchGroupedPermissions(): Promise<GroupedPermissions> {
  const response = await apiClient.get("/permissions/grouped");
  return response.data;
}

// Assign permissions to role
async function assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
  await apiClient.put(`/roles/${roleId}/permissions`, { permissionIds });
}

export function PermissionAssignmentModal({
  open,
  onOpenChange,
  role,
  onSuccess,
}: PermissionAssignmentModalProps) {
  const [selectedPermissionIds, setSelectedPermissionIds] = React.useState<string[]>([]);

  // Fetch grouped permissions
  const { data: groupedPermissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["permissions", "grouped"],
    queryFn: fetchGroupedPermissions,
    enabled: open,
  });

  // Initialize selected permissions when role changes
  React.useEffect(() => {
    if (role && open) {
      setSelectedPermissionIds(role.permissions.map((p) => p.id));
    }
  }, [role, open]);

  // Assign permissions mutation
  const assignMutation = useMutation({
    mutationFn: () => assignPermissions(role!.id, selectedPermissionIds),
    onSuccess: () => {
      toast.success("İzinler başarıyla atandı");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "İzinler atanırken bir hata oluştu";
      toast.error(message);
    },
  });

  // Toggle permission selection
  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Toggle all permissions for a resource
  const toggleResourcePermissions = (resource: string, permissions: Permission[]) => {
    const resourcePermissionIds = permissions.map((p) => p.id);
    const allSelected = resourcePermissionIds.every((id) =>
      selectedPermissionIds.includes(id)
    );

    if (allSelected) {
      // Deselect all permissions for this resource
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !resourcePermissionIds.includes(id))
      );
    } else {
      // Select all permissions for this resource
      setSelectedPermissionIds((prev) => {
        const newIds = resourcePermissionIds.filter((id) => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  // Check if all permissions for a resource are selected
  const isResourceFullySelected = (permissions: Permission[]) => {
    return permissions.every((p) => selectedPermissionIds.includes(p.id));
  };

  // Check if some permissions for a resource are selected
  const isResourcePartiallySelected = (permissions: Permission[]) => {
    const selected = permissions.filter((p) => selectedPermissionIds.includes(p.id));
    return selected.length > 0 && selected.length < permissions.length;
  };

  // Handle save
  const handleSave = () => {
    assignMutation.mutate();
  };

  // Format action name for display
  const formatAction = (action: string) => {
    const actionMap: Record<string, string> = {
      create: "Oluştur",
      read: "Oku",
      update: "Güncelle",
      delete: "Sil",
    };
    return actionMap[action] || action;
  };

  // Format resource name for display
  const formatResource = (resource: string) => {
    const resourceMap: Record<string, string> = {
      users: "Kullanıcılar",
      roles: "Roller",
      permissions: "İzinler",
      dashboard: "Gösterge Paneli",
    };
    return resourceMap[resource] || resource.charAt(0).toUpperCase() + resource.slice(1);
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>İzin Ata</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{role.name}</span> rolüne izin atayın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2">
          {/* Current permissions count */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mevcut İzinler:</span>
            <Badge variant="secondary">{role.permissions.length} izin</Badge>
          </div>

          {/* Permission grid */}
          {isLoadingPermissions ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : groupedPermissions ? (
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                <div
                  key={resource}
                  className="border rounded-lg p-4 space-y-3"
                >
                  {/* Resource header with select all */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`resource-${resource}`}
                        checked={isResourceFullySelected(permissions)}
                        ref={(el) => {
                          if (el) {
                            (el as HTMLButtonElement).dataset.state = 
                              isResourcePartiallySelected(permissions) ? "indeterminate" : 
                              isResourceFullySelected(permissions) ? "checked" : "unchecked";
                          }
                        }}
                        onCheckedChange={() =>
                          toggleResourcePermissions(resource, permissions)
                        }
                      />
                      <label
                        htmlFor={`resource-${resource}`}
                        className="text-sm font-semibold cursor-pointer"
                      >
                        {formatResource(resource)}
                      </label>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {permissions.filter((p) => selectedPermissionIds.includes(p.id)).length}/
                      {permissions.length}
                    </Badge>
                  </div>

                  {/* Permission checkboxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-6">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={selectedPermissionIds.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <label
                          htmlFor={`permission-${permission.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {formatAction(permission.action)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">İzin bulunamadı</p>
          )}

          {/* Selected count */}
          <p className="text-sm text-muted-foreground">
            {selectedPermissionIds.length} izin seçildi
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
            disabled={assignMutation.isPending}
          >
            {assignMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
