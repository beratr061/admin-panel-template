"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import apiClient from "@/lib/api-client";

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  name: z.string().min(1, "Ad soyad zorunludur"),
  isActive: z.boolean().default(true),
  roleIds: z.array(z.string()).optional(),
});

const updateUserSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin").optional(),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır").optional().or(z.literal("")),
  name: z.string().min(1, "Ad soyad zorunludur").optional(),
  isActive: z.boolean().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  roles: { id: string; name: string }[];
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess?: () => void;
}

// Fetch roles for selection
async function fetchRoles(): Promise<{ data: Role[] }> {
  const response = await apiClient.get("/roles?pageSize=100");
  return response.data;
}

// Create user
async function createUser(data: CreateUserFormData): Promise<User> {
  const response = await apiClient.post("/users", data);
  return response.data;
}

// Update user
async function updateUser(id: string, data: UpdateUserFormData): Promise<User> {
  // Remove empty password from update
  const payload = { ...data };
  if (!payload.password) {
    delete payload.password;
  }
  const response = await apiClient.put(`/users/${id}`, payload);
  return response.data;
}

export function UserFormModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserFormModalProps) {
  const isEditing = !!user;

  // Fetch roles
  const { data: rolesData } = useQuery({
    queryKey: ["roles", "list"],
    queryFn: fetchRoles,
    enabled: open,
  });

  const roles = rolesData?.data ?? [];

  // Form setup
  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      isActive: true,
      roleIds: [],
    },
  });

  // Reset form when user changes or modal opens
  React.useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          email: user.email,
          password: "",
          name: user.name,
          isActive: user.isActive,
        });
      } else {
        form.reset({
          email: "",
          password: "",
          name: "",
          isActive: true,
          roleIds: [],
        });
      }
    }
  }, [open, user, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("Kullanıcı başarıyla oluşturuldu");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Kullanıcı oluşturulurken bir hata oluştu";
      toast.error(message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserFormData) => updateUser(user!.id, data),
    onSuccess: () => {
      toast.success("Kullanıcı başarıyla güncellendi");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Kullanıcı güncellenirken bir hata oluştu";
      toast.error(message);
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Handle form submit
  const onSubmit = (data: CreateUserFormData | UpdateUserFormData) => {
    if (isEditing) {
      updateMutation.mutate(data as UpdateUserFormData);
    } else {
      createMutation.mutate(data as CreateUserFormData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Kullanıcı bilgilerini güncelleyin"
              : "Yeni bir kullanıcı oluşturun"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Ad Soyad
            </label>
            <Input
              id="name"
              placeholder="Ad Soyad"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-posta
            </label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Şifre {isEditing && "(boş bırakılırsa değişmez)"}
            </label>
            <Input
              id="password"
              type="password"
              placeholder={isEditing ? "••••••" : "En az 6 karakter"}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={form.watch("isActive")}
              onCheckedChange={(checked) =>
                form.setValue("isActive", checked as boolean)
              }
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Aktif
            </label>
          </div>

          {/* Roles (only for create) */}
          {!isEditing && roles.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Roller</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={(form.watch("roleIds") as string[] || []).includes(role.id)}
                      onCheckedChange={(checked) => {
                        const currentRoles = (form.getValues("roleIds") as string[]) || [];
                        if (checked) {
                          form.setValue("roleIds", [...currentRoles, role.id]);
                        } else {
                          form.setValue(
                            "roleIds",
                            currentRoles.filter((id) => id !== role.id)
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={`role-${role.id}`}
                      className="text-sm leading-none"
                    >
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

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
