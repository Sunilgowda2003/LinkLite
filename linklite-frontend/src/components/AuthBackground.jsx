
import { motion } from "framer-motion";

const particles = [
  { left: "8%", top: "20%", delay: 0 },
  { left: "18%", top: "75%", delay: 1 },
  { left: "32%", top: "12%", delay: 2 },
  { left: "48%", top: "85%", delay: 0.5 },
  { left: "66%", top: "18%", delay: 1.5 },
  { left: "80%", top: "70%", delay: 2.5 },
  { left: "92%", top: "30%", delay: 1 },
];

export default function AuthBackground() {
  return (
    <div className="auth-background">
      {/* Animated background effects */}
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="aurora aurora-three" />

      <div className="auth-grid" />

      {/* Animated orbit effects */}
      <motion.div
        className="orbit orbit-one"
        animate={{ rotate: 360 }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <span className="orbit-dot" />
      </motion.div>

      <motion.div
        className="orbit orbit-two"
        animate={{ rotate: -360 }}
        transition={{
          duration: 48,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <span className="orbit-dot orbit-dot-two" />
      </motion.div>

      {/* Floating particles */}
      <div className="floating-particles">
        {particles.map((particle, index) => (
          <motion.span
            key={index}
            className="particle"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [0, -22, 0],
              opacity: [0.25, 0.9, 0.25],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + index % 3,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* LinkLite brand */}
      <div className="auth-brand">
        <motion.div
          className="auth-brand-icon"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ↗
        </motion.div>

        <div className="auth-brand-text">
          <h1>
            Link<span>Lite</span>
          </h1>

          <p>Shorten less. Share more.</p>
        </div>
      </div>
    </div>
  );
}
