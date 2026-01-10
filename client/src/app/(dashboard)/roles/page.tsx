"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Shield, MoreHorizontal, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { Can } from "@/components/auth";
import { ConfirmationModal } from "@/components/notifications";
import apiClient from "@/lib/api-client";
import { RoleFormModal, PermissionAssignmentModal } from "@/components/roles";

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
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  userCount: number;
  permissions: Permission[];
}

interface PaginatedRoles {
  data: Role[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Query keys
const roleKeys = {
  all: ["roles"] as const,
  list: (page: number, pageSize: number, search?: string) =>
    [...roleKeys.all, "list", { page, pageSize, search }] as const,
};

// Fetch roles
async function fetchRoles(
  page: number,
  pageSize: number,
  search?: string
): Promise<PaginatedRoles> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.append("search", search);

  const response = await apiClient.get<PaginatedRoles>(`/roles?${params}`);
  return response.data;
}

// Delete role
async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`/roles/${id}`);
}

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState("");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);

  // Fetch roles query
  const { data, isLoading } = useQuery({
    queryKey: roleKeys.list(page, pageSize, search),
    queryFn: () => fetchRoles(page, pageSize, search),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success("Rol başarıyla silindi");
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      setDeleteModalOpen(false);
      setSelectedRole(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Rol silinirken bir hata oluştu";
      toast.error(message);
    },
  });

  // Handle edit
  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setEditModalOpen(true);
  };

  // Handle permission assignment
  const handlePermissionAssignment = (role: Role) => {
    setSelectedRole(role);
    setPermissionModalOpen(true);
  };

  // Handle delete
  const handleDelete = (role: Role) => {
    if (role.isSystem) {
      toast.error("Sistem rolleri silinemez");
      return;
    }
    setSelectedRole(role);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedRole) {
      deleteMutation.mutate(selectedRole.id);
    }
  };

  // Table columns
  const columns: ColumnDef<Role>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rol Adı" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
          {row.original.isSystem && (
            <Badge variant="outline" className="text-xs">
              Sistem
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Açıklama",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.description || "-"}
        </span>
      ),
    },
    {
      accessorKey: "permissions",
      header: "İzinler",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Badge variant="secondary">
            {row.original.permissions.length} izin
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "userCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Kullanıcılar" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.userCount}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Oluşturulma" />
      ),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("tr-TR"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">İşlemler</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Can permission="roles.update">
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePermissionAssignment(row.original)}>
                <Shield className="mr-2 h-4 w-4" />
                İzin Ata
              </DropdownMenuItem>
            </Can>
            <Can permission="roles.delete">
              <DropdownMenuItem
                onClick={() => handleDelete(row.original)}
                className="text-destructive"
                disabled={row.original.isSystem}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </Can>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roller</h1>
          <p className="text-muted-foreground">
            Sistem rollerini ve izinlerini yönetin
          </p>
        </div>
        <Can permission="roles.create">
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Rol Ekle
          </Button>
        </Can>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50]}
        enableRowSelection
        enableColumnVisibility
        getRowId={(row) => row.id}
        filterConfigs={[
          {
            id: "search",
            label: "Ara",
            type: "text",
          },
        ]}
      />

      {/* Create Role Modal */}
      <RoleFormModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: roleKeys.all });
        }}
      />

      {/* Edit Role Modal */}
      <RoleFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        role={selectedRole}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: roleKeys.all });
          setSelectedRole(null);
        }}
      />

      {/* Permission Assignment Modal */}
      <PermissionAssignmentModal
        open={permissionModalOpen}
        onOpenChange={setPermissionModalOpen}
        role={selectedRole}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: roleKeys.all });
          setSelectedRole(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Rolü Sil"
        description={`"${selectedRole?.name}" rolünü silmek istediğinizden emin misiniz? Bu role sahip kullanıcılara varsayılan rol atanacaktır.`}
        confirmText="Sil"
        cancelText="İptal"
        variant="destructive"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
