// CONFIGURAÇÃO DO WEBHOOK
const N8N_WEBHOOK_URL = 'https://primary-production-f8d8.up.railway.app/webhook/get_data_automacao_campanhas_hbs';

// Utils Globais
const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatNumber = (val) => val >= 1000 ? (val / 1000).toFixed(1).replace('.', ',') + "k" : val;

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
});

async function fetchDashboardData() {
    try {
        // --- MODO DE TESTE (Descomente o fetch abaixo quando conectar o n8n) ---
        const response = await fetch(N8N_WEBHOOK_URL);
        const n8nData = await response.json();

        // SEU JSON DE EXEMPLO (Para garantir que funcione agora):
        //const n8nData = [
          //{ "Tipo de Campanha": "Interna", "Leads": 214, "CPL (30 dias)": 37.38, "Saldo": 1857.75, "Média leads 7 dias": "5.86", "Média CPL 7 dias": 48.78, "CPL Ideal": "", "Leads Hoje": 4 },
          //{ "Tipo de Campanha": "Externa", "Leads": 2816, "CPL (30 dias)": 24.29, "Saldo": 3093.58, "Média leads 7 dias": "79.86", "Média CPL 7 dias": 26.61, "CPL Ideal": "", "Leads Hoje": 110 },
          //{ "Tipo de Campanha": "Total", "Leads": 3030, "CPL (30 dias)": 30.835, "Saldo": 4951.33 },
          //{ "Tipo de Campanha": "Atualizar Dados" }
        //];

        // 1. Separa as linhas baseado na chave "Tipo de Campanha"
        const rowInterna = n8nData.find(item => item["Tipo de Campanha"] === "Interna") || {};
        const rowExterna = n8nData.find(item => item["Tipo de Campanha"] === "Externa") || {};
        const rowTotal   = n8nData.find(item => item["Tipo de Campanha"] === "Total") || {};

        // 2. Header (Cards do Topo - Mantendo lógica anterior do Total)
        animateValue(document.getElementById('nav-leads-val'), 0, rowTotal["Leads"] || 0, 1000, false);
        animateValue(document.getElementById('nav-cpl-val'), 0, rowTotal["CPL (30 dias)"] || 0, 1000, true);
        
        // Ajuste Header Saldo
        const elSaldo = document.getElementById('nav-media-val');
        const cardSaldoTitle = elSaldo.closest('.nav-card').querySelector('.text-xs.font-bold');
        if(cardSaldoTitle) cardSaldoTitle.innerText = "SALDO DISPONÍVEL";
        const cardSaldoSub = elSaldo.nextElementSibling;
        if(cardSaldoSub) cardSaldoSub.innerText = "Total";
        animateValue(elSaldo, 0, rowTotal["Saldo"] || 0, 1000, true);

        // 3. Renderiza os Grids Detalhados com o MAPEAMENTO SOLICITADO
        renderCustomGrid(rowInterna, 'grid-interno', 'blue');
        renderCustomGrid(rowExterna, 'grid-externo', 'cyan');


    } catch (error) {
        console.error("Erro ao processar dados:", error);
    }
}

// --- FUNÇÃO DE RENDERIZAÇÃO PERSONALIZADA ---
function renderCustomGrid(data, containerId, colorTheme) {
    const container = document.getElementById(containerId);
    if(!container) return;

    // Definição de Cores
    const bgIcon = colorTheme === 'blue' ? 'bg-blue-50' : 'bg-cyan-50';
    const textIcon = colorTheme === 'blue' ? 'text-blue-600' : 'text-cyan-600';

    // Helper: Trata string com vírgula, números ou vazio
    const getVal = (key) => {
        let val = data[key];
        if (val === "" || val === undefined || val === null) return 0; // Trata vazio
        if (typeof val === 'string') val = parseFloat(val.replace(',', '.')); // Trata "5,86"
        return val || 0;
    };

    // Construção HTML com o Mapeamento Solicitado
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


function animateValue(obj, start, end, duration, isCurrency) {
    if(!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = isCurrency ? formatCurrency(start + (end - start) * progress) : Math.floor(start + (end - start) * progress);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);

}
