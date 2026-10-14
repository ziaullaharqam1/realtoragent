import React, { useState } from 'react';
import { ConversationThread, Property } from '../../types';
import { CONVERSATION_THREADS } from '../../data/mockData';
import { 
  MessageSquare, 
  Send, 
  User, 
  Phone, 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  Bot, 
  CheckCheck,
  Share2
} from 'lucide-react';

interface ConversationsTabProps {
  properties: Property[];
  onSelectPropertyFor3D: (property: Property) => void;
  onOpen3DModal: () => void;
}

export const ConversationsTab: React.FC<ConversationsTabProps> = ({
  properties,
  onSelectPropertyFor3D,
  onOpen3DModal,
}) => {
  const [threads, setThreads] = useState<ConversationThread[]>(CONVERSATION_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0]?.id || 'conv-01');
  const [inputMessage, setInputMessage] = useState('');

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleToggleTakeover = (threadId: string) => {
    setThreads(
      threads.map((t) => (t.id === threadId ? { ...t, brokerTakeover: !t.brokerTakeover } : t))
    );
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'broker' as const,
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setThreads(
      threads.map((t) =>
        t.id === activeThreadId
          ? { ...t, messages: [...t.messages, newMsg] }
          : t
      )
    );
    setInputMessage('');
  };

  const handleSend3DLink = () => {
    const matchedProp = properties.find((p) => p.title.toLowerCase().includes(activeThread.propertyOfInterest.toLowerCase())) || properties[0];
    const linkMsg = {
      id: `m-${Date.now()}`,
      sender: 'broker' as const,
      text: `Here is your private interactive 3D digital showroom session for ${matchedProp.title}: https://proppilot.vip/tour/${matchedProp.id}?guest=${encodeURIComponent(activeThread.contactName)} — you can explore the full floorplan, cantilever pool, and switch marble finishes in real-time.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setThreads(
      threads.map((t) =>
        t.id === activeThreadId
          ? { ...t, messages: [...t.messages, linkMsg] }
          : t
      )
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Live Omnichannel Conversation Engine
            </span>
            <span className="text-xs text-slate-500">· WhatsApp Cloud API & Telegram Integrated</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display mt-1">
            Broker Client Conversations & Live Takeover
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time multi-channel client messaging with AI co-pilot grounding and instantaneous human takeover.
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-[600px]">
        
        {/* Left Thread List (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2">
            Active Client Threads ({threads.length})
          </div>

          <div className="space-y-2">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all ${
                  activeThreadId === thread.id
                    ? 'bg-amber-100 border border-amber-300 shadow-2xs'
                    : 'bg-white border border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 font-display">{thread.contactName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-amber-800 font-semibold border border-slate-200">
                    {thread.channel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-1">
                  {thread.propertyOfInterest}
                </div>
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/80 text-[10px]">
                  <span className="text-emerald-700 font-bold">{thread.sentiment}</span>
                  {thread.brokerTakeover ? (
                    <span className="text-amber-800 font-bold flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-amber-600" />
                      Broker Manual
                    </span>
                  ) : (
                    <span className="text-sky-700 font-bold flex items-center gap-1">
                      <Bot className="w-3 h-3 text-sky-600" />
                      AI Shadow
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Active Conversation Window (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white">
          
          {/* Top Bar of Active Conversation */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 font-display">{activeThread.contactName}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                  {activeThread.sentiment}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{activeThread.phone}</span>
                <span>•</span>
                <span className="text-amber-800 font-semibold">{activeThread.propertyOfInterest}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleTakeover(activeThread.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeThread.brokerTakeover
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white text-slate-700 hover:text-slate-950 border border-slate-300'
                }`}
              >
                {activeThread.brokerTakeover ? <UserCheck className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                <span>{activeThread.brokerTakeover ? 'Broker Takeover Active' : 'Switch to Broker Control'}</span>
              </button>

              <button
                onClick={handleSend3DLink}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                title="Send Instant 3D Property Walkthrough Link to Client"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send 3D Tour Link</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-[460px]">
            {activeThread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'broker' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-medium">
                  <span>{msg.sender === 'broker' ? 'Marcus Sterling (Broker)' : activeThread.contactName}</span>
                  <span>•</span>
                  <span>{msg.time}</span>
                </div>
                <div
                  className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'broker'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-xs'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200 shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Reply & Message Input Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto text-[11px] pb-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0">Quick AI Actions:</span>
              <button
                onClick={handleSend3DLink}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-semibold whitespace-nowrap transition-all"
              >
                🚀 Drop 3D Virtual Walkthrough Link
              </button>
              <button
                onClick={() => setInputMessage('I have scheduled our VIP viewing escort with the concierge team for tomorrow at 3:00 PM. Looking forward to meeting in person.')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 whitespace-nowrap transition-all"
              >
                📅 Confirm In-Person Viewing
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message to client on WhatsApp / Telegram..."
                className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
