import { createRouter, createWebHistory } from 'vue-router'
import OverviewView from '../views/OverviewView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/overview' },
    { path: '/overview', name: 'overview', component: OverviewView },
    { path: '/onboarding', name: 'onboarding', component: () => import('../views/OnboardingView.vue') },
    { path: '/workspaces', name: 'workspaces', component: () => import('../views/WorkspacesView.vue') },
    { path: '/billing', name: 'billing', component: () => import('../views/BillingView.vue') },
    { path: '/plans', name: 'plans', component: () => import('../views/PlansView.vue') },
    { path: '/addons', name: 'addons', component: () => import('../views/AddonsView.vue') },
    { path: '/seats', name: 'seats', component: () => import('../views/SeatsView.vue') },
    { path: '/usage', name: 'usage', component: () => import('../views/UsageView.vue') },
    { path: '/retention', name: 'retention', component: () => import('../views/RetentionView.vue') },
    { path: '/compliance', name: 'compliance', component: () => import('../views/ComplianceView.vue') },
    { path: '/ops', name: 'ops', component: () => import('../views/OpsView.vue') },
    { path: '/audit', name: 'audit', component: () => import('../views/AuditView.vue') }
  ]
})

export default router
