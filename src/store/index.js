import { defineStore } from 'pinia'

const calculateMrr = (plan, users, idxType, microsites) => {
  let mrr = 0;
  let baseUsers = 1;

  if (plan === 'Solo') {
    return 79; // Strictly Solo
  } else if (plan === 'Growth') {
    mrr += 179;
    baseUsers = 3;
  } else if (plan === 'Brokerage') {
    mrr += 399;
    baseUsers = 5; 
  } else if (plan === 'Enterprise') {
    mrr += 1200; 
    baseUsers = 20;
  }

  if (users > baseUsers) {
    mrr += (users - baseUsers) * 35;
  }

  if (idxType === 'IDX Core') mrr += 199;
  if (idxType === 'IDX Pro') mrr += 349;
  if (microsites > 0) mrr += (microsites * 29);

  return mrr;
}

export const useAppStore = defineStore('app', {
  state: () => ({
    rawData: {
      workspaces: [
        // --- SOLO PLAN (Strictly 1 user) ---
        { id: "WS-10001", brokerage: "Sunset Realty", plan: "Solo", status: "Active", risk: "Healthy", health: 95, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Today", date: "2026-05-01" },
        { id: "WS-10002", brokerage: "Gulf Homes", plan: "Solo", status: "Active", risk: "Healthy", health: 82, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Yesterday", date: "2026-04-20" },
        { id: "WS-10003", brokerage: "Prime Estates", plan: "Solo", status: "Payment Failed", risk: "Critical", health: 12, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "Payment", owner: "Support", last: "5 days ago", date: "2026-05-03" },
        { id: "WS-10004", brokerage: "City View Realty", plan: "Solo", status: "Active", risk: "Needs Attention", health: 64, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "No First Value", owner: "System", last: "Today", date: "2026-05-04" },
        { id: "WS-10005", brokerage: "Al Maskan Properties", plan: "Solo", status: "Active", risk: "Healthy", health: 88, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Today", date: "2026-02-15" },
        { id: "WS-10006", brokerage: "Nile Property Group", plan: "Solo", status: "Active", risk: "At Risk", health: 45, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "Support", last: "8 days ago", date: "2026-01-10" },
        { id: "WS-10007", brokerage: "Royal Living", plan: "Solo", status: "Active", risk: "Healthy", health: 91, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Today", date: "2026-05-02" },

        // --- GROWTH PLAN (3 free seats) ---
        { id: "WS-20001", brokerage: "Green Valley Homes", plan: "Growth", status: "Active", risk: "Healthy", health: 92, users: 3, idx: "IDX Core", microsites: 2, onboarding: "First Value", owner: "Manager", last: "Today", date: "2026-05-02" },
        { id: "WS-20002", brokerage: "Elite Home Team", plan: "Growth", status: "Active", risk: "Healthy", health: 87, users: 5, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "Admin", last: "Yesterday", date: "2026-04-12" },
        { id: "WS-20003", brokerage: "Trust Brokers", plan: "Growth", status: "Active", risk: "Needs Attention", health: 58, users: 3, idx: "IDX Core", microsites: 0, onboarding: "No First Value", owner: "Support", last: "7 days ago", date: "2026-05-01" },
        { id: "WS-20004", brokerage: "Skyline Realty", plan: "Growth", status: "Payment Failed", risk: "Critical", health: 22, users: 4, idx: "IDX Pro", microsites: 1, onboarding: "Payment", owner: "Support", last: "Today", date: "2026-05-04" },
        { id: "WS-20005", brokerage: "Crescent Properties", plan: "Growth", status: "Active", risk: "Healthy", health: 94, users: 8, idx: "IDX Pro", microsites: 5, onboarding: "First Value", owner: "Manager", last: "Today", date: "2025-11-20" },
        { id: "WS-20006", brokerage: "Palm Gate Realty", plan: "Growth", status: "Active", risk: "At Risk", health: 41, users: 3, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "Support", last: "12 days ago", date: "2026-02-05" },
        { id: "WS-20007", brokerage: "Horizon Real Estate", plan: "Growth", status: "Active", risk: "Healthy", health: 85, users: 12, idx: "IDX Core", microsites: 10, onboarding: "First Value", owner: "Manager", last: "Today", date: "2026-03-30" },
        { id: "WS-20008", brokerage: "Desert Rose Homes", plan: "Growth", status: "Active", risk: "Needs Attention", health: 66, users: 3, idx: "Not Purchased", microsites: 0, onboarding: "No First Value", owner: "Support", last: "3 days ago", date: "2026-05-03" },

        // --- BROKERAGE PLAN (5 free seats) ---
        { id: "WS-30001", brokerage: "Kingdom Properties", plan: "Brokerage", status: "Active", risk: "Healthy", health: 98, users: 45, idx: "IDX Pro", microsites: 20, onboarding: "First Value", owner: "Director", last: "Today", date: "2024-06-01" },
        { id: "WS-30002", brokerage: "Oasis Real Estate", plan: "Brokerage", status: "Active", risk: "At Risk", health: 52, users: 15, idx: "IDX Pro", microsites: 0, onboarding: "First Value", owner: "Support", last: "Today", date: "2025-08-15" },
        { id: "WS-30003", brokerage: "Summit Brokers", plan: "Brokerage", status: "Active", risk: "Healthy", health: 89, users: 32, idx: "IDX Core", microsites: 5, onboarding: "First Value", owner: "Director", last: "Yesterday", date: "2025-12-10" },
        { id: "WS-30004", brokerage: "Golden Key Realty", plan: "Brokerage", status: "Active", risk: "Critical", health: 34, users: 8, idx: "IDX Pro", microsites: 2, onboarding: "First Value", owner: "Support", last: "15 days ago", date: "2026-04-05" },
        { id: "WS-30005", brokerage: "Prestige Homes", plan: "Brokerage", status: "Active", risk: "Healthy", health: 91, users: 55, idx: "IDX Pro", microsites: 30, onboarding: "First Value", owner: "Director", last: "Today", date: "2026-01-20" },
        { id: "WS-30006", brokerage: "Metro Living", plan: "Brokerage", status: "Active", risk: "Needs Attention", health: 61, users: 5, idx: "Not Purchased", microsites: 0, onboarding: "No First Value", owner: "Support", last: "4 days ago", date: "2026-05-02" },

        // --- ENTERPRISE PLAN (20 free seats) ---
        { id: "WS-40001", brokerage: "Al Rajhi Real Estate", plan: "Enterprise", status: "Active", risk: "Healthy", health: 96, users: 120, idx: "IDX Pro", microsites: 50, onboarding: "First Value", owner: "Legal", last: "Today", date: "2023-12-01" },
        { id: "WS-40002", brokerage: "Emaar Properties", plan: "Enterprise", status: "Contract Required", risk: "At Risk", health: 55, users: 85, idx: "IDX Pro", microsites: 40, onboarding: "Enterprise Info", owner: "Legal", last: "5 days ago", date: "2026-05-02" },
        { id: "WS-40003", brokerage: "Dar Al Arkan", plan: "Enterprise", status: "Active", risk: "Healthy", health: 99, users: 350, idx: "IDX Pro", microsites: 100, onboarding: "First Value", owner: "Legal", last: "Today", date: "2024-01-15" },

        // --- MIXED ADDITIONS TO REACH 50+ ---
        { id: "WS-10008", brokerage: "Lighthouse Realty", plan: "Solo", status: "Active", risk: "Healthy", health: 87, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Today", date: "2026-05-04" },
        { id: "WS-10009", brokerage: "Cedar Homes", plan: "Solo", status: "Active", risk: "Healthy", health: 93, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Yesterday", date: "2026-04-28" },
        { id: "WS-10010", brokerage: "Marina Properties", plan: "Solo", status: "Active", risk: "Needs Attention", health: 59, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "No First Value", owner: "Support", last: "Today", date: "2026-05-04" },
        { id: "WS-20009", brokerage: "Capital Brokers", plan: "Growth", status: "Active", risk: "Healthy", health: 84, users: 4, idx: "IDX Core", microsites: 1, onboarding: "First Value", owner: "Manager", last: "Today", date: "2026-05-04" },
        { id: "WS-20010", brokerage: "Pearl Real Estate", plan: "Growth", status: "Active", risk: "Healthy", health: 90, users: 6, idx: "IDX Pro", microsites: 4, onboarding: "First Value", owner: "Manager", last: "Yesterday", date: "2026-05-03" },
        { id: "WS-20011", brokerage: "Atlas Realty", plan: "Growth", status: "Active", risk: "At Risk", health: 47, users: 3, idx: "IDX Core", microsites: 0, onboarding: "First Value", owner: "Support", last: "Today", date: "2026-05-04" },
        { id: "WS-20012", brokerage: "Falcon Properties", plan: "Growth", status: "Active", risk: "Healthy", health: 88, users: 10, idx: "IDX Pro", microsites: 2, onboarding: "First Value", owner: "Manager", last: "Today", date: "2026-05-04" },
        { id: "WS-30007", brokerage: "Crown Realty Group", plan: "Brokerage", status: "Active", risk: "Healthy", health: 92, users: 20, idx: "IDX Pro", microsites: 10, onboarding: "First Value", owner: "Director", last: "Today", date: "2026-05-04" },
        { id: "WS-30008", brokerage: "Diamond Homes", plan: "Brokerage", status: "Payment Failed", risk: "Critical", health: 18, users: 15, idx: "IDX Core", microsites: 0, onboarding: "First Value", owner: "Support", last: "Today", date: "2026-05-04" },
        { id: "WS-30009", brokerage: "Vista Properties", plan: "Brokerage", status: "Active", risk: "Healthy", health: 86, users: 40, idx: "IDX Pro", microsites: 25, onboarding: "First Value", owner: "Director", last: "Today", date: "2026-05-04" },
        { id: "WS-10011", brokerage: "Sahara Estates", plan: "Solo", status: "Active", risk: "Healthy", health: 91, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Today", date: "2026-05-04" },
        { id: "WS-10012", brokerage: "Coral Bay Realty", plan: "Solo", status: "Active", risk: "Healthy", health: 85, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Today", date: "2026-05-04" },
        { id: "WS-20013", brokerage: "Amber Properties", plan: "Growth", status: "Active", risk: "Healthy", health: 95, users: 5, idx: "IDX Pro", microsites: 2, onboarding: "First Value", owner: "Manager", last: "Today", date: "2026-05-04" },
        { id: "WS-20014", brokerage: "Silver Key Homes", plan: "Growth", status: "Active", risk: "Healthy", health: 82, users: 3, idx: "IDX Core", microsites: 1, onboarding: "First Value", owner: "Manager", last: "Today", date: "2026-05-04" }
      ].map(w => {
        const freeSeats = w.plan === 'Solo' ? 1 : (w.plan === 'Growth' ? 3 : (w.plan === 'Brokerage' ? 5 : 20));
        return {
          ...w,
          freeSeats,
          mrr: calculateMrr(w.plan, w.users, w.idx, w.microsites),
          seats: `${w.users}/${w.plan === 'Solo' ? 1 : (w.plan === 'Enterprise' ? Math.max(100, w.users + 20) : Math.max(freeSeats, w.users))}`
        };
      }),
      onboardingSteps: [
        { step: "Signup Started", reached: 2450, next: 2180, drop: 11.0 },
        { step: "Account Created", reached: 2180, next: 1950, drop: 10.5 },
        { step: "Plan Selected", reached: 1950, next: 1620, drop: 16.9 },
        { step: "Payment", reached: 1620, next: 1480, drop: 8.6 },
        { step: "CRM Completed", reached: 1480, next: 1120, drop: 24.3 },
        { step: "First Value", reached: 1120, next: 450, drop: 59.8 },
        { step: "Optional IDX", reached: 450, next: 210, drop: 53.3 }
      ],
      canceledAddons: [
        { id: 'CA-001', workspace: 'WS-30002', brokerage: 'Oasis Real Estate', addon: 'IDX Pro', monthlyPrice: 349, cancelDate: '2026-04-28' },
        { id: 'CA-002', workspace: 'WS-20006', brokerage: 'Palm Gate Realty', addon: 'Marketing Automation', monthlyPrice: 149, cancelDate: '2026-04-15' },
        { id: 'CA-003', workspace: 'WS-10006', brokerage: 'Nile Property Group', addon: 'Social Suite', monthlyPrice: 99, cancelDate: '2026-05-01' },
        { id: 'CA-004', workspace: 'WS-30004', brokerage: 'Golden Key Realty', addon: 'IDX Core', monthlyPrice: 199, cancelDate: '2026-04-20' },
        { id: 'CA-005', workspace: 'WS-20011', brokerage: 'Atlas Realty', addon: 'Agent Microsites', monthlyPrice: 87, cancelDate: '2026-05-02' },
        { id: 'CA-006', workspace: 'WS-20003', brokerage: 'Trust Brokers', addon: 'Marketing Automation', monthlyPrice: 149, cancelDate: '2026-04-10' }
      ],
      enterpriseRequests: [
        { id: 'ER-001', brokerage: 'National Housing Corp', contact: 'Mohammed Al-Salem', email: 'msalem@nhc.sa', phone: '+966 55 123 4567', type: 'Demo Request', status: 'New', date: '2026-05-03' },
        { id: 'ER-002', brokerage: 'Gulf Alliance Realty', contact: 'Fahad Al-Rashidi', email: 'fahad@gar.ae', phone: '+971 50 987 6543', type: 'Upgrade Request', status: 'In Progress', date: '2026-05-01' },
        { id: 'ER-003', brokerage: 'Jabal Properties', contact: 'Sara Al-Harbi', email: 'sara@jabal.com', phone: '+966 54 222 3333', type: 'Custom Plan', status: 'New', date: '2026-05-04' },
        { id: 'ER-004', brokerage: 'Platinum Real Estate', contact: 'Ahmad Nasser', email: 'anasser@platinum.ae', phone: '+971 55 444 5555', type: 'Demo Request', status: 'Completed', date: '2026-04-25' },
        { id: 'ER-005', brokerage: 'Royal Crown Developers', contact: 'Khalid bin Saeed', email: 'khalid@rcd.sa', phone: '+966 50 666 7777', type: 'Upgrade Request', status: 'In Progress', date: '2026-04-30' }
      ]
    },
    filters: {
      dateRange: 'month',
      plan: 'all'
    },
    isMvpMode: false
  }),
  getters: {
    filteredWorkspaces(state) {
      const now = new Date("2026-05-04");
      return state.rawData.workspaces.filter(w => {
        const planMatch = state.filters.plan === 'all' || w.plan === state.filters.plan;
        const wsDate = new Date(w.date);
        let dateMatch = true;
        if (state.filters.dateRange === 'month') {
          dateMatch = wsDate.getMonth() === now.getMonth() && wsDate.getFullYear() === now.getFullYear();
        } else if (state.filters.dateRange === 'quarter') {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const wsQuarter = Math.floor(wsDate.getMonth() / 3);
          dateMatch = wsQuarter === currentQuarter && wsDate.getFullYear() === now.getFullYear();
        } else if (state.filters.dateRange === 'year') {
          dateMatch = wsDate.getFullYear() === now.getFullYear();
        }
        return planMatch && dateMatch;
      });
    },
    filteredKpis() {
      const workspaces = this.filteredWorkspaces;
      const totalMRR = workspaces.reduce((sum, w) => sum + w.mrr, 0);
      const riskMRR = workspaces.filter(w => ['At Risk', 'Critical'].includes(w.risk)).reduce((sum, w) => sum + w.mrr, 0);
      const activeSeats = workspaces.reduce((sum, w) => sum + w.users, 0);
      const totalAddons = workspaces.filter(w => w.idx !== 'Not Purchased').length + workspaces.filter(w => w.microsites > 0).length;
      const onboardingCompleted = workspaces.filter(w => w.onboarding === 'First Value').length;
      const paidWs = workspaces.filter(w => w.status !== 'Payment Failed');
      return {
        totalWorkspaces: workspaces.length,
        activeWorkspaces: workspaces.filter(w => w.status === 'Active').length,
        onboardingCompleted,
        firstValue: onboardingCompleted,
        mrr: totalMRR,
        arr: totalMRR * 12,
        revenueAtRisk: riskMRR,
        paidInvoices: paidWs.length,
        paidAmount: paidWs.reduce((sum, w) => sum + w.mrr, 0),
        overdueInvoices: workspaces.filter(w => w.status === 'Payment Failed').length,
        activeSeats,
        totalSeats: activeSeats,
        totalAddons,
        seatUtilization: workspaces.length > 0 ? 85 : 0,
        addonAttach: Math.round((workspaces.filter(w => w.idx !== 'Not Purchased').length / (workspaces.length || 1)) * 100) || 0,
        churnRisk: workspaces.filter(w => ['At Risk', 'Critical'].includes(w.risk)).length
      }
    },
    top10ByUsers() {
      return [...this.filteredWorkspaces].sort((a, b) => b.users - a.users).slice(0, 10);
    },
    top10ByValue() {
      return [...this.filteredWorkspaces].sort((a, b) => b.mrr - a.mrr).slice(0, 10);
    },
    revenueMix() {
      const mix = {};
      this.filteredWorkspaces.forEach(w => { mix[w.plan] = (mix[w.plan] || 0) + w.mrr; });
      return [
        { name: "Enterprise", value: mix['Enterprise'] || 0, color: "purple" },
        { name: "Brokerage", value: mix['Brokerage'] || 0, color: "green" },
        { name: "Growth", value: mix['Growth'] || 0, color: "orange" },
        { name: "Solo", value: mix['Solo'] || 0, color: "blue" }
      ].filter(r => r.value > 0).sort((a,b) => b.value - a.value);
    },
    planPerformance(state) {
      const plans = ['Solo', 'Growth', 'Brokerage', 'Enterprise'];
      const mockChanges = { Solo: { upgrades: 12, downgrades: 0 }, Growth: { upgrades: 18, downgrades: 5 }, Brokerage: { upgrades: 8, downgrades: 3 }, Enterprise: { upgrades: 2, downgrades: 1 } };
      return plans.map(p => {
        const ws = state.rawData.workspaces.filter(w => {
          return w.plan === p;
        });
        if (state.filters.plan !== 'all' && state.filters.plan !== p) return null;
        if (ws.length === 0) return null;
        const revenue = ws.reduce((sum, w) => sum + w.mrr, 0);
        const zeroAddons = ws.filter(w => w.idx === 'Not Purchased' && w.microsites === 0).length;
        const mc = mockChanges[p];
        return {
          plan: p, accounts: ws.length, revenue: `$${revenue.toLocaleString()}`,
          revenueRaw: revenue,
          upgrades: mc.upgrades, downgrades: mc.downgrades,
          samePlan: Math.max(0, ws.length - mc.upgrades - mc.downgrades),
          upsale: zeroAddons,
          activation: Math.round((ws.filter(w => w.onboarding === 'First Value').length / ws.length) * 100) + '%',
          signal: ws.filter(w => w.onboarding === 'First Value').length / ws.length > 0.6 ? 'Healthy' : 'Needs Attention'
        }
      }).filter(Boolean);
    },
    planMatrix(state) {
      const plans = ['Solo', 'Growth', 'Brokerage', 'Enterprise'];
      return plans.map(p => {
        const ws = state.rawData.workspaces.filter(w => {
          return w.plan === p;
        });
        if (state.filters.plan !== 'all' && state.filters.plan !== p) return null;
        if(ws.length === 0) return null;
        const mrr = ws.reduce((sum, w) => sum + w.mrr, 0);
        const activation = Math.round((ws.filter(w => w.onboarding === 'First Value').length / ws.length) * 100);
        const addons = Math.round((ws.filter(w => w.idx !== 'Not Purchased').length / ws.length) * 100);
        return { plan: p, accounts: ws.length, mrr: `$${mrr.toLocaleString()}`, activation: `${activation}%`, addons: `${addons}%`, signal: activation > 60 ? 'Healthy' : 'Needs Attention' }
      }).filter(Boolean);
    },
    addonFunnel() {
      const workspaces = this.filteredWorkspaces;
      const total = workspaces.length || 1;
      const idx = workspaces.filter(w => w.idx !== 'Not Purchased').length;
      const micro = workspaces.filter(w => w.microsites > 0).length;
      return [
        { name: "IDX Website Integration", value: Math.round((idx/total)*100), color: "orange" },
        { name: "Agent Microsites", value: Math.round((micro/total)*100), color: "blue" }
      ];
    },
    canceledAddonsData(state) {
      const total = state.rawData.canceledAddons.length;
      const lostRevenue = state.rawData.canceledAddons.reduce((sum, a) => sum + a.monthlyPrice, 0);
      return { items: state.rawData.canceledAddons, total, lostRevenue };
    },
    invoices() {
      return this.filteredWorkspaces.map((w, i) => ({
        id: `INV-100${31 + i}`,
        workspace: w.id,
        brokerage: w.brokerage,
        plan: w.plan,
        amount: "$" + w.mrr.toLocaleString(),
        amountRaw: w.mrr,
        status: w.status === 'Payment Failed' ? 'Failed' : 'Paid',
        due: `May 0${(i%9)+1}, 2026`,
        age: w.status === 'Payment Failed' ? '3d' : '0d'
      }))
    },
    rescueQueue() {
      return this.filteredWorkspaces.filter(w => ['Critical', 'At Risk', 'Needs Attention'].includes(w.risk)).map(w => ({
        name: w.brokerage || w.id,
        current: w.status === 'Payment Failed' ? 'Payment Failed' : (w.onboarding === 'First Value' ? 'Broker Authorization' : 'First Record Pending'),
        stuck: w.last,
        mrr: "$" + w.mrr.toLocaleString(),
        action: w.status === 'Payment Failed' ? "Billing retry" : "Guided checklist + training",
        risk: w.risk
      }));
    },
    enterpriseWorkspaces() {
      return this.filteredWorkspaces.filter(w => w.plan === 'Enterprise');
    },
    audit() {
      const workspaces = this.filteredWorkspaces;
      const events = [];
      workspaces.forEach(w => {
        if (w.status === 'Payment Failed') events.push({ event: "payment_failed", actor: "System", workspace: w.id, target: "Invoice", time: w.last, severity: "High" });
        if (w.users > w.freeSeats) events.push({ event: "seat_added", actor: "Admin", workspace: w.id, target: "User Account", time: "2 days ago", severity: "Info" });
        if (w.idx !== 'Not Purchased') events.push({ event: "idx_sync_enabled", actor: "System", workspace: w.id, target: "MLS Feed", time: "Today", severity: "Medium" });
      });
      return events.length > 0 ? events : [{ event: "No events", actor: "-", workspace: "-", target: "-", time: "-", severity: "Low" }];
    },
    compliance() {
      return this.filteredWorkspaces.filter(w => w.idx !== 'Not Purchased').map(w => ({
        workspace: w.id,
        idx: w.risk === 'Critical' ? 'Suspended' : 'Active',
        mls: w.risk === 'Critical' ? 'Failed' : 'Verified',
        broker: w.risk === 'At Risk' ? 'Pending' : 'Approved',
        sync: w.risk === 'Critical' ? 'Disabled' : 'Success',
        last: w.last,
        risk: w.risk === 'Critical' ? 'High' : (w.risk === 'At Risk' ? 'Medium' : 'Low')
      }));
    }
  },
  actions: {
    setFilter(key, value) { this.filters[key] = value; },
    toggleMvpMode() { this.isMvpMode = !this.isMvpMode; }
  }
})
