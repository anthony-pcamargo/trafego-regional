// --- DADOS DO RELATÓRIO ---
const reportData = {
    interno: {
        leads: 1450,
        cpl30: 12.50,
        saldo: 5000.00,
        mediaLeads7: 48,
        mediaCpl7: 11.80,
        cplIdeal: 12.00,
        leadsHoje: 24
    },
    externo: {
        leads: 3200,
        cpl30: 18.20,
        saldo: 12000.00,
        mediaLeads7: 105,
        mediaCpl7: 19.50,
        cplIdeal: 18.00,
        leadsHoje: 62
    }
};

// Configurações
document.getElementById('data-atualizacao').innerText = new Date().toLocaleDateString('pt-BR');
const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CÁLCULOS TOTAIS ---
    const totalLeadsHoje = reportData.interno.leadsHoje + reportData.externo.leadsHoje;
    const mediaCplTotal = (reportData.interno.cpl30 + reportData.externo.cpl30) / 2;
    const totalMedia7d = reportData.interno.mediaLeads7 + reportData.externo.mediaLeads7;

    // --- 2. POPULAR NAV CARDS ---
    animateValue(document.getElementById('nav-leads-val'), 0, totalLeadsHoje, 1000, false);
    animateValue(document.getElementById('nav-cpl-val'), 0, mediaCplTotal, 1000, true);
    animateValue(document.getElementById('nav-media-val'), 0, totalMedia7d, 1000, false);

    // --- 3. POPULAR HERO CARDS ---
    // Aba Leads
    document.getElementById('tab-total-leads').innerText = totalLeadsHoje;
    document.getElementById('tab-leads-interno').innerText = reportData.interno.leadsHoje;
    document.getElementById('tab-leads-externo').innerText = reportData.externo.leadsHoje;

    // Aba CPL
    document.getElementById('tab-total-cpl').innerText = formatCurrency(mediaCplTotal);
    document.getElementById('tab-cpl-interno').innerText = formatCurrency(reportData.interno.cpl30);
    document.getElementById('tab-cpl-externo').innerText = formatCurrency(reportData.externo.cpl30);

    // Aba Média
    document.getElementById('tab-total-media').innerText = Math.round(totalMedia7d); 
    document.getElementById('tab-media-interno').innerText = reportData.interno.mediaLeads7;
    document.getElementById('tab-media-externo').innerText = reportData.externo.mediaLeads7;

    // --- 4. LÓGICA DE CLIQUE NAS ABAS ---
    const navCards = document.querySelectorAll('.nav-card');
    const panels = document.querySelectorAll('.tab-panel');

    navCards.forEach(card => {
        card.addEventListener('click', () => {
            navCards.forEach(c => c.classList.remove('active'));
            panels.forEach(p => p.classList.add('hidden'));

            card.classList.add('active');
            const targetId = card.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });
});

// --- ANIMAÇÃO DE NÚMEROS ---
function animateValue(obj, start, end, duration, isCurrency) {
    if(!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        let currentVal = start + (end - start) * ease;
        
        if (isCurrency) {
            obj.innerHTML = formatCurrency(currentVal);
        } else {
            if (end >= 1000 && progress === 1) {
                 obj.innerHTML = (end / 1000).toFixed(1).replace('.', ',') + "k";
            } else {
                 obj.innerHTML = Math.floor(currentVal);
            }
        }
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

// Configuração dos Cards de Métricas Inferiores
const cardConfig = {
    leads: { label: "Total Leads", help: "Volume acumulado", icon: "fa-users", type: "number", bg: "bg-blue-50", text: "text-blue-600" },
    cpl30: { label: "CPL (30 dias)", help: "Custo médio mensal", icon: "fa-sack-dollar", type: "money", bg: "bg-emerald-50", text: "text-emerald-600" },
    saldo: { label: "Saldo Disp.", help: "Orçamento restante", icon: "fa-wallet", type: "money", bg: "bg-purple-50", text: "text-purple-600" },
    mediaLeads7: { label: "Média Leads (7d)", help: "Média diária recente", icon: "fa-chart-line", type: "number", bg: "bg-slate-50", text: "text-slate-600" },
    mediaCpl7: { label: "Média CPL (7d)", help: "Custo médio recente", icon: "fa-tags", type: "money", bg: "bg-slate-50", text: "text-slate-600" },
    cplIdeal: { label: "Meta CPL", help: "Alvo estratégico", icon: "fa-crosshairs", type: "money", bg: "bg-amber-50", text: "text-amber-600" },
    leadsHoje: { label: "Leads Hoje", help: "Captação do dia", icon: "fa-calendar-day", type: "number", bg: "bg-rose-50", text: "text-rose-600" }
};

// Renderização dos Cards Inferiores
function renderCards(dataObj, containerId, accentColor) {
    const container = document.getElementById(containerId);
    
    Object.keys(dataObj).forEach((key, index) => {
        const config = cardConfig[key];
        const value = dataObj[key];
        
        let trendHTML = '';
        if (key === 'mediaCpl7' || key === 'cpl30') {
            const diff = ((value - dataObj.cplIdeal) / dataObj.cplIdeal) * 100;
            const isBad = diff > 0;
            const colorClass = isBad ? 'trend-bad' : 'trend-good';
            const icon = isBad ? 'fa-arrow-up' : 'fa-arrow-down';
            trendHTML = `<span class="trend-badge ${colorClass}"><i class="fa-solid ${icon}"></i> ${Math.abs(diff).toFixed(0)}%</span>`;
        }

        const cardHTML = `
            <div class="metric-card group" style="color: ${accentColor};">
                <div class="flex justify-between items-start mb-4">
                    <div class="icon-box ${config.bg} ${config.text}">
                        <i class="fa-solid ${config.icon}"></i>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                        ${key === 'cplIdeal' ? '<span class="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-slate-200">Meta</span>' : trendHTML}
                        <i class="fa-regular fa-circle-question info-tooltip text-sm" data-tippy-content="${config.help}"></i>
                    </div>
                </div>
                <div>
                    <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">${config.label}</h4>
                    <span id="${containerId}-${key}" class="text-2xl font-bold text-slate-800 metric-value block">0</span>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
        
        setTimeout(() => {
            const el = document.getElementById(`${containerId}-${key}`);
            animateValue(el, 0, value, 1200, config.type === 'money');
        }, index * 50);
    });
}

renderCards(reportData.interno, 'grid-interno', '#2563eb'); 
renderCards(reportData.externo, 'grid-externo', '#06b6d4'); 

if(window.tippy) {
    tippy('[data-tippy-content]', { animation: 'scale', theme: 'light-border' });
}

// --- GRÁFICOS ---
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#64748b';
Chart.defaults.scale.grid.color = 'transparent';

const ctxLeads = document.getElementById('chartLeads').getContext('2d');
const gradientBlue = ctxLeads.createLinearGradient(0, 0, 0, 300);
gradientBlue.addColorStop(0, '#2563eb');
gradientBlue.addColorStop(1, '#93c5fd');
const gradientCyan = ctxLeads.createLinearGradient(0, 0, 0, 300);
gradientCyan.addColorStop(0, '#06b6d4');
gradientCyan.addColorStop(1, '#67e8f9');

new Chart(ctxLeads, {
    type: 'bar',
    data: {
        labels: ['Hoje', 'Média 7d', 'Total (10%)'],
        datasets: [
            { label: 'Interno', data: [reportData.interno.leadsHoje, reportData.interno.mediaLeads7, reportData.interno.leads/10], backgroundColor: gradientBlue, borderRadius: 4, barPercentage: 0.6 },
            { label: 'Externo', data: [reportData.externo.leadsHoje, reportData.externo.mediaLeads7, reportData.externo.leads/10], backgroundColor: gradientCyan, borderRadius: 4, barPercentage: 0.6 }
        ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }, scales: { y: { beginAtZero: true, grid: { drawBorder: false, color: '#f1f5f9' }, ticks: { padding: 10 } }, x: { grid: { display: false } } } }
});

const ctxCPL = document.getElementById('chartCPL').getContext('2d');
new Chart(ctxCPL, {
    type: 'line',
    data: {
        labels: ['Meta Ideal', 'Média 7d', 'Média 30d'],
        datasets: [
            { label: 'Interno', data: [reportData.interno.cplIdeal, reportData.interno.mediaCpl7, reportData.interno.cpl30], borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.05)', borderWidth: 2, tension: 0.4, fill: true, pointBackgroundColor: '#2563eb', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5 },
            { label: 'Externo', data: [reportData.externo.cplIdeal, reportData.externo.mediaCpl7, reportData.externo.cpl30], borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.05)', borderWidth: 2, tension: 0.4, fill: true, pointBackgroundColor: '#06b6d4', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5 }
        ]
    },
    options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }, scales: { y: { grid: { drawBorder: false, color: '#f1f5f9', borderDash: [5, 5] }, ticks: { padding: 10 } }, x: { grid: { display: false } } } }
});
