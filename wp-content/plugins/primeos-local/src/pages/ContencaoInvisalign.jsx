import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getActiveTenantId } from "@/lib/tenantContext";

export default function ContencaoInvisalign() {
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    setLoading(true);
    try {
      const tenantId = getActiveTenantId();
      await supabase.from("leads").insert({
        tenant_id: tenantId,
        name,
        phone,
        email: email || null,
        source: "invisalign_landing",
        stage: "new",
        treatment_interest: "Contenção Invisalign Vivera (3 unidades)",
        estimated_value: 2500,
        notes: "Lead capturado via Landing Page de Contenção Invisalign",
      });

      setSuccess(true);
      setTimeout(() => {
        const msg = encodeURIComponent(
          `Olá! Meu nome é ${name}, vim pela página de contenção Invisalign Vivera e quero agendar minha avaliação.`
        );
        window.open(`https://wa.me/5531984666991?text=${msg}`, "_blank");
        setLeadModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error("Erro ao salvar lead:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-emerald-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight text-teal-800">
              PRIME ODONTOLOGIA
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Invisalign Doctor
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLeadModalOpen(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-all text-sm"
            >
              Agendar Avaliação
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6">
            <div className="inline-block px-3 py-1 bg-teal-100/70 text-teal-900 font-semibold text-xs tracking-wider uppercase rounded-full">
              Proteção do Sorriso Alinhado
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              Contenção Invisalign Vivera: <br className="hidden md:block" />
              <span className="text-teal-700">3 unidades originais</span> por R$ 2.500
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Garanta a estabilidade definitiva dos seus dentes após o tratamento ortodôntico com a tecnologia patenteada Vivera, 30% mais resistente que as contenções convencionais.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setLeadModalOpen(true)}
                className="bg-teal-700 hover:bg-teal-800 text-white text-base font-bold px-8 py-3.5 rounded-lg shadow-lg hover:shadow-teal-700/20 transition-all"
              >
                Garantir Minhas 3 Contenções
              </button>
              <div className="text-sm font-medium text-slate-500">
                💳 Parcelamento em até 12x
              </div>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100/80 space-y-4">
              <div className="text-center pb-4 border-b border-slate-100">
                <span className="text-xs uppercase tracking-wider text-teal-700 font-bold">Oferta Exclusiva Prime</span>
                <div className="text-3xl font-black text-slate-900 mt-1">R$ 2.500</div>
                <div className="text-sm text-slate-500">ou 12x sem juros de R$ 208,33</div>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center space-x-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span><strong>3 pares originais</strong> Align Technology</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Escaneamento digital 3D de alta precisão</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Material proprietário SmartTrack mais durável</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Acompanhamento clínico presencial em Lourdes/BH</span>
                </li>
              </ul>
              <button
                onClick={() => setLeadModalOpen(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg shadow transition-colors text-center"
              >
                Pedir Avaliação Agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-12">
          Por que a contenção Vivera é a melhor escolha?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-lg">1</div>
            <h3 className="font-bold text-lg text-slate-800">30% Mais Resistente</h3>
            <p className="text-sm text-slate-600">
              Fabricadas com material de ponta testado em laboratório, menos propensas a quebras ou deformações com o uso contínuo.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-lg">2</div>
            <h3 className="font-bold text-lg text-slate-800">Encaixe Perfeito & Conforto</h3>
            <p className="text-sm text-slate-600">
              Moldadas com base no escaneamento digital do seu sorriso finalizado, sem moldagens desconfortáveis de gesso.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-lg">3</div>
            <h3 className="font-bold text-lg text-slate-800">Tranquilidade Garantida</h3>
            <p className="text-sm text-slate-600">
              Com 3 unidades, você tem sempre contenções reserva caso perca ou quebre uma durante viagens ou rotina diária.
            </p>
          </div>
        </div>
      </section>

      {/* Lead Capture Modal */}
      {leadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setLeadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 mb-2">
              Agendar Avaliação de Contenção
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Preencha seus dados para receber o contato da nossa equipe pelo WhatsApp.
            </p>

            {success ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-center font-semibold text-sm">
                ✓ Dados confirmados! Redirecionando para o WhatsApp da clínica...
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(31) 99999-9999"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    E-mail (opcional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-lg shadow-md transition-colors text-sm mt-2"
                >
                  {loading ? "Registrando..." : "Confirmar e Ir para WhatsApp"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
