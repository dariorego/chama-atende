import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import {
  useAdminCombinationGroupsWithOptions,
  useCreateCombinationGroup,
  useUpdateCombinationGroup,
  useDeleteCombinationGroup,
  useCreateCombinationOption,
  useUpdateCombinationOption,
  useDeleteCombinationOption,
  type CombinationGroup,
  type CombinationOption,
} from "@/hooks/useAdminCombinationGroups";
import { CombinationGroupFormDialog } from "@/components/admin/CombinationGroupFormDialog";
import { CombinationOptionFormDialog } from "@/components/admin/CombinationOptionFormDialog";

const SELECTION_TYPE_LABELS = {
  single: "Única",
  multiple: "Múltipla",
  quantity: "Quantidade",
};

export default function AdminCombinationGroups() {
  const { restaurant: settings } = useAdminSettings();
  const restaurantId = settings?.id;

  const { data: groups, isLoading } = useAdminCombinationGroupsWithOptions(restaurantId);
  const createGroup = useCreateCombinationGroup();
  const updateGroup = useUpdateCombinationGroup();
  const deleteGroup = useDeleteCombinationGroup();
  const createOption = useCreateCombinationOption();
  const updateOption = useUpdateCombinationOption();
  const deleteOption = useDeleteCombinationOption();

  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [optionFormOpen, setOptionFormOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CombinationGroup | null>(null);
  const [selectedOption, setSelectedOption] = useState<CombinationOption | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [deleteOptionId, setDeleteOptionId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleExpanded = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setGroupFormOpen(true);
  };

  const handleEditGroup = (group: CombinationGroup) => {
    setSelectedGroup(group);
    setGroupFormOpen(true);
  };

  const handleCreateOption = (groupId: string) => {
    setActiveGroupId(groupId);
    setSelectedOption(null);
    setOptionFormOpen(true);
  };

  const handleEditOption = (option: CombinationOption) => {
    setSelectedOption(option);
    setActiveGroupId(option.group_id);
    setOptionFormOpen(true);
  };

  const handleSubmitGroup = async (data: any) => {
    if (selectedGroup) {
      await updateGroup.mutateAsync({ id: selectedGroup.id, ...data });
    } else if (restaurantId) {
      await createGroup.mutateAsync({ restaurant_id: restaurantId, ...data });
    }
    setGroupFormOpen(false);
  };

  const handleSubmitOption = async (data: any) => {
    if (selectedOption) {
      await updateOption.mutateAsync({ id: selectedOption.id, ...data });
    } else if (activeGroupId) {
      await createOption.mutateAsync({ group_id: activeGroupId, ...data });
    }
    setOptionFormOpen(false);
  };

  const handleConfirmDeleteGroup = async () => {
    if (deleteGroupId) {
      await deleteGroup.mutateAsync(deleteGroupId);
      setDeleteGroupId(null);
    }
  };

  const handleConfirmDeleteOption = async () => {
    if (deleteOptionId) {
      await deleteOption.mutateAsync(deleteOptionId);
      setDeleteOptionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grupos de Combinação</h1>
          <p className="text-muted-foreground">
            Configure grupos e opções para personalização dos pedidos
          </p>
        </div>
        <Button onClick={handleCreateGroup}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      {groups?.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Nenhum grupo cadastrado</CardTitle>
            <CardDescription>
              Comece criando grupos como Queijos, Proteínas, Vegetais, Molhos, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleCreateGroup}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Grupo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups?.map((group) => (
            <Collapsible
              key={group.id}
              open={expandedGroups.has(group.id)}
              onOpenChange={() => toggleExpanded(group.id)}
            >
              <Card className={`bg-card ${!group.is_active ? "opacity-60" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-2 hover:text-primary transition-colors">
                      {expandedGroups.has(group.id) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <Badge variant="secondary">
                        {SELECTION_TYPE_LABELS[group.selection_type]}
                      </Badge>
                      {group.is_required && (
                        <Badge variant="outline" className="text-primary border-primary">
                          Obrigatório
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {group.options?.length || 0} opções
                      </Badge>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={group.is_active}
                        onCheckedChange={() =>
                          updateGroup.mutate({ id: group.id, is_active: !group.is_active })
                        }
                      />
                      <Button variant="outline" size="icon" onClick={() => handleEditGroup(group)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteGroupId(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {group.description && (
                    <CardDescription className="ml-7">{group.description}</CardDescription>
                  )}
                  <div className="ml-7 text-xs text-muted-foreground">
                    Seleções: {group.min_selections} - {group.max_selections || "∞"}
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="ml-7 space-y-2">
                      {group.options?.map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-center justify-between bg-surface rounded-lg p-3 ${
                            !option.is_active ? "opacity-60" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {option.emoji && (
                              <span className="text-2xl">{option.emoji}</span>
                            )}
                            <div>
                              <span className="font-medium">{option.name}</span>
                              {option.additional_price > 0 && (
                                <span className="ml-2 text-sm text-primary">
                                  +R$ {option.additional_price.toFixed(2)}
                                </span>
                              )}
                              {option.description && (
                                <p className="text-xs text-muted-foreground">
                                  {option.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={option.is_active}
                              onCheckedChange={() =>
                                updateOption.mutate({ id: option.id, is_active: !option.is_active })
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditOption(option)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteOptionId(option.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleCreateOption(group.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Opção
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}

      <CombinationGroupFormDialog
        open={groupFormOpen}
        onOpenChange={setGroupFormOpen}
        group={selectedGroup}
        onSubmit={handleSubmitGroup}
        isLoading={createGroup.isPending || updateGroup.isPending}
      />

      <CombinationOptionFormDialog
        open={optionFormOpen}
        onOpenChange={setOptionFormOpen}
        option={selectedOption}
        onSubmit={handleSubmitOption}
        isLoading={createOption.isPending || updateOption.isPending}
      />

      <AlertDialog open={!!deleteGroupId} onOpenChange={() => setDeleteGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as opções do grupo serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteGroup}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteOptionId} onOpenChange={() => setDeleteOptionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir opção?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteOption}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
