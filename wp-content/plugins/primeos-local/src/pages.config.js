// @ts-nocheck
/**
 * pages.config.js - Page routing configuration with dynamic code-splitting
 */
import { lazy } from 'react';
import __Layout from './Layout.jsx';

const AIAssistant = lazy(() => import('./pages/AIAssistant.jsx'));
const AIInsights = lazy(() => import('./pages/AIInsights.jsx'));
const Activities = lazy(() => import('./pages/Activities.jsx'));
const AdminPanel = lazy(() => import('./pages/AdminPanel.jsx'));
const AdvancedReports = lazy(() => import('./pages/AdvancedReports.jsx'));
const Agenda = lazy(() => import('./pages/Agenda.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const AppointmentReports = lazy(() => import('./pages/AppointmentReports.jsx'));
const Apps = lazy(() => import('./pages/Apps.jsx'));
const BusinessModelCanvas = lazy(() => import('./pages/BusinessModelCanvas.jsx'));
const CRM = lazy(() => import('./pages/CRM.jsx'));
const CRMAgenda = lazy(() => import('./pages/CRMAgenda.jsx'));
const CRMAvancado = lazy(() => import('./pages/CRMAvancado.jsx'));
const Campanhas = lazy(() => import('./pages/Campanhas.jsx'));
const Canais = lazy(() => import('./pages/Canais.jsx'));
const Catalogo = lazy(() => import('./pages/Catalogo.jsx'));
const Channels = lazy(() => import('./pages/Channels.jsx'));
const ClientPortal = lazy(() => import('./pages/ClientPortal.jsx'));
const ContentCreator = lazy(() => import('./pages/ContentCreator.jsx'));
const Conteudos = lazy(() => import('./pages/Conteudos.jsx'));
const CostStructure = lazy(() => import('./pages/CostStructure.jsx'));
const CustomerPipeline = lazy(() => import('./pages/CustomerPipeline.jsx'));
const CustomerRelationships = lazy(() => import('./pages/CustomerRelationships.jsx'));
const CustomerSegments = lazy(() => import('./pages/CustomerSegments.jsx'));
const CustomerSupport = lazy(() => import('./pages/CustomerSupport.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const DashboardFinanceiro = lazy(() => import('./pages/DashboardFinanceiro.jsx'));
const EHR = lazy(() => import('./pages/EHR.jsx'));
const EHRIntegration = lazy(() => import('./pages/EHRIntegration.jsx'));
const EmailAutomation = lazy(() => import('./pages/EmailAutomation.jsx'));
const Estrategias = lazy(() => import('./pages/Estrategias.jsx'));
const Financeiro = lazy(() => import('./pages/Financeiro.jsx'));
const FollowUpAutomation = lazy(() => import('./pages/FollowUpAutomation.jsx'));
const Gamification = lazy(() => import('./pages/Gamification.jsx'));
const Inventory = lazy(() => import('./pages/Inventory.jsx'));
const InventoryReports = lazy(() => import('./pages/InventoryReports.jsx'));
const JornadaCliente = lazy(() => import('./pages/JornadaCliente.jsx'));
const JourneyMapping = lazy(() => import('./pages/JourneyMapping.jsx'));
const KeyActivities = lazy(() => import('./pages/KeyActivities.jsx'));
const KeyPartnerships = lazy(() => import('./pages/KeyPartnerships.jsx'));
const KeyResources = lazy(() => import('./pages/KeyResources.jsx'));
const LeadsPipeline = lazy(() => import('./pages/LeadsPipeline.jsx'));
const MarketingAutomation = lazy(() => import('./pages/MarketingAutomation.jsx'));
const MarketingOS = lazy(() => import('./pages/MarketingOS.jsx'));
const Metricas = lazy(() => import('./pages/Metricas.jsx'));
const MeuAgendamento = lazy(() => import('./pages/MeuAgendamento.jsx'));
const OnlineBooking = lazy(() => import('./pages/OnlineBooking.jsx'));
const POPs = lazy(() => import('./pages/POPs.jsx'));
const PatientPipeline = lazy(() => import('./pages/PatientPipeline.jsx'));
const Patients = lazy(() => import('./pages/Patients.jsx'));
const PrimeOS = lazy(() => import('./pages/PrimeOS.jsx'));
const Prontuarios = lazy(() => import('./pages/Prontuarios.jsx'));
const Revenue = lazy(() => import('./pages/Revenue.jsx'));
const RevenueStreams = lazy(() => import('./pages/RevenueStreams.jsx'));
const SOPs = lazy(() => import('./pages/SOPs.jsx'));
const Sales = lazy(() => import('./pages/Sales.jsx'));
const SalesPipeline = lazy(() => import('./pages/SalesPipeline.jsx'));
const SalesReports = lazy(() => import('./pages/SalesReports.jsx'));
const ScriptsVendas = lazy(() => import('./pages/ScriptsVendas.jsx'));
const Strategy = lazy(() => import('./pages/Strategy.jsx'));
const TaskCalendar = lazy(() => import('./pages/TaskCalendar.jsx'));
const Tasks = lazy(() => import('./pages/Tasks.jsx'));
const ValueProposition = lazy(() => import('./pages/ValueProposition.jsx'));
const ContencaoInvisalign = lazy(() => import('./pages/ContencaoInvisalign.jsx'));
const DatabaseMap = lazy(() => import('./pages/DatabaseMap.jsx'));

export const PAGES = {
    "AIAssistant": AIAssistant,
    "AIInsights": AIInsights,
    "Activities": Activities,
    "AdminPanel": AdminPanel,
    "AdvancedReports": AdvancedReports,
    "Agenda": Agenda,
    "Analytics": Analytics,
    "AppointmentReports": AppointmentReports,
    "Apps": Apps,
    "BusinessModelCanvas": BusinessModelCanvas,
    "CRM": CRM,
    "CRMAgenda": CRMAgenda,
    "CRMAvancado": CRMAvancado,
    "Campanhas": Campanhas,
    "Canais": Canais,
    "Catalogo": Catalogo,
    "Channels": Channels,
    "ClientPortal": ClientPortal,
    "ContentCreator": ContentCreator,
    "Conteudos": Conteudos,
    "CostStructure": CostStructure,
    "CustomerPipeline": CustomerPipeline,
    "CustomerRelationships": CustomerRelationships,
    "CustomerSegments": CustomerSegments,
    "CustomerSupport": CustomerSupport,
    "Dashboard": Dashboard,
    "DashboardFinanceiro": DashboardFinanceiro,
    "EHR": EHR,
    "EHRIntegration": EHRIntegration,
    "EmailAutomation": EmailAutomation,
    "Estrategias": Estrategias,
    "Financeiro": Financeiro,
    "FollowUpAutomation": FollowUpAutomation,
    "Gamification": Gamification,
    "Inventory": Inventory,
    "InventoryReports": InventoryReports,
    "JornadaCliente": JornadaCliente,
    "JourneyMapping": JourneyMapping,
    "KeyActivities": KeyActivities,
    "KeyPartnerships": KeyPartnerships,
    "KeyResources": KeyResources,
    "LeadsPipeline": LeadsPipeline,
    "MarketingAutomation": MarketingAutomation,
    "MarketingOS": MarketingOS,
    "Metricas": Metricas,
    "MeuAgendamento": MeuAgendamento,
    "OnlineBooking": OnlineBooking,
    "POPs": POPs,
    "PatientPipeline": PatientPipeline,
    "Patients": Patients,
    "PrimeOS": PrimeOS,
    "Prontuarios": Prontuarios,
    "Revenue": Revenue,
    "RevenueStreams": RevenueStreams,
    "SOPs": SOPs,
    "Sales": Sales,
    "SalesPipeline": SalesPipeline,
    "SalesReports": SalesReports,
    "ScriptsVendas": ScriptsVendas,
    "Strategy": Strategy,
    "TaskCalendar": TaskCalendar,
    "Tasks": Tasks,
    "ValueProposition": ValueProposition,
    "ContencaoInvisalign": ContencaoInvisalign,
    "DatabaseMap": DatabaseMap,
};

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
