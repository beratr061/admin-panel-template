"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Shield, MoreHorizontal } from "lucide-react";
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
import { UserFormModal, RoleAssignmentModal } from "@/components/users";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: { id: string; name: string; description?: string }[];
}

interface PaginatedUsers {
  data: User[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Query keys
const userKeys = {
  all: ["users"] as const,
  list: (page: number, pageSize: number, search?: string) =>
    [...userKeys.all, "list", { page, pageSize, search }] as const,
};

// Fetch users
async function fetchUsers(
  page: number,
  pageSize: number,
  search?: string
): Promise<PaginatedUsers> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search) params.append("search", search);

  const response = await apiClient.get<PaginatedUsers>(`/users?${params}`);
  return response.data;
}

// Delete user
async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState("");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [roleModalOpen, setRoleModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  // Fetch users query
  const { data, isLoading } = useQuery({
    queryKey: userKeys.list(page, pageSize, search),
    queryFn: () => fetchUsers(page, pageSize, search),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("Kullanıcı başarıyla silindi");
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      setDeleteModalOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast.error("Kullanıcı silinirken bir hata oluştu");
    },
  });

  // Handle edit
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  // Handle role assignment
  const handleRoleAssignment = (user: User) => {
    setSelectedUser(user);
    setRoleModalOpen(true);
  };

  // Handle delete
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id);
    }
  };

  // Table columns
  const columns: ColumnDef<User>[] = [
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
        <DataTableColumnHeader column={column} title="Ad Soyad" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="E-posta" />
      ),
    },
    {
      accessorKey: "roles",
      header: "Roller",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role) => (
            <Badge key={role.id} variant="secondary">
              {role.name}
            </Badge>
          ))}
          {row.original.roles.length === 0 && (
            <span className="text-muted-foreground text-sm">Rol atanmamış</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Durum",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Aktif" : "Pasif"}
        </Badge>
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
            <Can permission="users.update">
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleAssignment(row.original)}>
                <Shield className="mr-2 h-4 w-4" />
                Rol Ata
              </DropdownMenuItem>
            </Can>
            <Can permission="users.delete">
              <DropdownMenuItem
                onClick={() => handleDelete(row.original)}
                className="text-destructive"
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
          <h1 className="text-2xl font-bold tracking-tight">Kullanıcılar</h1>
          <p className="text-muted-foreground">
            Sistem kullanıcılarını yönetin
          </p>
        </div>
        <Can permission="users.create">
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Kullanıcı Ekle
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

      {/* Create User Modal */}
      <UserFormModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: userKeys.all });
        }}
      />

      {/* Edit User Modal */}
      <UserFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        user={selectedUser}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: userKeys.all });
          setSelectedUser(null);
        }}
      />

      {/* Role Assignment Modal */}
      <RoleAssignmentModal
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
        user={selectedUser}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: userKeys.all });
          setSelectedUser(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Kullanıcıyı Sil"
        description={`"${selectedUser?.name}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        variant="destructive"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
