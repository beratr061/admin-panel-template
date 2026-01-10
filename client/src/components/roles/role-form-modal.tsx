"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api-client";

// Validation schemas
const createRoleSchema = z.object({
  name: z.string().min(1, "Rol adı zorunludur"),
  description: z.string().optional(),
});

const updateRoleSchema = z.object({
  name: z.string().min(1, "Rol adı zorunludur").optional(),
  description: z.string().optional(),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;
type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
}

interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSuccess?: () => void;
}

// Create role
async function createRole(data: CreateRoleFormData): Promise<Role> {
  const response = await apiClient.post("/roles", data);
  return response.data;
}

// Update role
async function updateRole(id: string, data: UpdateRoleFormData): Promise<Role> {
  const response = await apiClient.put(`/roles/${id}`, data);
  return response.data;
}

export function RoleFormModal({
  open,
  onOpenChange,
  role,
  onSuccess,
}: RoleFormModalProps) {
  const isEditing = !!role;

  // Form setup
  const form = useForm<CreateRoleFormData | UpdateRoleFormData>({
    resolver: zodResolver(isEditing ? updateRoleSchema : createRoleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Reset form when role changes or modal opens
  React.useEffect(() => {
    if (open) {
      if (role) {
        form.reset({
          name: role.name,
          description: role.description || "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
        });
      }
    }
  }, [open, role, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success("Rol başarıyla oluşturuldu");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Rol oluşturulurken bir hata oluştu";
      toast.error(message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateRoleFormData) => updateRole(role!.id, data),
    onSuccess: () => {
      toast.success("Rol başarıyla güncellendi");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Rol güncellenirken bir hata oluştu";
      toast.error(message);
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Handle form submit
  const onSubmit = (data: CreateRoleFormData | UpdateRoleFormData) => {
    if (isEditing) {
      updateMutation.mutate(data as UpdateRoleFormData);
    } else {
      createMutation.mutate(data as CreateRoleFormData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Rol Düzenle" : "Yeni Rol"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Rol bilgilerini güncelleyin"
              : "Yeni bir rol oluşturun"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Rol Adı
            </label>
            <Input
              id="name"
              placeholder="Rol adı"
              disabled={isEditing && role?.isSystem}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
            {isEditing && role?.isSystem && (
              <p className="text-sm text-muted-foreground">
                Sistem rollerinin adı değiştirilemez
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Açıklama
            </label>
            <Input
              id="description"
              placeholder="Rol açıklaması (opsiyonel)"
              {...form.register("description")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
