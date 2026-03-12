import { useState, useEffect } from "react"
import "./App.css"

function obtenerColor(letra, posicion, palabraSecreta) {
  if (letra === palabraSecreta[posicion]) {
    return "var(--color-correct)"
  }
  if (palabraSecreta.includes(letra)) {
    return "var(--color-present)"
  }
  return "var(--color-absent)"
}

function obtenerEstadoTeclado(intentos, palabraSecreta) {
  const estado = {}

  intentos.forEach((intento) => {
    if (intento === "") {
      return
    }
    for (let i = 0; i < intento.length; i++) {
      const letra = intento[i]

      if (letra === palabraSecreta[i]) {
        estado[letra] = "var(--color-correct)"
      } else if (palabraSecreta.includes(letra)) {
        if (estado[letra] !== "var(--color-correct)") {
          estado[letra] = "var(--color-present)"
        }
      } else {
        if (!estado[letra]) {
          estado[letra] = "var(--color-absent)"
        }
      }
    }
  })

  return estado
}

function App() {
  const titulo = "MORTAL WORDS"
  const longitudPalabra = 5
  const palabraSecreta = "PIANO"
  const [intentos, setIntentos] = useState(["", "", "", ""])
  const [intentoActual, setIntentoActual] = useState("")
  const [filaAnimada, setFilaAnimada] = useState(-1)
  const [shake, setShake] = useState(false)

  const tecladoFilas = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["Z","X","C","V","B","N","M"]
  ]

  const filaActual = intentos.findIndex((intento) => {
    return intento === ""
  })

  const haGanado = intentos.includes(palabraSecreta)
  const haPerdido = !haGanado && filaActual === -1
  const estadoTeclado = obtenerEstadoTeclado(intentos, palabraSecreta)

  function enviarIntento() {
    if (intentoActual.length !== longitudPalabra) {
      setShake(true)
      setTimeout(() => {
        setShake(false)
      }, 500)
      return
    }
    if (filaActual === -1) {
      return
    }
    const nuevosIntentos = [...intentos]
    nuevosIntentos[filaActual] = intentoActual
    setFilaAnimada(filaActual)
    setIntentos(nuevosIntentos)
    setIntentoActual("")
    setTimeout(() => {
      setFilaAnimada(-1)
    }, 1500)
  }

  function pulsarTecla(letra) {
    if (haGanado || haPerdido) {
      return
    }
    if (intentoActual.length >= longitudPalabra) {
      return
    }
    setIntentoActual(intentoActual + letra)
  }

  function borrarLetra() {
    setIntentoActual(intentoActual.slice(0, -1))
  }

  useEffect(() => {
    function manejarTecla(evento) {
      if (haGanado || haPerdido) {
        return
      }
      if (evento.key === "Enter") {
        enviarIntento()
        return
      }
      if (evento.key === "Backspace") {
        borrarLetra()
        return
      }
      const letra = evento.key.toUpperCase()
      if (letra.length === 1 && letra >= "A" && letra <= "Z") {
        pulsarTecla(letra)
      }
    }

    window.addEventListener("keydown", manejarTecla)
    return () => {
      window.removeEventListener("keydown", manejarTecla)
    }
  })

  return (
    <div className="game-container">
      {/* Torch particles */}
      <div className="particles">
        {Array(12).fill("").map((_, i) => {
          return <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${4 + Math.random() * 4}s`
          }} />
        })}
      </div>

      {/* Lives top-left */}
      <div className="hud-top-left">
        {"❤️".repeat(5)}
      </div>

      {/* Title */}
      <div className="title-container">
        <h1 className="title">{titulo}</h1>
        <div className="subtitle">⚔ Guess or die ⚔</div>
      </div>

      {/* Grid */}
      <div className={`grid ${shake ? "shake" : ""}`}>
        {intentos.map((intento, filaPosicion) => {
          return (
            <div key={filaPosicion} className="grid-row">
              {Array(longitudPalabra).fill("").map((casilla, casillaPosicion) => {
                const esFilaActual = filaPosicion === filaActual
                const letra = esFilaActual
                  ? intentoActual[casillaPosicion] || ""
                  : intento[casillaPosicion] || ""
                const tieneLetra = letra !== ""
                const estaEnviado = intento !== ""
                const colorFondo = estaEnviado && tieneLetra
                  ? obtenerColor(letra, casillaPosicion, palabraSecreta)
                  : "transparent"
                const estaAnimando = filaPosicion === filaAnimada

                let claseExtra = "cell"
                if (esFilaActual && tieneLetra) {
                  claseExtra += " cell-active"
                }
                if (estaAnimando) {
                  claseExtra += " cell-flip"
                }
                if (esFilaActual && tieneLetra) {
                  claseExtra += " cell-pop"
                }

                return (
                  <div
                    key={casillaPosicion}
                    className={claseExtra}
                    style={{
                      backgroundColor: estaEnviado ? colorFondo : "var(--color-cell-bg)",
                      borderColor: estaEnviado && tieneLetra ? colorFondo : esFilaActual && tieneLetra ? "var(--color-cell-active)" : "var(--color-cell-border)",
                      animationDelay: estaAnimando ? `${casillaPosicion * 0.2}s` : "0s"
                    }}
                  >
                    {letra}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Messages */}
      {haGanado && (
        <div className="message message-win">
          ⚔ ¡Victoria! Has sobrevivido ⚔
        </div>
      )}
      {haPerdido && (
        <div className="message message-lose">
          💀 La Bestia te ha atrapado... La palabra era {palabraSecreta}
        </div>
      )}

      {/* Keyboard */}
      <div className="keyboard">
        {tecladoFilas.map((fila, filaIndex) => {
          return (
            <div key={filaIndex} className="keyboard-row">
              {filaIndex === 2 && (
                <button className="key key-special" onClick={borrarLetra}>
                  ◄
                </button>
              )}
              {fila.map((letra) => {
                return (
                  <button
                    key={letra}
                    className="key"
                    onClick={() => {
                      pulsarTecla(letra)
                    }}
                    style={{
                      backgroundColor: estadoTeclado[letra] || "var(--color-key-bg)",
                    }}
                  >
                    {letra}
                  </button>
                )
              })}
              {filaIndex === 2 && (
                <button className="key key-special" onClick={enviarIntento}>
                  ENTER
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* HUD bottom */}
      <div className="hud-bottom">
        <div className="hud-bottom-left">Day 1</div>
        <div className="hud-bottom-right">🔥 Streak 0</div>
      </div>
    </div>
  )
}

export default App