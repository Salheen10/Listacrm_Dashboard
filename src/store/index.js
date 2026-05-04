import { defineStore } from 'pinia'

const calculateMrr = (plan, users, idxType, microsites) => {
  let mrr = 0;
  let baseUsers = 1;

  if (plan === 'Starter') {
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
        // --- STARTER PLAN (Strictly 1 user) ---
        { id: "WS-10001", plan: "Starter", status: "Active", risk: "Healthy", health: 95, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Today", date: "2026-05-01" },
        { id: "WS-10002", plan: "Starter", status: "Active", risk: "Healthy", health: 82, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Yesterday", date: "2026-04-20" },
        { id: "WS-10003", plan: "Starter", status: "Payment Failed", risk: "Critical", health: 12, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "Payment", owner: "Support", last: "5 days ago", date: "2026-05-03" },
        { id: "WS-10004", plan: "Starter", status: "Active", risk: "Needs Attention", health: 64, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "No First Value", owner: "System", last: "Today", date: "2026-05-04" },
        { id: "WS-10005", plan: "Starter", status: "Active", risk: "Healthy", health: 88, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Today", date: "2026-02-15" },
        { id: "WS-10006", plan: "Starter", status: "Active", risk: "At Risk", health: 45, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "Support", last: "8 days ago", date: "2026-01-10" },
        { id: "WS-10007", plan: "Starter", status: "Active", risk: "Healthy", health: 91, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Today", date: "2026-05-02" },

        // --- GROWTH PLAN (3 free seats) ---
        { id: "WS-20001", plan: "Growth", status: "Active", risk: "Healthy", health: 92, users: 3, idx: "IDX Core", microsites: 2, onboarding: "First Value", owner: "Manager", last: "Today", date: "2026-05-02" },
        { id: "WS-20002", plan: "Growth", status: "Active", risk: "Healthy", health: 87, users: 5, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "Admin", last: "Yesterday", date: "2026-04-12" },
        { id: "WS-20003", plan: "Growth", status: "Active", risk: "Needs Attention", health: 58, users: 3, idx: "IDX Core", microsites: 0, onboarding: "No First Value", owner: "Support", last: "7 days ago", date: "2026-05-01" },
        { id: "WS-20004", plan: "Growth", status: "Payment Failed", risk: "Critical", health: 22, users: 4, idx: "IDX Pro", microsites: 1, onboarding: "Payment", owner: "Support", last: "Today", date: "2026-05-04" },
        { id: "WS-20005", plan: "Growth", status: "Active", risk: "Healthy", health: 94, users: 8, idx: "IDX Pro", microsites: 5, onboarding: "First Value", owner: "Manager", last: "Today", date: "2025-11-20" },
        { id: "WS-20006", plan: "Growth", status: "Active", risk: "At Risk", health: 41, users: 3, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "Support", last: "12 days ago", date: "2026-02-05" },
        { id: "WS-20007", plan: "Growth", status: "Active", risk: "Healthy", health: 85, users: 12, idx: "IDX Core", microsites: 10, onboarding: "First Value", owner: "Manager", last: "Today", date: "2026-03-30" },
        { id: "WS-20008", plan: "Growth", status: "Active", risk: "Needs Attention", health: 66, users: 3, idx: "Not Purchased", microsites: 0, onboarding: "No First Value", owner: "Support", last: "3 days ago", date: "2026-05-03" },

        // --- BROKERAGE PLAN (5 free seats) ---
        { id: "WS-30001", plan: "Brokerage", status: "Active", risk: "Healthy", health: 98, users: 45, idx: "IDX Pro", microsites: 20, onboarding: "First Value", owner: "Director", last: "Today", date: "2024-06-01" },
        { id: "WS-30002", plan: "Brokerage", status: "Active", risk: "At Risk", health: 52, users: 15, idx: "IDX Pro", microsites: 0, onboarding: "First Value", owner: "Support", last: "Today", date: "2025-08-15" },
        { id: "WS-30003", plan: "Brokerage", status: "Active", risk: "Healthy", health: 89, users: 32, idx: "IDX Core", microsites: 5, onboarding: "First Value", owner: "Director", last: "Yesterday", date: "2025-12-10" },
        { id: "WS-30004", plan: "Brokerage", status: "Active", risk: "Critical", health: 34, users: 8, idx: "IDX Pro", microsites: 2, onboarding: "First Value", owner: "Support", last: "15 days ago", date: "2026-04-05" },
        { id: "WS-30005", plan: "Brokerage", status: "Active", risk: "Healthy", health: 91, users: 55, idx: "IDX Pro", microsites: 30, onboarding: "First Value", owner: "Director", last: "Today", date: "2026-01-20" },
        { id: "WS-30006", plan: "Brokerage", status: "Active", risk: "Needs Attention", health: 61, users: 5, idx: "Not Purchased", microsites: 0, onboarding: "No First Value", owner: "Support", last: "4 days ago", date: "2026-05-02" },

        // --- ENTERPRISE PLAN (20 free seats) ---
        { id: "WS-40001", plan: "Enterprise", status: "Active", risk: "Healthy", health: 96, users: 120, idx: "IDX Pro", microsites: 50, onboarding: "First Value", owner: "Legal", last: "Today", date: "2023-12-01" },
        { id: "WS-40002", plan: "Enterprise", status: "Contract Required", risk: "At Risk", health: 55, users: 85, idx: "IDX Pro", microsites: 40, onboarding: "Enterprise Info", owner: "Legal", last: "5 days ago", date: "2026-05-02" },
        { id: "WS-40003", plan: "Enterprise", status: "Active", risk: "Healthy", health: 99, users: 350, idx: "IDX Pro", microsites: 100, onboarding: "First Value", owner: "Legal", last: "Today", date: "2024-01-15" },

        // --- MIXED ADDITIONS TO REACH 50+ ---
        { id: "WS-10008", plan: "Starter", status: "Active", risk: "Healthy", health: 87, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Today", date: "2026-05-04" },
        { id: "WS-10009", plan: "Starter", status: "Active", risk: "Healthy", health: 93, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Yesterday", date: "2026-04-28" },
        { id: "WS-10010", plan: "Starter", status: "Active", risk: "Needs Attention", health: 59, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "No First Value", owner: "Support", last: "Today", date: "2026-05-04" },
        { id: "WS-20009", plan: "Growth", status: "Active", risk: "Healthy", health: 84, users: 4, idx: "IDX Core", microsites: 1, onboarding: "First Value", owner: "Manager", last: "Today", date: "2026-05-04" },
        { id: "WS-20010", plan: "Growth", status: "Active", risk: "Healthy", health: 90, users: 6, idx: "IDX Pro", microsites: 4, onboarding: "First Value", owner: "Manager", last: "Yesterday", date: "2026-05-03" },
        { id: "WS-20011", plan: "Growth", status: "Active", risk: "At Risk", health: 47, users: 3, idx: "IDX Core", microsites: 0, onboarding: "First Value", owner: "Support", last: "Today", date: "2026-05-04" },
        { id: "WS-20012", plan: "Growth", status: "Active", risk: "Healthy", health: 88, users: 10, idx: "IDX Pro", microsites: 2, onboarding: "First Value", owner: "Manager", last: "Today", date: "2026-05-04" },
        { id: "WS-30007", plan: "Brokerage", status: "Active", risk: "Healthy", health: 92, users: 20, idx: "IDX Pro", microsites: 10, onboarding: "First Value", owner: "Director", last: "Today", date: "2026-05-04" },
        { id: "WS-30008", plan: "Brokerage", status: "Payment Failed", risk: "Critical", health: 18, users: 15, idx: "IDX Core", microsites: 0, onboarding: "First Value", owner: "Support", last: "Today", date: "2026-05-04" },
        { id: "WS-30009", plan: "Brokerage", status: "Active", risk: "Healthy", health: 86, users: 40, idx: "IDX Pro", microsites: 25, onboarding: "First Value", owner: "Director", last: "Today", date: "2026-05-04" },
        { id: "WS-10011", plan: "Starter", status: "Active", risk: "Healthy", health: 91, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Today", date: "2026-05-04" },
        { id: "WS-10012", plan: "Starter", status: "Active", risk: "Healthy", health: 85, users: 1, idx: "Not Purchased", microsites: 0, onboarding: "First Value", owner: "System", last: "Today", date: "2026-05-04" },
        { id: "WS-20013", plan: "Growth", status: "Active", risk: "Healthy", health: 95, users: 5, idx: "IDX Pro", microsites: 2, onboarding: "First Value", owner: "Manager", last: "Today", date: "2026-05-04" },
        { id: "WS-20014", plan: "Growth", status: "Active", risk: "Healthy", health: 82, users: 3, idx: "IDX Core", microsites: 1, onboarding: "First Value", owner: "Manager", last: "Today", date: "2026-05-04" }
      ].map(w => {
        const freeSeats = w.plan === 'Starter' ? 1 : (w.plan === 'Growth' ? 3 : (w.plan === 'Brokerage' ? 5 : 20));
        return {
          ...w,
          freeSeats,
          mrr: calculateMrr(w.plan, w.users, w.idx, w.microsites),
          seats: `${w.users}/${w.plan === 'Starter' ? 1 : (w.plan === 'Enterprise' ? Math.max(100, w.users + 20) : Math.max(freeSeats, w.users))}`
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
      ]
    },
    filters: {
      dateRange: 'month',
      plan: 'all',
      risk: 'all'
    },
    isMvpMode: false
  }),
  getters: {
    filteredWorkspaces(state) {
      const now = new Date("2026-05-04");
      return state.rawData.workspaces.filter(w => {
        const planMatch = state.filters.plan === 'all' || w.plan === state.filters.plan;
        const riskMatch = state.filters.risk === 'all' || w.risk === state.filters.risk;
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
        return planMatch && riskMatch && dateMatch;
      });
    },
    filteredKpis() {
      const workspaces = this.filteredWorkspaces;
      const totalMRR = workspaces.reduce((sum, w) => sum + w.mrr, 0);
      const riskMRR = workspaces.filter(w => ['At Risk', 'Critical'].includes(w.risk)).reduce((sum, w) => sum + w.mrr, 0);
      const activeSeats = workspaces.reduce((sum, w) => sum + w.users, 0);
      const onboardingCompleted = workspaces.filter(w => w.onboarding === 'First Value').length;
      return {
        totalWorkspaces: workspaces.length,
        activeWorkspaces: workspaces.filter(w => w.status === 'Active').length,
        onboardingCompleted,
        firstValue: onboardingCompleted,
        mrr: totalMRR,
        arr: totalMRR * 12,
        revenueAtRisk: riskMRR,
        paidInvoices: workspaces.filter(w => w.status !== 'Payment Failed').length,
        overdueInvoices: workspaces.filter(w => w.status === 'Payment Failed').length,
        activeSeats,
        seatUtilization: workspaces.length > 0 ? 85 : 0, 
        addonAttach: Math.round((workspaces.filter(w => w.idx !== 'Not Purchased').length / (workspaces.length || 1)) * 100) || 0,
        churnRisk: workspaces.filter(w => ['At Risk', 'Critical'].includes(w.risk)).length
      }
    },
    revenueMix() {
      const mix = {};
      this.filteredWorkspaces.forEach(w => { mix[w.plan] = (mix[w.plan] || 0) + w.mrr; });
      return [
        { name: "Enterprise", value: mix['Enterprise'] || 0, color: "purple" },
        { name: "Brokerage", value: mix['Brokerage'] || 0, color: "green" },
        { name: "Growth", value: mix['Growth'] || 0, color: "orange" },
        { name: "Starter", value: mix['Starter'] || 0, color: "blue" }
      ].filter(r => r.value > 0).sort((a,b) => b.value - a.value);
    },
    planMatrix(state) {
      const plans = ['Starter', 'Growth', 'Brokerage', 'Enterprise'];
      return plans.map(p => {
        const ws = state.rawData.workspaces.filter(w => {
          const riskMatch = state.filters.risk === 'all' || w.risk === state.filters.risk;
          return riskMatch && w.plan === p;
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
        { name: "IDX Integration", value: Math.round((idx/total)*100), color: "orange" },
        { name: "Agent Microsites", value: Math.round((micro/total)*100), color: "blue" }
      ];
    },
    invoices() {
      return this.filteredWorkspaces.map((w, i) => ({
        id: `INV-100${31 + i}`,
        workspace: w.id,
        plan: w.plan,
        amount: "$" + w.mrr.toLocaleString(),
        status: w.status === 'Payment Failed' ? 'Failed' : 'Paid',
        due: `May 0${(i%9)+1}, 2026`,
        age: w.status === 'Payment Failed' ? '3d' : '0d'
      }))
    },
    rescueQueue() {
      return this.filteredWorkspaces.filter(w => ['Critical', 'At Risk', 'Needs Attention'].includes(w.risk)).map(w => ({
        name: w.id,
        current: w.status === 'Payment Failed' ? 'Payment Failed' : (w.onboarding === 'First Value' ? 'Broker Authorization' : 'First Record Pending'),
        stuck: w.last,
        mrr: "$" + w.mrr.toLocaleString(),
        action: w.status === 'Payment Failed' ? "Billing retry" : "Guided checklist + training",
        risk: w.risk
      }));
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
