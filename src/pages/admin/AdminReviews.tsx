import { useState } from "react";
import { Star, Store, HeadphonesIcon, UtensilsCrossed, BarChart3, Search, Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ReviewCard } from "@/components/admin/ReviewCard";
import { ReviewResponseDialog } from "@/components/admin/ReviewResponseDialog";
import {
  useAdminReviews,
  useReviewStats,
  useUpdateReviewStatus,
  useToggleFeatured,
  useRespondToReview,
  useDeleteReview,
  CustomerReview,
} from "@/hooks/useAdminReviews";

const StatCard = ({
  icon,
  label,
  value,
  subLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subLabel?: string;
}) => (
  <Card className="bg-card border-border">
    <CardContent className="p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {subLabel && <p className="text-xs text-muted-foreground">{subLabel}</p>}
      </div>
    </CardContent>
  </Card>
);

const AdminReviews = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [respondingReview, setRespondingReview] = useState<CustomerReview | null>(null);

  const { data: reviews = [], isLoading } = useAdminReviews(activeTab);
  const { data: stats } = useReviewStats();
  const updateStatus = useUpdateReviewStatus();
  const toggleFeatured = useToggleFeatured();
  const respondToReview = useRespondToReview();
  const deleteReview = useDeleteReview();

  const filteredReviews = reviews.filter((review) =>
    review.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePublish = (id: string) => {
    updateStatus.mutate({ id, status: 'published' });
  };

  const handleArchive = (id: string) => {
    updateStatus.mutate({ id, status: 'archived' });
  };

  const handleToggleFeatured = (id: string, featured: boolean) => {
    toggleFeatured.mutate({ id, is_featured: featured });
  };

  const handleRespond = (data: { id: string; response: string; publish: boolean; feature: boolean }) => {
    respondToReview.mutate(
      { id: data.id, response: data.response, publish: data.publish, feature: data.feature },
      { onSuccess: () => setRespondingReview(null) }
    );
  };

  const handleDelete = (id: string) => {
    deleteReview.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
        <p className="text-muted-foreground">Veja o feedback dos clientes e acompanhe métricas de satisfação</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={<Star className="h-6 w-6 text-yellow-500" />}
          label="Média Geral"
          value={stats?.averageOverall.toFixed(1) || "0.0"}
          subLabel={`${stats?.total || 0} avaliações`}
        />
        <StatCard
          icon={<Store className="h-5 w-5 text-primary" />}
          label="Ambiente"
          value={stats?.averageAmbiente.toFixed(1) || "0.0"}
        />
        <StatCard
          icon={<HeadphonesIcon className="h-5 w-5 text-primary" />}
          label="Atendimento"
          value={stats?.averageAtendimento.toFixed(1) || "0.0"}
        />
        <StatCard
          icon={<UtensilsCrossed className="h-5 w-5 text-primary" />}
          label="Comida"
          value={stats?.averageComida.toFixed(1) || "0.0"}
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
          label="Total"
          value={stats?.total || 0}
          subLabel={`${stats?.pending || 0} pendentes`}
        />
      </div>

      {/* Tabs and Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList className="bg-surface">
            <TabsTrigger value="pending" className="gap-2">
              Pendentes
              {stats?.pending ? (
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 text-xs px-1.5">
                  {stats.pending}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="published">Publicadas</TabsTrigger>
            <TabsTrigger value="archived">Arquivadas</TabsTrigger>
            <TabsTrigger value="featured" className="gap-2">
              Destaques
              {stats?.featured ? (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 text-xs px-1.5">
                  {stats.featured}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface border-border"
            />
          </div>
        </div>

        {/* Reviews List */}
        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação encontrada</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {search
                    ? "Nenhuma avaliação corresponde à sua busca."
                    : activeTab === "pending"
                    ? "Não há avaliações pendentes de moderação."
                    : activeTab === "featured"
                    ? "Você ainda não destacou nenhuma avaliação."
                    : "Nenhuma avaliação nesta categoria."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onRespond={setRespondingReview}
                  onPublish={handlePublish}
                  onArchive={handleArchive}
                  onToggleFeatured={handleToggleFeatured}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <ReviewResponseDialog
        review={respondingReview}
        open={!!respondingReview}
        onOpenChange={(open) => !open && setRespondingReview(null)}
        onSubmit={handleRespond}
        isSubmitting={respondToReview.isPending}
      />
    </div>
  );
};

export default AdminReviews;
