import { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, FileSpreadsheet, Image as ImageIcon, CheckCircle2, XCircle, Info, CloudDownload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { parseCSVToObjects, toCSV, downloadCSV, parseBool, parseNumber, slugify } from '@/lib/csv';

const BUCKET = 'imagens';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const publicUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

type LogEntry = { ok: boolean; message: string };

export default function AdminImport() {
  const { tenantId, slug: tenantSlug } = useTenant();
  const { toast } = useToast();
  const { data: categories = [], refetch: refetchCategories } = useAdminCategories();
  const { data: products = [], refetch: refetchProducts } = useAdminProducts();

  const categoryFileRef = useRef<HTMLInputElement>(null);
  const productFileRef = useRef<HTMLInputElement>(null);
  const imagesFileRef = useRef<HTMLInputElement>(null);

  const [catLog, setCatLog] = useState<LogEntry[]>([]);
  const [prodLog, setProdLog] = useState<LogEntry[]>([]);
  const [imgLog, setImgLog] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [migrateLog, setMigrateLog] = useState<LogEntry[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrateStatus, setMigrateStatus] = useState<string | null>(null);

  // ---------- Templates ----------
  const downloadCategoryTemplate = () => {
    const csv = toCSV(
      ['name', 'description', 'display_order', 'is_active'],
      [
        ['Entradas', 'Petiscos e aperitivos', 1, 'sim'],
        ['Pratos Principais', 'Pratos servidos individualmente', 2, 'sim'],
        ['Bebidas', 'Sucos, refrigerantes e drinks', 3, 'sim'],
      ],
    );
    downloadCSV('modelo-categorias.csv', csv);
  };

  const downloadProductTemplate = () => {
    const exampleCategory = categories[0]?.name ?? 'Pratos Principais';
    const csv = toCSV(
      [
        'name',
        'category_name',
        'description',
        'price',
        'promotional_price',
        'image_url',
        'is_active',
        'is_highlight',
        'is_orderable',
        'show_on_display',
        'display_order',
      ],
      [
        [
          'Filé ao Molho Madeira',
          exampleCategory,
          'Filé mignon grelhado com molho especial e fritas',
          49.9,
          39.9,
          'produtos/file-madeira.jpg',
          'sim',
          'sim',
          'sim',
          'nao',
          1,
        ],
        [
          'Suco de Laranja Natural',
          'Bebidas',
          'Copo 400ml',
          9.5,
          '',
          `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/produtos/suco-laranja.jpg`,
          'sim',
          'nao',
          'sim',
          'sim',
          1,
        ],
      ],
    );
    downloadCSV('modelo-produtos.csv', csv);
  };

  // ---------- Import Categories ----------
  const handleCategoryUpload = async (file: File) => {
    if (!tenantId) return;
    setIsProcessing(true);
    const log: LogEntry[] = [];
    try {
      const text = await file.text();
      const rows = parseCSVToObjects(text);
      if (rows.length === 0) throw new Error('CSV vazio');

      const existing = new Map(categories.map((c) => [c.name.toLowerCase(), c]));

      for (const [idx, row] of rows.entries()) {
        const name = (row.name || '').trim();
        if (!name) {
          log.push({ ok: false, message: `Linha ${idx + 2}: nome vazio, pulada.` });
          continue;
        }
        const payload = {
          restaurant_id: tenantId,
          name,
          slug: slugify(name),
          description: row.description || null,
          display_order: parseNumber(row.display_order) ?? idx + 1,
          is_active: parseBool(row.is_active, true),
        };
        const existingCat = existing.get(name.toLowerCase());
        if (existingCat) {
          const { error } = await supabase
            .from('menu_categories')
            .update(payload)
            .eq('id', existingCat.id);
          if (error) log.push({ ok: false, message: `"${name}": ${error.message}` });
          else log.push({ ok: true, message: `"${name}" atualizada.` });
        } else {
          const { error } = await supabase.from('menu_categories').insert(payload);
          if (error) log.push({ ok: false, message: `"${name}": ${error.message}` });
          else log.push({ ok: true, message: `"${name}" criada.` });
        }
      }
      await refetchCategories();
      toast({ title: 'Importação concluída', description: `${log.filter((l) => l.ok).length} categoria(s) processada(s).` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao importar CSV';
      log.push({ ok: false, message: msg });
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setCatLog(log);
      setIsProcessing(false);
      if (categoryFileRef.current) categoryFileRef.current.value = '';
    }
  };

  // ---------- Import Products ----------
  const resolveImageUrl = (value: string): string | null => {
    const v = (value || '').trim();
    if (!v) return null;
    if (/^https?:\/\//i.test(v)) return v;
    // Treat as bucket path (e.g. "produtos/foto.jpg")
    return publicUrl(v.replace(/^\/+/, ''));
  };

  const handleProductUpload = async (file: File) => {
    if (!tenantId) return;
    setIsProcessing(true);
    const log: LogEntry[] = [];
    try {
      const text = await file.text();
      const rows = parseCSVToObjects(text);
      if (rows.length === 0) throw new Error('CSV vazio');

      const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));
      const prodByName = new Map(products.map((p) => [p.name.toLowerCase(), p]));

      for (const [idx, row] of rows.entries()) {
        const name = (row.name || '').trim();
        const categoryName = (row.category_name || '').trim();
        if (!name || !categoryName) {
          log.push({ ok: false, message: `Linha ${idx + 2}: nome ou categoria vazios.` });
          continue;
        }
        const cat = catByName.get(categoryName.toLowerCase());
        if (!cat) {
          log.push({ ok: false, message: `Linha ${idx + 2} "${name}": categoria "${categoryName}" não encontrada. Importe as categorias primeiro.` });
          continue;
        }
        const price = parseNumber(row.price);
        if (price == null) {
          log.push({ ok: false, message: `Linha ${idx + 2} "${name}": preço inválido.` });
          continue;
        }
        const payload = {
          restaurant_id: tenantId,
          category_id: cat.id,
          name,
          description: row.description || null,
          price,
          promotional_price: parseNumber(row.promotional_price),
          image_url: resolveImageUrl(row.image_url),
          is_active: parseBool(row.is_active, true),
          is_highlight: parseBool(row.is_highlight, false),
          is_orderable: parseBool(row.is_orderable, true),
          show_on_display: parseBool(row.show_on_display, false),
          display_order: parseNumber(row.display_order) ?? idx + 1,
        };
        const existing = prodByName.get(name.toLowerCase());
        if (existing) {
          const { error } = await supabase
            .from('menu_products')
            .update(payload)
            .eq('id', existing.id);
          if (error) log.push({ ok: false, message: `"${name}": ${error.message}` });
          else log.push({ ok: true, message: `"${name}" atualizado.` });
        } else {
          const { error } = await supabase.from('menu_products').insert(payload);
          if (error) log.push({ ok: false, message: `"${name}": ${error.message}` });
          else log.push({ ok: true, message: `"${name}" criado.` });
        }
      }
      await refetchProducts();
      toast({ title: 'Importação concluída', description: `${log.filter((l) => l.ok).length} produto(s) processado(s).` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao importar CSV';
      log.push({ ok: false, message: msg });
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setProdLog(log);
      setIsProcessing(false);
      if (productFileRef.current) productFileRef.current.value = '';
    }
  };

  // ---------- Upload Images ----------
  const handleImagesUpload = async (files: FileList) => {
    setIsProcessing(true);
    const log: LogEntry[] = [];
    for (const file of Array.from(files)) {
      try {
        const clean = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
        const path = `${tenantSlug ? `${tenantSlug}/cardapio` : 'cardapio'}/${Date.now()}-${clean}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });
        if (error) throw error;
        log.push({ ok: true, message: `${file.name} → ${publicUrl(path)}` });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Falha no upload';
        log.push({ ok: false, message: `${file.name}: ${msg}` });
      }
    }
    setImgLog(log);
    setIsProcessing(false);
    if (imagesFileRef.current) imagesFileRef.current.value = '';
    toast({ title: 'Uploads concluídos', description: `${log.filter((l) => l.ok).length}/${log.length} imagens enviadas.` });
  };

  // ---------- Migrar imagens externas para o bucket ----------
  const callMigrate = async (payload: { dryRun?: boolean; limit?: number }) => {
    const { data, error } = await supabase.functions.invoke('migrate-menu-images', {
      body: { restaurantId: tenantId, ...payload },
    });
    if (error) throw new Error(error.message);
    if ((data as any)?.error) throw new Error(JSON.stringify((data as any).error));
    return data as {
      slug: string;
      total?: number;
      pending?: number;
      processed?: number;
      migrated?: number;
      failed?: number;
      remaining?: number;
      results?: LogEntry[];
      sample?: { name: string; image_url: string }[];
    };
  };

  const handleAnalyze = async () => {
    if (!tenantId) return;
    setIsMigrating(true);
    setMigrateLog([]);
    try {
      const data = await callMigrate({ dryRun: true });
      setMigrateStatus(
        `${data.pending ?? 0} de ${data.total ?? 0} imagens estão fora de imagens/${data.slug}/cardapio/`,
      );
      setMigrateLog(
        (data.sample ?? []).map((s) => ({ ok: true, message: `${s.name}: ${s.image_url}` })),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha na análise';
      setMigrateStatus(null);
      setMigrateLog([{ ok: false, message: msg }]);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleMigrate = async () => {
    if (!tenantId) return;
    setIsMigrating(true);
    const log: LogEntry[] = [];
    let totalMigrated = 0;
    try {
      // Loop em lotes até não haver mais pendências
      for (let round = 0; round < 60; round++) {
        const data = await callMigrate({ limit: 20 });
        log.push(...(data.results ?? []));
        totalMigrated += data.migrated ?? 0;
        setMigrateLog([...log]);
        setMigrateStatus(`Migradas ${totalMigrated} imagens • restam ${data.remaining ?? 0}`);
        if (!data.processed || (data.remaining ?? 0) === 0) break;
        if ((data.migrated ?? 0) === 0) break; // evita loop infinito em falhas
      }
      await refetchProducts();
      toast({ title: 'Migração concluída', description: `${totalMigrated} imagem(ns) movida(s) para o bucket.` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha na migração';
      log.push({ ok: false, message: msg });
      setMigrateLog([...log]);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setIsMigrating(false);
    }
  };

  const renderLog = (log: LogEntry[]) => {
    if (log.length === 0) return null;
    return (
      <div className="mt-4 max-h-64 overflow-y-auto rounded-md border bg-muted/30 p-3 text-sm space-y-1">
        {log.map((l, i) => (
          <div key={i} className="flex items-start gap-2">
            {l.ok ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
            )}
            <span className={l.ok ? '' : 'text-destructive'}>{l.message}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Importar CSV</h2>
        <p className="text-muted-foreground">Importe categorias, produtos e imagens em massa</p>
      </div>

      <Tabs defaultValue="categorias" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="imagens">Imagens</TabsTrigger>
        </TabsList>

        <TabsContent value="categorias">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" /> Categorias em CSV
              </CardTitle>
              <CardDescription>
                Baixe o modelo, preencha e envie. Categorias com o mesmo nome serão atualizadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={downloadCategoryTemplate}>
                  <Download className="mr-2 h-4 w-4" /> Baixar modelo
                </Button>
                <Button
                  onClick={() => categoryFileRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="mr-2 h-4 w-4" /> Enviar CSV
                </Button>
                <input
                  ref={categoryFileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCategoryUpload(f);
                  }}
                />
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Colunas esperadas</AlertTitle>
                <AlertDescription>
                  <code className="text-xs">name, description, display_order, is_active</code>
                </AlertDescription>
              </Alert>
              {renderLog(catLog)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" /> Produtos em CSV
              </CardTitle>
              <CardDescription>
                Produtos com o mesmo nome serão atualizados. A categoria deve existir previamente (nome exato).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={downloadProductTemplate}>
                  <Download className="mr-2 h-4 w-4" /> Baixar modelo
                </Button>
                <Button
                  onClick={() => productFileRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="mr-2 h-4 w-4" /> Enviar CSV
                </Button>
                <input
                  ref={productFileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleProductUpload(f);
                  }}
                />
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Sobre a coluna image_url</AlertTitle>
                <AlertDescription className="space-y-1">
                  <p>Aceita uma URL completa (https://...) <b>ou</b> um caminho relativo dentro do bucket <Badge variant="secondary">{BUCKET}</Badge>, ex.: <code className="text-xs">produtos/pizza-margherita.jpg</code>.</p>
                  <p>Use a aba <b>Imagens</b> para enviar as fotos ao bucket antes de referenciá-las no CSV.</p>
                </AlertDescription>
              </Alert>
              {renderLog(prodLog)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imagens">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" /> Enviar imagens para o bucket
              </CardTitle>
              <CardDescription>
                Selecione várias imagens de uma vez. As URLs geradas podem ser copiadas para o CSV de produtos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="images-upload" className="sr-only">Imagens</Label>
                <Input
                  id="images-upload"
                  ref={imagesFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isProcessing}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleImagesUpload(e.target.files);
                    }
                  }}
                />
              </div>
              {renderLog(imgLog)}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudDownload className="h-5 w-5" /> Migrar imagens externas
              </CardTitle>
              <CardDescription>
                Baixa as fotos dos produtos que ainda estão em servidores externos e as reenvia para{' '}
                <code className="text-xs">imagens/{tenantSlug}/cardapio/</code>, atualizando o cardápio automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleAnalyze} disabled={isMigrating}>
                  {isMigrating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Info className="mr-2 h-4 w-4" />}
                  Analisar
                </Button>
                <Button onClick={handleMigrate} disabled={isMigrating}>
                  {isMigrating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudDownload className="mr-2 h-4 w-4" />}
                  Migrar tudo
                </Button>
              </div>
              {migrateStatus && <p className="text-sm text-muted-foreground">{migrateStatus}</p>}
              {renderLog(migrateLog)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}