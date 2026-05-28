import { motion } from "framer-motion";
import {
  Sprout, DollarSign, TrendingUp, Truck, Package, Users, CloudSun,
  Bug, ArrowUpRight, ArrowDownRight, Loader2, AlertTriangle, ShieldCheck, Download
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import AlertCard from "@/components/AlertCard";
import WeatherWidget from "@/components/WeatherWidget";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatBRLk, formatBRLPlain } from "@/lib/formatters";
export default function Dashboard() {
  // Fetch current user
  const { data: userData } = useCurrentUser();

  // Fetch total planted area from plantios
  const { data: plantiosData, isLoading: loadingPlantios } = useQuery({
    queryKey: ["dashboard-plantios"],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plantios")
        .select(`
          area_plantada,
          culturas (nome),
          talhoes!inner (
            fazendas!inner (user_id)
          )
        `)
        .eq("talhoes.fazendas.user_id", userData?.id);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch machines status
  const { data: maquinasData, isLoading: loadingMaquinas } = useQuery({
    queryKey: ["dashboard-maquinas"],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maquinas")
        .select(`
          id,
          nome,
          status,
          proxima_manutencao,
          fazendas!inner (user_id)
        `)
        .eq("fazendas.user_id", userData?.id);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch low stock items
  const { data: estoqueData, isLoading: loadingEstoque } = useQuery({
    queryKey: ["dashboard-estoque"],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estoque")
        .select(`
          id,
          nome,
          quantidade,
          quantidade_minima,
          unidade,
          fazendas!inner (user_id)
        `)
        .eq("fazendas.user_id", userData?.id);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch latest financial transactions
  const { data: transacoesData, isLoading: loadingTransacoes } = useQuery({
    queryKey: ["dashboard-transacoes"],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transacoes_financeiras")
        .select(`
          id,
          descricao,
          valor,
          tipo,
          data,
          categoria,
          fazendas!inner (user_id, nome)
        `)
        .eq("fazendas.user_id", userData?.id)
        .order("data", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch employees count
  const { data: funcionariosData } = useQuery({
    queryKey: ["dashboard-funcionarios"],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcionarios")
        .select(`
          id,
          status,
          fazendas!inner (user_id)
        `)
        .eq("fazendas.user_id", userData?.id);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch colheitas for production chart
  const { data: colheitasData } = useQuery({
    queryKey: ["dashboard-colheitas"],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colheitas")
        .select(`
          data_colheita, producao_total,
          plantios!inner (
            culturas (nome),
            talhoes!inner (
              fazendas!inner (user_id)
            )
          )
        `)
        .eq("plantios.talhoes.fazendas.user_id", userData?.id)
        .order("data_colheita", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch fazendas for weather (get first farm with coordinates)
  const { data: fazendasData } = useQuery({
    queryKey: ["dashboard-fazendas"],
    enabled: !!userData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fazendas")
        .select("id, nome, latitude, longitude")
        .eq("user_id", userData?.id!)
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .limit(3);
      if (error) throw error;
      return data;
    },
  });
  const primaryFarm = fazendasData?.[0];

  // Calculate KPIs
  const totalAreaPlantada = plantiosData?.reduce((acc, p) => acc + Number(p.area_plantada), 0) || 0;
  const plantiosAtivos = plantiosData?.length || 0;

  const totalMaquinas = maquinasData?.length || 0;
  const maquinasOperando = maquinasData?.filter(m => m.status === 'operando').length || 0;
  const maquinasManutencao = maquinasData?.filter(m => m.status === 'manutencao').length || 0;

  const totalEstoque = estoqueData?.length || 0;
  const estoqueBaixo = estoqueData?.filter(e => 
    e.quantidade_minima && Number(e.quantidade) < Number(e.quantidade_minima)
  ) || [];

  const totalFuncionarios = funcionariosData?.length || 0;
  const funcionariosAtivos = funcionariosData?.filter(f => f.status === 'ativo').length || 0;

  // Calculate financial totals
  const receitas = transacoesData?.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + Number(t.valor), 0) || 0;
  const despesas = transacoesData?.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + Number(t.valor), 0) || 0;
  const saldo = receitas - despesas;

  // Calculate culture distribution from plantios
  const cultureDistribution = plantiosData?.reduce((acc: any[], p: any) => {
    const culturaNome = p.culturas?.nome || 'Outros';
    const existing = acc.find(c => c.name === culturaNome);
    if (existing) {
      existing.value += Number(p.area_plantada);
    } else {
      acc.push({ name: culturaNome, value: Number(p.area_plantada) });
    }
    return acc;
  }, []) || [];

  // Calculate percentages
  const totalCultureArea = cultureDistribution.reduce((acc, c) => acc + c.value, 0);
  const cultureWithPercentage = cultureDistribution.map((c, i) => ({
    ...c,
    percentage: totalCultureArea > 0 ? Math.round((c.value / totalCultureArea) * 100) : 0,
    color: ["hsl(152, 55%, 28%)", "hsl(40, 60%, 50%)", "hsl(200, 80%, 50%)", "hsl(25, 70%, 40%)", "hsl(280, 60%, 50%)"][i % 5]
  }));

  // Build production chart data from colheitas grouped by month
  const productionData = (() => {
    if (!colheitasData || colheitasData.length === 0) return [];
    const monthMap = new Map<string, Record<string, number>>();
    colheitasData.forEach((c: any) => {
      const d = new Date(c.data_colheita);
      const mesKey = format(d, "MMM/yy", { locale: ptBR });
      const cultura = c.plantios?.culturas?.nome || "Outros";
      if (!monthMap.has(mesKey)) monthMap.set(mesKey, {});
      const entry = monthMap.get(mesKey)!;
      entry[cultura] = (entry[cultura] || 0) + Number(c.producao_total);
    });
    return Array.from(monthMap.entries()).map(([mes, cultures]) => ({ mes, ...cultures }));
  })();

  const productionCultures = (() => {
    if (!colheitasData) return [];
    const set = new Set<string>();
    colheitasData.forEach((c: any) => set.add(c.plantios?.culturas?.nome || "Outros"));
    return Array.from(set);
  })();

  const chartColors = ["hsl(152, 55%, 28%)", "hsl(40, 60%, 50%)", "hsl(200, 80%, 50%)", "hsl(25, 70%, 40%)", "hsl(280, 60%, 50%)"];

  const costData = transacoesData?.filter(t => t.tipo === 'despesa')
    .reduce((acc: any[], t: any) => {
      const categoria = t.categoria || 'Outros';
      const existing = acc.find(c => c.categoria === categoria);
      if (existing) {
        existing.valor += Number(t.valor);
      } else {
        acc.push({ categoria, valor: Number(t.valor) });
      }
      return acc;
    }, [])
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5) || [];

  // Generate dynamic alerts
  const dynamicAlerts: any[] = [];

  // Low stock alerts
  estoqueBaixo.forEach(item => {
    dynamicAlerts.push({
      type: "geral" as const,
      title: `Estoque baixo: ${item.nome}`,
      description: `Apenas ${item.quantidade} ${item.unidade} restantes (mín: ${item.quantidade_minima})`,
      time: "Agora",
      severity: "media" as const,
    });
  });

  // Machines needing maintenance
  maquinasData?.filter(m => m.status === 'manutencao').forEach(m => {
    dynamicAlerts.push({
      type: "maquina" as const,
      title: `Máquina em manutenção`,
      description: m.nome,
      time: "Em andamento",
      severity: "media" as const,
    });
  });

  // If no alerts, show a positive message
  if (dynamicAlerts.length === 0) {
    dynamicAlerts.push({
      type: "geral" as const,
      title: "Tudo em ordem!",
      description: "Nenhum alerta pendente no momento.",
      time: "Agora",
      severity: "baixa" as const,
    });
  }

  const isLoading = loadingPlantios || loadingMaquinas || loadingEstoque || loadingTransacoes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Visão geral da sua operação agrícola</p>
        </div>
        
        <div className="flex items-center gap-2">
          <a 
            href="https://rpowegchummgmdckzcik.supabase.co/storage/v1/object/public/documents/security-audits%2FRelatorio_Auditoria_RLS.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-semibold hover:bg-success/20 transition-colors border border-success/20"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Auditoria RLS (PDF)
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Main Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              icon={Sprout} 
              title="Área Plantada" 
              value={`${totalAreaPlantada.toFixed(1)} ha`} 
              change={`${plantiosAtivos} plantio${plantiosAtivos !== 1 ? 's' : ''} ativo${plantiosAtivos !== 1 ? 's' : ''}`} 
              changeType="positive" 
              delay={0} 
            />
            <MetricCard 
              icon={DollarSign} 
              title="Saldo Financeiro" 
              value={formatBRLk(saldo)} 
              change={`Receitas: ${formatBRLk(receitas)}`} 
              changeType={saldo >= 0 ? "positive" : "negative"} 
              delay={0.1} 
            />
            <MetricCard 
              icon={Truck} 
              title="Máquinas" 
              value={`${maquinasOperando}/${totalMaquinas}`} 
              change={maquinasManutencao > 0 ? `${maquinasManutencao} em manutenção` : "Todas disponíveis"} 
              changeType={maquinasManutencao > 0 ? "neutral" : "positive"} 
              delay={0.2} 
            />
            <MetricCard 
              icon={Package} 
              title="Estoque" 
              value={totalEstoque.toString()} 
              change={estoqueBaixo.length > 0 ? `${estoqueBaixo.length} item(ns) baixo` : "Níveis normais"} 
              changeType={estoqueBaixo.length > 0 ? "negative" : "positive"} 
              delay={0.3} 
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Production chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-card rounded-xl p-5 shadow-card border border-border"
            >
              <h3 className="font-display font-semibold text-foreground mb-4">Produção por Mês (ton)</h3>
              {productionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={productionData}>
                    <defs>
                      {productionCultures.map((c, i) => (
                        <linearGradient key={c} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(160, 10%, 45%)" }} />
                    <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} />
                    {productionCultures.map((c, i) => (
                      <Area key={c} type="monotone" dataKey={c} stroke={chartColors[i % chartColors.length]} fill={`url(#grad-${i})`} strokeWidth={2} name={c} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[260px] text-muted-foreground">
                  <Sprout className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma colheita registrada ainda</p>
                </div>
              )}
            </motion.div>

            {/* Culture distribution */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border"
            >
              <h3 className="font-display font-semibold text-foreground mb-4">Distribuição de Culturas</h3>
              {cultureWithPercentage.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={cultureWithPercentage} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                        {cultureWithPercentage.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} 
                        formatter={(value: number) => [`${value.toFixed(1)} ha`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {cultureWithPercentage.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                        {item.name} ({item.percentage}%)
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[220px] text-muted-foreground">
                  <Sprout className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">Nenhum plantio cadastrado</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Weather Widget */}
          {primaryFarm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border"
            >
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-primary" /> Clima — {primaryFarm.nome}
              </h3>
              <WeatherWidget
                latitude={primaryFarm.latitude!}
                longitude={primaryFarm.longitude!}
                farmName={primaryFarm.nome}
              />
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cost chart / Recent transactions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border"
            >
              <h3 className="font-display font-semibold text-foreground mb-4">
                {costData.length > 0 ? 'Despesas por Categoria (R$)' : 'Últimas Transações'}
              </h3>
              
              {costData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={costData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} />
                    <YAxis dataKey="categoria" type="category" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} width={80} />
                    <Tooltip 
                      contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(150, 10%, 88%)", borderRadius: "8px", fontSize: "12px" }} 
                      formatter={(value: number) => [formatBRLPlain(value), 'Valor']}
                    />
                    <Bar dataKey="valor" fill="hsl(152, 55%, 28%)" radius={[0, 6, 6, 0]} name="Valor" />
                  </BarChart>
                </ResponsiveContainer>
              ) : transacoesData && transacoesData.length > 0 ? (
                <div className="space-y-3 max-h-[220px] overflow-y-auto">
                  {transacoesData.slice(0, 5).map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          t.tipo === 'receita' ? 'bg-success/10' : 'bg-destructive/10'
                        }`}>
                          {t.tipo === 'receita' ? (
                            <ArrowUpRight className="w-4 h-4 text-success" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{t.descricao}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(t.data), "dd MMM", { locale: ptBR })} • {t.fazendas?.nome}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${
                        t.tipo === 'receita' ? 'text-success' : 'text-destructive'
                      }`}>
                        {t.tipo === 'receita' ? '+' : '-'}{formatBRLPlain(Number(t.valor))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[220px] text-muted-foreground">
                  <DollarSign className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma transação registrada</p>
                </div>
              )}
            </motion.div>

            {/* Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">Alertas</h3>
                {dynamicAlerts.length > 0 && dynamicAlerts[0].severity !== 'baixa' && (
                  <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {dynamicAlerts.length} alerta{dynamicAlerts.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="space-y-3 max-h-[220px] overflow-y-auto">
                {dynamicAlerts.slice(0, 4).map((alert, i) => (
                  <AlertCard key={i} {...alert} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick stats bottom */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard 
              icon={Users} 
              title="Funcionários" 
              value={totalFuncionarios.toString()} 
              change={funcionariosAtivos === totalFuncionarios ? "Todos ativos" : `${funcionariosAtivos} ativos`} 
              changeType="positive" 
              delay={0.45} 
            />
            <MetricCard 
              icon={TrendingUp} 
              title="Receitas" 
              value={formatBRLk(receitas)} 
              change="Total do período" 
              changeType="positive" 
              delay={0.5} 
            />
            <MetricCard 
              icon={Bug} 
              title="Despesas" 
              value={formatBRLk(despesas)} 
              change="Total do período" 
              changeType="neutral" 
              delay={0.55} 
            />
            <MetricCard 
              icon={CloudSun} 
              title="Plantios" 
              value={plantiosAtivos.toString()} 
              change="Em andamento" 
              changeType="neutral" 
              delay={0.6} 
            />
          </div>
        </>
      )}
    </div>
  );
}
