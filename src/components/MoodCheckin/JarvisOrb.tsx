import { useEffect, useState, useRef } from 'react';

const PHRASES = [
  'Sistemas online. Pronto para o dia.',
  'Analisando seu potencial. Resultado: ilimitado.',
  'Cada tarefa concluida e uma vitoria calculada.',
  'Foco ativado. Modo operacional iniciado.',
  'Sua mente e o hardware mais avancado do planeta.',
  'Iniciando protocolo de produtividade.',
  'Status: pronto para qualquer desafio.',
  'Processando objetivos. Todos os sistemas no verde.',
  'Energia detectada. Vamos comecar.',
  'Consistencia bate talento todos os dias.',
];

const PARTICLE_COUNT = 6;

function useTypewriter(phrases: string[], typeSpeed = 55, deleteSpeed = 28, pauseMs = 2200) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const phrase = phrases[phraseIdx];

    function tick() {
      if (!deleting) {
        if (charIdx < phrase.length) {
          setDisplayed(phrase.slice(0, charIdx + 1));
          setCharIdx((i) => i + 1);
          timeoutRef.current = setTimeout(tick, typeSpeed);
        } else {
          timeoutRef.current = setTimeout(() => setDeleting(true), pauseMs);
        }
      } else {
        if (charIdx > 0) {
          setDisplayed(phrase.slice(0, charIdx - 1));
          setCharIdx((i) => i - 1);
          timeoutRef.current = setTimeout(tick, deleteSpeed);
        } else {
          setDeleting(false);
          setPhraseIdx((i) => (i + 1) % phrases.length);
        }
      }
    }

    timeoutRef.current = setTimeout(tick, deleting ? deleteSpeed : typeSpeed);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [charIdx, deleting, phraseIdx, phrases, typeSpeed, deleteSpeed, pauseMs]);

  return displayed;
}

interface Particle {
  id: number;
  angle: number;
  radius: number;
  delay: number;
  duration: number;
}

function buildParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (360 / PARTICLE_COUNT) * i + Math.random() * 30,
    radius: 72 + Math.random() * 24,
    delay: (i / PARTICLE_COUNT) * 3,
    duration: 2.5 + Math.random() * 1.5,
  }));
}

export function JarvisOrb() {
  const text = useTypewriter(PHRASES);
  const [particles] = useState<Particle[]>(buildParticles);

  return (
    <div className="flex flex-col items-center gap-5 select-none">
      {/* Orb container */}
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>

        {/* Ping expansivo de fundo */}
        <div
          className="absolute rounded-full"
          style={{
            width: 100,
            height: 100,
            backgroundColor: 'rgba(46,111,255,0.08)',
            animation: 'orb-ping 3s ease-out infinite',
          }}
        />

        {/* Anel externo — rotacao lenta horaria, tracejado */}
        <div
          className="absolute rounded-full"
          style={{
            width: 180,
            height: 180,
            border: '1px dashed rgba(46,111,255,0.25)',
            animation: 'orb-rotate-cw 24s linear infinite',
          }}
        >
          {/* Marcador no anel externo */}
          <div
            className="absolute rounded-full"
            style={{
              width: 6,
              height: 6,
              backgroundColor: '#5B9FFF',
              top: -3,
              left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 8px rgba(91,159,255,0.9)',
            }}
          />
        </div>

        {/* Anel medio — rotacao anti-horaria, solido fino */}
        <div
          className="absolute rounded-full"
          style={{
            width: 140,
            height: 140,
            border: '1px solid rgba(46,111,255,0.18)',
            animation: 'orb-rotate-ccw 16s linear infinite',
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 5,
              height: 5,
              backgroundColor: '#2E6FFF',
              bottom: -2.5,
              left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: '0 0 6px rgba(46,111,255,0.8)',
            }}
          />
        </div>

        {/* Anel de scan — efeito radar com gradiente conico */}
        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            width: 120,
            height: 120,
            animation: 'orb-scan 4s linear infinite',
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 65%, rgba(46,111,255,0.5) 85%, rgba(91,159,255,0.8) 100%)',
            }}
          />
        </div>

        {/* Anel interno estatico */}
        <div
          className="absolute rounded-full"
          style={{
            width: 120,
            height: 120,
            border: '1px solid rgba(46,111,255,0.12)',
          }}
        />

        {/* Particulas orbitando */}
        {particles.map((p) => {
          const rad = (p.angle * Math.PI) / 180;
          const x = Math.cos(rad) * p.radius;
          const y = Math.sin(rad) * p.radius;
          return (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: 3,
                height: 3,
                backgroundColor: '#5B9FFF',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                opacity: 0.8,
                animation: `orb-particle ${p.duration}s ease-out ${p.delay}s infinite`,
                boxShadow: '0 0 4px rgba(91,159,255,0.9)',
              }}
            />
          );
        })}

        {/* Nucleo pulsante */}
        <div
          className="absolute rounded-full"
          style={{
            width: 52,
            height: 52,
            backgroundColor: 'rgba(46,111,255,0.12)',
            border: '1px solid rgba(46,111,255,0.4)',
            animation: 'orb-pulse-core 2.4s ease-in-out infinite',
          }}
        />

        {/* Centro — ponto de luz */}
        <div
          className="absolute rounded-full"
          style={{
            width: 16,
            height: 16,
            backgroundColor: '#2E6FFF',
            boxShadow: '0 0 20px rgba(46,111,255,1), 0 0 40px rgba(46,111,255,0.4)',
          }}
        />
      </div>

      {/* Texto typewriter */}
      <div className="h-6 flex items-center justify-center px-4">
        <p
          className="text-sm text-center font-medium"
          style={{ color: '#5B9FFF', letterSpacing: '0.02em' }}
        >
          {text}
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: '1em',
              backgroundColor: '#5B9FFF',
              marginLeft: 2,
              verticalAlign: 'text-bottom',
              animation: 'cursor-blink 0.9s step-end infinite',
            }}
          />
        </p>
      </div>
    </div>
  );
}
