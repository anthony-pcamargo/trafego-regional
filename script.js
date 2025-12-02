// CONFIGURAÇÃO DO WEBHOOK
const N8N_WEBHOOK_URL = 'https://primary-production-f8d8.up.railway.app/webhook-test/get_data_automacao_campanhas_hbs';

// Utils Globais
document.getElementById('data-atualizacao').innerText = new Date().toLocaleDateString('pt-BR');
const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatNumber = (val) => val >= 1000 ? (val / 1000).toFixed(1).replace('.', ',') + "k" : val;

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
});

async function fetchDashboardData() {
    try {
        // 1. Busca os dados (Simulação com seu JSON para teste)
        // Quando conectar o n8n, descomente a linha do fetch e remova a variável mockData
        
        // const response = await fetch(N8N_WEBHOOK_URL);
        // const n8nData = await response.json();

        // SIMULANDO O RETORNO DO N8N QUE VOCÊ MANDOU:
        const n8nData = [
          { "Tipo de Campanha": "Interna", "Leads": 214, "CPL (30 dias)": 37.38, "Saldo": 1857.75 },
          { "Tipo de Campanha": "Externa", "Leads": 2816, "CPL (30 dias)": 24.29, "Saldo": 3093.58 },
          { "Tipo de Campanha": "Total", "Leads": 3030, "CPL (30 dias)": 30.835, "Saldo": 4951.33 },
          { "Tipo de Campanha": "Atualizar Dados" }
        ];

        // 2. Filtra apenas a linha "Total"
        const rowTotal = n8nData.find(item => item["Tipo de Campanha"] === "Total") || {};

        // 3. Extrai os valores (tratando caso venha vazio)
        const leadsTotal = rowTotal["Leads"] || 0;
        const cplTotal = rowTotal["CPL (30 dias)"] || 0;
        const saldoTotal = rowTotal["Saldo"] || 0;

        // 4. Preenche os 3 Cards do Topo
        
        // Card 1: Leads (Esquerda)
        animateValue(document.getElementById('nav-leads-val'), 0, leadsTotal, 1000, false);

        // Card 2: CPL (Meio)
        animateValue(document.getElementById('nav-cpl-val'), 0, cplTotal, 1000, true);

        // Card 3: Saldo (Direita) - Antes era "Média"
        // Vamos ajustar também o rótulo para fazer sentido
        const elSaldoVal = document.getElementById('nav-media-val');
        
        // Troca o título do card de "Média 7 Dias" para "Saldo Total" via JS
        // (Isso procura o elemento pai e troca o texto do título)
        const cardSaldoTitle = elSaldoVal.closest('.nav-card').querySelector('.text-xs.font-bold');
        if(cardSaldoTitle) cardSaldoTitle.innerText = "SALDO DISPONÍVEL";
        
        // Troca o texto pequeno de "/ dia" para "Total"
        const cardSaldoSub = elSaldoVal.nextElementSibling;
        if(cardSaldoSub) cardSaldoSub.innerText = "Total";

        // Anima o valor formatado como moeda (true)
        animateValue(elSaldoVal, 0, saldoTotal, 1000, true);

    } catch (error) {
        console.error("Erro ao processar dados:", error);
    }
}

// ... (Mantenha daqui para baixo suas funções animateValue, renderCards, etc) ...

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CÁLCULOS TOTAIS
    const totalLeadsHoje = reportData.interno.leadsHoje + reportData.externo.leadsHoje;
    const mediaCplTotal = (reportData.interno.cpl30 + reportData.externo.cpl30) / 2;
    const totalMedia7d = reportData.interno.mediaLeads7 + reportData.externo.mediaLeads7;

    // 2. NAV CARDS
    animateValue(document.getElementById('nav-leads-val'), 0, totalLeadsHoje, 1000, false);
    animateValue(document.getElementById('nav-cpl-val'), 0, mediaCplTotal, 1000, true);
    animateValue(document.getElementById('nav-media-val'), 0, totalMedia7d, 1000, false);


    // 5. RENDER DETAILED CARDS
    renderCards(reportData.interno, 'grid-interno', 'text-blue-600', 'bg-blue-50');
    renderCards(reportData.externo, 'grid-externo', 'text-cyan-600', 'bg-cyan-50');
});

// --- HELPER: ANIMATE NUMBERS ---
function animateValue(obj, start, end, duration, isCurrency) {
    if(!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4); // Quartic Ease Out (Mais suave)
        let currentVal = start + (end - start) * ease;
        obj.innerHTML = isCurrency ? formatCurrency(currentVal) : Math.floor(currentVal);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

// --- CONFIGURAÇÃO CARDS DETALHE ---
const cardConfig = {
    leads: { label: "Total Leads", icon: "fa-users" },
    cpl30: { label: "CPL (30 dias)", icon: "fa-sack-dollar", type: "money" },
    saldo: { label: "Saldo Disp.", icon: "fa-wallet", type: "money" },
    mediaLeads7: { label: "Média Leads (7d)", icon: "fa-chart-line" },
    mediaCpl7: { label: "Média CPL (7d)", icon: "fa-tags", type: "money" },
    cplIdeal: { label: "Meta CPL", icon: "fa-crosshairs", type: "money" },
    leadsHoje: { label: "Leads Hoje", icon: "fa-calendar-day" }
};

function renderCards(dataObj, containerId, textColor, bgColor) {
    const container = document.getElementById(containerId);
    Object.keys(dataObj).forEach((key) => {
        const config = cardConfig[key];
        const value = dataObj[key];
        let displayVal = config.type === 'money' ? formatCurrency(value) : formatNumber(value);
        
        let metaHtml = '';
        if(key === 'cplIdeal') metaHtml = `<span class="bg-slate-100 text-[10px] font-bold px-2 py-0.5 rounded text-slate-500 uppercase">Meta</span>`;

        const html = `
            <div class="metric-card group">
                <div class="flex justify-between items-start mb-3">
                    <div class="w-10 h-10 rounded-xl ${bgColor} ${textColor} flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform">
                        <i class="fa-solid ${config.icon}"></i>
                    </div>
                    ${metaHtml}
                </div>
                <div>
                    <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">${config.label}</h4>
                    <span class="text-2xl font-bold text-slate-700 font-display block tracking-tight">${displayVal}</span>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

// --- CHART JS PREMIUM CONFIG ---
Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
Chart.defaults.color = '#94a3b8';

// Função para criar gradientes verticais suaves
function createGradient(ctx, color1, color2) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 25, boxWidth: 8, font: { size: 12, weight: 600 } } },
        tooltip: {
            backgroundColor: '#1e293b',
            padding: 12,
            cornerRadius: 8,
            titleFont: { size: 13 },
            bodyFont: { size: 13, family: "'Inter', sans-serif" },
            displayColors: false
        }
    },
    scales: {
        y: { 
            beginAtZero: true, 
            grid: { color: '#f1f5f9', drawBorder: false }, 
            ticks: { padding: 10, font: { size: 11 } },
            border: { display: false }
        },
        x: { 
            grid: { display: false }, 
            border: { display: false },
            ticks: { font: { size: 11 } }
        }
    }
};

const ctxLeads = document.getElementById('chartLeads').getContext('2d');
new Chart(ctxLeads, {
    type: 'bar',
    data: {
        labels: ['Hoje', 'Média 7d', 'Total (10%)'],
        datasets: [
            { 
                label: 'Interno', 
                data: [reportData.interno.leadsHoje, reportData.interno.mediaLeads7, reportData.interno.leads/10], 
                backgroundColor: createGradient(ctxLeads, '#2563eb', '#60a5fa'),
                borderRadius: 6, 
                barPercentage: 0.6 
            },
            { 
                label: 'Externo', 
                data: [reportData.externo.leadsHoje, reportData.externo.mediaLeads7, reportData.externo.leads/10], 
                backgroundColor: createGradient(ctxLeads, '#06b6d4', '#67e8f9'),
                borderRadius: 6, 
                barPercentage: 0.6 
            }
        ]
    },
    options: commonOptions
});

const ctxCPL = document.getElementById('chartCPL').getContext('2d');
new Chart(ctxCPL, {
    type: 'line',
    data: {
        labels: ['Meta Ideal', 'Média 7d', 'Média 30d'],
        datasets: [
            { 
                label: 'Interno', 
                data: [reportData.interno.cplIdeal, reportData.interno.mediaCpl7, reportData.interno.cpl30], 
                borderColor: '#2563eb', 
                backgroundColor: 'rgba(37, 99, 235, 0.05)',
                borderWidth: 3, 
                tension: 0.4, 
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#2563eb',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            },
            { 
                label: 'Externo', 
                data: [reportData.externo.cplIdeal, reportData.externo.mediaCpl7, reportData.externo.cpl30], 
                borderColor: '#06b6d4', 
                backgroundColor: 'rgba(6, 182, 212, 0.05)',
                borderWidth: 3, 
                tension: 0.4, 
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#06b6d4',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }
        ]
    },
    options: commonOptions
});
