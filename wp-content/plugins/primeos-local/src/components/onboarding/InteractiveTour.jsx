// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InteractiveTour({ tourId, steps, onComplete, autoStart = true }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const overlayRef = useRef(null);

  useEffect(() => {
    // Check if user has completed this tour
    const completedTours = JSON.parse(localStorage.getItem('completed_tours') || '[]');
    if (completedTours.includes(tourId)) {
      return;
    }

    if (autoStart) {
      const timer = setTimeout(() => setIsActive(true), 500);
      return () => clearTimeout(timer);
    }
  }, [tourId, autoStart]);

  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const updatePosition = () => {
      const selector = steps[currentStep].selector;
      const element = document.querySelector(selector);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Scroll element into view smoothly
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Calculate tooltip position
        const tooltipHeight = 250;
        let top = rect.bottom + scrollY + 20;
        let left = rect.left + scrollX;

        // Adjust if tooltip goes off screen
        if (top + tooltipHeight > window.innerHeight + scrollY) {
          top = rect.top + scrollY - tooltipHeight - 20;
        }

        if (left + 400 > window.innerWidth) {
          left = window.innerWidth - 420;
        }

        setPosition({ top, left, width: rect.width, height: rect.height });

        // Add highlight class
        element.classList.add('tour-highlight');
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      const element = document.querySelector(steps[currentStep].selector);
      if (element) {
        element.classList.remove('tour-highlight');
      }
    };
  }, [isActive, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    const completedTours = JSON.parse(localStorage.getItem('completed_tours') || '[]');
    if (!completedTours.includes(tourId)) {
      completedTours.push(tourId);
      localStorage.setItem('completed_tours', JSON.stringify(completedTours));
    }
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];

  return (
    <>
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 9998 !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.4), 0 0 0 9999px rgba(0, 0, 0, 0.5) !important;
          border-radius: 8px;
          animation: tour-pulse 2s infinite;
        }
        
        @keyframes tour-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.4), 0 0 0 9999px rgba(0, 0, 0, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0.6), 0 0 0 9999px rgba(0, 0, 0, 0.5); }
        }
      `}</style>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            zIndex: 9999,
            maxWidth: '400px'
          }}
        >
          <Card className="border-2 border-indigo-500 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {step.icon && <step.icon className="w-5 h-5 text-indigo-600" />}
                  <span className="text-xs font-semibold text-indigo-600 uppercase">
                    Passo {currentStep + 1} de {steps.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleSkip}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <h3 className="font-bold text-lg text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 mb-4">{step.description}</p>

              {step.tip && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-900">
                    <strong>💡 Dica:</strong> {step.tip}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        idx === currentStep ? "w-6 bg-indigo-600" : "w-1.5 bg-slate-300"
                      )}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Voltar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Concluir
                      </>
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
