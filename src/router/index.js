import { createRouter, createWebHistory } from 'vue-router'
import OverviewView from '../views/OverviewView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', redirect: '/overview' },
    { path: '/overview', name: 'overview', component: OverviewView, meta: { ownHeader: true } },
    { path: '/onboarding', name: 'onboarding', component: () => import('../views/OnboardingView.vue') },
    { path: '/workspaces', name: 'workspaces', component: () => import('../views/WorkspacesView.vue') },
    { path: '/billing', name: 'billing', component: () => import('../views/BillingView.vue') },
    { path: '/plans', name: 'plans', component: () => import('../views/PlansView.vue') },
    { path: '/addons', name: 'addons', component: () => import('../views/AddonsView.vue') },
    { path: '/seats', name: 'seats', component: () => import('../views/SeatsView.vue') },
    { path: '/promo-codes', name: 'promo-codes', component: () => import('../views/PromoCodesView.vue'), meta: { ownHeader: true } },
    { path: '/promo-codes/new', name: 'promo-create', component: () => import('../views/PromoCreateView.vue'), meta: { ownHeader: true } },
    { path: '/promo-codes/:id', name: 'promo-detail', component: () => import('../views/PromoDetailView.vue'), meta: { ownHeader: true } },
    { path: '/usage', name: 'usage', component: () => import('../views/UsageView.vue') },
    { path: '/enterprise', name: 'enterprise', component: () => import('../views/EnterpriseView.vue') },
    { path: '/compliance', name: 'compliance', component: () => import('../views/ComplianceView.vue') },
    { path: '/ops', name: 'ops', component: () => import('../views/OpsView.vue') },
    { path: '/audit', name: 'audit', component: () => import('../views/AuditView.vue') }
  ]
})

export default router
