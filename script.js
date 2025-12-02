// CONFIGURAÇÃO DO WEBHOOK

// 1. URL de Produção do n8n (A que NÃO tem 'test') - Certifique-se que o fluxo está ATIVO no n8n
const N8N_PROD_URL = 'https://primary-production-f8d8.up.railway.app/webhook/get_data_automacao_campanhas_hbs';

// 2. Proxy para evitar CORS (Obrigatório para conexões diretas do navegador)
const N8N_WEBHOOK_URL = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(N8N_PROD_URL);

// --- UTILS ---
const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatNumber = (val) => val >= 1000 ? (val / 1000).toFixed(1).replace('.', ',') + "k" : val;
const formatDecimal = (val) => val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
});

async function fetchDashboardData() {
    try {
        // 1. MOSTRA CARREGAMENTO (Antes de buscar)
        showLoadingState();

        // 2. BUSCA DADOS REAIS
        const response = await fetch(N8N_WEBHOOK_URL);
        const n8nData = await response.json();
        
        // 3. SEPARA AS LINHAS
        const rowInterna = n8nData.find(item => item["Tipo de Campanha"] === "Interna") || {};
        const rowExterna = n8nData.find(item => item["Tipo de Campanha"] === "Externa") || {};
        const rowTotal   = n8nData.find(item => item["Tipo de Campanha"] === "Total") || {};

        // 4. ATUALIZA HEADER (Substitui o ícone de load pelos números)
        animateValue(document.getElementById('nav-leads-val'), 0, rowTotal["Leads"] || 0, 1000, false);
        animateValue(document.getElementById('nav-cpl-val'), 0, rowTotal["CPL (30 dias)"] || 0, 1000, true);
        
        const elSaldo = document.getElementById('nav-media-val');
        if(elSaldo) {
            const cardTitle = elSaldo.closest('.nav-card')?.querySelector('.text-xs.font-bold');
            if(cardTitle) cardTitle.innerText = "SALDO DISPONÍVEL";
            const cardSub = elSaldo.nextElementSibling;
            if(cardSub) cardSub.innerText = "Total";
            animateValue(elSaldo, 0, rowTotal["Saldo"] || 0, 1000, true);
        }

        // 5. LÓGICA DE ALERTA (TEMPO DE VOO)
        const campanhaCritica = rowTotal["Tempo de Voo"]; 

        // 6. ATUALIZA OS GRIDS (Substitui os Skeletons pelos Cards Reais)
        renderCustomGrid(rowInterna, 'grid-interno', 'blue', campanhaCritica === "Interna");
        renderCustomGrid(rowExterna, 'grid-externo', 'cyan', campanhaCritica === "Externa");

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Opcional: Mostrar mensagem de erro na tela se falhar
    }
}

// --- FUNÇÃO NOVO: ESTADO DE CARREGAMENTO ---
function showLoadingState() {
    // 1. Coloca spinner nos cards do Topo
    const loadingIcon = '<i class="fa-solid fa-circle-notch fa-spin text-2xl text-slate-300"></i>';
    document.getElementById('nav-leads-val').innerHTML = loadingIcon;
    document.getElementById('nav-cpl-val').innerHTML = loadingIcon;
    document.getElementById('nav-media-val').innerHTML = loadingIcon;

    // 2. Cria o HTML do Skeleton (Blocos cinzas pulsando)
    // Criamos 9 blocos para simular os 9 cards que virão
    let skeletonHTML = '';
    
    // Card Grande (Saldo)
    skeletonHTML += `
        <div class="metric-card col-span-1 sm:col-span-2 flex items-center gap-4 animate-pulse">
            <div class="w-12 h-12 bg-slate-200 rounded-xl"></div>
            <div class="flex-1">
                <div class="h-3 bg-slate-200 rounded w-24 mb-2"></div>
                <div class="h-8 bg-slate-300 rounded w-48"></div>
            </div>
        </div>
    `;

    // Cards Pequenos (Repetir 8x)
    for(let i=0; i<8; i++) {
        skeletonHTML += `
            <div class="metric-card animate-pulse">
                <div class="w-8 h-8 bg-slate-200 rounded-lg mb-3"></div>
                <div class="h-3 bg-slate-200 rounded w-20 mb-2"></div>
                <div class="h-6 bg-slate-300 rounded w-32"></div>
            </div>
        `;
    }

    // Aplica nos dois grids
    const gridInterno = document.getElementById('grid-interno');
    const gridExterno = document.getElementById('grid-externo');
    
    if(gridInterno) gridInterno.innerHTML = skeletonHTML;
    if(gridExterno) gridExterno.innerHTML = skeletonHTML;
}

// --- RENDERIZAÇÃO DOS CARDS REAIS ---
function renderCustomGrid(data, containerId, colorTheme, isCriticalRunway) {
    const container = document.getElementById(containerId);
    if(!container) return;

    const bgIcon = colorTheme === 'blue' ? 'bg-blue-50' : 'bg-cyan-50';
    const textIcon = colorTheme === 'blue' ? 'text-blue-600' : 'text-cyan-600';

    const getVal = (key) => {
        let val = data[key];
        if (val === "" || val === undefined || val === null) return 0;
        if (typeof val === 'string') val = parseFloat(val.replace(',', '.')) || 0;
        return val;
    };

    // Estilos do Tempo de Voo
    const runwayCardStyle = isCriticalRunway ? 'background-color: #ed2e2eff; border: 1px solid #f87171;' : ''; 
    const runwayTitleColor = isCriticalRunway ? 'text-black' : 'text-slate-400';
    const runwayValueColor = isCriticalRunway ? 'text-black' : 'text-slate-700';
    const runwayIconTextColor = isCriticalRunway ? 'text-black' : textIcon;

    const html = `
        <div class="metric-card col-span-1 sm:col-span-2 flex items-center justify-between group">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl ${bgIcon} ${textIcon} flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                    <i class="fa-solid fa-wallet"></i>
                </div>
                <div>
                    <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Saldo</h4>
                    <span class="text-3xl font-bold text-slate-700 font-display tracking-tight">${formatCurrency(getVal("Saldo"))}</span>
                </div>
            </div>
        </div>

        <div class="metric-card group">
            <div class="flex justify-between items-start mb-2">
                <div class="w-8 h-8 rounded-lg ${bgIcon} ${textIcon} flex items-center justify-center text-xs shadow-sm">
                    <i class="fa-solid fa-hand-holding-dollar"></i>
                </div>
            </div>
            <div>
                <h4 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Custo por Dia</h4>
                <span class="text-xl font-bold text-slate-700 font-display">${formatCurrency(getVal("Custo por dia"))}</span>
            </div>
        </div>

        <div class="metric-card group" style="${runwayCardStyle}">
            <div class="flex justify-between items-start mb-2">
                <div class="w-8 h-8 rounded-lg ${bgIcon} ${runwayIconTextColor} flex items-center justify-center text-xs shadow-sm">
                    <i class="fa-solid fa-stopwatch"></i>
                </div>
            </div>
            <div>
                <h4 class="${runwayTitleColor} font-semibold uppercase tracking-wider mb-1 text-[10px]">Tempo de Voo</h4>
                <span class="${runwayValueColor} font-bold font-display text-xl">${formatDecimal(getVal("Tempo de Voo"))} dias</span>
            </div>
        </div>

        <div class="metric-card group">
            <div class="flex justify-between items-start mb-2">
                <div class="w-8 h-8 rounded-lg ${bgIcon} ${textIcon} flex items-center justify-center text-xs shadow-sm">
                    <i class="fa-solid fa-users"></i>
                </div>
            </div>
            <div>
                <h4 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Leads Totais</h4>
                <span class="text-xl font-bold text-slate-700 font-display">${formatNumber(getVal("Leads"))}</span>
            </div>
        </div>

        <div class="metric-card group">
            <div class="flex justify-between items-start mb-2">
                <div class="w-8 h-8 rounded-lg ${bgIcon} ${textIcon} flex items-center justify-center text-xs shadow-sm">
                    <i class="fa-solid fa-calendar-day"></i>
                </div>
            </div>
            <div>
                <h4 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Leads Hoje</h4>
                <span class="text-xl font-bold text-slate-700 font-display">${getVal("Leads Hoje")}</span>
            </div>
        </div>

        <div class="metric-card group">
            <div class="flex justify-between items-start mb-2">
                <div class="w-8 h-8 rounded-lg ${bgIcon} ${textIcon} flex items-center justify-center text-xs shadow-sm">
                    <i class="fa-solid fa-chart-line"></i>
                </div>
            </div>
            <div>
                <h4 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Média Leads (7D)</h4>
                <span class="text-xl font-bold text-slate-700 font-display">${formatNumber(getVal("Média leads 7 dias"))}</span>
            </div>
        </div>

        <div class="metric-card group">
            <div class="flex justify-between items-start mb-2">
                <div class="w-8 h-8 rounded-lg ${bgIcon} ${textIcon} flex items-center justify-center text-xs shadow-sm">
                    <i class="fa-solid fa-tags"></i>
                </div>
            </div>
            <div>
                <h4 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">CPL (7D)</h4>
                <span class="text-xl font-bold text-slate-700 font-display">${formatCurrency(getVal("Média CPL 7 dias"))}</span>
            </div>
        </div>

        <div class="metric-card group">
            <div class="flex justify-between items-start mb-2">
                <div class="w-8 h-8 rounded-lg ${bgIcon} ${textIcon} flex items-center justify-center text-xs shadow-sm">
                    <i class="fa-solid fa-sack-dollar"></i>
                </div>
            </div>
            <div>
                <h4 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">CPL (30 dias)</h4>
                <span class="text-xl font-bold text-slate-700 font-display">${formatCurrency(getVal("CPL (30 dias)"))}</span>
            </div>
        </div>

        <div class="metric-card group relative overflow-hidden">
            <div class="flex justify-between items-start mb-2">
                <div class="w-8 h-8 rounded-lg ${bgIcon} ${textIcon} flex items-center justify-center text-xs shadow-sm">
                    <i class="fa-solid fa-crosshairs"></i>
                </div>
                <span class="bg-slate-100 text-[8px] font-bold px-1.5 py-0.5 rounded text-slate-500 uppercase">Meta</span>
            </div>
            <div>
                <h4 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">CPL Ideal</h4>
                <span class="text-xl font-bold text-slate-700 font-display">${formatCurrency(getVal("CPL Ideal"))}</span>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// --- ANIMAÇÃO DE NÚMEROS ---
function animateValue(obj, start, end, duration, isCurrency) {
    if(!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        let val = start + (end - start) * progress;
        obj.innerHTML = isCurrency ? formatCurrency(val) : Math.floor(val);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}