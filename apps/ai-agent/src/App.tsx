/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CURRENT_USER, 
  PROPERTIES, 
  PIPELINE_LEADS, 
  PENDING_APPROVALS 
} from './data/mockData';
import { Property, ClientBrief, ApprovalDraft, UserPrincipal, ToastNotification } from './types';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/tabs/DashboardOverview';
import { PropertiesManagementTab } from './components/tabs/PropertiesManagementTab';
import { Showroom3DTab } from './components/tabs/Showroom3DTab';
import { LeadsPipelineTab } from './components/tabs/LeadsPipelineTab';
import { ApprovalsTab } from './components/tabs/ApprovalsTab';
import { ConversationsTab } from './components/tabs/ConversationsTab';
import { StudioPresentationTab } from './components/tabs/StudioPresentationTab';
import { NurtureTab } from './components/tabs/NurtureTab';
import { OperationsSettingsTab } from './components/tabs/OperationsSettingsTab';
import { SalesGuy3DInputModal } from './components/modals/SalesGuy3DInputModal';
import { PropertyEditModal } from './components/modals/PropertyEditModal';
import { LoginModal } from './components/modals/LoginModal';
import { ToastContainer } from './components/ui/Toast';
import { exportPropertyPitchDeck } from './utils/pptxExport';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserPrincipal>(CURRENT_USER);
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [properties, setProperties] = useState<Property[]>(PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState<Property>(PROPERTIES[0]);
  const [approvals, setApprovals] = useState<ApprovalDraft[]>(PENDING_APPROVALS);
  
  // Modals state
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Central Toast Notifications System
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (toast: { type: 'success' | 'error' | 'warning' | 'info'; title?: string; message: string }) => {
    const newToast: ToastNotification = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: toast.type,
      title: toast.title,
      message: toast.message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sales guy client briefing state
  const [clientBrief, setClientBrief] = useState<ClientBrief>({
    clientName: 'Dr. Elena Rostova',
    companyOrFamily: 'Rostova Global Health Fund',
    phoneOrEmail: '+44 7700 900342',
    vipTier: 'Platinum UHNW',
    motive: 'Trophy Asset',
    budgetMaxAED: 50000000,
    buyingTimeline: 'Immediate (7-14 Days)',
    pitchAngle: 'Highlight the 7.4m double-height ceiling volume, motorized acoustic wind shields on the cantilever pool deck, and 9.2% net short-term rental yield.',
    customNotes: 'Client seeking tax relocation to Dubai and 10-year Golden Visa.',
  });

  const handleApproveDraft = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const handleLaunch3DPresentation = (config: any) => {
    setSelectedProperty(config.property);
    setClientBrief(config.brief);
    setCurrentTab('3d-showroom');
    showToast({
      type: 'success',
      title: '3D Session Ready',
      message: `3D Walkthrough showroom launched for ${config.property.title}.`,
    });
  };

  const handleExportPPTX = async () => {
    try {
      await exportPropertyPitchDeck(selectedProperty, clientBrief);
      showToast({
        type: 'success',
        title: 'Presentation Exported',
        message: `Investor Deck downloaded for ${selectedProperty.title}!`,
      });
    } catch (e: any) {
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: `Could not export presentation: ${e.message}`,
      });
    }
  };

  // Property Admin CRUD Handlers
  const handleAddProperty = () => {
    setEditingProperty(null);
    setIsPropertyModalOpen(true);
  };

  const handleEditProperty = (prop: Property) => {
    setEditingProperty(prop);
    setIsPropertyModalOpen(true);
  };

  const handleSaveProperty = (prop: Property) => {
    const exists = properties.some((p) => p.id === prop.id);
    if (exists) {
      setProperties((prev) => prev.map((p) => (p.id === prop.id ? prop : p)));
      if (selectedProperty.id === prop.id) {
        setSelectedProperty(prop);
      }
      showToast({
        type: 'success',
        title: 'Property Updated',
        message: `Listing "${prop.title}" specifications and pricing saved.`,
      });
    } else {
      setProperties((prev) => [prop, ...prev]);
      showToast({
        type: 'success',
        title: 'New Property Added',
        message: `Trophy listing "${prop.title}" added to your Dubai portfolio.`,
      });
    }
  };

  const handleDeleteProperty = (propertyId: string) => {
    const propToDelete = properties.find((p) => p.id === propertyId);
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    if (selectedProperty.id === propertyId && properties.length > 1) {
      const nextProp = properties.find((p) => p.id !== propertyId) || properties[0];
      setSelectedProperty(nextProp);
    }
    showToast({
      type: 'warning',
      title: 'Property Removed',
      message: `Listing "${propToDelete?.title || propertyId}" removed from portfolio.`,
    });
  };

  const handleToggleCustomerVisibility = (propertyId: string) => {
    let newStatus = false;
    let propTitle = '';
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === propertyId) {
          const currentVis = p.showToCustomers !== false;
          newStatus = !currentVis;
          propTitle = p.title;
          return {
            ...p,
            showToCustomers: newStatus,
          };
        }
        return p;
      })
    );

    showToast({
      type: newStatus ? 'success' : 'info',
      title: newStatus ? 'Customer Showroom Visibility Enabled' : 'Listing Hidden from Customer',
      message: newStatus
        ? `"${propTitle}" is now visible to customers in 3D showroom.`
        : `"${propTitle}" is now hidden from customer view.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      
      {/* Centralized Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpen3DModal={() => setIs3DModalOpen(true)}
        onLogout={() => setIsLoginModalOpen(true)}
        pendingApprovalsCount={approvals.length}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentTab === 'overview' && (
          <DashboardOverview
            properties={properties}
            leads={PIPELINE_LEADS}
            approvals={approvals}
            onSelectPropertyFor3D={(prop) => {
              setSelectedProperty(prop);
              setCurrentTab('3d-showroom');
            }}
            onOpen3DModal={() => setIs3DModalOpen(true)}
            onApproveDraft={handleApproveDraft}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'properties' && (
          <PropertiesManagementTab
            properties={properties}
            onAddProperty={handleAddProperty}
            onEditProperty={handleEditProperty}
            onDeleteProperty={handleDeleteProperty}
            onToggleCustomerVisibility={handleToggleCustomerVisibility}
            onLaunch3D={(prop) => {
              setSelectedProperty(prop);
              setCurrentTab('3d-showroom');
              showToast({
                type: 'info',
                title: '3D Preview Active',
                message: `Opened 3D showroom for ${prop.title}.`,
              });
            }}
          />
        )}

        {currentTab === '3d-showroom' && (
          <Showroom3DTab
            properties={properties}
            selectedProperty={selectedProperty}
            onSelectProperty={setSelectedProperty}
            clientBrief={clientBrief}
            onOpenSalesInputModal={() => setIs3DModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'leads' && (
          <LeadsPipelineTab
            leads={PIPELINE_LEADS}
            properties={properties}
            onSelectPropertyFor3D={(prop) => {
              setSelectedProperty(prop);
              setIs3DModalOpen(true);
            }}
            onOpen3DModal={() => setIs3DModalOpen(true)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'approvals' && (
          <ApprovalsTab
            approvals={approvals}
            onApprove={handleApproveDraft}
            onSelectPropertyFor3D={(prop) => {
              setSelectedProperty(prop);
              setIs3DModalOpen(true);
            }}
            properties={properties}
            onOpen3DModal={() => setIs3DModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'conversations' && (
          <ConversationsTab
            properties={properties}
            onSelectPropertyFor3D={(prop) => {
              setSelectedProperty(prop);
              setIs3DModalOpen(true);
            }}
            onOpen3DModal={() => setIs3DModalOpen(true)}
          />
        )}

        {currentTab === 'studio' && (
          <StudioPresentationTab
            properties={properties}
            selectedProperty={selectedProperty}
            onSelectProperty={setSelectedProperty}
            clientBrief={clientBrief}
            onOpen3DShowroom={() => setCurrentTab('3d-showroom')}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'nurture' && (
          <NurtureTab />
        )}

        {currentTab === 'ops-settings' && (
          <OperationsSettingsTab />
        )}

      </main>

      {/* Sales Guy 3D Input Modal */}
      <SalesGuy3DInputModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        selectedProperty={selectedProperty}
        onSelectProperty={setSelectedProperty}
        clientBrief={clientBrief}
        onSaveClientBrief={setClientBrief}
        onLaunchPresentation={handleLaunch3DPresentation}
        onExportPPTX={handleExportPPTX}
      />

      {/* Admin Property Add / Edit Modal */}
      <PropertyEditModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        property={editingProperty}
        onSave={handleSaveProperty}
      />

      {/* Login Screen Modal for Testing admin@proppilot.demo / proppilot */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLoginSuccess={(email) => {
          setCurrentUser({
            ...CURRENT_USER,
            email,
          });
          setIsLoginModalOpen(false);
          showToast({
            type: 'success',
            title: 'Welcome Back',
            message: `Logged in as ${email}. Full broker privileges restored.`,
          });
        }}
        onCancel={() => setIsLoginModalOpen(false)}
      />

      {/* Clean Footer (No technology stack mentions, no powered-by tags) */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">PropPilot Pro</span>
            <span>·</span>
            <span>RERA Registered UAE Brokerage Engine</span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Confidential Licensed Broker Portal · Dubai Portals Multi-Feed Syndication
          </div>
        </div>
      </footer>

    </div>
  );
}
